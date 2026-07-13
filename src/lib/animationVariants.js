// ============================================================
// lib/animationVariants.js
// Framer Motion animation variants — dipisah dari AnimatedPage.jsx
// agar tidak melanggar react-refresh/only-export-components.
// ============================================================

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
