import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import MovieCard from '../components/MovieCard'
import { useLang } from '../context/LangContext'

const FALLBACK = 'https://via.placeholder.com/200x300/1f1f1f/e50914?text=No+Poster'

function MovieSlider({ items, onSelect, onFavoriteToggle }) {
  const sliderRef = useRef(null)

  const scrollLeft = () => {
    sliderRef.current?.scrollBy({ left: -700, behavior: 'smooth' })
  }

  const scrollRight = () => {
    sliderRef.current?.scrollBy({ left: 700, behavior: 'smooth' })
  }

  return (
    <div className="slider-wrapper">
      <button className="slider-btn left" onClick={scrollLeft}>
        ‹
      </button>

      <div className="slider" ref={sliderRef}>
        {items.map(m => (
          <MovieCard
            key={m.id}
            movie={m}
            onSelect={() => onSelect(m)}
            onFavoriteToggle={onFavoriteToggle}
          />
        ))}
      </div>

      <button className="slider-btn right" onClick={scrollRight}>
        ›
      </button>
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { t } = useLang()

  const [user, setUser] = useState(null)
  const [movies, setMovies] = useState([])
  const [series, setSeries] = useState([])
  const [comingSoon, setComingSoon] = useState([])
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)

  const [searchVal, setSearchVal] = useState('')
  const [searchRes, setSearchRes] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [activeGenre, setActiveGenre] = useState(null)

  const timer = useRef(null)

  useEffect(() => {
    fetch('/api/me/', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (!d.authenticated) navigate('/login')
        else setUser(d)
      })
      .catch(() => navigate('/login'))
  }, [navigate])

  useEffect(() => {
    const load = async () => {
      setLoading(true)

      try {
        const [mr, sr, cr, gr] = await Promise.all([
          fetch('/api/movies/?type=movie', { credentials: 'include' }),
          fetch('/api/movies/?type=series', { credentials: 'include' }),
          fetch('/api/movies/?coming_soon=true', { credentials: 'include' }),
          fetch('/api/genres/', { credentials: 'include' }),
        ])

        setMovies(await mr.json())
        setSeries(await sr.json())
        setComingSoon(await cr.json())
        setGenres(await gr.json())
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const doSearch = async (q, gid) => {
    if (!q.trim() && !gid) {
      setSearchRes(null)
      return
    }

    setSearchLoading(true)

    try {
      const p = new URLSearchParams()

      if (q.trim()) p.append('search', q.trim())
      if (gid) p.append('genre', gid)

      const res = await fetch(`/api/movies/?${p}`, { credentials: 'include' })
      setSearchRes(await res.json())
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSearchChange = (e) => {
    const val = e.target.value
    setSearchVal(val)

    clearTimeout(timer.current)
    timer.current = setTimeout(() => doSearch(val, activeGenre), 400)
  }

  const handleClear = () => {
    setSearchVal('')
    setSearchRes(null)
    setActiveGenre(null)
    clearTimeout(timer.current)
  }

  const handleGenre = (gid) => {
    const next = activeGenre === gid ? null : gid
    setActiveGenre(next)
    doSearch(searchVal, next)
  }

  const handleLogout = async () => {
    await fetch('/api/logout/', { method: 'POST', credentials: 'include' })
    navigate('/login')
  }

  const handleFavToggle = (id, isFav) => {
    const upd = list => list.map(m => (
      m.id === id ? { ...m, is_favorite: isFav } : m
    ))

    setMovies(upd)
    setSeries(upd)

    if (searchRes) {
      setSearchRes(upd(searchRes))
    }
  }

  const hero = movies[0] || null
  const isSearching = searchRes !== null || searchLoading

  const Footer = () => (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <div className="footer-logo">
            <i className="fas fa-cat"></i>
            <span className="logo-flix">FLIX</span>
          </div>

          <p className="footer-description">
            Your purr-fect destination for movies and entertainment.
          </p>

          <div className="social-links">
            <a href="#"><i className="fab fa-facebook"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-youtube"></i></a>
          </div>
        </div>

        <div className="footer-section">
          <h4>{t('movies')}</h4>
          <ul>
            <li><a href="#movies">{t('movies')}</a></li>
            <li><a href="#series">{t('series')}</a></li>
            <li><a href="#coming">{t('comingSoon')}</a></li>
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
  )

  return (
    <>
      <Header user={user} onLogout={handleLogout} scrolled={scrolled} />

      <main className="main">
        <div
          className="hero"
          style={{
            height: isSearching ? '180px' : '80vh',
            transition: 'height 0.35s ease',
            ...(hero && !isSearching
              ? {
                  background: `linear-gradient(to top,#141414 5%,transparent 60%),
                    linear-gradient(to right,rgba(0,0,0,0.85),transparent 60%),
                    url('${hero.poster_url || FALLBACK}') center/cover no-repeat`,
                }
              : { background: '#141414' }),
          }}
        >
          {!isSearching && <div className="hero-overlay"></div>}

          <div className="hero-content">
            {!isSearching && hero && (
              <h1 className="hero-title">{hero.title}</h1>
            )}

            {!isSearching && (
              <p className="hero-subtitle">
                {hero
                  ? hero.description.slice(0, 100) + '…'
                  : 'Unlimited Movies & Series'}
              </p>
            )}

            <div className="hero-search">
              <input
                className="search-input"
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchVal}
                onChange={handleSearchChange}
                onKeyDown={e => {
                  if (e.key === 'Escape') handleClear()
                }}
              />

              {searchVal ? (
                <button
                  className="search-button"
                  onClick={handleClear}
                  style={{ background: '#555' }}
                >
                  <i className="fas fa-times"></i> {t('clearBtn')}
                </button>
              ) : (
                <button className="search-button">
                  <i className="fas fa-search"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        {genres.length > 0 && (
          <div style={{
            padding: '14px 60px 0',
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
          }}>
            {genres.map(g => (
              <button
                key={g.id}
                onClick={() => handleGenre(g.id)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 20,
                  cursor: 'pointer',
                  border: `1px solid ${activeGenre === g.id ? 'var(--netflix-red)' : 'var(--netflix-gray)'}`,
                  background: activeGenre === g.id ? 'var(--netflix-red)' : 'transparent',
                  color: '#fff',
                  fontSize: 13,
                  transition: 'all 0.2s',
                }}
              >
                {g.name}
              </button>
            ))}

            {(activeGenre || searchRes) && (
              <button
                onClick={handleClear}
                style={{
                  padding: '5px 12px',
                  borderRadius: 20,
                  border: '1px solid #555',
                  background: 'transparent',
                  color: '#aaa',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                ✕ {t('clearBtn')}
              </button>
            )}
          </div>
        )}

        {isSearching && (
          <section className="section" style={{ paddingTop: 20 }}>
            <div className="section-header">
              <h2 className="section-title">
                {searchLoading ? t('loading') : (
                  <>
                    {searchVal ? (
                      <>
                        {t('resultsFor')}{' '}
                        <span style={{ color: '#aaa' }}>"{searchVal}"</span>
                      </>
                    ) : (
                      t('filteredResults')
                    )}

                    {!searchLoading && (
                      <span style={{
                        fontSize: 14,
                        fontWeight: 400,
                        color: '#666',
                        marginLeft: 10,
                      }}>
                        — {searchRes?.length ?? 0} {t('found')}
                      </span>
                    )}
                  </>
                )}
              </h2>

              <button
                onClick={handleClear}
                style={{
                  background: 'transparent',
                  border: '1px solid #444',
                  color: '#888',
                  padding: '6px 14px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                {t('showAll')}
              </button>
            </div>

            {!searchLoading && searchRes?.length === 0 && (
              <p style={{ padding: '0 60px', color: '#555' }}>
                {t('nothingFound')}
              </p>
            )}

            {!searchLoading && searchRes && searchRes.length > 0 && (
              <div className="content-grid">
                {searchRes.map(m => (
                  <MovieCard
                    key={m.id}
                    movie={m}
                    onSelect={() => navigate(`/movie/${m.id}`)}
                    onFavoriteToggle={handleFavToggle}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        <section className="section" id="movies">
          <div className="section-header">
            <h2 className="section-title">{t('popularMovies')}</h2>
          </div>

          {loading ? (
            <p style={{ padding: '0 60px', color: '#444' }}>
              {t('loading')}
            </p>
          ) : (
            <MovieSlider
              items={movies}
              onSelect={(m) => navigate(`/movie/${m.id}`)}
              onFavoriteToggle={handleFavToggle}
            />
          )}
        </section>

        <section className="section" id="series">
          <div className="section-header">
            <h2 className="section-title">{t('seriesTitle')}</h2>
          </div>

          {loading ? (
            <p style={{ padding: '0 60px', color: '#444' }}>
              {t('loading')}
            </p>
          ) : (
            <MovieSlider
              items={series}
              onSelect={(m) => navigate(`/movie/${m.id}`)}
              onFavoriteToggle={handleFavToggle}
            />
          )}
        </section>

        <section className="section" id="coming">
          <div className="section-header">
            <h2 className="section-title">{t('comingSoonTitle')}</h2>
          </div>

          {loading ? (
            <p style={{ padding: '0 60px', color: '#444' }}>
              {t('loading')}
            </p>
          ) : (
            <div className="coming-grid">
              {comingSoon.map(m => (
                <div
                  className="coming-card"
                  key={m.id}
                  onClick={() => navigate(`/movie/${m.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={m.poster_url || FALLBACK}
                    alt={m.title}
                    onError={e => {
                      e.target.src = FALLBACK
                    }}
                  />

                  <div className="coming-info">
                    {m.release_date && (
                      <span className="coming-date">
                        {new Date(m.release_date).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    )}

                    <h4>{m.title}</h4>
                    <p>{m.description.slice(0, 80)}…</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  )
}