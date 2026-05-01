import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Header    from '../components/Header'
import MovieCard from '../components/MovieCard'

const FALLBACK = 'https://via.placeholder.com/200x300/1f1f1f/e50914?text=No+Poster'

export default function HomePage() {
  const navigate = useNavigate()

  const [user,       setUser]       = useState(null)
  const [movies,     setMovies]     = useState([])
  const [series,     setSeries]     = useState([])
  const [comingSoon, setComingSoon] = useState([])
  const [genres,     setGenres]     = useState([])
  const [loading,    setLoading]    = useState(true)
  const [scrolled,   setScrolled]   = useState(false)

  // Поиск
  const [searchVal,   setSearchVal]   = useState('')
  const [searchRes,   setSearchRes]   = useState(null)   // null = нет активного поиска
  const [searchLoading, setSearchLoading] = useState(false)
  const [activeGenre, setActiveGenre] = useState(null)
  const searchTimer = useRef(null)

  // Проверка авторизации
  useEffect(() => {
    fetch('/api/me/', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (!d.authenticated) navigate('/login'); else setUser(d) })
      .catch(() => navigate('/login'))
  }, [navigate])

  // Загрузка каталога
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [mr, sr, cr, gr] = await Promise.all([
          fetch('/api/movies/?type=movie',       { credentials: 'include' }),
          fetch('/api/movies/?type=series',      { credentials: 'include' }),
          fetch('/api/movies/?coming_soon=true', { credentials: 'include' }),
          fetch('/api/genres/',                  { credentials: 'include' }),
        ])
        setMovies(    await mr.json())
        setSeries(    await sr.json())
        setComingSoon(await cr.json())
        setGenres(    await gr.json())
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Scroll для хедера
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Живой поиск с debounce 400ms
  const doSearch = async (q, gid) => {
    if (!q.trim() && !gid) { setSearchRes(null); return }
    setSearchLoading(true)
    try {
      const params = new URLSearchParams()
      if (q.trim()) params.append('search', q.trim())
      if (gid)      params.append('genre', gid)
      const res = await fetch(`/api/movies/?${params}`, { credentials: 'include' })
      setSearchRes(await res.json())
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearchVal(val)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => doSearch(val, activeGenre), 400)
  }

  const handleClearSearch = () => {
    setSearchVal('')
    setSearchRes(null)
    setActiveGenre(null)
    clearTimeout(searchTimer.current)
  }

  const handleGenreFilter = (gid) => {
    const next = activeGenre === gid ? null : gid
    setActiveGenre(next)
    doSearch(searchVal, next)
  }

  const handleLogout = async () => {
    await fetch('/api/logout/', { method: 'POST', credentials: 'include' })
    navigate('/login')
  }

  const hero = movies[0] || null

  return (
    <>
      <Header user={user} onLogout={handleLogout} scrolled={scrolled} />

      <main className="main">

        {/* ── Hero ── */}
        <div className="hero" style={hero ? {
          background: `linear-gradient(to top, #141414 5%, transparent 60%),
                       linear-gradient(to right, rgba(0,0,0,0.85), transparent 60%),
                       url('${hero.poster_url || FALLBACK}') center/cover no-repeat`
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
                placeholder="Search movies, series, genres..."
                value={searchVal}
                onChange={handleSearchChange}
                onKeyDown={e => { if (e.key === 'Escape') handleClearSearch() }}
              />
              {searchVal
                ? <button className="search-button" onClick={handleClearSearch}
                    style={{ background: '#555' }}>
                    <i className="fas fa-times"></i> Clear
                  </button>
                : <button className="search-button">
                    <i className="fas fa-search"></i> Search
                  </button>
              }
            </div>
          </div>
        </div>

        {/* ── Genre filters ── */}
        {genres.length > 0 && (
          <div style={{ padding: '20px 60px 0', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {genres.map(g => (
              <button key={g.id} onClick={() => handleGenreFilter(g.id)} style={{
                padding: '6px 16px', borderRadius: 20, cursor: 'pointer',
                border: `1px solid ${activeGenre === g.id ? 'var(--netflix-red)' : 'var(--netflix-gray)'}`,
                background: activeGenre === g.id ? 'var(--netflix-red)' : 'transparent',
                color: '#fff', fontSize: 13, transition: 'all 0.2s',
              }}>{g.name}</button>
            ))}
          </div>
        )}

        {/* ── Search results (inline, не заменяет страницу) ── */}
        {(searchRes !== null || searchLoading) && (
          <section className="section">
            <div className="section-header">
              <h2 className="section-title">
                {searchLoading ? 'Searching…' : (
                  <>
                    Results {searchVal && <span style={{color:'#aaa'}}>for "{searchVal}"</span>}
                    <span style={{ fontSize: 16, fontWeight: 400, color: '#666', marginLeft: 12 }}>
                      {searchRes?.length ?? 0} found
                    </span>
                  </>
                )}
              </h2>
              <button onClick={handleClearSearch} style={{
                background: 'transparent', border: '1px solid #555',
                color: '#aaa', padding: '6px 14px', borderRadius: 4,
                cursor: 'pointer', fontSize: 13,
              }}>✕ Show all</button>
            </div>
            {!searchLoading && searchRes?.length === 0 && (
              <p style={{ padding: '0 60px', color: 'var(--netflix-light-gray)' }}>
                Nothing found. Try a different query.
              </p>
            )}
            {!searchLoading && searchRes && searchRes.length > 0 && (
              <div className="content-grid">
                {searchRes.map(m => (
                  <MovieCard key={m.id} movie={m}
                    onSelect={() => navigate(`/movie/${m.id}`)} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── Основной каталог — всегда виден ── */}
        <section className="section" id="movies">
          <div className="section-header">
            <h2 className="section-title">Popular Movies</h2>
          </div>
          {loading
            ? <p style={{ padding: '0 60px', color: '#555' }}>Loading…</p>
            : <div className="content-grid">
                {movies.map(m => (
                  <MovieCard key={m.id} movie={m}
                    onSelect={() => navigate(`/movie/${m.id}`)} />
                ))}
              </div>
          }
        </section>

        <section className="section" id="series">
          <div className="section-header">
            <h2 className="section-title">Series</h2>
          </div>
          {loading
            ? <p style={{ padding: '0 60px', color: '#555' }}>Loading…</p>
            : <div className="content-grid">
                {series.map(m => (
                  <MovieCard key={m.id} movie={m}
                    onSelect={() => navigate(`/movie/${m.id}`)} />
                ))}
              </div>
          }
        </section>

        <section className="section" id="coming">
          <div className="section-header">
            <h2 className="section-title">Coming Soon</h2>
          </div>
          {loading
            ? <p style={{ padding: '0 60px', color: '#555' }}>Loading…</p>
            : <div className="coming-grid">
                {comingSoon.map(m => (
                  <div className="coming-card" key={m.id}
                       onClick={() => navigate(`/movie/${m.id}`)}
                       style={{ cursor: 'pointer' }}>
                    <img src={m.poster_url || FALLBACK} alt={m.title}
                         onError={e => { e.target.src = FALLBACK }} />
                    <div className="coming-info">
                      {m.release_date && (
                        <span className="coming-date">
                          {new Date(m.release_date).toLocaleDateString('en-US',
                            { month: 'long', year: 'numeric' })}
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
    </>
  )
}
