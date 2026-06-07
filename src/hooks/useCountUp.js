// src/hooks/useCountUp.js
// Animated number counter yang smooth menggunakan requestAnimationFrame
// Tidak perlu library tambahan — murni hooks

import { useState, useEffect, useRef } from 'react'

export function useCountUp(target, { duration = 1800, start = 0, trigger = true, decimals = 0 } = {}) {
  const [value, setValue] = useState(start)
  const frameRef = useRef(null)
  const startTimeRef = useRef(null)

  useEffect(() => {
    if (!trigger) return
    if (frameRef.current) cancelAnimationFrame(frameRef.current)
    startTimeRef.current = null

    const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutExpo(progress)
      const current = start + (target - start) * eased

      setValue(decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.floor(current))

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        setValue(target)
      }
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current) }
  }, [target, duration, start, trigger, decimals])

  return value
}