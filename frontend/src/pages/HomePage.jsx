import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MovieCard from '../components/MovieCard'
import MovieModal from '../components/MovieModal'

const FALLBACK_POSTER = 'https://via.placeholder.com/200x300/1f1f1f/e50914?text=No+Poster'

export default function HomePage() {
  const navigate  = useNavigate()
  const [user,        setUser]        = useState(null)
  const [movies,      setMovies]      = useState([])
  const [series,      setSeries]      = useState([])
  const [comingSoon,  setComingSoon]  = useState([])
  const [genres,      setGenres]      = useState([])
  const [searchVal,   setSearchVal]   = useState('')
  const [searchRes,   setSearchRes]   = useState(null)   // null = не искали
  const [activeGenre, setActiveGenre] = useState(null)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [scrolled,    setScrolled]    = useState(false)
  const [loading,     setLoading]     = useState(true)

  // Проверка авторизации
  useEffect(() => {
    fetch('/api/me/', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (!d.authenticated) navigate('/login'); else setUser(d) })
      .catch(() => navigate('/login'))
  }, [navigate])

  // Загрузка каталога
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [movRes, serRes, csRes, genRes] = await Promise.all([
          fetch('/api/movies/?type=movie',       { credentials: 'include' }),
          fetch('/api/movies/?type=series',      { credentials: 'include' }),
          fetch('/api/movies/?coming_soon=true', { credentials: 'include' }),
          fetch('/api/genres/',                  { credentials: 'include' }),
        ])
        setMovies(    await movRes.json())
        setSeries(    await serRes.json())
        setComingSoon(await csRes.json())
        setGenres(    await genRes.json())
      } catch (e) {
        console.error('Failed to load catalog:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  // Scroll-эффект хедера
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const handleSearch = async () => {
    if (!searchVal.trim()) { setSearchRes(null); return }
    const url = `/api/movies/?search=${encodeURIComponent(searchVal)}` +
      (activeGenre ? `&genre=${activeGenre}` : '')
    const res  = await fetch(url, { credentials: 'include' })
    setSearchRes(await res.json())
  }

  const handleGenreFilter = async (gid) => {
    const next = activeGenre === gid ? null : gid
    setActiveGenre(next)
    if (!searchVal.trim() && !next) { setSearchRes(null); return }
    const url = `/api/movies/?` +
      (searchVal ? `search=${encodeURIComponent(searchVal)}&` : '') +
      (next ? `genre=${next}` : '')
    const res = await fetch(url, { credentials: 'include' })
    setSearchRes(await res.json())
  }

  const handleLogout = async () => {
    await fetch('/api/logout/', { method: 'POST', credentials: 'include' })
    navigate('/login')
  }

  // Первый фильм как герой-баннер
  const hero = movies[0] || null

  return (
    <>
      {/* ── Header ── */}
      <header className={scrolled ? 'scrolled' : ''}>
        <div className="header-container">
          <div className="header-left">
            <div className="logo">
              <i className="fas fa-cat"></i>
              <span className="logo-flix">FLIX</span>
            </div>
            <nav className="main-nav">
              <Link to="/home"      className="nav-link active">Home</Link>
              <a href="#movies"     className="nav-link">Movies</a>
              <a href="#series"     className="nav-link">Series</a>
              <a href="#coming"     className="nav-link">Coming Soon</a>
              <a href="#community" className="nav-link">Community</a>
            </nav>
          </div>
          <div className="header-right">
            {user && (
              <div className="user-menu">
                <div className="user-avatar"><i className="fas fa-cat"></i></div>
                <div className="user-dropdown">
                  <span className="username">{user.username}</span>
                  <i className="fas fa-chevron-down"></i>
                  <div className="dropdown-content">
                    <a href="#"><i className="fas fa-user"></i> Profile</a>
                    <a href="#"><i className="fas fa-film"></i> My List</a>
                    <a href="#"><i className="fas fa-heart"></i> Favorites</a>
                    <div className="dropdown-divider"></div>
                    <a href="#" className="logout-link"
                       onClick={e => { e.preventDefault(); handleLogout() }}>
                      <i className="fas fa-sign-out-alt"></i> Sign Out
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="main">

        {/* ── Hero ── */}
        <div className="hero" style={hero ? {
          background: `linear-gradient(to top, #141414, transparent),
                       linear-gradient(to right, rgba(0,0,0,0.8), transparent),
                       url('${hero.poster_url || FALLBACK_POSTER}') center/cover no-repeat`
        } : {}}>
          <div className="hero-overlay"></div>
          <div className="hero-content">
            {hero && <h1 className="hero-title">{hero.title}</h1>}
            <p className="hero-subtitle">
              {hero ? hero.description.slice(0, 120) + '…' : 'Unlimited Movies & Series'}
            </p>
            <div className="hero-search">
              <input
                className="search-input"
                type="text"
                placeholder="Search movies, series..."
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              <button className="search-button" onClick={handleSearch}>
                <i className="fas fa-search"></i> Search
              </button>
            </div>
          </div>
        </div>

        {/* ── Genre filter ── */}
        {genres.length > 0 && (
          <div style={{padding: '20px 60px 0', display:'flex', gap:10, flexWrap:'wrap'}}>
            {genres.map(g => (
              <button key={g.id} onClick={() => handleGenreFilter(g.id)} style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: `1px solid ${activeGenre === g.id ? 'var(--netflix-red)' : 'var(--netflix-gray)'}`,
                background: activeGenre === g.id ? 'var(--netflix-red)' : 'transparent',
                color: '#fff', cursor: 'pointer', fontSize: 13,
                transition: 'all 0.2s',
              }}>{g.name}</button>
            ))}
            {(activeGenre || searchRes) && (
              <button onClick={() => { setActiveGenre(null); setSearchRes(null); setSearchVal('') }} style={{
                padding: '6px 14px', borderRadius: 20,
                border: '1px solid #555', background: 'transparent',
                color: '#aaa', cursor: 'pointer', fontSize: 13,
              }}>✕ Clear</button>
            )}
          </div>
        )}

        {/* ── Search results ── */}
        {searchRes !== null && (
          <section className="section">
            <div className="section-header">
              <h2 className="section-title">
                Search results {searchVal && `for "${searchVal}"`}
                <span style={{fontSize:16, fontWeight:400, color:'#888', marginLeft:10}}>
                  ({searchRes.length} found)
                </span>
              </h2>
            </div>
            {searchRes.length === 0
              ? <p style={{padding:'0 60px', color:'var(--netflix-light-gray)'}}>Nothing found.</p>
              : <div className="content-grid">
                  {searchRes.map(m => (
                    <MovieCard key={m.id} movie={m} onSelect={setSelectedMovie} />
                  ))}
                </div>
            }
          </section>
        )}

        {/* ── Popular movies ── */}
        {searchRes === null && (
          <>
            <section className="section" id="movies">
              <div className="section-header">
                <h2 className="section-title">Popular Movies</h2>
              </div>
              {loading
                ? <p style={{padding:'0 60px', color:'#555'}}>Loading…</p>
                : <div className="content-grid">
                    {movies.map(m => (
                      <MovieCard key={m.id} movie={m} onSelect={setSelectedMovie} />
                    ))}
                  </div>
              }
            </section>

            {/* ── Series ── */}
            <section className="section" id="series">
              <div className="section-header">
                <h2 className="section-title">Series</h2>
              </div>
              {loading
                ? <p style={{padding:'0 60px', color:'#555'}}>Loading…</p>
                : <div className="content-grid">
                    {series.map(m => (
                      <MovieCard key={m.id} movie={m} onSelect={setSelectedMovie} />
                    ))}
                  </div>
              }
            </section>

            {/* ── Coming Soon ── */}
            <section className="section" id="coming">
              <div className="section-header">
                <h2 className="section-title">Coming Soon</h2>
              </div>
              {loading
                ? <p style={{padding:'0 60px', color:'#555'}}>Loading…</p>
                : <div className="coming-grid">
                    {comingSoon.map(m => (
                      <div className="coming-card" key={m.id}
                           onClick={() => setSelectedMovie(m)}
                           style={{cursor:'pointer'}}>
                        <img
                          src={m.poster_url || FALLBACK_POSTER}
                          alt={m.title}
                          onError={e => { e.target.src = FALLBACK_POSTER }}
                        />
                        <div className="coming-info">
                          {m.release_date && (
                            <span className="coming-date">
                              {new Date(m.release_date).toLocaleDateString('en-US', {month:'long', year:'numeric'})}
                            </span>
                          )}
                          <h4>{m.title}</h4>
                          <p>{m.description.slice(0, 80)}…</p>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </section>
          </>
        )}

      </main>

      {/* ── Footer ── */}
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
              <li><a href="#movies">Movies</a></li>
              <li><a href="#series">Series</a></li>
              <li><a href="#coming">Coming Soon</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Terms</a></li>
              <li><a href="#">Privacy</a></li>
              <li><a href="#">Cookies</a></li>
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

      {/* ── Movie modal ── */}
      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </>
  )
}
