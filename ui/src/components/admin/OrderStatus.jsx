import './OrderStatus.css'

const STATUS_LABELS = {
  received: '주문 접수',
  in_production: '제조 중',
  completed: '제조 완료',
}

function formatOrderDate(date) {
  const d = new Date(date)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hours = d.getHours()
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${month}월 ${day}일 ${hours}:${minutes}`
}

function OrderStatus({ orders, onStartProduction, onComplete }) {
  return (
    <section className="order-status">
      <h2 className="order-status__title">주문 현황</h2>
      {orders.length === 0 ? (
        <p className="order-status__empty">주문이 없습니다.</p>
      ) : (
        <ul className="order-status__list">
          {orders.map((order) => (
            <li key={order.id} className="order-status__item">
              <div className="order-status__info">
                <span className="order-status__date">
                  {formatOrderDate(order.orderedAt)}
                </span>
                <span className="order-status__menu">
                  {order.items
                    .map((item) => `${item.menuName}${item.options?.length ? ` (${item.options.map((o) => o.name).join(', ')})` : ''} x ${item.quantity}`)
                    .join(', ')}
                </span>
                <span className="order-status__price">
                  {order.totalPrice.toLocaleString()}원
                </span>
              </div>
              <div className="order-status__actions">
                {order.status === 'received' && (
                  <button
                    type="button"
                    className="order-status__btn"
                    onClick={() => onStartProduction(order.id)}
                  >
                    제조 시작
                  </button>
                )}
                {order.status === 'in_production' && (
                  <button
                    type="button"
                    className="order-status__btn"
                    onClick={() => onComplete(order.id)}
                  >
                    제조 완료
                  </button>
                )}
                {order.status === 'completed' && (
                  <span className="order-status__badge">{STATUS_LABELS.completed}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default OrderStatus
