import { useState, useEffect, useMemo } from 'react'
import Header from '../components/Header'
import AdminDashboard from '../components/admin/AdminDashboard'
import InventoryStatus from '../components/admin/InventoryStatus'
import OrderStatus from '../components/admin/OrderStatus'
import { api } from '../api/client'
import './AdminPage.css'

function AdminPage() {
  const [menus, setMenus] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = () => {
    Promise.all([api.getMenus(), api.getOrders()])
      .then(([menusData, ordersData]) => {
        setMenus(menusData.filter((m) => [1, 2, 3].includes(m.id)))
        setOrders(ordersData)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [])

  const inventory = useMemo(
    () => menus.reduce((acc, m) => ({ ...acc, [m.id]: m.stock ?? 0 }), {}),
    [menus]
  )

  const stats = useMemo(() => {
    const received = orders.filter((o) => o.status === 'received').length
    const inProduction = orders.filter((o) => o.status === 'in_production').length
    const completed = orders.filter((o) => o.status === 'completed').length
    return {
      total: orders.length,
      received,
      inProduction,
      completed,
    }
  }, [orders])

  const handleStartProduction = async (orderId) => {
    try {
      const updated = await api.updateOrderStatus(orderId, 'in_production')
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)))
    } catch (err) {
      alert(err.message || '상태 변경에 실패했습니다.')
    }
  }

  const handleComplete = async (orderId) => {
    try {
      const updated = await api.updateOrderStatus(orderId, 'completed')
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)))
    } catch (err) {
      alert(err.message || '상태 변경에 실패했습니다.')
    }
  }

  const handleUpdateInventory = async (menuId, delta) => {
    try {
      await api.updateMenuStock(menuId, delta)
      const freshMenus = await api.getMenus()
      setMenus(freshMenus.filter((m) => [1, 2, 3].includes(m.id)))
    } catch (err) {
      alert(err.message || '재고 수정에 실패했습니다.')
    }
  }

  if (loading) return <div className="admin-page"><Header /><p className="admin-page__loading">로딩 중...</p></div>
  if (error) return <div className="admin-page"><Header /><p className="admin-page__error">데이터를 불러올 수 없습니다: {error}</p></div>

  return (
    <div className="admin-page">
      <Header />
      <main className="admin-page__main">
        <AdminDashboard
          totalOrders={stats.total}
          receivedCount={stats.received}
          inProductionCount={stats.inProduction}
          completedCount={stats.completed}
        />
        <InventoryStatus
          menus={menus}
          inventory={inventory}
          onUpdate={handleUpdateInventory}
        />
        <OrderStatus
          orders={orders}
          onStartProduction={handleStartProduction}
          onComplete={handleComplete}
        />
      </main>
    </div>
  )
}

export default AdminPage
