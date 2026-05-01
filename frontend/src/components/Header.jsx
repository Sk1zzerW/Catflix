import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Header({ user, onLogout, scrolled }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Закрываем дропдаун при клике вне него
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className={scrolled ? 'scrolled' : ''}>
      <div className="header-container">
        <div className="header-left">
          <div className="logo">
            <i className="fas fa-cat"></i>
            <span className="logo-flix">FLIX</span>
          </div>
          <nav className="main-nav">
            <Link to="/home"  className="nav-link">Home</Link>
            <a href="/home#movies"  className="nav-link">Movies</a>
            <a href="/home#series"  className="nav-link">Series</a>
            <a href="/home#coming"  className="nav-link">Coming Soon</a>
          </nav>
        </div>

        <div className="header-right">
          {user && (
            <div
              className="user-menu"
              ref={dropdownRef}
            >
              {/* Клик открывает/закрывает — не hover */}
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                onClick={() => setDropdownOpen(prev => !prev)}
              >
                <div className="user-avatar">
                  <i className="fas fa-cat"></i>
                </div>
                <div className="user-dropdown" style={{ position: 'static' }}>
                  <span className="username">{user.username}</span>
                  <i className="fas fa-chevron-down"
                     style={{ marginLeft: 5, fontSize: 12,
                              transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                              transition: 'transform 0.2s' }}></i>
                </div>
              </div>

              {/* Дропдаун — показывается по клику, не по hover */}
              {dropdownOpen && (
                <div className="dropdown-content" style={{ display: 'block' }}>
                  <a href="#" onClick={e => { e.preventDefault(); setDropdownOpen(false) }}>
                    <i className="fas fa-user"></i> Profile
                  </a>
                  <a href="#" onClick={e => { e.preventDefault(); setDropdownOpen(false) }}>
                    <i className="fas fa-film"></i> My List
                  </a>
                  <a href="#" onClick={e => { e.preventDefault(); setDropdownOpen(false) }}>
                    <i className="fas fa-heart"></i> Favorites
                  </a>
                  <div className="dropdown-divider"></div>
                  <a href="#" className="logout-link"
                     onClick={e => { e.preventDefault(); setDropdownOpen(false); onLogout() }}>
                    <i className="fas fa-sign-out-alt"></i> Sign Out
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
