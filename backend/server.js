require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const pessoaRoutes = require("./routes/pessoa.routes");
const authRoutes = require("./routes/auth.routes");
const planosRoutes = require("./routes/planos.routes");
const acessoRoutes = require("./routes/acesso.routes");
const funcionariosRoutes = require("./routes/funcionarios.routes");
const equipamentosRoutes = require("./routes/equipamentos.routes");
const manutencoesRoutes = require("./routes/manutencoes.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const relatoriosRoutes = require("./routes/relatorios.routes");
const financeiroRoutes = require("./routes/financeiro.routes");



// para rodar o swagger da documentação
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("../documents/API/swagger.yaml");
const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// ROTAS
app.use("/api/pessoas", pessoaRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/planos", planosRoutes);
app.use("/api/acessos", acessoRoutes);
app.use("/api/funcionarios", funcionariosRoutes);
app.use("/api/equipamentos", equipamentosRoutes);
app.use("/api/manutencoes", manutencoesRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/relatorios", relatoriosRoutes);
app.use("/api/financeiro", financeiroRoutes);




app.get("/", (req, res) => {
  res.json({ message: "API GymIO rodando" });
});

const PORT = process.env.PORT || 3002;
// para rodar o swagger da documentação
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);
app.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
