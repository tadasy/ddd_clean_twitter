import mysql from 'mysql2/promise'
import { drizzle } from 'drizzle-orm/mysql2'

const host = process.env.DB_HOST ?? 'db'
const port = Number(process.env.DB_PORT ?? '3306')
const user = process.env.DB_USER ?? 'app'
const password = process.env.DB_PASSWORD ?? 'password'
const database = process.env.DB_NAME ?? 'ddd_twitter'

export const pool = mysql.createPool({ host, port, user, password, database, connectionLimit: 10 })
export const db = drizzle(pool)
