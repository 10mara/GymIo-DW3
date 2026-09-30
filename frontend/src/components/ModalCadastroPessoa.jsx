import React, { useState } from "react";
import { X, UserPlus, GraduationCap, Briefcase } from "lucide-react";
import "../styles/modal_cadastro_pessoa.css";
import { Eye, EyeOff } from "lucide-react";

export default function ModalCadastroPessoa({
  titulo = "Novo Cadastro",
  icone = <UserPlus size={18} />,
  dados,
  setDados,
  onClose,
  onSave,
  textoBotao = "Salvar",
  planos = [],
  cargos = [],
}) {

  const handleCheckboxAluno = (checked) => {
    setDados({
      ...dados,
      isAluno: checked,
      plano_id: checked ? dados.plano_id : "",
      status: checked ? dados.status : "Ativo",
      dataMatricula: checked ? dados.dataMatricula : "",
    });
  };

  const handleCheckboxFuncionario = (checked) => {
    setDados({
      ...dados,
      isFuncionario: checked,
      cargo_id: checked ? dados.cargo_id : "",
      dataAdmissao: checked ? dados.dataAdmissao : "",
      salario: checked ? dados.salario : "",
      comissao: checked ? dados.comissao : "",
    });
  };
  const [mostrarSenha, setMostrarSenha] = useState(false);
  function aplicarMascaraCPF(valor) {
    return valor
      .replace(/\D/g, "")
      .slice(0, 11)
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  function aplicarMascaraTelefone(valor) {
    return valor
      .replace(/\D/g, "")
      .slice(0, 11)
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container-layout">

        {/* MODAL PRINCIPAL - Agora com controle de rolagem próprio se necessário */}
        <div className="modal modal-form">
          <div className="modal-header">
            <h2>
              {icone}
              {titulo}
            </h2>

            <button className="modal-close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          <div className="modal-grid">
            <div className="input-group">
              <label>Nome completo *</label>
              <input
                value={dados.nome || ""}
                onChange={(e) => setDados({ ...dados, nome: e.target.value })}
                placeholder="Ex: Maria Silva"
              />
            </div>

            <div className="input-group">
              <label>CPF *</label>
              <input
                type="text"
                value={dados.cpf}
                onChange={(e) =>
                  setDados({
                    ...dados,
                    cpf: aplicarMascaraCPF(e.target.value),
                  })
                }
                placeholder="000.000.000-00"
              />
            </div>

            <div className="input-group">
              <label>E-mail *</label>
              <input
                type="email"
                value={dados.email || ""}
                onChange={(e) => setDados({ ...dados, email: e.target.value })}
                placeholder="Ex: maria@email.com"
              />
            </div>

            <div className="input-group">
              <label>Telefone *</label>
              <input
                type="text"
                value={dados.telefone}
                onChange={(e) =>
                  setDados({
                    ...dados,
                    telefone: aplicarMascaraTelefone(e.target.value),
                  })
                }
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="input-group">
              <label>Data de nascimento *</label>
              <input
                type="date"
                value={dados.dataNascimento || ""}
                onChange={(e) =>
                  setDados({ ...dados, dataNascimento: e.target.value })
                }
              />
            </div>

            <div className="input-group">
              <label>Endereço *</label>
              <input
                value={dados.endereco || ""}
                onChange={(e) => setDados({ ...dados, endereco: e.target.value })}
                placeholder="Ex: Rua das Flores, 123"
              />
            </div>

            <div className="input-group input-full">
              <label>Senha *</label>

              <div className="senha-container">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={dados.senha}
                  onChange={(e) =>
                    setDados({
                      ...dados,
                      senha: e.target.value,
                    })
                  }
                  placeholder="Digite a senha"
                />

                <button
                  type="button"
                  className="btn-olho"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                >
                  {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="vinculos-section input-full">
              <div className="vinculo-divider">
                <GraduationCap size={16} />
                <span>VÍNCULO COMO ALUNO</span>
              </div>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={!!dados.isAluno}
                  onChange={(e) => handleCheckboxAluno(e.target.checked)}
                />
                Esta pessoa é aluna
              </label>

              <div className="vinculo-divider">
                <Briefcase size={16} />
                <span>VÍNCULO COMO FUNCIONÁRIO</span>
              </div>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={!!dados.isFuncionario}
                  onChange={(e) => handleCheckboxFuncionario(e.target.checked)}
                />
                Esta pessoa é funcionária
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn--outline" onClick={onClose}>
              Cancelar
            </button>

            <button className="btn btn--primary" onClick={onSave}>
              {textoBotao}
            </button>
          </div>
        </div>

        {/* COLUNA INDEPENDENTE DOS MODAIS SECUNDÁRIOS */}
        {(dados.isAluno || dados.isFuncionario) && (
          <div className="modal-satellites-column">

            {/* INFORMAÇÕES DO ALUNO */}
            {dados.isAluno && (
              <div className="modal-satellite-card">
                <div className="satellite-header">
                  <h3>
                    <GraduationCap size={16} />
                    Informações do Aluno
                  </h3>
                </div>

                <div className="satellite-body">
                  <div className="input-group">
                    <label>Plano *</label>
                    <select
                      value={dados.plano_id || ""}
                      onChange={(e) =>
                        setDados({ ...dados, plano_id: e.target.value })
                      }
                    >
                      <option value="">Selecione um plano</option>
                      {planos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nome_plano}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="input-group">
                    <label>Status *</label>
                    <select
                      value={dados.status || "Ativo"}
                      onChange={(e) => setDados({ ...dados, status: e.target.value })}
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label>Data de matrícula</label>
                    <input
                      type="date"
                      value={dados.dataMatricula || ""}
                      onChange={(e) => setDados({ ...dados, dataMatricula: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* INFORMAÇÕES DO FUNCIONÁRIO */}
            {dados.isFuncionario && (
              <div className="modal-satellite-card">
                <div className="satellite-header">
                  <h3>
                    <Briefcase size={16} />
                    Informações do Funcionário
                  </h3>
                </div>

                <div className="satellite-body">
                  <div className="input-group">
                    <label>Cargo *</label>
                    <select
                      value={dados.cargo_id || ""}
                      onChange={(e) =>
                        setDados({ ...dados, cargo_id: e.target.value })
                      }
                    >
                      <option value="">Selecione um cargo</option>

                      {cargos.map((cargo) => (
                        <option key={cargo.id} value={cargo.id}>
                          {cargo.nome_cargo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="input-group">
                    <label>Data de admissão *</label>
                    <input
                      type="date"
                      value={dados.dataAdmissao || ""}
                      onChange={(e) => setDados({ ...dados, dataAdmissao: e.target.value })}
                    />
                  </div>

                  <div className="input-group">
                    <label>Salário (R$) *</label>
                    <input
                      type="text"
                      value={dados.salario || ""}
                      onChange={(e) => setDados({ ...dados, salario: e.target.value })}
                      placeholder="Ex: 2.500,00"
                    />
                  </div>

                  <div className="input-group">
                    <label>Comissão (%)</label>
                    <input
                      type="text"
                      value={dados.comissao || ""}
                      onChange={(e) => setDados({ ...dados, comissao: e.target.value })}
                      placeholder="Ex: 5"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
