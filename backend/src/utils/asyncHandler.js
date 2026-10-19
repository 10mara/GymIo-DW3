/** Encaminha erros de handlers async para o errorMiddleware. */
module.exports = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
