import { useState } from 'react'
import './MenuCard.css'

function MenuCard({ menu, onAddToCart }) {
  const [selectedOptions, setSelectedOptions] = useState([])
  const stock = menu.stock ?? 0
  const isSoldOut = stock <= 0

  const handleOptionChange = (option) => {
    setSelectedOptions((prev) =>
      prev.includes(option.id)
        ? prev.filter((id) => id !== option.id)
        : [...prev, option.id]
    )
  }

  const handleAddToCart = () => {
    if (isSoldOut) return
    const options = menu.options.filter((opt) => selectedOptions.includes(opt.id))
    const additionalPrice = options.reduce((sum, opt) => sum + opt.additionalPrice, 0)
    const totalPrice = menu.price + additionalPrice

    onAddToCart({
      menuId: menu.id,
      menuName: menu.name,
      options,
      quantity: 1,
      unitPrice: menu.price,
      additionalPrice,
      totalPrice,
    })

    setSelectedOptions([])
  }

  return (
    <article className="menu-card">
      <div className="menu-card__image">
        {menu.imageUrl ? (
          <img src={menu.imageUrl} alt={menu.name} loading="lazy" />
        ) : (
          <div className="menu-card__image-placeholder">
            <span>이미지</span>
          </div>
        )}
      </div>
      <h3 className="menu-card__name">{menu.name}</h3>
      <p className="menu-card__price">{menu.price.toLocaleString()}원</p>
      <p className="menu-card__description">{menu.description}</p>
      <div className="menu-card__options">
        {menu.options.map((option) => (
          <label key={option.id} className="menu-card__option">
            <input
              type="checkbox"
              checked={selectedOptions.includes(option.id)}
              onChange={() => handleOptionChange(option)}
            />
            <span>
              {option.name} ({option.additionalPrice > 0 ? `+${option.additionalPrice.toLocaleString()}원` : '+0원'})
            </span>
          </label>
        ))}
      </div>
      <button
        type="button"
        className="menu-card__add-btn"
        onClick={handleAddToCart}
        disabled={isSoldOut}
      >
        {isSoldOut ? '품절' : '담기'}
      </button>
    </article>
  )
}

export default MenuCard
