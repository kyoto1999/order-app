import { NavLink } from 'react-router-dom'
import './Header.css'

function Header() {
  return (
    <header className="header">
      <h1 className="header__logo">COZY</h1>
      <nav className="header__nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `header__tab ${isActive ? 'header__tab--active' : ''}`
          }
        >
          주문하기
        </NavLink>
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            `header__tab ${isActive ? 'header__tab--active' : ''}`
          }
        >
          관리자
        </NavLink>
      </nav>
    </header>
  )
}

export default Header
