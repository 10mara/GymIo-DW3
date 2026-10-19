/** Erro de negócio/HTTP. O errorMiddleware converte em { erro, ...extra }. */
class AppError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.extra = extra;
  }
}

module.exports = AppError;
