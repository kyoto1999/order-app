import './InventoryStatus.css'

function getStockStatus(stock) {
  if (stock === 0) return { label: '품절', className: 'inventory-status__badge--soldout' }
  if (stock < 5) return { label: '주의', className: 'inventory-status__badge--warning' }
  return { label: '정상', className: 'inventory-status__badge--normal' }
}

function InventoryStatus({ menus, inventory, onUpdate }) {
  return (
    <section className="inventory-status">
      <h2 className="inventory-status__title">재고 현황</h2>
      <div className="inventory-status__list">
        {menus.map((menu) => {
          const stock = inventory[menu.id] ?? 0
          const { label, className } = getStockStatus(stock)
          return (
            <div key={menu.id} className="inventory-status__card">
              <h3 className="inventory-status__menu-name">{menu.name}</h3>
              <div className="inventory-status__stock-row">
                <span className="inventory-status__count">{stock}개</span>
                <span className={`inventory-status__badge ${className}`}>{label}</span>
              </div>
              <div className="inventory-status__controls">
                <button
                  type="button"
                  className="inventory-status__btn"
                  onClick={() => onUpdate(menu.id, -1)}
                  disabled={stock <= 0}
                >
                  -
                </button>
                <button
                  type="button"
                  className="inventory-status__btn"
                  onClick={() => onUpdate(menu.id, 1)}
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default InventoryStatus
