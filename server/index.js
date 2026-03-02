import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { initDb, testConnection } from './db/init.js'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.redirect('/api/health')
})

app.get('/api/health', async (req, res) => {
  try {
    const result = await testConnection()
    res.json({
      status: 'ok',
      message: 'COZY Order Server',
      database: 'connected',
      timestamp: result?.now,
    })
  } catch (err) {
    res.status(503).json({
      status: 'error',
      message: 'Database connection failed',
      error: err.message,
    })
  }
})

async function startServer() {
  try {
    await initDb()
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`)
      console.log('Database connected')
    })
  } catch (err) {
    console.error('Failed to start server:', err.message)
    process.exit(1)
  }
}

startServer()
