import { useState, useEffect } from 'react'
import Header from '../components/Header'
import MenuCard from '../components/MenuCard'
import Cart from '../components/Cart'
import { api } from '../api/client'
import './OrderPage.css'

function OrderPage() {
  const [menus, setMenus] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api
      .getMenus()
      .then((data) => setMenus(data.filter((m) => [1, 2, 3].includes(m.id))))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleAddToCart = (item) => {
    setCartItems((prev) => [...prev, item])
  }

  const getItemKey = (item) => {
    const optionsKey = (item.options ?? []).map((o) => o.id).sort().join('-')
    return `${item.menuId}-${optionsKey}`
  }

  const handleOrder = async () => {
    if (cartItems.length === 0) return
    const grouped = cartItems.reduce((acc, item) => {
      const key = getItemKey(item)
      if (acc[key]) acc[key].quantity += item.quantity
      else acc[key] = { ...item }
      return acc
    }, {})
    const orderItems = Object.values(grouped)
    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.totalPrice * item.quantity,
      0
    )
    try {
      await api.createOrder({
        items: orderItems.map(({ menuId, menuName, options, quantity, totalPrice }) => ({
          menuId,
          menuName,
          options: options ?? [],
          quantity,
          unitPrice: totalPrice,
          totalPrice: totalPrice * quantity,
        })),
        totalPrice: totalAmount,
      })
      alert('주문이 접수되었습니다!')
      setCartItems([])
      const freshMenus = await api.getMenus()
      setMenus(freshMenus.filter((m) => [1, 2, 3].includes(m.id)))
    } catch (err) {
      alert(err.message || '주문에 실패했습니다.')
    }
  }

  if (loading) return <div className="order-page"><Header /><p className="order-page__loading">로딩 중...</p></div>
  if (error) return <div className="order-page"><Header /><p className="order-page__error">메뉴를 불러올 수 없습니다: {error}</p></div>

  return (
    <div className="order-page">
      <Header />
      <main className="order-page__main">
        <section className="order-page__menus">
          {menus.map((menu) => (
            <MenuCard key={menu.id} menu={menu} onAddToCart={handleAddToCart} />
          ))}
        </section>
        <aside className="order-page__cart">
          <Cart items={cartItems} onOrder={handleOrder} />
        </aside>
      </main>
    </div>
  )
}

export default OrderPage
