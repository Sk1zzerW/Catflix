import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function HomePage() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [scrolled, setScrolled] = useState(false)

  // Проверяем авторизацию при загрузке
  useEffect(() => {
    fetch('/api/me/', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (!data.authenticated) navigate('/login')
        else setUser(data)
      })
      .catch(() => navigate('/login'))
  }, [navigate])

  // Эффект прокрутки для хедера (как в base.html)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = async () => {
    await fetch('/api/logout/', { method: 'POST', credentials: 'include' })
    navigate('/login')
  }

  // Заглушки фильмов — замените на данные с Django API
  const movies = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    title: `Movie ${i + 1}`,
    year: 2023 + (i % 3),
    genre: ['Action', 'Drama', 'Comedy', 'Thriller', 'Sci-Fi', 'Horror'][i],
    rating: (7 + Math.random() * 2).toFixed(1),
    img: `https://via.placeholder.com/200x300/1f1f1f/e50914?text=🎬`,
  }))

  return (
    <>
      {/* Header — точно как в base.html */}
      <header className={scrolled ? 'scrolled' : ''}>
        <div className="header-container">
          <div className="header-left">
            <div className="logo">
              <i className="fas fa-cat"></i>
              <span className="logo-flix">FLIX</span>
            </div>
            <nav className="main-nav">
              <Link to="/home" className="nav-link active">Home</Link>
              <a href="#" className="nav-link">Movies</a>
              <a href="#" className="nav-link">Series</a>
              <a href="#" className="nav-link">Coming Soon</a>
              <a href="#" className="nav-link">Community</a>
            </nav>
          </div>

          <div className="header-right">
            {user && (
              <div className="user-menu">
                <div className="user-avatar">
                  <i className="fas fa-cat"></i>
                </div>
                <div className="user-dropdown">
                  <span className="username">{user.username}</span>
                  <i className="fas fa-chevron-down"></i>
                  <div className="dropdown-content">
                    <a href="#"><i className="fas fa-user"></i> Profile</a>
                    <a href="#"><i className="fas fa-film"></i> My List</a>
                    <a href="#"><i className="fas fa-heart"></i> Favorites</a>
                    <a href="#"><i className="fas fa-cog"></i> Settings</a>
                    <div className="dropdown-divider"></div>
                    <a href="#" className="logout-link" onClick={e => { e.preventDefault(); handleLogout() }}>
                      <i className="fas fa-sign-out-alt"></i> Sign Out
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="main">

        {/* Hero */}
        <div className="hero">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h1 className="hero-title">Unlimited Movies & Series</h1>
            <p className="hero-subtitle">Watch anywhere. Cancel anytime.</p>
            <div className="hero-search">
              <input className="search-input" type="text" placeholder="Search movies, series..." />
              <button className="search-button">
                <i className="fas fa-search"></i> Search
              </button>
            </div>
          </div>
        </div>

        {/* Popular */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Popular Now</h2>
            <a href="#" className="section-link">See all <i className="fas fa-chevron-right"></i></a>
          </div>
          <div className="content-grid">
            {movies.map(m => (
              <div className="content-card" key={m.id}>
                <div className="card-poster">
                  <img src={m.img} alt={m.title} />
                  <span className="card-rating">⭐ {m.rating}</span>
                  <div className="card-overlay">
                    <button className="card-button"><i className="fas fa-play"></i></button>
                    <button className="card-button"><i className="fas fa-plus"></i></button>
                    <button className="card-button"><i className="fas fa-heart"></i></button>
                  </div>
                </div>
                <div className="card-info">
                  <div className="card-title">{m.title}</div>
                  <div className="card-meta">
                    <span className="card-year">{m.year}</span>
                    <span className="card-age">16+</span>
                  </div>
                  <div className="card-genre">{m.genre}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Coming Soon */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Coming Soon</h2>
            <a href="#" className="section-link">See all <i className="fas fa-chevron-right"></i></a>
          </div>
          <div className="coming-grid">
            {[1,2,3].map(i => (
              <div className="coming-card" key={i}>
                <img
                  src={`https://via.placeholder.com/600x338/1f1f1f/e50914?text=Coming+Soon`}
                  alt="Coming Soon"
                />
                <div className="coming-info">
                  <span className="coming-date">May 2025</span>
                  <h4>Upcoming Title {i}</h4>
                  <p>An exciting new release coming to CATFLIX</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer — точно как в base.html */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <div className="footer-logo">
              <i className="fas fa-cat"></i>
              <span className="logo-flix">FLIX</span>
            </div>
            <p className="footer-description">Your purr-fect destination for movies and entertainment.</p>
            <div className="social-links">
              <a href="#"><i className="fab fa-facebook"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-youtube"></i></a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Explore</h4>
            <ul>
              <li><a href="#">Home</a></li>
              <li><a href="#">Movies</a></li>
              <li><a href="#">Series</a></li>
              <li><a href="#">Coming Soon</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Press</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Terms</a></li>
              <li><a href="#">Privacy</a></li>
              <li><a href="#">Cookies</a></li>
              <li><a href="#">Help</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 CATFLIX. All rights reserved.</p>
          <div className="footer-badges">
            <i className="fas fa-film"></i>
            <i className="fas fa-cat"></i>
            <i className="fas fa-popcorn"></i>
          </div>
        </div>
      </footer>
    </>
  )
}
