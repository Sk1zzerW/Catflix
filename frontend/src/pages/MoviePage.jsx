import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Header     from '../components/Header'
import StarRating from '../components/StarRating'
import { apiFetch } from '../utils/api'
import { useLang } from '../context/LangContext'
const FALLBACK = 'https://via.placeholder.com/400x600/1f1f1f/e50914?text=No+Poster'
export default function MoviePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useLang()
  const [user,       setUser]       = useState(null)
  const [movie,      setMovie]      = useState(null)
  const [myRating,   setMyRating]   = useState(null)
  const [avgRating,  setAvgRating]  = useState(null)
  const [isFav,      setIsFav]      = useState(false)
  const [rateMsg,    setRateMsg]    = useState('')
  const [favMsg,     setFavMsg]     = useState('')
  const [scrolled,   setScrolled]   = useState(false)
  const [loading,    setLoading]    = useState(true)
  const [playerOpen, setPlayerOpen] = useState(false)
  const [error,      setError]      = useState('')
  useEffect(() => {
    fetch('/api/me/', { credentials:'include' })
      .then(r => r.json())
      .then(d => { if (!d.authenticated) navigate('/login'); else setUser(d) })
      .catch(() => navigate('/login'))
  }, [navigate])
  useEffect(() => {
    setLoading(true)
    fetch(`/api/movies/${id}/`, { credentials:'include' })
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(data => {
        setMovie(data)
        setMyRating(data.my_rating)
        setAvgRating(data.avg_user_rating)
        setIsFav(data.is_favorite || false)
        setLoading(false)
      })
      .catch(() => { setError(t('movieNotFound')); setLoading(false) })
  }, [id])
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])
  const handleLogout = async () => {
    await fetch('/api/logout/', { method:'POST', credentials:'include' })
    navigate('/login')
  }
  const handleRate = async (score) => {
    try {
      const res  = await apiFetch(`/api/movies/${id}/rate/`, {
        method: 'POST',
        body: JSON.stringify({ score }),
      })
      const data = await res.json()
      if (res.ok) {
        setMyRating(data.score)
        setAvgRating(data.avg_user_rating)
        setRateMsg(`${t('ratingSaved')} ${data.score}/10`)
        setTimeout(() => setRateMsg(''), 3000)
      } else {
        setRateMsg(data.error || t('ratingError'))
        setTimeout(() => setRateMsg(''), 3000)
      }
    } catch {
      setRateMsg(t('ratingError'))
      setTimeout(() => setRateMsg(''), 3000)
    }
  }
  const handleFavorite = async () => {
    try {
      const res  = await apiFetch(`/api/movies/${id}/favorite/`, { method:'POST' })
      const data = await res.json()
      if (res.ok) {
        setIsFav(data.is_favorite)
        setFavMsg(data.is_favorite ? t('addedFav') : t('removedFav'))
        setTimeout(() => setFavMsg(''), 2500)
      }
    } catch {  }
  }
  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#141414', display:'flex',
                  alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'#444', fontSize:20 }}>{t('loading')}</p>
    </div>
  )
  if (error) return (
    <div style={{ minHeight:'100vh', background:'#141414', display:'flex',
                  flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
      <p style={{ color:'#E50914', fontSize:24 }}>{error}</p>
      <Link to="/home" style={{ color:'#fff', textDecoration:'none',
        border:'1px solid #555', padding:'10px 24px', borderRadius:4 }}>{t('back')}</Link>
    </div>
  )
  return (
    <>
      <Header user={user} onLogout={handleLogout} scrolled={scrolled} />
      {}
      <div style={{
        position:'relative', minHeight:'55vh',
        background: movie.poster_url
          ? `linear-gradient(to bottom,rgba(20,20,20,0.35),#141414 100%),
             linear-gradient(to right,rgba(20,20,20,0.9),transparent 60%),
             url('${movie.poster_url}') center/cover no-repeat`
          : '#1f1f1f',
        display:'flex', alignItems:'flex-end', paddingTop:100,
      }}>
        <div style={{ maxWidth:1400, margin:'0 auto', padding:'60px 60px 40px',
                       width:'100%', display:'flex', gap:48, alignItems:'flex-end' }}>
          <img src={movie.poster_url || FALLBACK} alt={movie.title}
               onError={e => { e.target.src = FALLBACK }}
               style={{ width:200, borderRadius:8, boxShadow:'0 10px 40px rgba(0,0,0,0.8)',
                         flexShrink:0 }} />
          <div style={{ flex:1, paddingBottom:8 }}>
            <div style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap' }}>
              <span style={{ background:'var(--netflix-red)', padding:'3px 10px',
                              borderRadius:4, fontSize:13 }}>
                {movie.content_type === 'series' ? t('seriesWord').toUpperCase() : t('movie').toUpperCase()}
              </span>
              <span style={{ background:'#333', padding:'3px 10px', borderRadius:4, fontSize:13 }}>{movie.age_rating}</span>
              <span style={{ background:'#333', padding:'3px 10px', borderRadius:4, fontSize:13 }}>{movie.year}</span>
              {movie.is_coming_soon && (
                <span style={{ background:'#1565c0', padding:'3px 10px', borderRadius:4, fontSize:13 }}>COMING SOON</span>
              )}
            </div>
            <h1 style={{ fontSize:46, fontWeight:700, marginBottom:12, color:'#fff', lineHeight:1.1 }}>
              {movie.title}
            </h1>
            {movie.genres.length > 0 && (
              <div style={{ display:'flex', gap:8, marginBottom:18, flexWrap:'wrap' }}>
                {movie.genres.map(g => (
                  <span key={g.id} style={{ border:'1px solid var(--netflix-red)',
                    borderRadius:20, padding:'3px 12px', fontSize:13, color:'var(--netflix-red)' }}>
                    {g.name}
                  </span>
                ))}
              </div>
            )}
            <div style={{ display:'flex', gap:28, marginBottom:22, flexWrap:'wrap' }}>
              {movie.rating > 0 && (
                <div>
                  <div style={{ fontSize:12, color:'#888', marginBottom:4 }}>TMDB</div>
                  <div style={{ fontSize:22, color:'#f5c518', fontWeight:700 }}>
                    ⭐ {movie.rating}<span style={{ fontSize:13, color:'#888' }}>/10</span>
                  </div>
                </div>
              )}
              {avgRating && (
                <div>
                  <div style={{ fontSize:12, color:'#888', marginBottom:4 }}>{t('avgUserScore')}</div>
                  <div style={{ fontSize:22, color:'#f5c518', fontWeight:700 }}>
                    ⭐ {avgRating}<span style={{ fontSize:13, color:'#888' }}>/10</span>
                  </div>
                </div>
              )}
            </div>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
              {!movie.is_coming_soon && (
                <button onClick={() => setPlayerOpen(p => !p)} style={{
                  background:'var(--netflix-red)', border:'none', color:'#fff',
                  padding:'13px 26px', borderRadius:4, fontSize:15, fontWeight:700,
                  cursor:'pointer', display:'flex', alignItems:'center', gap:10,
                }}>
                  <i className="fas fa-play"></i>
                  {playerOpen ? t('closeTrailer') : t('watchTrailer')}
                </button>
              )}
              <button onClick={handleFavorite} style={{
                background: isFav ? 'rgba(229,9,20,0.2)' : 'transparent',
                border:`2px solid ${isFav ? 'var(--netflix-red)' : '#fff'}`,
                color: isFav ? 'var(--netflix-red)' : '#fff',
                padding:'13px 22px', borderRadius:4, fontSize:15, cursor:'pointer',
                display:'flex', alignItems:'center', gap:10, transition:'all 0.2s',
              }}>
                <i className={isFav ? 'fas fa-heart' : 'far fa-heart'}></i>
                {isFav ? t('inFavorites') : t('addFavorites')}
              </button>
              <Link to="/home" style={{
                background:'transparent', border:'1px solid #555', color:'#aaa',
                padding:'13px 18px', borderRadius:4, fontSize:14,
                textDecoration:'none', display:'flex', alignItems:'center', gap:8,
              }}>
                <i className="fas fa-arrow-left"></i> {t('back')}
              </Link>
            </div>
            {favMsg && <p style={{ marginTop:10, fontSize:14, color:'#f5c518' }}>{favMsg}</p>}
          </div>
        </div>
      </div>
      {}
      <div style={{ maxWidth:1400, margin:'0 auto', padding:'48px 60px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 310px', gap:52 }}>
          <div>
            <section style={{ marginBottom:44 }}>
              <h2 style={{ fontSize:21, fontWeight:600, marginBottom:14,
                            borderLeft:'4px solid var(--netflix-red)', paddingLeft:14 }}>{t('about')}</h2>
              <p style={{ color:'#ccc', lineHeight:1.9, fontSize:16 }}>
                {movie.description || t('noDescription')}
              </p>
            </section>
            {playerOpen && (
              <section style={{ marginBottom:44 }}>
                <h2 style={{ fontSize:21, fontWeight:600, marginBottom:14,
                              borderLeft:'4px solid var(--netflix-red)', paddingLeft:14 }}>{t('trailer')}</h2>
                {movie.trailer_url ? (
                  <div style={{ position:'relative', paddingBottom:'56.25%', height:0,
                                 borderRadius:8, overflow:'hidden', background:'#000' }}>
                    <iframe src={`${movie.trailer_url}?autoplay=1&rel=0&modestbranding=1`}
                      title={movie.title}
                      style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen frameBorder="0" />
                  </div>
                ) : (
                  <div style={{ background:'#1f1f1f', borderRadius:8, aspectRatio:'16/9',
                                 display:'flex', flexDirection:'column', alignItems:'center',
                                 justifyContent:'center', gap:14, border:'1px solid #333' }}>
                    <i className="fas fa-film" style={{ fontSize:52, color:'#333' }}></i>
                    <p style={{ color:'#555' }}>{t('noTrailer')}</p>
                  </div>
                )}
              </section>
            )}
          </div>
          {}
          <div>
            <div style={{ background:'#1f1f1f', borderRadius:8, padding:26,
                           border:'1px solid #2a2a2a', position:'sticky', top:100 }}>
              <h3 style={{ fontSize:16, marginBottom:18, fontWeight:600 }}>
                {t('rateThis')} {movie.content_type === 'series' ? t('seriesWord') : t('movie')}
              </h3>
              <StarRating current={myRating} onRate={handleRate} />
              {rateMsg
                ? <div style={{ marginTop:12, background:'rgba(229,9,20,0.12)',
                                 border:'1px solid var(--netflix-red)', borderRadius:4,
                                 padding:'9px 12px', color:'#fff', fontSize:13 }}>{rateMsg}</div>
                : <p style={{ color: myRating ? '#888' : '#444', fontSize:13, marginTop:10 }}>
                    {myRating ? `${t('yourRating')}: ${myRating}/10` : t('clickToRate')}
                  </p>
              }
              <div style={{ marginTop:24, paddingTop:16, borderTop:'1px solid #2a2a2a' }}>
                {[
                  [t('tmdbScore'), movie.rating > 0 ? `${movie.rating}/10` : 'N/A'],
                  [t('avgUserScore'), avgRating ? `${avgRating}/10` : '—'],
                  [t('year'), movie.year],
                  ...(movie.release_date
                    ? [[t('release'), new Date(movie.release_date).toLocaleDateString('en-US',
                        {month:'long', day:'numeric', year:'numeric'})]]
                    : []),
                ].map(([label, val]) => (
                  <div key={label} style={{ display:'flex', justifyContent:'space-between',
                                             marginBottom:10, fontSize:14 }}>
                    <span style={{ color:'#666' }}>{label}</span>
                    <span style={{ color:'#bbb' }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="footer">
        <div className="footer-bottom" style={{ maxWidth:1400, margin:'0 auto',
          padding:'20px 60px', borderTop:'1px solid #2a2a2a',
          display:'flex', justifyContent:'space-between', opacity:0.5, fontSize:14 }}>
          <p>© 2026 CATFLIX. All rights reserved.</p>
          <i className="fas fa-cat" style={{ color:'var(--netflix-red)' }}></i>
        </div>
      </footer>
    </>
  )
}