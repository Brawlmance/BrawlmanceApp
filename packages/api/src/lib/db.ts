import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
})

// TODO: narrow row types per query (RowDataPacket / ResultSetHeader)
async function query(sql: string, args?: unknown): Promise<unknown> {
  const [rows] = await pool.query(sql, args)
  return rows
}

export default { query }
