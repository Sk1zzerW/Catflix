const FALLBACK = 'https://via.placeholder.com/200x300/1f1f1f/e50914?text=No+Poster'

export default function MovieCard({ movie, onSelect }) {
  return (
    <div className="content-card" onClick={() => onSelect(movie)}>
      <div className="card-poster">
        <img
          src={movie.poster_url || FALLBACK}
          alt={movie.title}
          onError={e => { e.target.src = FALLBACK }}
        />
        <span className="card-rating">⭐ {movie.rating}</span>
        <div className="card-overlay">
          <button className="card-button"
            onClick={e => { e.stopPropagation(); onSelect(movie) }}>
            <i className="fas fa-play"></i>
          </button>
          <button className="card-button"
            onClick={e => e.stopPropagation()}>
            <i className="fas fa-plus"></i>
          </button>
          <button className="card-button"
            onClick={e => e.stopPropagation()}>
            <i className="fas fa-heart"></i>
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
