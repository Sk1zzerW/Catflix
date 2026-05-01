import { useState } from 'react'

/**
 * Звёздный рейтинг 1–10 (отображается как 5 звёзд, где 1 звезда = 2 очка)
 */
export default function StarRating({ current, onRate, disabled }) {
  const [hover, setHover] = useState(0)
  const stars = 5
  // current и hover — в шкале 1-10; отображаем 5 звёзд (каждая = 2)
  const activeStars = hover || (current ? Math.round(current / 2) : 0)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {Array.from({ length: stars }, (_, i) => {
        const starVal = i + 1
        const filled  = starVal <= activeStars
        return (
          <span
            key={i}
            onClick={() => !disabled && onRate(starVal * 2)}
            onMouseEnter={() => !disabled && setHover(starVal)}
            onMouseLeave={() => !disabled && setHover(0)}
            style={{
              fontSize: 28,
              cursor: disabled ? 'default' : 'pointer',
              color: filled ? '#f5c518' : '#444',
              transition: 'color 0.15s, transform 0.1s',
              transform: hover === starVal ? 'scale(1.2)' : 'scale(1)',
              userSelect: 'none',
            }}
          >★</span>
        )
      })}
      {current && (
        <span style={{ color: '#f5c518', fontSize: 15, marginLeft: 6 }}>
          {current}/10
        </span>
      )}
    </div>
  )
}
