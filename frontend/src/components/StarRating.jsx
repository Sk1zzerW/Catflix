import { useState } from 'react'
export default function StarRating({ current, onRate }) {
  const [hovered, setHovered] = useState(0)
  const filled = hovered > 0 ? hovered : (current ? Math.round(current / 2) : 0)
  return (
    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onRate(star * 2)}
          style={{
            fontSize: 32,
            cursor: 'pointer',
            color: star <= filled ? '#f5c518' : '#3a3a3a',
            transition: 'color 0.12s, transform 0.1s',
            transform: hovered === star ? 'scale(1.25)' : 'scale(1)',
            userSelect: 'none',
            lineHeight: 1,
          }}
        >★</span>
      ))}
      {current != null && (
        <span style={{ color:'#f5c518', fontSize:15, marginLeft:8, fontWeight:600 }}>
          {current}/10
        </span>
      )}
    </div>
  )
}