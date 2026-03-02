import { Router } from 'express'
import pool from '../db/pool.js'

const router = Router()

// GET /api/menus - 메뉴 목록 조회 (옵션 포함)
router.get('/', async (req, res) => {
  try {
    const menusResult = await pool.query(
      'SELECT id, name, description, price, image_url, stock FROM menus ORDER BY id'
    )
    const optionsResult = await pool.query(
      'SELECT id, name, additional_price, menu_id FROM options ORDER BY menu_id, id'
    )

    const optionsByMenu = optionsResult.rows.reduce((acc, opt) => {
      if (!acc[opt.menu_id]) acc[opt.menu_id] = []
      acc[opt.menu_id].push({
        id: opt.id,
        name: opt.name,
        additionalPrice: opt.additional_price,
      })
      return acc
    }, {})

    const menus = menusResult.rows.map((m) => ({
      id: m.id,
      name: m.name,
      description: m.description,
      price: m.price,
      imageUrl: m.image_url,
      stock: m.stock,
      options: optionsByMenu[m.id] || [],
    }))

    res.json(menus)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// PATCH /api/menus/:id/stock - 재고 수정
router.patch('/:id/stock', async (req, res) => {
  try {
    const { id } = req.params
    const delta = parseInt(req.body.delta, 10)

    if (isNaN(delta)) {
      return res.status(400).json({ error: 'delta (number) is required' })
    }

    const result = await pool.query(
      `UPDATE menus SET stock = GREATEST(0, stock + $1) WHERE id = $2 RETURNING id, name, stock`,
      [delta, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Menu not found' })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

export default router
