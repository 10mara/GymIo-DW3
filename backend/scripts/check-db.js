const { checkDatabaseConnection, disconnectDatabase } = require("../src/config/prisma");

(async () => {
  try {
    const { now } = await checkDatabaseConnection();
    console.log("✅ PostgreSQL conectado com sucesso! Servidor respondeu em:", now);
  } catch (err) {
    console.error("❌ Erro ao conectar no PostgreSQL:", err.message, "| código:", err.code || "N/A");
    process.exitCode = 1;
  } finally {
    await disconnectDatabase();
  }
})();