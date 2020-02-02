const mysql = require('mysql2/promise')
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
})

module.exports.query = (sql, args) => {
  return pool.query(sql, args).then(r => r[0])
}
