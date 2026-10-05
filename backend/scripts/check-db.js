const {
  checkDatabaseConnection,
  closeDatabaseConnection,
} = require("../db");

async function main() {
  try {
    const result = await checkDatabaseConnection();

    console.log("");
    console.log("========================================");
    console.log("✅ PostgreSQL conectado com sucesso!");
    console.log("========================================");
    console.log("");
    console.log("Servidor respondeu em:");
    console.log(result.now);
    console.log("");
  } catch (error) {
    console.error("");
    console.error("========================================");
    console.error("❌ ERRO AO CONECTAR NO POSTGRESQL");
    console.error("========================================");
    console.error("");
    console.error(error.message);
    console.error("");
    console.error("Código:", error.code || "N/A");
    console.error("");
    process.exitCode = 1;
  } finally {
    await closeDatabaseConnection();
  }
}

main();