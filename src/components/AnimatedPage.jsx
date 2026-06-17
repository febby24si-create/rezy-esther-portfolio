// src/components/AnimatedPage.jsx
// ─────────────────────────────────────────────────────────────
// Kumpulan komponen animasi yang dipakai di seluruh project.
// Semua berbasis Framer Motion yang sudah terinstall.
// ─────────────────────────────────────────────────────────────

import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

// ── Variants dasar ────────────────────────────────────────────
export const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
}

export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
}

export const slideLeft = {
  hidden:  { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0,   transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

export const slideRight = {
  hidden:  { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0,   transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

export const scaleIn = {
  hidden:  { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1,    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
}

export const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

export const staggerContainerSlow = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

// ── Page transition wrapper ────────────────────────────────────
export function AnimatedPage({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ── Scroll-triggered reveal ────────────────────────────────────
export function ScrollReveal({ children, variant = fadeUp, delay = 0, className = '', once = true }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, margin: '-60px 0px' })

  return (
    <motion.div
      ref={ref}
      variants={variant}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ── Stagger container dengan scroll trigger ───────────────────
export function StaggerReveal({ children, className = '', delay = 0, slow = false }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40px 0px' })
  const variant = slow ? staggerContainerSlow : staggerContainer

  return (
    <motion.div
      ref={ref}
      variants={variant}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ── Stagger child item ─────────────────────────────────────────
export function StaggerItem({ children, className = '', variant = fadeUp }) {
  return (
    <motion.div variants={variant} className={className}>
      {children}
    </motion.div>
  )
}

// ── Floating animation ─────────────────────────────────────────
export function FloatElement({ children, amplitude = 8, duration = 4, className = '' }) {
  return (
    <motion.div
      animate={{ y: [0, -amplitude, 0] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ── Pulsing glow dot ───────────────────────────────────────────
export function GlowDot({ color = '#22C55E', size = 8 }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <motion.div
        animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
        className="absolute rounded-full"
        style={{ width: size, height: size, background: color }}
      />
      <div className="rounded-full" style={{ width: size * 0.6, height: size * 0.6, background: color }} />
    </div>
  )
}

// ── Hover card lift ────────────────────────────────────────────
export function HoverCard({ children, className = '', style = {}, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.015 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={className}
      style={style}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}

// ── Button with magnetic-like press effect ─────────────────────
export function PressButton({ children, className = '', style = {}, onClick, disabled = false }) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.04 }}
      whileTap={disabled ? {} : { scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className={className}
      style={style}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  )
}

// ── Animated progress bar ──────────────────────────────────────
export function AnimatedProgress({ value, color, height = 10, bg = 'rgba(255,255,255,0.08)', delay = 0.3 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <div ref={ref} className="rounded-full overflow-hidden" style={{ height, background: bg }}>
      <motion.div
        className="h-full rounded-full"
        initial={{ width: 0 }}
        animate={isInView ? { width: `${Math.min(value, 100)}%` } : { width: 0 }}
        transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
        style={{ background: color }}
      />
    </div>
  )
}

// ── Skeleton loading placeholder ──────────────────────────────
export function Skeleton({ className = '', style = {} }) {
  return (
    <motion.div
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      className={`rounded-lg ${className}`}
      style={{ background: 'rgba(255,255,255,0.06)', ...style }}
    />
  )
}

// ── Number reveal (count-up dengan scroll trigger) ────────────
export function CountUpNumber({ value, suffix = '', prefix = '', duration = 1.5, className = '' }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <span ref={ref} className={className}>
      {prefix}
      <motion.span
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      >
        {isInView ? (
          <CountUpSpan target={value} duration={duration} />
        ) : 0}
      </motion.span>
      {suffix}
    </span>
  )
}

function CountUpSpan({ target, duration }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = null
    const easeOut = (t) => 1 - Math.pow(1 - t, 3)
    const step = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / (duration * 1000), 1)
      setCount(Math.floor(easeOut(progress) * target))
      if (progress < 1) requestAnimationFrame(step)
      else setCount(target)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return <>{count.toLocaleString('id-ID')}</>
}

// ── AnimatedNumber (untuk dashboard) ──────────────────────────
// Versi sederhana yang langsung menampilkan angka (tanpa count-up)
// Karena di dashboard sudah di-handle dengan useSpring.
export function AnimatedNumber({ value, format = (v) => v.toLocaleString('id-ID') }) {
  return <span>{format(value)}</span>
}

// Re-export AnimatePresence for convenience
export { AnimatePresence, motion }