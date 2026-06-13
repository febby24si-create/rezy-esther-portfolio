import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { layanan } from '../../data/guestData'
import ServiceCard from '../../components/guest/ServiceCard'
import { MdSearch } from 'react-icons/md'

const categories = ['Semua', 'Perawatan', 'Performa', 'Ban & Kaki', 'Kenyamanan', 'Elektronik']

// ── Intersection Observer hook (untuk animasi scroll) ──
function useInView(options = { threshold: 0.2, triggerOnce: true }) {
  const [isInView, setIsInView] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsInView(true); if (options.triggerOnce) observer.disconnect() }
      else if (!options.triggerOnce) setIsInView(false)
    }, { threshold: options.threshold })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [options.threshold, options.triggerOnce])
  return { ref, isInView }
}

// ── FadeInUp component ──
function FadeInUp({ children, delay = 0, className = '' }) {
  const { ref, isInView } = useInView({ threshold: 0.1, triggerOnce: true })
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${className} ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

// ── Stagger container untuk card ──
function StaggerContainer({ children, className = '' }) {
  const { ref, isInView } = useInView({ threshold: 0.1, triggerOnce: true })
  return (
    <div ref={ref} className={className}>
      {isInView && children}
      {!isInView && <div className="opacity-0">{children}</div>}
    </div>
  )
}

// ── Animated counter untuk jumlah hasil ──
function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const step = value / 30
    const timer = setInterval(() => {
      start += step
      if (start >= value) { setDisplay(value); clearInterval(timer) }
      else setDisplay(Math.floor(start))
    }, 20)
    return () => clearInterval(timer)
  }, [value])
  return <span>{display}</span>
}

export default function Layanan() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Semua')
  const [isFilterAnim, setIsFilterAnim] = useState(false)

  const filtered = layanan.filter((l) => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
                        l.desc.toLowerCase().includes(search.toLowerCase())
    const matchCategory = activeCategory === 'Semua' || l.category === activeCategory
    return matchSearch && matchCategory
  })

  // Trigger animasi saat filter berubah
  useEffect(() => {
    setIsFilterAnim(true)
    const timer = setTimeout(() => setIsFilterAnim(false), 500)
    return () => clearTimeout(timer)
  }, [search, activeCategory])

  return (
    <div className="pt-16 min-h-screen overflow-x-hidden" style={{ background: '#020f09' }}>
      
      {/* ── HEADER dengan animasi partikel ── */}
      <FadeInUp delay={0}>
        <section className="relative py-16 px-4 sm:px-6 overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.15) 0%, transparent 70%)' }} />
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative max-w-3xl mx-auto text-center"
          >
            <motion.p 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-3"
            >
              Layanan Kami
            </motion.p>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-extrabold text-white mb-4"
            >
              Servis Lengkap untuk Kendaraan Anda
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 text-base leading-relaxed max-w-xl mx-auto"
            >
              Semua layanan dikerjakan oleh mekanik bersertifikat dengan peralatan diagnostik modern.
            </motion.p>
          </motion.div>
          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-green-400 rounded-full"
                initial={{ x: Math.random() * 100 + '%', y: Math.random() * 100 + '%', opacity: 0 }}
                animate={{ y: [0, -30, 0], opacity: [0, 0.3, 0] }}
                transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 2 }}
                style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              />
            ))}
          </div>
        </section>
      </FadeInUp>

      {/* ── FILTER & SEARCH dengan animasi ── */}
      <FadeInUp delay={100}>
        <section className="px-4 sm:px-6 pb-6" style={{ background: '#041C15' }}>
          <div className="max-w-7xl mx-auto">
            {/* Search bar dengan animasi focus */}
            <motion.div 
              className="relative max-w-sm mb-5"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari layanan..."
                className="w-full bg-white/5 border border-white/10 focus:border-green-500/40 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-gray-500 outline-none transition-all duration-300 focus:shadow-lg focus:shadow-green-500/10"
              />
            </motion.div>

            {/* Category filter dengan stagger */}
            <motion.div 
              className="flex flex-wrap gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, staggerChildren: 0.05 }}
            >
              {categories.map((c, idx) => (
                <motion.button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeCategory === c
                      ? 'bg-green-500/20 text-green-400 border border-green-500/40 shadow-md shadow-green-500/20'
                      : 'bg-white/5 text-gray-400 border border-white/8 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {c}
                </motion.button>
              ))}
            </motion.div>
          </div>
        </section>
      </FadeInUp>

      {/* ── SERVICE GRID dengan stagger dan animasi hasil ── */}
      <section className="px-4 sm:px-6 py-10" style={{ background: '#041C15' }}>
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="text-center py-16"
              >
                <motion.div 
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="text-5xl mb-4"
                >
                  🔍
                </motion.div>
                <p className="text-white font-semibold text-lg mb-2">Layanan tidak ditemukan</p>
                <p className="text-gray-500 text-sm">Coba kata kunci atau kategori lain</p>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.p 
                  className="text-gray-500 text-sm mb-5"
                  animate={{ opacity: isFilterAnim ? 0.5 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <AnimatedNumber value={filtered.length} /> layanan ditemukan
                </motion.p>
                <StaggerContainer>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {filtered.map((s, i) => (
                      <motion.div
                        key={s.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.4, ease: "easeOut" }}
                        whileHover={{ y: -8, transition: { type: 'spring', stiffness: 300 } }}
                      >
                        <ServiceCard service={s} />
                      </motion.div>
                    ))}
                  </div>
                </StaggerContainer>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Floating button untuk scroll to top ── (optional) */}
      <ScrollToTop />

      <style>{`
        @keyframes subtlePulse {
          0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.2); }
          70% { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
      `}</style>
    </div>
  )
}

// ── Komponen Scroll To Top ──
function ScrollToTop() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  if (!visible) return null
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 p-3 rounded-full shadow-lg"
      style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}
    >
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </motion.button>
  )
}