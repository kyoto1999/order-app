import { useState } from 'react'
import { MENUS } from '../data/menus'
import Header from '../components/Header'
import MenuCard from '../components/MenuCard'
import Cart from '../components/Cart'
import { useApp } from '../context/AppContext'
import './OrderPage.css'

function OrderPage() {
  const [cartItems, setCartItems] = useState([])
  const { addOrder } = useApp()

  const handleAddToCart = (item) => {
    setCartItems((prev) => [...prev, item])
  }

  const handleOrder = () => {
    if (cartItems.length === 0) return
    const totalAmount = cartItems.reduce(
      (sum, item) => sum + item.totalPrice * item.quantity,
      0
    )
    addOrder(cartItems, totalAmount)
    alert('주문이 접수되었습니다!')
    setCartItems([])
  }

  return (
    <div className="order-page">
      <Header />
      <main className="order-page__main">
        <section className="order-page__menus">
          {MENUS.slice(0, 3).map((menu) => (
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
