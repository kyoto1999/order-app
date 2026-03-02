import 'dotenv/config'
import { initDb } from '../db/init.js'

initDb()
  .then(() => {
    console.log('Done')
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
