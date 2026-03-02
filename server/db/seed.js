import pool from './pool.js'

const MENUS = [
  {
    name: '아메리카노(ICE)',
    description: '시원하고 깔끔한 아이스 아메리카노',
    price: 4000,
    image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&h=400&fit=crop',
    stock: 10,
    options: [
      { name: '샷 추가', additional_price: 500 },
      { name: '시럽 추가', additional_price: 0 },
    ],
  },
  {
    name: '아메리카노(HOT)',
    description: '따뜻하고 진한 핫 아메리카노',
    price: 4000,
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&h=400&fit=crop',
    stock: 10,
    options: [
      { name: '샷 추가', additional_price: 500 },
      { name: '시럽 추가', additional_price: 0 },
    ],
  },
  {
    name: '카페라떼',
    description: '부드러운 우유와 에스프레소의 조화',
    price: 5000,
    image_url: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400&h=400&fit=crop',
    stock: 10,
    options: [
      { name: '샷 추가', additional_price: 500 },
      { name: '시럽 추가', additional_price: 0 },
    ],
  },
]

export async function seedDb() {
  const client = await pool.connect()
  try {
    const menuCount = await client.query('SELECT COUNT(*) FROM menus')
    if (parseInt(menuCount.rows[0].count, 10) > 0) {
      console.log('Database already seeded, skipping')
      return
    }

    for (const menu of MENUS) {
      const menuResult = await client.query(
        `INSERT INTO menus (name, description, price, image_url, stock)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [menu.name, menu.description, menu.price, menu.image_url, menu.stock]
      )
      const menuId = menuResult.rows[0].id

      for (const opt of menu.options) {
        await client.query(
          `INSERT INTO options (name, additional_price, menu_id)
           VALUES ($1, $2, $3)`,
          [opt.name, opt.additional_price, menuId]
        )
      }
    }
    console.log('Seed data inserted')
  } finally {
    client.release()
  }
}
