import 'dotenv/config'
import pool from '../db/pool.js'

const UPDATES = [
  { name: '아메리카노(ICE)', image_url: '/images/americano-ice.jpg' },
  { name: '아메리카노(HOT)', image_url: '/images/americano-hot.jpg' },
  { name: '카페라떼', image_url: '/images/caffe-latte.jpg' },
]

async function updateImages() {
  const client = await pool.connect()
  try {
    for (const { name, image_url } of UPDATES) {
      const result = await client.query(
        'UPDATE menus SET image_url = $1 WHERE name = $2 RETURNING id, name, image_url',
        [image_url, name]
      )
      if (result.rows.length > 0) {
        console.log(`Updated: ${name} -> ${image_url}`)
      } else {
        console.log(`Not found: ${name}`)
      }
    }
    console.log('Done')
  } finally {
    client.release()
    await pool.end()
  }
}

updateImages().catch((err) => {
  console.error(err)
  process.exit(1)
})
