import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import StarRating from '../components/StarRating'
import { apiFetch } from '../utils/api'
import { useLang } from '../context/LangContext'

const FALLBACK = 'https://via.placeholder.com/400x600/1f1f1f/e50914?text=No+Poster'

export default function MoviePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useLang()

  const [user, setUser] = useState(null)
  const [movie, setMovie] = useState(null)
  const [myRating, setMyRating] = useState(null)
  const [avgRating, setAvgRating] = useState(null)
  const [isFav, setIsFav] = useState(false)
  const [rateMsg, setRateMsg] = useState('')
  const [favMsg, setFavMsg] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [playerOpen, setPlayerOpen] = useState(false)
  const [error, setError] = useState('')

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
    setLoading(true)

    fetch(`/api/movies/${id}/`, { credentials: 'include' })
      .then(r => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(data => {
        setMovie(data)
        setMyRating(data.my_rating)
        setAvgRating(data.avg_user_rating)
        setIsFav(Boolean(data.is_favorite))
        setLoading(false)
      })
      .catch(() => {
        setError(t('movieNotFound'))
        setLoading(false)
      })
  }, [id, t])

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
    try {
      const res = await apiFetch(`/api/movies/${id}/rate/`, {
        method: 'POST',
        body: JSON.stringify({ score }),
      })

      const data = await res.json()

      if (res.ok) {
        setMyRating(data.score)
        setAvgRating(data.avg_user_rating)
        setRateMsg(`${t('ratingSaved')} ${data.score}/10`)
      } else {
        setRateMsg(data.error || t('ratingError'))
      }
    } catch {
      setRateMsg(t('ratingError'))
    }

    setTimeout(() => setRateMsg(''), 3000)
  }

  const handleFavorite = async () => {
    setFavMsg('')

    try {
      const res = await apiFetch(`/api/movies/${id}/favorite/`, {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        console.log('Favorite backend error:', data)
        setFavMsg(data.error || data.detail || 'Favorite error')
        setTimeout(() => setFavMsg(''), 3000)
        return
      }

      setIsFav(Boolean(data.is_favorite))
      setMovie(prev => prev ? { ...prev, is_favorite: Boolean(data.is_favorite) } : prev)
      setFavMsg(data.is_favorite ? t('addedFav') : t('removedFav'))
    } catch (err) {
  console.error(err)
  setFavMsg('Favorite error')
}

    setTimeout(() => setFavMsg(''), 3000)
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#141414',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p style={{ color: '#777', fontSize: 20 }}>{t('loading')}</p>
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#141414',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
      }}>
        <p style={{ color: '#E50914', fontSize: 24 }}>{error}</p>
        <Link to="/home" style={{
          color: '#fff',
          textDecoration: 'none',
          border: '1px solid #555',
          padding: '10px 24px',
          borderRadius: 4,
        }}>
          {t('back')}
        </Link>
      </div>
    )
  }

  return (
    <>
      <Header user={user} onLogout={handleLogout} scrolled={scrolled} />

      <div style={{
        position: 'relative',
        minHeight: '55vh',
        background: movie.poster_url
          ? `linear-gradient(to bottom,rgba(20,20,20,0.35),#141414 100%),
             linear-gradient(to right,rgba(20,20,20,0.9),transparent 60%),
             url('${movie.poster_url}') center/cover no-repeat`
          : '#1f1f1f',
        display: 'flex',
        alignItems: 'flex-end',
        paddingTop: 100,
      }}>
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '60px 60px 40px',
          width: '100%',
          display: 'flex',
          gap: 48,
          alignItems: 'flex-end',
        }}>
          <img
            src={movie.poster_url || FALLBACK}
            alt={movie.title}
            onError={e => { e.target.src = FALLBACK }}
            style={{
              width: 200,
              borderRadius: 8,
              boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
              flexShrink: 0,
            }}
          />

          <div style={{ flex: 1, paddingBottom: 8 }}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              <span style={{
                background: 'var(--netflix-red)',
                padding: '3px 10px',
                borderRadius: 4,
                fontSize: 13,
              }}>
                {movie.content_type === 'series' ? t('seriesWord').toUpperCase() : t('movie').toUpperCase()}
              </span>

              <span style={{ background: '#333', padding: '3px 10px', borderRadius: 4, fontSize: 13 }}>
                {movie.age_rating}
              </span>

              <span style={{ background: '#333', padding: '3px 10px', borderRadius: 4, fontSize: 13 }}>
                {movie.year}
              </span>
            </div>

            <h1 style={{ fontSize: 46, fontWeight: 700, marginBottom: 12, color: '#fff' }}>
              {movie.title}
            </h1>

            {movie.genres?.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
                {movie.genres.map(g => (
                  <span key={g.id} style={{
                    border: '1px solid var(--netflix-red)',
                    borderRadius: 20,
                    padding: '3px 12px',
                    fontSize: 13,
                    color: 'var(--netflix-red)',
                  }}>
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 28, marginBottom: 22, flexWrap: 'wrap' }}>
              {movie.rating > 0 && (
                <div>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>TMDB</div>
                  <div style={{ fontSize: 22, color: '#f5c518', fontWeight: 700 }}>
                    ⭐ {movie.rating}<span style={{ fontSize: 13, color: '#888' }}>/10</span>
                  </div>
                </div>
              )}

              {avgRating && (
                <div>
                  <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{t('avgUserScore')}</div>
                  <div style={{ fontSize: 22, color: '#f5c518', fontWeight: 700 }}>
                    ⭐ {avgRating}<span style={{ fontSize: 13, color: '#888' }}>/10</span>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              {!movie.is_coming_soon && (
                <button onClick={() => setPlayerOpen(p => !p)} style={{
                  background: 'var(--netflix-red)',
                  border: 'none',
                  color: '#fff',
                  padding: '13px 26px',
                  borderRadius: 4,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}>
                  <i className="fas fa-play"></i>
                  {playerOpen ? t('closeTrailer') : t('watchTrailer')}
                </button>
              )}

              <button onClick={handleFavorite} style={{
                background: isFav ? 'rgba(229,9,20,0.2)' : 'transparent',
                border: `2px solid ${isFav ? 'var(--netflix-red)' : '#fff'}`,
                color: isFav ? 'var(--netflix-red)' : '#fff',
                padding: '13px 22px',
                borderRadius: 4,
                fontSize: 15,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <i className={isFav ? 'fas fa-heart' : 'far fa-heart'}></i>
                {isFav ? t('inFavorites') : t('addFavorites')}
              </button>

              <Link to="/home" style={{
                background: 'transparent',
                border: '1px solid #555',
                color: '#aaa',
                padding: '13px 18px',
                borderRadius: 4,
                fontSize: 14,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <i className="fas fa-arrow-left"></i> {t('back')}
              </Link>
            </div>

            {favMsg && (
              <p style={{ marginTop: 10, fontSize: 14, color: '#f5c518' }}>
                {favMsg}
              </p>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '48px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 310px', gap: 52 }}>
          <div>
            <section style={{ marginBottom: 44 }}>
              <h2 style={{
                fontSize: 21,
                fontWeight: 600,
                marginBottom: 14,
                borderLeft: '4px solid var(--netflix-red)',
                paddingLeft: 14,
              }}>
                {t('about')}
              </h2>

              <p style={{ color: '#ccc', lineHeight: 1.9, fontSize: 16 }}>
                {movie.description || t('noDescription')}
              </p>
            </section>

            {playerOpen && (
              <section style={{ marginBottom: 44 }}>
                <h2 style={{
                  fontSize: 21,
                  fontWeight: 600,
                  marginBottom: 14,
                  borderLeft: '4px solid var(--netflix-red)',
                  paddingLeft: 14,
                }}>
                  {t('trailer')}
                </h2>

                {movie.trailer_url ? (
                  <div style={{
                    position: 'relative',
                    paddingBottom: '56.25%',
                    height: 0,
                    borderRadius: 8,
                    overflow: 'hidden',
                    background: '#000',
                  }}>
                    <iframe
                      src={movie.trailer_url}
                      title={movie.title}
                      allowFullScreen
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        border: 0,
                      }}
                    />
                  </div>
                ) : (
                  <p style={{ color: '#777' }}>Trailer not available.</p>
                )}
              </section>
            )}
          </div>

          <aside style={{
            background: '#1f1f1f',
            borderRadius: 8,
            padding: 24,
            border: '1px solid #2a2a2a',
            height: 'fit-content',
          }}>
            <h3 style={{ marginBottom: 16 }}>Rate this movie</h3>
            <StarRating value={myRating} onRate={handleRate} />
            {rateMsg && <p style={{ marginTop: 12, color: '#f5c518' }}>{rateMsg}</p>}
          </aside>
        </div>
      </div>
    </>
  )
}