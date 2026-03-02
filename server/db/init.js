import pool from './pool.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { seedDb } from './seed.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export async function initDb() {
  const client = await pool.connect()
  try {
    const schemaPath = path.join(__dirname, 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf-8')
    await client.query(schema)
    console.log('Database schema initialized')
    await seedDb()
  } finally {
    client.release()
  }
}

export async function testConnection() {
  const client = await pool.connect()
  try {
    const result = await client.query('SELECT NOW()')
    return result.rows[0]
  } finally {
    client.release()
  }
}
