import './AdminDashboard.css'

function AdminDashboard({ totalOrders, receivedCount, inProductionCount, completedCount }) {
  return (
    <section className="admin-dashboard">
      <h2 className="admin-dashboard__title">관리자 대시보드</h2>
      <p className="admin-dashboard__summary">
        총 주문 {totalOrders} / 주문 접수 {receivedCount} / 제조 중 {inProductionCount} / 제조 완료 {completedCount}
      </p>
    </section>
  )
}

export default AdminDashboard
