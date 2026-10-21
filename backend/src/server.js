const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const env = require("./config/env");
const { checkDatabaseConnection, disconnectDatabase } = require("./config/prisma");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

const app = express();

app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => res.json({ message: "API GymIO rodando" }));

/**
 * Carrega automaticamente todo módulo em src/modules/<nome>/index.js
 * que exporte { basePath: "/api/...", router }.
 * Cada pessoa só cria a própria pasta: ninguém precisa editar este arquivo (menos conflitos no Git).
 */
const modulesDir = path.join(__dirname, "modules");
const basePathsUsados = new Map();

fs.readdirSync(modulesDir, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort()
  .forEach((nome) => {
    const indexPath = path.join(modulesDir, nome, "index.js");
    if (!fs.existsSync(indexPath)) return;

    const { basePath, router } = require(indexPath);
    if (!basePath || !router) {
      throw new Error(`Módulo "${nome}": index.js deve exportar { basePath, router }.`);
    }
    if (basePathsUsados.has(basePath)) {
      throw new Error(`basePath ${basePath} duplicado nos módulos "${basePathsUsados.get(basePath)}" e "${nome}".`);
    }
    basePathsUsados.set(basePath, nome);
    app.use(basePath, router);
  });

/**
 * LEGADO (temporário): módulos que ainda não foram migrados para src/modules/.
 * Monta as rotas antigas de backend/routes/ para as telas não ficarem em branco durante a refatoração.
 * Se um módulo novo assumir o mesmo basePath, o legado é ignorado automaticamente.
 * Quando cada pessoa terminar o seu módulo, é só apagar a linha correspondente daqui.
 * (acesso fica de fora: o middleware antigo valida o token do Supabase e rejeitaria o login novo.)
 */
const LEGADO = [
  ["/api/planos", "planos"],
  ["/api/equipamentos", "equipamentos"],
  ["/api/manutencoes", "manutencoes"],
  ["/api/financeiro", "financeiro"],
  ["/api/relatorios", "relatorios"],
];

LEGADO.forEach(([basePath, nome]) => {
  if (basePathsUsados.has(basePath)) return;
  const arquivo = path.join(__dirname, "..", "routes", `${nome}.routes.js`);
  if (!fs.existsSync(arquivo)) return;
  try {
    app.use(basePath, require(arquivo));
    basePathsUsados.set(basePath, `${nome} (legado)`);
  } catch (err) {
    console.warn(`Rota legada ${basePath} não carregou: ${err.message}`);
  }
});

// Swagger
try {
  const swaggerDocument = YAML.load(path.join(__dirname, "..", "..", "documents", "API", "swagger.yaml"));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (err) {
  console.warn("Swagger não carregado:", err.message);
}

app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    await checkDatabaseConnection();
    console.log("PostgreSQL conectado (Direct Connection via Prisma).");
  } catch (err) {
    console.error("Falha ao conectar no PostgreSQL:", err.message);
    process.exit(1);
  }

  const server = app.listen(env.port, () => {
    console.log(`Servidor rodando na porta ${env.port}`);
    console.log(`Módulos carregados: ${[...basePathsUsados.keys()].join(", ") || "(nenhum)"}`);
  });

  const encerrar = async () => {
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };
  process.on("SIGINT", encerrar);
  process.on("SIGTERM", encerrar);
}

start();
