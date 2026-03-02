import { useMemo } from 'react'
import Header from '../components/Header'
import AdminDashboard from '../components/admin/AdminDashboard'
import InventoryStatus from '../components/admin/InventoryStatus'
import OrderStatus from '../components/admin/OrderStatus'
import { useApp } from '../context/AppContext'
import { MENUS } from '../data/menus'
import './AdminPage.css'

const ADMIN_MENUS = MENUS.slice(0, 3)

function AdminPage() {
  const { orders, inventory, updateOrderStatus, updateInventory } = useApp()

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

  const handleStartProduction = (orderId) => {
    updateOrderStatus(orderId, 'in_production')
  }

  const handleComplete = (orderId) => {
    updateOrderStatus(orderId, 'completed')
  }

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
          menus={ADMIN_MENUS}
          inventory={inventory}
          onUpdate={updateInventory}
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
