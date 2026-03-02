import pg from 'pg'
import 'dotenv/config'

const { Client } = pg

async function createDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  })

  try {
    await client.connect()
    const dbName = process.env.DB_NAME || 'cozy_order'
    await client.query(`CREATE DATABASE ${dbName}`)
    console.log(`Database '${dbName}' created`)
  } catch (err) {
    if (err.code === '42P04') {
      console.log(`Database '${process.env.DB_NAME || 'cozy_order'}' already exists`)
    } else {
      throw err
    }
  } finally {
    await client.end()
  }
}

createDatabase().catch((err) => {
  console.error(err)
  process.exit(1)
})
