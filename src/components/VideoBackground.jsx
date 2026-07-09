import { useState, useEffect, useRef } from 'react'

/**
 * Reusable full-screen video background component.
 *
 * Props:
 *   poster   – fallback image URL (shown on mobile / loading / error)
 *   overlay  – custom overlay gradient (default: dark garage theme)
 *   className – additional wrapper classes
 *
 * Video file must be at /videos/hero.mp4 (served from public/videos/).
 * On mobile (< 768 px) the video is hidden; the poster is shown instead.
 * Respects prefers-reduced-motion by pausing the video.
 */
export default function VideoBackground({
  poster = '',
  overlay,
  className = '',
}) {
  const videoRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  const [videoError, setVideoError] = useState(false)

  // Respect reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches && videoRef.current) {
      videoRef.current.pause()
    }
    const handler = (e) => {
      if (e.matches && videoRef.current) videoRef.current.pause()
      if (!e.matches && videoRef.current) videoRef.current.play()
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const showVideo = isReady && !videoError

  const defaultOverlay = `
    radial-gradient(ellipse at 50% 0%, rgba(2,15,9,0.3) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 50%, rgba(2,15,9,0.6) 0%, transparent 50%),
    linear-gradient(180deg, rgba(2,15,9,0.85) 0%, rgba(2,15,9,0.5) 30%, rgba(2,15,9,0.3) 60%, rgba(2,15,9,0.8) 85%, #020f09 100%)
  `

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Video background – hidden on mobile via CSS */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={poster}
        onCanPlay={() => setIsReady(true)}
        onError={() => setVideoError(true)}
        className={`absolute inset-0 w-full h-full object-cover scale-110 transition-all duration-1000 hidden md:block ${
          showVideo ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/* Static poster image (shown on mobile / loading / error) */}
      <img
        src={poster}
        alt=""
        className="absolute inset-0 w-full h-full object-cover scale-110"
        style={{
          opacity: showVideo ? 0 : 1,
          transition: 'opacity 1s ease',
        }}
        loading="eager"
      />

      {/* Dark gradient overlay for readability */}
      <div
        className="absolute inset-0 z-[1]"
        style={{ background: overlay || defaultOverlay }}
      />

      {/* Subtle vignette + blur edge effect */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 120px rgba(2,15,9,0.6), inset 0 0 40px rgba(2,15,9,0.3)',
        }}
      />

      {/* Ambient blue glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] md:w-[800px] h-[400px] rounded-full pointer-events-none z-[1]"
        style={{
          background: 'radial-gradient(ellipse, rgba(37,99,235,0.08) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}
