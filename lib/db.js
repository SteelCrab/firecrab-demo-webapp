import pg from 'pg';

const { Pool } = pg;

export function createDb(connectionString) {
  const pool = new Pool({ connectionString });

  async function init() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        question TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
  }

  async function listQuestions() {
    const { rows } = await pool.query(
      'SELECT id, name, question, created_at FROM questions ORDER BY id ASC',
    );
    return rows;
  }

  async function addQuestion({ name, question }) {
    const { rows } = await pool.query(
      'INSERT INTO questions (name, question) VALUES ($1, $2) RETURNING id, name, question, created_at',
      [name, question],
    );
    return rows[0];
  }

  async function clear() {
    await pool.query('DELETE FROM questions');
  }

  return { init, listQuestions, addQuestion, clear, close: () => pool.end() };
}
