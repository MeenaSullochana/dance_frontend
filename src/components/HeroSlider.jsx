import { useCallback, useEffect, useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export default function HeroSlider({ slides, interval = 4500, className = '' }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = slides.length

  const go = useCallback((i) => setIndex((i + count) % count), [count])

  useEffect(() => {
    if (paused || count < 2) return
    const timer = setTimeout(() => go(index + 1), interval)
    return () => clearTimeout(timer)
  }, [index, paused, count, interval, go])

  return (
    <div
      className={`hero-slider ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((s, i) => {
        const Icon = s.icon
        return (
          <div key={s.src} className={`slide ${i === index ? 'active' : ''}`} aria-hidden={i !== index}>
            <div className="slide-bg" style={{ backgroundImage: `url(${s.src})` }} />
            <img src={s.src} alt={s.alt ?? s.title} loading={i === 0 ? 'eager' : 'lazy'} decoding="async" />
            {s.title && (
              <div className="slide-caption">
                {Icon && <span className="slide-icon"><Icon /></span>}
                <div>
                  <strong>{s.title}</strong>
                  <span>{s.subtitle}</span>
                </div>
              </div>
            )}
          </div>
        )
      })}

      <button className="slider-arrow prev" onClick={() => go(index - 1)} aria-label="Previous slide">
        <FiChevronLeft />
      </button>
      <button className="slider-arrow next" onClick={() => go(index + 1)} aria-label="Next slide">
        <FiChevronRight />
      </button>

      <div className="slider-dots">
        {slides.map((s, i) => (
          <button
            key={s.src}
            className={`dot ${i === index ? 'active' : ''}`}
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {!paused && <div key={index} className="slider-progress" style={{ animationDuration: `${interval}ms` }} />}
    </div>
  )
}
