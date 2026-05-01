import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Header    from '../components/Header'
import StarRating from '../components/StarRating'

const FALLBACK = 'https://via.placeholder.com/400x600/1f1f1f/e50914?text=No+Poster'

export default function MoviePage() {
  const { id }   = useParams()
  const navigate  = useNavigate()

  const [user,       setUser]       = useState(null)
  const [movie,      setMovie]      = useState(null)
  const [myRating,   setMyRating]   = useState(null)
  const [avgRating,  setAvgRating]  = useState(null)
  const [rateMsg,    setRateMsg]    = useState('')
  const [scrolled,   setScrolled]   = useState(false)
  const [loading,    setLoading]    = useState(true)
  const [playerOpen, setPlayerOpen] = useState(false)
  const [error,      setError]      = useState('')

  // Авторизация
  useEffect(() => {
    fetch('/api/me/', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (!d.authenticated) navigate('/login'); else setUser(d) })
      .catch(() => navigate('/login'))
  }, [navigate])

  // Данные фильма
  useEffect(() => {
    setLoading(true)
    fetch(`/api/movies/${id}/`, { credentials: 'include' })
      .then(r => {
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then(data => {
        setMovie(data)
        setMyRating(data.my_rating)
        setAvgRating(data.avg_user_rating)
        setLoading(false)
      })
      .catch(() => { setError('Movie not found'); setLoading(false) })
  }, [id])

  // Scroll хедера
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const handleLogout = async () => {
    await fetch('/api/logout/', { method: 'POST', credentials: 'include' })
    navigate('/login')
  }

  const handleRate = async (score) => {
    const res = await fetch(`/api/movies/${id}/rate/`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score }),
    })
    const data = await res.json()
    if (res.ok) {
      setMyRating(data.score)
      setAvgRating(data.avg_user_rating)
      setRateMsg(`Your rating: ${data.score}/10 saved!`)
      setTimeout(() => setRateMsg(''), 3000)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#141414', display: 'flex',
                  alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#555', fontSize: 20 }}>Loading…</p>
    </div>
  )

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#141414', display: 'flex',
                  flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <p style={{ color: '#E50914', fontSize: 24 }}>{error}</p>
      <Link to="/home" style={{ color: '#fff', textDecoration: 'none',
                                 border: '1px solid #555', padding: '10px 24px', borderRadius: 4 }}>
        ← Back to Home
      </Link>
    </div>
  )

  return (
    <>
      <Header user={user} onLogout={handleLogout} scrolled={scrolled} />

      {/* ── Hero backdrop ── */}
      <div style={{
        position: 'relative',
        minHeight: '55vh',
        background: movie.poster_url
          ? `linear-gradient(to bottom, rgba(20,20,20,0.3) 0%, #141414 100%),
             linear-gradient(to right, rgba(20,20,20,0.9) 0%, transparent 60%),
             url('${movie.poster_url}') center/cover no-repeat`
          : '#1f1f1f',
        display: 'flex',
        alignItems: 'flex-end',
        paddingTop: 100,
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '60px 60px 40px',
                       width: '100%', display: 'flex', gap: 50, alignItems: 'flex-end' }}>

          {/* Постер */}
          <img
            src={movie.poster_url || FALLBACK}
            alt={movie.title}
            onError={e => { e.target.src = FALLBACK }}
            style={{
              width: 220, borderRadius: 8,
              boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
              flexShrink: 0,
              display: 'block',
            }}
          />

          {/* Основная информация */}
          <div style={{ flex: 1, paddingBottom: 8 }}>
            {/* Бейджи */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              <span style={{ background: 'var(--netflix-red)', padding: '3px 10px',
                              borderRadius: 4, fontSize: 13 }}>
                {movie.content_type === 'series' ? 'SERIES' : 'MOVIE'}
              </span>
              <span style={{ background: '#333', padding: '3px 10px',
                              borderRadius: 4, fontSize: 13 }}>{movie.age_rating}</span>
              <span style={{ background: '#333', padding: '3px 10px',
                              borderRadius: 4, fontSize: 13 }}>{movie.year}</span>
              {movie.is_coming_soon && (
                <span style={{ background: '#1565c0', padding: '3px 10px',
                                borderRadius: 4, fontSize: 13 }}>COMING SOON</span>
              )}
            </div>

            <h1 style={{ fontSize: 48, fontWeight: 700, marginBottom: 12,
                          color: '#fff', lineHeight: 1.1 }}>{movie.title}</h1>

            {/* Жанры */}
            {movie.genres.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
                {movie.genres.map(g => (
                  <span key={g.id} style={{
                    border: '1px solid var(--netflix-red)', borderRadius: 20,
                    padding: '3px 12px', fontSize: 13, color: 'var(--netflix-red)',
                  }}>{g.name}</span>
                ))}
              </div>
            )}

            {/* Рейтинги */}
            <div style={{ display: 'flex', gap: 30, marginBottom: 24, flexWrap: 'wrap' }}>
              {movie.rating > 0 && (
                <div>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>TMDB Rating</div>
                  <div style={{ fontSize: 22, color: '#f5c518', fontWeight: 700 }}>
                    ⭐ {movie.rating}<span style={{ fontSize: 14, color: '#888' }}>/10</span>
                  </div>
                </div>
              )}
              {avgRating && (
                <div>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>User Rating</div>
                  <div style={{ fontSize: 22, color: '#f5c518', fontWeight: 700 }}>
                    ⭐ {avgRating}<span style={{ fontSize: 14, color: '#888' }}>/10</span>
                  </div>
                </div>
              )}
            </div>

            {/* Кнопки действий */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {!movie.is_coming_soon && (
                <button
                  onClick={() => setPlayerOpen(true)}
                  style={{
                    background: 'var(--netflix-red)', border: 'none', color: '#fff',
                    padding: '14px 32px', borderRadius: 4, fontSize: 16, fontWeight: 700,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.target.style.background = '#f40612'}
                  onMouseLeave={e => e.target.style.background = 'var(--netflix-red)'}
                >
                  <i className="fas fa-play"></i> Watch Trailer
                </button>
              )}
              <button style={{
                background: 'transparent', border: '2px solid #fff', color: '#fff',
                padding: '14px 28px', borderRadius: 4, fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <i className="fas fa-plus"></i> My List
              </button>
              <Link to="/home" style={{
                background: 'transparent', border: '1px solid #555', color: '#aaa',
                padding: '14px 24px', borderRadius: 4, fontSize: 15,
                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <i className="fas fa-arrow-left"></i> Back
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Основной контент ── */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '50px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 60 }}>

          {/* Левая колонка */}
          <div>
            {/* Описание */}
            <section style={{ marginBottom: 50 }}>
              <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16,
                            borderLeft: '4px solid var(--netflix-red)', paddingLeft: 16 }}>
                About
              </h2>
              <p style={{ color: '#ccc', lineHeight: 1.9, fontSize: 16 }}>
                {movie.description || 'No description available.'}
              </p>
            </section>

            {/* Встроенный плеер (trailer) */}
            {playerOpen && movie.trailer_url && (
              <section style={{ marginBottom: 50 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between',
                               alignItems: 'center', marginBottom: 16 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 600,
                                borderLeft: '4px solid var(--netflix-red)', paddingLeft: 16 }}>
                    Trailer
                  </h2>
                  <button onClick={() => setPlayerOpen(false)} style={{
                    background: 'transparent', border: '1px solid #555', color: '#aaa',
                    padding: '6px 14px', borderRadius: 4, cursor: 'pointer', fontSize: 13,
                  }}>✕ Close</button>
                </div>
                <div style={{
                  position: 'relative', paddingBottom: '56.25%', height: 0,
                  borderRadius: 8, overflow: 'hidden', background: '#000',
                }}>
                  <iframe
                    src={`${movie.trailer_url}?autoplay=1&rel=0&modestbranding=1`}
                    title={`${movie.title} — Trailer`}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    frameBorder="0"
                  />
                </div>
              </section>
            )}

            {/* Плеер-заглушка если нет трейлера */}
            {playerOpen && !movie.trailer_url && (
              <section style={{ marginBottom: 50 }}>
                <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16,
                              borderLeft: '4px solid var(--netflix-red)', paddingLeft: 16 }}>
                  Player
                </h2>
                <div style={{
                  background: '#1f1f1f', borderRadius: 8, aspectRatio: '16/9',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 16,
                  border: '1px solid #333',
                }}>
                  <i className="fas fa-film" style={{ fontSize: 60, color: '#444' }}></i>
                  <p style={{ color: '#555', fontSize: 16 }}>
                    No trailer available yet
                  </p>
                  <p style={{ color: '#444', fontSize: 13 }}>
                    Add a trailer URL via the admin panel
                  </p>
                </div>
              </section>
            )}
          </div>

          {/* Правая колонка — рейтинг */}
          <div>
            <div style={{
              background: '#1f1f1f', borderRadius: 8, padding: 30,
              border: '1px solid #2f2f2f', position: 'sticky', top: 100,
            }}>
              <h3 style={{ fontSize: 18, marginBottom: 20, fontWeight: 600 }}>
                Rate this {movie.content_type === 'series' ? 'series' : 'movie'}
              </h3>

              <StarRating
                current={myRating}
                onRate={handleRate}
                disabled={false}
              />

              {rateMsg && (
                <div style={{
                  marginTop: 14, background: 'rgba(229,9,20,0.15)',
                  border: '1px solid var(--netflix-red)',
                  borderRadius: 4, padding: '10px 14px',
                  color: '#fff', fontSize: 14,
                }}>
                  <i className="fas fa-check" style={{ marginRight: 8, color: 'var(--netflix-red)' }}></i>
                  {rateMsg}
                </div>
              )}

              {myRating && (
                <p style={{ color: '#888', fontSize: 13, marginTop: 12 }}>
                  Your rating: <span style={{ color: '#f5c518' }}>{myRating}/10</span>
                </p>
              )}

              {!myRating && (
                <p style={{ color: '#555', fontSize: 13, marginTop: 12 }}>
                  Click a star to rate
                </p>
              )}

              <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid #2f2f2f' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between',
                               marginBottom: 10, fontSize: 14 }}>
                  <span style={{ color: '#888' }}>TMDB Score</span>
                  <span style={{ color: movie.rating > 0 ? '#f5c518' : '#555' }}>
                    {movie.rating > 0 ? `${movie.rating}/10` : 'N/A'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between',
                               marginBottom: 10, fontSize: 14 }}>
                  <span style={{ color: '#888' }}>Avg User Score</span>
                  <span style={{ color: avgRating ? '#f5c518' : '#555' }}>
                    {avgRating ? `${avgRating}/10` : 'No ratings yet'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: '#888' }}>Year</span>
                  <span style={{ color: '#ccc' }}>{movie.year}</span>
                </div>
                {movie.release_date && (
                  <div style={{ display: 'flex', justifyContent: 'space-between',
                                 fontSize: 14, marginTop: 10 }}>
                    <span style={{ color: '#888' }}>Release</span>
                    <span style={{ color: '#ccc' }}>
                      {new Date(movie.release_date).toLocaleDateString('en-US',
                        { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-bottom" style={{ maxWidth: 1400, margin: '0 auto',
                                                 padding: '20px 60px', borderTop: '1px solid #2f2f2f',
                                                 display: 'flex', justifyContent: 'space-between',
                                                 opacity: 0.6, fontSize: 14 }}>
          <p>© 2026 CATFLIX. All rights reserved.</p>
          <div className="footer-badges">
            <i className="fas fa-film"></i>
            <i className="fas fa-cat"></i>
          </div>
        </div>
      </footer>
    </>
  )
}
