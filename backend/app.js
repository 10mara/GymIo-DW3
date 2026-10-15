const express = require("express");
const dotenv = require("dotenv");

// Rotas
const pessoaRoutes = require("./routes/pessoa.routes");
const authRoutes = require("./routes/auth.routes");
const planosRoutes = require("./routes/planos.routes");
const financeiroRoutes = require("./routes/financeiro.routes");
const relatoriosRoutes = require("./routes/relatorios.routes");

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());

// Rotas
app.use("/pessoas", pessoaRoutes);
app.use("/auth", authRoutes);
app.use("/api/planos", planosRoutes);
app.use("/api/financeiro", financeiroRoutes);
app.use("/api/relatorios", relatoriosRoutes);

// Rota de teste
app.get("/", (req, res) => {
  res.send("API rodando");
});

module.exports = app;