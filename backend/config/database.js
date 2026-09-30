const pg = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

pool.connect()
  .then(() => {
    console.log("Banco de dados conectado com sucesso!");
  })
  .catch((err) => {
    console.error("Erro ao conectar no banco:", err);
  });

module.exports = {
  pool
};