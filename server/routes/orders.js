import { Router } from 'express'
import pool from '../db/pool.js'

const router = Router()

// GET /api/orders - 주문 목록 조회
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.id, o.ordered_at, o.status, o.total_price
       FROM orders o ORDER BY o.ordered_at DESC`
    )

    const orders = await Promise.all(
      result.rows.map(async (row) => {
        const itemsResult = await pool.query(
          `SELECT menu_id, menu_name, quantity, unit_price, options
           FROM order_items WHERE order_id = $1`,
          [row.id]
        )
        const items = itemsResult.rows.map((i) => ({
          menuId: i.menu_id,
          menuName: i.menu_name,
          quantity: i.quantity,
          unitPrice: i.unit_price,
          totalPrice: i.unit_price * i.quantity,
          options: i.options || [],
        }))
        return {
          id: row.id,
          orderedAt: row.ordered_at,
          status: row.status,
          totalPrice: row.total_price,
          items,
        }
      })
    )

    res.json(orders)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/orders/:id - 주문 단건 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const orderResult = await pool.query(
      'SELECT id, ordered_at, status, total_price FROM orders WHERE id = $1',
      [id]
    )

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const order = orderResult.rows[0]
    const itemsResult = await pool.query(
      `SELECT menu_id, menu_name, quantity, unit_price, options
       FROM order_items WHERE order_id = $1`,
      [id]
    )

    const items = itemsResult.rows.map((i) => ({
      menuId: i.menu_id,
      menuName: i.menu_name,
      quantity: i.quantity,
      unitPrice: i.unit_price,
      totalPrice: i.unit_price * i.quantity,
      options: i.options || [],
    }))

    res.json({
      id: order.id,
      orderedAt: order.ordered_at,
      status: order.status,
      totalPrice: order.total_price,
      items,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// POST /api/orders - 주문 생성
router.post('/', async (req, res) => {
  const client = await pool.connect()
  try {
    const { items, totalPrice } = req.body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items array is required' })
    }

    if (totalPrice === undefined || typeof totalPrice !== 'number') {
      return res.status(400).json({ error: 'totalPrice (number) is required' })
    }

    await client.query('BEGIN')

    // 재고 확인 및 차감
    for (const item of items) {
      const stockResult = await client.query(
        'SELECT stock FROM menus WHERE id = $1',
        [item.menuId]
      )
      if (stockResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return res.status(400).json({ error: `Menu ${item.menuId} not found` })
      }
      const stock = stockResult.rows[0].stock
      if (stock < item.quantity) {
        await client.query('ROLLBACK')
        return res.status(400).json({
          error: `Insufficient stock for ${item.menuName}. Available: ${stock}`,
        })
      }
      await client.query(
        'UPDATE menus SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.menuId]
      )
    }

    // 주문 생성
    const orderResult = await client.query(
      `INSERT INTO orders (status, total_price) VALUES ('received', $1) RETURNING id, ordered_at, status, total_price`,
      [totalPrice]
    )
    const order = orderResult.rows[0]

    // 주문 항목 생성
    for (const item of items) {
      const unitPrice = item.unitPrice ?? item.totalPrice
      await client.query(
        `INSERT INTO order_items (order_id, menu_id, menu_name, quantity, unit_price, options)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          order.id,
          item.menuId,
          item.menuName,
          item.quantity,
          unitPrice,
          JSON.stringify(item.options || []),
        ]
      )
    }

    await client.query('COMMIT')

    const itemsResult = await pool.query(
      `SELECT menu_id, menu_name, quantity, unit_price, options
       FROM order_items WHERE order_id = $1`,
      [order.id]
    )

    const orderItems = itemsResult.rows.map((i) => ({
      menuId: i.menu_id,
      menuName: i.menu_name,
      quantity: i.quantity,
      unitPrice: i.unit_price,
      totalPrice: i.unit_price * i.quantity,
      options: i.options || [],
    }))

    res.status(201).json({
      id: order.id,
      orderedAt: order.ordered_at,
      status: order.status,
      totalPrice: order.total_price,
      items: orderItems,
    })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error(err)
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
})

// PATCH /api/orders/:id/status - 주문 상태 변경
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ['received', 'in_production', 'completed']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: `status must be one of: ${validStatuses.join(', ')}`,
      })
    }

    const result = await pool.query(
      `UPDATE orders SET status = $1 WHERE id = $2
       RETURNING id, ordered_at, status, total_price`,
      [status, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' })
    }

    const order = result.rows[0]
    const itemsResult = await pool.query(
      `SELECT menu_id, menu_name, quantity, unit_price, options
       FROM order_items WHERE order_id = $1`,
      [id]
    )

    const items = itemsResult.rows.map((i) => ({
      menuId: i.menu_id,
      menuName: i.menu_name,
      quantity: i.quantity,
      unitPrice: i.unit_price,
      totalPrice: i.unit_price * i.quantity,
      options: i.options || [],
    }))

    res.json({
      id: order.id,
      orderedAt: order.ordered_at,
      status: order.status,
      totalPrice: order.total_price,
      items,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

export default router
