import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header    from '../components/Header'
import MovieCard from '../components/MovieCard'
import { apiFetch } from '../utils/api'
import { useLang } from '../context/LangContext'
export default function FavoritesPage() {
  const navigate = useNavigate()
  const { t } = useLang()
  const [user,     setUser]     = useState(null)
  const [movies,   setMovies]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    fetch('/api/me/', { credentials:'include' })
      .then(r => r.json())
      .then(d => { if (!d.authenticated) navigate('/login'); else setUser(d) })
      .catch(() => navigate('/login'))
  }, [navigate])
  useEffect(() => {
    fetch('/api/favorites/', { credentials:'include' })
      .then(r => r.json())
      .then(data => { setMovies(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])
  const handleLogout = async () => {
    await fetch('/api/logout/', { method:'POST', credentials:'include' })
    navigate('/login')
  }
  const handleFavToggle = (id, isFav) => {
    if (!isFav) setMovies(prev => prev.filter(m => m.id !== id))
  }
  return (
    <>
      <Header user={user} onLogout={handleLogout} scrolled={scrolled} />
      <main className="main">
        <div style={{
          background:'linear-gradient(135deg,#1a0000,#2a0a0a)',
          padding:'80px 60px 36px', borderBottom:'1px solid #2a2a2a',
        }}>
          <div style={{ maxWidth:1400, margin:'0 auto' }}>
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:8 }}>
              <i className="fas fa-heart" style={{ fontSize:30, color:'var(--netflix-red)' }}></i>
              <h1 style={{ fontSize:40, fontWeight:700 }}>{t('myFavorites')}</h1>
            </div>
            <p style={{ color:'#888', fontSize:15 }}>
              {loading ? t('loading')
                : movies.length === 0 ? t('noFavYet')
                : `${movies.length} ${movies.length === 1 ? t('movie') : t('movies')} in your list`}
            </p>
          </div>
        </div>
        <div style={{ maxWidth:1400, margin:'0 auto', padding:'36px 60px' }}>
          {loading && <p style={{ color:'#444', textAlign:'center', padding:60 }}>{t('loading')}</p>}
          {!loading && movies.length === 0 && (
            <div style={{ textAlign:'center', padding:'72px 0' }}>
              <i className="far fa-heart" style={{ fontSize:72, color:'#252525',
                 display:'block', marginBottom:22 }}></i>
              <p style={{ color:'#555', fontSize:20, marginBottom:10 }}>{t('noFavYet')}</p>
              <p style={{ color:'#404040', fontSize:14, marginBottom:28 }}>{t('noFavDesc')}</p>
              <button onClick={() => navigate('/home')} style={{
                background:'var(--netflix-red)', border:'none', color:'#fff',
                padding:'11px 26px', borderRadius:4, fontSize:14, cursor:'pointer', fontWeight:600,
              }}>{t('browseMovies')}</button>
            </div>
          )}
          {!loading && movies.length > 0 && (
            <div className="content-grid">
              {movies.map(m => (
                <MovieCard key={m.id} movie={m}
                  onSelect={() => navigate(`/movie/${m.id}`)}
                  onFavoriteToggle={handleFavToggle} />
              ))}
            </div>
          )}
        </div>
      </main>
      <footer className="footer">
        <div className="footer-bottom" style={{ maxWidth:1400, margin:'0 auto',
          padding:'20px 60px', borderTop:'1px solid #2a2a2a',
          display:'flex', justifyContent:'space-between', opacity:0.5, fontSize:14 }}>
          <p>© 2026 CATFLIX. All rights reserved.</p>
          <i className="fas fa-heart" style={{ color:'var(--netflix-red)' }}></i>
        </div>
      </footer>
    </>
  )
}