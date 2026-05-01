import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLang } from '../context/LangContext'
export default function Header({ user, onLogout, scrolled }) {
  const navigate = useNavigate()
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const go = (path) => { setOpen(false); navigate(path) }
  return (
    <header className={scrolled ? 'scrolled' : ''}>
      <div className="header-container">
        <div className="header-left">
          <div className="logo">
            <i className="fas fa-cat"></i>
            <span className="logo-flix">FLIX</span>
          </div>
          <nav className="main-nav">
            <Link to="/home"        className="nav-link">{t('home')}</Link>
            <a href="/home#movies"  className="nav-link">{t('movies')}</a>
            <a href="/home#series"  className="nav-link">{t('series')}</a>
            <a href="/home#coming"  className="nav-link">{t('comingSoon')}</a>
          </nav>
        </div>
        <div className="header-right">
          {user && (
            <div className="user-menu" ref={ref}>
              <div style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}
                   onClick={() => setOpen(p => !p)}>
                <div className="user-avatar">
                  <i className="fas fa-cat"></i>
                </div>
                <div className="user-dropdown" style={{ position:'static' }}>
                  <span className="username">{user.username}</span>
                  <i className="fas fa-chevron-down" style={{
                    marginLeft:5, fontSize:12,
                    transform: open ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s',
                  }}></i>
                </div>
              </div>
              {open && (
                <div className="dropdown-content" style={{ display:'block' }}>
                  <a href="#" onClick={e => { e.preventDefault(); go('/profile') }}>
                    <i className="fas fa-user"></i> {t('profile')}
                  </a>
                  <a href="#" onClick={e => { e.preventDefault(); go('/favorites') }}>
                    <i className="fas fa-heart"></i> {t('favorites')}
                  </a>
                  <div className="dropdown-divider"></div>
                  <a href="#" className="logout-link"
                     onClick={e => { e.preventDefault(); setOpen(false); onLogout() }}>
                    <i className="fas fa-sign-out-alt"></i> {t('signOut')}
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