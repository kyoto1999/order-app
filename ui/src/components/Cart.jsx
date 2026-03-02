import './Cart.css'

function Cart({ items, onOrder }) {
  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0)

  const getItemKey = (item) => {
    const optionsKey = (item.options ?? []).map((o) => o.id).sort().join('-')
    return `${item.menuId}-${optionsKey}`
  }

  const groupedItems = items.reduce((acc, item) => {
    const key = getItemKey(item)
    if (acc[key]) {
      acc[key].quantity += item.quantity
    } else {
      acc[key] = { ...item }
    }
    return acc
  }, {})

  const cartItems = Object.values(groupedItems)

  return (
    <section className="cart">
      <h2 className="cart__title">장바구니</h2>
      <div className="cart__content">
        <div className="cart__left">
          {cartItems.length === 0 ? (
            <p className="cart__empty">장바구니가 비어 있습니다.</p>
          ) : (
            <ul className="cart__list">
              {cartItems.map((item) => (
                <li key={getItemKey(item)} className="cart__item">
                  <span className="cart__item-name">
                    {item.menuName}
                    {item.options?.length > 0 && (
                      <span className="cart__item-options">
                        {' '}
                        ({(item.options ?? []).map((o) => o.name).join(', ')})
                      </span>
                    )}{' '}
                    X {item.quantity}
                  </span>
                  <span className="cart__item-price">
                    {(item.totalPrice * item.quantity).toLocaleString()}원
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="cart__right">
          <p className="cart__total">
            총 금액 <strong>{totalAmount.toLocaleString()}원</strong>
          </p>
          <button
            type="button"
            className="cart__order-btn"
            onClick={onOrder}
            disabled={cartItems.length === 0}
          >
            주문하기
          </button>
        </div>
      </div>
    </section>
  )
}

export default Cart
