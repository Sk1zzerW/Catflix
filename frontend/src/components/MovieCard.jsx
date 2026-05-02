import { apiFetch } from '../utils/api'
const FALLBACK = 'https://via.placeholder.com/200x300/1f1f1f/e50914?text=No+Poster'
export default function MovieCard({ movie, onSelect, onFavoriteToggle }) {
  const isFav = movie.is_favorite || false
  const handleFavorite = async (e) => {
    e.stopPropagation()
    try {
      const res  = await apiFetch(`/api/movies/${movie.id}/favorite/`, { method: 'POST' })
      const data = await res.json()
      if (res.ok && onFavoriteToggle) {
        onFavoriteToggle(movie.id, data.is_favorite)
      }
    } catch (err) {
      console.error('Favorite toggle failed:', err)
    }
  }
  return (
    <div className="content-card" onClick={onSelect}>
      <div className="card-poster">
        <img
          src={movie.poster_url || FALLBACK}
          alt={movie.title}
          onError={e => { e.target.src = FALLBACK }}
        />
        {movie.rating > 0 && (
          <span className="card-rating">⭐ {movie.rating}</span>
        )}
        <div className="card-overlay">
          <button className="card-button" title="Watch">
            <i className="fas fa-play"></i>
          </button>
          <button
            className="card-button"
            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            onClick={handleFavorite}
            style={{ background: isFav ? '#c00' : undefined }}
          >
            <i className={isFav ? 'fas fa-heart' : 'far fa-heart'}></i>
          </button>
        </div>
      </div>
      <div className="card-info">
        <div className="card-title">{movie.title}</div>
        <div className="card-meta">
          <span className="card-year">{movie.year}</span>
          <span className="card-age">{movie.age_rating}</span>
        </div>
        <div className="card-genre">
          {movie.genres.map(g => g.name).join(', ')}
        </div>
      </div>
    </div>
  )
}