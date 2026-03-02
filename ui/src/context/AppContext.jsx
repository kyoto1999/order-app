import { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext(null)

const INITIAL_INVENTORY = {
  1: 10, // 아메리카노(ICE)
  2: 10, // 아메리카노(HOT)
  3: 10, // 카페라떼
}

const createSampleOrder = () => {
  const d = new Date()
  d.setHours(13, 0, 0, 0)
  return {
    id: 1730000000000,
    status: 'received',
    items: [
      { menuName: '아메리카노(ICE)', options: [{ name: '샷 추가' }], quantity: 1, totalPrice: 4500 },
    ],
    totalPrice: 4500,
    orderedAt: d,
  }
}

export function AppProvider({ children }) {
  const [orders, setOrders] = useState([createSampleOrder()])
  const [inventory, setInventory] = useState(INITIAL_INVENTORY)

  const addOrder = useCallback((orderItems, totalAmount) => {
    const newOrder = {
      id: Date.now(),
      status: 'received', // 주문 접수
      items: orderItems,
      totalPrice: totalAmount,
      orderedAt: new Date(),
    }
    setOrders((prev) => [newOrder, ...prev])

    // 주문 시 재고 차감
    setInventory((prev) => {
      const next = { ...prev }
      orderItems.forEach((item) => {
        const current = next[item.menuId] ?? 0
        next[item.menuId] = Math.max(0, current - item.quantity)
      })
      return next
    })
  }, [])

  const updateOrderStatus = useCallback((orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    )
  }, [])

  const updateInventory = useCallback((menuId, delta) => {
    setInventory((prev) => {
      const current = prev[menuId] ?? 0
      const next = Math.max(0, current + delta)
      return { ...prev, [menuId]: next }
    })
  }, [])

  const value = {
    orders,
    inventory,
    addOrder,
    updateOrderStatus,
    updateInventory,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
