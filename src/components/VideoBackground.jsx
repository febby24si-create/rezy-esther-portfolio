import { useState, useEffect, useRef, useCallback } from 'react'

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
 * Handles browser autoplay policy: if autoplay is blocked, shows the poster
 * until the user interacts with the page (click/touch/scroll).
 */
export default function VideoBackground({
  poster = '',
  overlay,
  className = '',
}) {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const userInteracted = useRef(false)

  // ── Programmatic play with autoplay rejection handling ──
  const attemptPlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.play()
      .then(() => setIsPlaying(true))
      .catch(() => {
        // Autoplay blocked by browser — stay on poster
        setIsPlaying(false)
      })
  }, [])

  // Try to play on mount
  useEffect(() => {
    attemptPlay()
  }, [attemptPlay])

  // Retry play once user interacts with the page
  useEffect(() => {
    const handleInteraction = () => {
      if (userInteracted.current) return
      userInteracted.current = true
      attemptPlay()
    }
    // Also retry on scroll — user is clearly engaging
    window.addEventListener('click', handleInteraction, { once: true })
    window.addEventListener('touchstart', handleInteraction, { once: true })
    window.addEventListener('scroll', handleInteraction, { once: true })
    return () => {
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
      window.removeEventListener('scroll', handleInteraction)
    }
  }, [attemptPlay])

  // Respect reduced motion preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches && videoRef.current) {
      videoRef.current.pause()
    }
    const handler = (e) => {
      if (e.matches && videoRef.current) videoRef.current.pause()
      if (!e.matches && videoRef.current) attemptPlay()
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [attemptPlay])

  const showVideo = isPlaying && !videoError

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
        onPlay={() => setIsPlaying(true)}
        onError={() => setVideoError(true)}
        className={`absolute inset-0 w-full h-full object-cover scale-110 transition-all duration-1000 hidden md:block ${
          showVideo ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>

      {/* Static poster image (shown on mobile / loading / error / autoplay blocked) */}
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
