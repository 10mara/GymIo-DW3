const { pool } = require("../config/database");

class Assinatura {

  static async listar(){

  const query = `
    SELECT
      a.id,
      a.aluno_id,
      a.plano_id,
      a.data_inicio,
      a.data_fim,
      a.status_assinatura AS status,
      a.data_assinatura,
      p.nome AS aluno,
      pl.nome_plano AS plano

      FROM assinatura a

      JOIN aluno al
      ON al.id=a.aluno_id

      JOIN pessoa p
      ON p.id=al.pessoa_id

      JOIN plano pl
      ON pl.id=a.plano_id

      WHERE a.deleted_at IS NULL

      ORDER BY a.data_inicio DESC
  `;

  const { rows } = await pool.query(query);

  return rows;
}

  static async alunoPossuiAtiva(
    aluno_id
  ){

    const query=`
      SELECT *
      FROM assinatura

      WHERE aluno_id=$1
      AND status_assinatura ILIKE 'Ativo'
      AND deleted_at IS NULL
    `;

    const { rows } =
      await pool.query(
        query,
        [aluno_id]
      );

    return rows[0];

  }


  static async criar(
    aluno_id,
    plano_id
  ){

    const planoQuery=`
      SELECT *
      FROM plano
      WHERE id=$1
    `;

    const plano =
      await pool.query(
        planoQuery,
        [plano_id]
      );

    if(!plano.rows.length){

      throw new Error(
        "Plano não encontrado"
      );

    }

    const meses =
      plano.rows[0]
      .duracao_meses;

    const query = `
      INSERT INTO assinatura(
        aluno_id,
        plano_id,
        data_inicio,
        data_fim,
        status_assinatura,
        data_assinatura
      )

      VALUES(
        $1,
        $2,
        CURRENT_DATE,
        CURRENT_DATE + ($3 || ' month')::INTERVAL,
        'Ativo',
        CURRENT_DATE
      )

      RETURNING *
    `;

    const { rows } =
      await pool.query(
        query,
        [
          aluno_id,
          plano_id,
          meses
        ]
      );

    return rows[0];

  }


  static async cancelar(id){

    const query = `
      UPDATE assinatura
      SET status_assinatura='Cancelado'

      WHERE id=$1

      RETURNING *
    `;

    const { rows } =
      await pool.query(
        query,
        [id]
      );

    return rows[0];

  }


  static async renovar(id){

    const query = `
      UPDATE assinatura

      SET
      data_inicio=CURRENT_DATE,

      data_fim=
      CURRENT_DATE +
      (
        (
          SELECT duracao_meses
          FROM plano
          WHERE id=assinatura.plano_id
        ) || ' month'
      )::INTERVAL,

      status_assinatura='Ativo'

      WHERE id=$1

      RETURNING *
    `;

    const { rows } =
      await pool.query(
        query,
        [id]
      );

    return rows[0];

  }

  static async atualizar(id, dados){

    const {
      plano_id,
      status_assinatura
    } = dados;

    const query = `
      UPDATE assinatura
      SET
      plano_id=$1,
      status_assinatura=$2

      WHERE id=$3

      RETURNING *
    `;

    const valores = [
      plano_id,
      status_assinatura,
      id
    ];

    const { rows } =
      await pool.query(
        query,
        valores
      );

    return rows[0];

  }

}

module.exports = Assinatura;