import { motion } from 'framer-motion'
import { useScrollSpy } from '../../hooks/useScrollSpy'

// Tinggi navbar fixed (GuestNavbar.jsx pakai h-16 = 64px) + sedikit
// jarak napas, dipakai untuk offset scroll & deteksi section aktif.
const NAVBAR_OFFSET = 80

/**
 * ScrollSpyNav — dot-navigation vertikal untuk one-page scroll di
 * Landing Page. Dirender terpisah dari GuestNavbar (yang linknya
 * mengarah ke halaman lain, bukan anchor section) supaya tidak
 * mengubah navigasi utama yang sudah berjalan.
 *
 * Hanya tampil di layar besar (lg+) — di mobile/tablet, scroll
 * biasa sudah jadi pola utama dan rail dot di pinggir akan makan
 * ruang layar yang sempit.
 */
export default function ScrollSpyNav({ sections }) {
  const ids = sections.map((s) => s.id)
  const activeId = useScrollSpy(ids, { offsetPx: NAVBAR_OFFSET })

  const handleClick = (id) => {
    const el = document.getElementById(id)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - NAVBAR_OFFSET
    window.scrollTo({ top, behavior: 'smooth' })
  }

  return (
    <nav
      aria-label="Navigasi section landing page"
      className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-3"
    >
      {sections.map(({ id, label }) => {
        const isActive = activeId === id
        return (
          <button
            key={id}
            onClick={() => handleClick(id)}
            aria-label={`Ke bagian ${label}`}
            aria-current={isActive ? 'true' : undefined}
            className="group flex items-center gap-3 focus:outline-none"
          >
            {/* Label — muncul saat hover, atau menetap saat aktif */}
            <motion.span
              initial={false}
              animate={{
                opacity: isActive ? 1 : 0,
                x: isActive ? 0 : 8,
              }}
              whileHover={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap pointer-events-none select-none"
              style={{
                color: isActive ? '#22d3ee' : '#94a3b8',
                background: 'rgba(2,11,24,0.9)',
                border: '1px solid rgba(6,182,212,0.15)',
                backdropFilter: 'blur(6px)',
              }}
            >
              {label}
            </motion.span>

            {/* Dot */}
            <motion.span
              initial={false}
              animate={{
                scale: isActive ? 1 : 0.8,
                boxShadow: isActive
                  ? '0 0 0 4px rgba(6,182,212,0.18), 0 4px 12px rgba(6,182,212,0.4)'
                  : '0 0 0 0 rgba(6,182,212,0)',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="rounded-full flex-shrink-0"
              style={{
                width: isActive ? 11 : 8,
                height: isActive ? 11 : 8,
                background: isActive
                  ? 'linear-gradient(135deg,#2563eb,#06b6d4)'
                  : 'rgba(148,163,184,0.4)',
                border: isActive ? 'none' : '1px solid rgba(148,163,184,0.5)',
              }}
            />
          </button>
        )
      })}
    </nav>
  )
}