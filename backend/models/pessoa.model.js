const supabase = require("../config/supabase");

const PessoaModel = {
  /**
   * =========================
   * CREATE
   * =========================
   */
  async create(data) {
    const { data: pessoa, error } = await supabase
      .from("pessoa")
      .insert([
        {
          nome: data.nome,
          cpf: data.cpf,
          email: data.email,
          telefone: data.telefone,
          data_nascimento: data.dataNascimento,
          endereco: data.endereco,
          password: data.senha,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return pessoa;
  },

  /**
   * =========================
   * FIND ALL
   * =========================
   */
  async findAll() {
    const { data, error } = await supabase
      .from("pessoa")
      .select("*")
      .is("deleted_at", null)
      .order("id", { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * =========================
   * FIND BY ID
   * =========================
   */
  async findById(id) {
    const { data, error } = await supabase
      .from("pessoa")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * =========================
   * UPDATE
   * =========================
   */
  async update(id, data) {
    const { data: pessoa, error } = await supabase
      .from("pessoa")
      .update({
        nome: data.nome,
        cpf: data.cpf,
        email: data.email,
        telefone: data.telefone,
        data_nascimento: data.dataNascimento,
        endereco: data.endereco,
        password: data.senha,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return pessoa;
  },

  /**
   * =========================
   * DELETE (soft delete)
   * =========================
   */
  async delete(id) {
    const { error } = await supabase
      .from("pessoa")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw error;
    return true;
  },
};

module.exports = PessoaModel;