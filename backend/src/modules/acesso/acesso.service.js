const AppError = require("../../utils/AppError");
const { isUuid, isValidCPF } = require("../../utils/validators");
const {
  todayISO,
  parseDateOnly,
  formatDateOnly,
  startOfDay,
  addDaysISO,
  weekdayLabel,
} = require("../../utils/date");
const repository = require("./acesso.repository");
const { toRow, toListItem } = require("./acesso.serializer");

const INTERVALO_MINIMO_ENTRE_ACESSOS_MINUTOS = 5;
const LIMITE_PADRAO = 1000;
const LIMITE_MAXIMO = 5000;
const TIPOS_FILTRO = ["entrada", "bloqueado"];

const MENSAGEM_CPF_INVALIDO = "CPF inválido. Informe um CPF com 11 dígitos.";
const MENSAGEM_CPF_NAO_ENCONTRADO = "CPF não encontrado no sistema. Verifique o cadastro do aluno.";

/* ------------------------------ helpers ------------------------------ */

const normalizarStatus = (status) => String(status || "").trim().toLowerCase();
const somenteDigitos = (valor) => String(valor ?? "").replace(/\D/g, "");

const formatarCpf = (cpf) =>
  cpf.length === 11 ? cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4") : null;

/** O CPF pode estar gravado com ou sem máscara: procura nos formatos possíveis. */
function candidatosDeCpf(identificador) {
  const cpf = somenteDigitos(identificador);
  return [...new Set([cpf, formatarCpf(cpf), String(identificador).trim()].filter(Boolean))];
}

function normalizarTipoRegistro(tipo) {
  const valor = String(tipo ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
  if (valor !== "entrada" && valor !== "saida") {
    throw new AppError(400, 'Informe o tipo do registro: "entrada" ou "saida".');
  }
  return valor;
}

function dataIso(valor, campo) {
  return formatDateOnly(parseDateOnly(String(valor), campo));
}

/** Valida e converte os filtros da querystring (datas em AAAA-MM-DD, no fuso da academia). */
function normalizarFiltros(query = {}) {
  const { tipo, busca, dataInicio, dataFim, alunoId, limit } = query;
  const filtros = {};

  if (tipo !== undefined && tipo !== "") {
    const valor = String(tipo).trim().toLowerCase();
    if (!TIPOS_FILTRO.includes(valor)) {
      throw new AppError(400, `tipo inválido. Use: ${TIPOS_FILTRO.join(" ou ")}.`);
    }
    filtros.tipo = valor;
  }

  if (busca !== undefined && String(busca).trim()) filtros.busca = String(busca).trim();

  if (dataInicio) filtros.desde = startOfDay(dataIso(dataInicio, "dataInicio"));
  if (dataFim) filtros.ate = startOfDay(addDaysISO(dataIso(dataFim, "dataFim"), 1)); // fim inclusivo
  if (filtros.desde && filtros.ate && filtros.desde >= filtros.ate) {
    throw new AppError(400, "dataInicio não pode ser posterior a dataFim.");
  }

  if (alunoId) {
    if (!isUuid(alunoId)) throw new AppError(400, "alunoId inválido.");
    filtros.alunoId = alunoId;
  }

  let take = LIMITE_PADRAO;
  if (limit !== undefined && limit !== "") {
    const n = Number(limit);
    if (!Number.isInteger(n) || n < 1) throw new AppError(400, "limit deve ser um inteiro positivo.");
    take = Math.min(n, LIMITE_MAXIMO);
  }

  return { filtros, take };
}

/* ------------------------------ regras de negócio ------------------------------ */

/**
 * Regra de acesso: o aluno só entra com assinatura (matrícula) ativa e dentro da vigência.
 * Aceita status "ativo"/"ativa" em qualquer caixa; datas ausentes não limitam.
 */
function possuiAssinaturaVigente(assinaturas, hoje = todayISO()) {
  return (assinaturas || []).some((assinatura) => {
    const status = normalizarStatus(assinatura.statusAssinatura);
    const statusAtivo = status === "ativo" || status === "ativa";
    const inicio = formatDateOnly(assinatura.dataInicio);
    const fim = formatDateOnly(assinatura.dataFim);
    return statusAtivo && (!inicio || inicio <= hoje) && (!fim || fim >= hoje);
  });
}

/** Minutos que ainda faltam para liberar nova entrada após a última saída (0 = liberado). */
function minutosParaLiberar(ultimaSaida, agora = new Date()) {
  if (!ultimaSaida) return 0;
  const saida = new Date(ultimaSaida).getTime();
  if (Number.isNaN(saida)) return 0;

  const decorridos = Math.max(0, (agora.getTime() - saida) / 60000);
  if (decorridos >= INTERVALO_MINIMO_ENTRE_ACESSOS_MINUTOS) return 0;
  return Math.ceil(INTERVALO_MINIMO_ENTRE_ACESSOS_MINUTOS - decorridos);
}

/* ------------------------------ consultas ------------------------------ */

async function listar(query = {}) {
  const { filtros, take } = normalizarFiltros(query);
  return (await repository.findAll(filtros, take)).map(toListItem);
}

async function listarHoje() {
  const hoje = todayISO();
  const filtros = { desde: startOfDay(hoje), ate: startOfDay(addDaysISO(hoje, 1)) };
  return (await repository.findAll(filtros, LIMITE_MAXIMO)).map(toListItem);
}

async function listarPorAluno(alunoId, query = {}) {
  if (!(await repository.existsAluno(alunoId))) throw new AppError(404, "Aluno não encontrado.");
  const { filtros, take } = normalizarFiltros({ ...query, alunoId });
  return (await repository.findAll(filtros, take)).map(toListItem);
}

/**
 * Indicadores de acesso consumidos pelo Dashboard (que não duplica essa consulta):
 * entradas de hoje, dos últimos 7 dias (por dia) e o horário de pico de hoje.
 * Conta apenas entradas liberadas — tentativas bloqueadas não são frequência.
 */
async function estatisticasDashboard() {
  const hoje = todayISO();
  const dias = Array.from({ length: 7 }, (_, i) => addDaysISO(hoje, i - 6)); // do mais antigo até hoje
  const porDia = new Map(dias.map((dia) => [dia, 0]));
  const porHoraHoje = new Map();
  const entradasAgrupadas = await repository.resumirEntradasDashboard(
    startOfDay(dias[0]),
    startOfDay(addDaysISO(hoje, 1)),
  );

  entradasAgrupadas.forEach(({ dia, hora, total }) => {
    porDia.set(dia, (porDia.get(dia) || 0) + total);
    if (dia === hoje) porHoraHoje.set(hora, (porHoraHoje.get(hora) || 0) + total);
  });

  // Maior movimento; em empate vence o horário mais cedo (resultado determinístico).
  let horarioPico = "-";
  let maior = 0;
  [...porHoraHoje.entries()]
    .sort(([a], [b]) => a - b)
    .forEach(([hora, total]) => {
      if (total > maior) {
        maior = total;
        horarioPico = `${String(hora).padStart(2, "0")}:00`;
      }
    });

  const frequenciaSemanal = dias.map((dia) => ({ data: dia, dia: weekdayLabel(dia), total: porDia.get(dia) }));

  return {
    acessosHoje: porDia.get(hoje),
    frequenciaTotal: frequenciaSemanal.reduce((soma, d) => soma + d.total, 0),
    frequenciaSemanal,
    horarioPico,
  };
}

/* ------------------------------ registro (catraca) ------------------------------ */

/**
 * Tudo roda dentro de comLockDoAluno. Os caminhos de negação RETORNAM { negado } em vez de lançar,
 * para que o registro de "bloqueado" seja confirmado (commit) antes de a requisição responder 403.
 */
function processarEntrada(aluno) {
  return repository.comLockDoAluno(aluno.id, async (tx) => {
    const agora = new Date();

    if (normalizarStatus(aluno.status) !== "ativo") {
      await repository.createBloqueio(aluno.id, agora, tx);
      return { negado: { status: 403, mensagem: "Acesso bloqueado: aluno inativo." } };
    }

    const assinaturas = await repository.findAssinaturasDoAluno(aluno.id, tx);
    if (!possuiAssinaturaVigente(assinaturas, todayISO())) {
      await repository.createBloqueio(aluno.id, agora, tx);
      return { negado: { status: 403, mensagem: "Acesso bloqueado: aluno sem assinatura ativa." } };
    }

    if (await repository.findEntradaAberta(aluno.id, tx)) {
      return { negado: { status: 409, mensagem: "Aluno já possui uma entrada aberta." } };
    }

    const ultima = await repository.findUltimaSaida(aluno.id, tx);
    const espera = minutosParaLiberar(ultima?.horaSaida, agora);
    if (espera > 0) {
      return { negado: { status: 429, mensagem: `Aguarde ${espera} minuto(s) para registrar uma nova entrada.` } };
    }

    return { acesso: await repository.createEntrada(aluno.id, agora, tx) };
  });
}

function processarSaida(aluno) {
  return repository.comLockDoAluno(aluno.id, async (tx) => {
    const aberta = await repository.findEntradaAberta(aluno.id, tx);
    if (!aberta) return { negado: { status: 409, mensagem: "Aluno não possui uma entrada aberta." } };

    return { acesso: await repository.updateSaida(aberta.id, new Date(), tx) };
  });
}

/**
 * Registra uma entrada ou saída pelo CPF do aluno.
 * Entrada exige aluno ativo + assinatura vigente; tentativas negadas por status/assinatura ficam
 * gravadas como "bloqueado" no histórico. Saída exige uma entrada aberta.
 */
async function registrar({ identificador, tipo } = {}) {
  const tipoRegistro = normalizarTipoRegistro(tipo);

  const cpf = somenteDigitos(identificador);
  if (!isValidCPF(cpf)) throw new AppError(400, MENSAGEM_CPF_INVALIDO);

  // CPF válido sem aluno vinculado não gera bloqueio: não há aluno_id confiável para o histórico.
  const vinculo = await repository.findAlunoPorCpf(candidatosDeCpf(identificador));
  if (!vinculo) throw new AppError(404, MENSAGEM_CPF_NAO_ENCONTRADO);

  const aluno = { id: vinculo.id, status: vinculo.status };
  const resultado = tipoRegistro === "entrada" ? await processarEntrada(aluno) : await processarSaida(aluno);

  if (resultado.negado) throw new AppError(resultado.negado.status, resultado.negado.mensagem);

  return {
    tipo: tipoRegistro,
    mensagem: tipoRegistro === "entrada" ? "Entrada registrada com sucesso." : "Saída registrada com sucesso.",
    acesso: toRow(resultado.acesso),
    aluno: { id: vinculo.id, nome: vinculo.pessoa.nome, cpf: vinculo.pessoa.cpf },
  };
}

module.exports = {
  listar,
  listarHoje,
  listarPorAluno,
  registrar,
  estatisticasDashboard,
  // expostas para teste unitário
  possuiAssinaturaVigente,
  minutosParaLiberar,
};
