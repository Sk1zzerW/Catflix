import { useEffect } from 'react'

const FALLBACK = 'https://via.placeholder.com/400x600/1f1f1f/e50914?text=No+Poster'

export default function MovieModal({ movie, onClose }) {
  // Закрытие по Escape
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--netflix-dark-light)',
        borderRadius: 8,
        maxWidth: 800,
        width: '100%',
        display: 'flex',
        gap: 0,
        overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.8)',
        position: 'relative',
        maxHeight: '90vh',
      }}>
        {/* Poster */}
        <img
          src={movie.poster_url || FALLBACK}
          alt={movie.title}
          onError={e => { e.target.src = FALLBACK }}
          style={{ width: 220, objectFit: 'cover', flexShrink: 0 }}
        />

        {/* Info */}
        <div style={{ padding: '36px 36px 36px', overflowY: 'auto', flex: 1 }}>
          {/* Close */}
          <button onClick={onClose} style={{
            position: 'absolute', top: 16, right: 16,
            background: 'rgba(0,0,0,0.6)', border: 'none',
            color: '#fff', fontSize: 20, width: 36, height: 36,
            borderRadius: '50%', cursor: 'pointer', display:'flex',
            alignItems:'center', justifyContent:'center',
          }}>✕</button>

          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12, color:'#fff' }}>
            {movie.title}
          </h2>

          <div style={{ display:'flex', gap: 12, marginBottom: 20, flexWrap:'wrap' }}>
            <span style={{ color:'#888', fontSize:14 }}>{movie.year}</span>
            <span style={{
              background:'var(--netflix-gray)', padding:'2px 8px',
              borderRadius: 4, fontSize:13, color:'#ccc'
            }}>{movie.age_rating}</span>
            <span style={{
              background: movie.content_type === 'series' ? '#1565c0' : 'var(--netflix-gray)',
              padding:'2px 8px', borderRadius:4, fontSize:13, color:'#ccc'
            }}>{movie.content_type === 'series' ? 'Series' : 'Movie'}</span>
            {movie.rating > 0 && (
              <span style={{ color:'#f5c518', fontSize:14 }}>⭐ {movie.rating}</span>
            )}
            {movie.is_coming_soon && movie.release_date && (
              <span style={{
                background:'var(--netflix-red)', padding:'2px 8px',
                borderRadius:4, fontSize:13, color:'#fff'
              }}>
                Coming: {new Date(movie.release_date).toLocaleDateString('en-US',{month:'long',year:'numeric'})}
              </span>
            )}
          </div>

          {movie.genres.length > 0 && (
            <div style={{ marginBottom: 16, display:'flex', gap:8, flexWrap:'wrap' }}>
              {movie.genres.map(g => (
                <span key={g.id} style={{
                  border:'1px solid var(--netflix-red)',
                  borderRadius:20, padding:'3px 10px',
                  fontSize:12, color:'var(--netflix-red)',
                }}>{g.name}</span>
              ))}
            </div>
          )}

          <p style={{ color:'#ccc', lineHeight:1.7, marginBottom:28, fontSize:15 }}>
            {movie.description || 'No description available.'}
          </p>

          <div style={{ display:'flex', gap:12 }}>
            <button style={{
              background:'var(--netflix-red)', border:'none', color:'#fff',
              padding:'12px 28px', borderRadius:4, fontSize:15, fontWeight:600,
              cursor:'pointer', display:'flex', alignItems:'center', gap:8,
            }}>
              <i className="fas fa-play"></i> Play
            </button>
            <button style={{
              background:'transparent', border:'1px solid #666', color:'#fff',
              padding:'12px 20px', borderRadius:4, fontSize:15, cursor:'pointer',
              display:'flex', alignItems:'center', gap:8,
            }}>
              <i className="fas fa-plus"></i> My List
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
