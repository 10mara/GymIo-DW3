const supabase = require("../config/supabase");

module.exports = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ erro: "Não autenticado" });
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error) {
    return res.status(401).json({ erro: "Token inválido" });
  }

  req.user = data.user;

  next();
};