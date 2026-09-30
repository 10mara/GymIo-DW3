const { pool } = require("../config/database");

class Plano {

  static async listar() {

    const query = `
      SELECT *
      FROM plano
      WHERE deleted_at IS NULL
      ORDER BY nome_plano
    `;

    const { rows } = await pool.query(query);

    return rows;
  }


  static async buscarPorId(id) {

    const query = `
      SELECT *
      FROM plano
      WHERE id=$1
      AND deleted_at IS NULL
    `;

    const { rows } = await pool.query(
      query,
      [id]
    );

    return rows[0];
  }


  static async criar(dados) {

    const {
      nome_plano,
      descricao,
      valor,
      duracao_meses
    } = dados;

    const query = `
      INSERT INTO plano(
        nome_plano,
        descricao,
        valor,
        duracao_meses
      )
      VALUES(
        $1,$2,$3,$4
      )
      RETURNING *
    `;

    const valores = [
      nome_plano,
      descricao,
      valor,
      duracao_meses
    ];

    const { rows } =
      await pool.query(
        query,
        valores
      );

    return rows[0];
  }


  static async atualizar(
    id,
    dados
  ){

    const {
      nome_plano,
      descricao,
      valor,
      duracao_meses
    } = dados;

    const query = `
      UPDATE plano
      SET
      nome_plano=$1,
      descricao=$2,
      valor=$3,
      duracao_meses=$4

      WHERE id=$5

      RETURNING *
    `;

    const valores = [
      nome_plano,
      descricao,
      valor,
      duracao_meses,
      id
    ];

    const { rows } =
      await pool.query(
        query,
        valores
      );

    return rows[0];

  }


  static async deletar(id){

    const query = `
      UPDATE plano
      SET deleted_at=NOW()

      WHERE id=$1
    `;

    await pool.query(
      query,
      [id]
    );

    return true;
  }

}

module.exports = Plano;