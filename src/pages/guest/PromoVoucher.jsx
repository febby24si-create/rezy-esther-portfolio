import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { promos } from '../../data/guestData'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import {
  MdSearch, MdArrowForward, MdWhatsapp,
  MdDiscount, MdCardGiftcard, MdStars,
  MdCalendarToday, MdPersonAdd, MdLocalOffer,
  MdTimer, MdCheckCircle, MdEmojiEvents,
  MdRedeem, MdClose, MdVerified, MdPeople,
  MdContentCopy, MdCheckCircleOutline, MdLock
} from 'react-icons/md'

const filters = ['Semua', 'Promo', 'Birthday', 'Loyalty', 'Member']

// ─── COMPONENT: Animated Counter ──────────────────────────────
function AnimatedCounter({ target, suffix = '', label }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = target / 40
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 20)
    return () => clearInterval(timer)
  }, [inView, target])

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl md:text-4xl font-extrabold text-white">
        {count.toLocaleString('id-ID')}{suffix}
      </div>
      <div className="text-gray-400 text-sm mt-1">{label}</div>
    </div>
  )
}

  const badgeColors = {
    red: 'bg-red-500/80',
    blue: 'bg-blue-500/80',
    purple: 'bg-purple-500/80',
    yellow: 'bg-yellow-500/80',
    green: 'bg-green-500/80',
    orange: 'bg-orange-500/80'
  }
// ─── COMPONENT: FAQ Accordion ──────────────────────────────────
function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl overflow-hidden bg-[#1E293B]/40 border border-white/5 hover:border-blue-500/20 transition-all"
    >
      <button
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition"
        onClick={() => setOpen(!open)}
      >
        <span className="text-white font-medium text-sm">{question}</span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-6 pb-4">
          <p className="text-gray-400 text-sm leading-relaxed">{answer}</p>
        </div>
      </div>
    </motion.div>
  )
}

// ─── COMPONENT: Promo Card dengan Gambar ──────────────────────
function PromoCard({ promo, showCode, onClaim }) {
  const { id, title, desc, diskon, type, validUntil, image, code, countdown, badge, badgeColor } = promo
  const [claimState, setClaimState] = useState('idle') // 'idle' | 'success' | 'already' | 'copied'
  const defaultImage =
  'https://images.pexels.com/photos/3807329/pexels-photo-3807329.jpeg?auto=compress&cs=tinysrgb&w=800'
  const discountText = diskon ? `${diskon}%` : 'Promo'
  const isExpired = countdown === 'Berakhir'

  const handleClaim = () => {
    if (isExpired) return
    const result = onClaim(promo)
    if (result.redirect) return // navigated away

    if (result.alreadyClaimed) {
      setClaimState('already')
      // Still copy the code
      if (code) {
        navigator.clipboard.writeText(code).catch(() => {})
        setClaimState('copied')
      }
    } else if (result.success) {
      setClaimState('success')
      if (result.voucher?.code) {
        navigator.clipboard.writeText(result.voucher.code).catch(() => {})
      }
    }
    setTimeout(() => setClaimState('idle'), 3000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={!isExpired ? { y: -8 } : {}}
      className={`glass-card rounded-2xl overflow-hidden group bg-[#1E293B]/40 border border-white/5 transition-all ${isExpired ? 'opacity-60' : 'hover:border-blue-500/30'}`}
    >
      {/* ─── Gambar Thumbnail ─── */}
      <div className="relative h-48 overflow-hidden bg-[#0F172A]">
        <img
          src={image || defaultImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => { e.target.src = defaultImage }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent opacity-60" />

        {/* Badge diskon */}
        <div className="absolute top-3 left-3">
          <span className="text-xs font-bold bg-orange-500/80 text-white px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
            <MdDiscount className="text-sm" /> {discountText}
          </span>
        </div>

        {/* Badge tipe / badge custom */}
        <div className="absolute top-3 right-3">
          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full backdrop-blur-sm text-white ${badgeColors[badgeColor] || 'bg-blue-500/80'}`}>
            {badge}
          </span>
        </div>

        {/* Badge HOT untuk diskon besar */}
        {diskon && diskon >= 30 && !isExpired && (
          <div className="absolute bottom-3 left-3">
            <span className="text-[10px] font-bold bg-red-500/80 text-white px-2.5 py-0.5 rounded-full backdrop-blur-sm animate-pulse">
              🔥 HOT
            </span>
          </div>
        )}
      </div>

      {/* ─── Content ─── */}
      <div className="p-5">
        <h3 className="text-white font-bold text-base">{title}</h3>
        <p className="text-gray-400 text-xs leading-relaxed mt-1 line-clamp-2">{desc}</p>

        {/* Countdown */}
        {countdown && !isExpired && countdown !== 'Tidak Ada Batas' && (
          <div className="flex items-center gap-1.5 text-xs font-mono text-white bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 mt-3">
            <MdTimer className="text-orange-400" />
            <span>{countdown}</span>
          </div>
        )}
        {isExpired && (
          <div className="flex items-center gap-1.5 text-xs font-mono text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 mt-3">
            <span>⏰ Promo Berakhir</span>
          </div>
        )}

        {/* Kode voucher — tampil setelah berhasil diklaim */}
        {claimState === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            className="mt-3 bg-green-500/10 rounded-lg px-3 py-2 text-center border border-green-500/25"
          >
            <span className="text-green-400 text-[10px] uppercase tracking-wider font-semibold">✓ Tersimpan & Disalin</span>
            <p className="text-white font-mono font-bold text-sm mt-0.5">{promo.code || '—'}</p>
            <p className="text-green-400/60 text-[10px] mt-0.5">Cek Voucher Saya</p>
          </motion.div>
        )}
        {claimState === 'already' || claimState === 'copied' ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            className="mt-3 bg-yellow-500/10 rounded-lg px-3 py-2 text-center border border-yellow-500/25"
          >
            <span className="text-yellow-400 text-[10px] uppercase tracking-wider font-semibold">Sudah Diklaim</span>
            <p className="text-white font-mono font-bold text-sm mt-0.5">{code}</p>
            <p className="text-yellow-400/60 text-[10px] mt-0.5">Kode disalin ke clipboard</p>
          </motion.div>
        ) : showCode && code && claimState === 'idle' && (
          <div className="mt-3 bg-white/5 rounded-lg px-3 py-1.5 text-center border border-white/10">
            <span className="text-gray-400 text-[10px] uppercase tracking-wider">Kode Voucher</span>
            <p className="text-white font-mono font-bold text-sm">{code}</p>
          </div>
        )}

        {/* Tombol Klaim */}
        <motion.button
          onClick={handleClaim}
          disabled={isExpired}
          whileHover={!isExpired ? { scale: 1.02 } : {}}
          whileTap={!isExpired ? { scale: 0.98 } : {}}
          className={`mt-4 w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            isExpired
              ? 'bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed'
              : claimState === 'success'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : claimState === 'already' || claimState === 'copied'
              ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25'
              : 'text-white bg-gradient-to-r from-blue-600/30 to-blue-500/30 hover:from-blue-600/50 hover:to-blue-500/50 border border-blue-500/30 group-hover:gap-3'
          }`}
        >
          {claimState === 'success' ? (
            <><MdCheckCircleOutline className="text-base" /> Berhasil Diklaim!</>
          ) : claimState === 'already' || claimState === 'copied' ? (
            <><MdContentCopy className="text-base" /> Kode Disalin</>
          ) : isExpired ? (
            <>Promo Berakhir</>
          ) : (
            <>Klaim Promo <MdArrowForward className="text-sm" /></>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}

// ─── MAIN ──────────────────────────────────────────────────────
export default function PromoVoucher() {
  const { isLoggedIn, claimPromo } = useCustomerAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Semua')
  const [countdown, setCountdown] = useState({})
  const [featuredIndex, setFeaturedIndex] = useState(0)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleClaim = (promo) => {
    if (!isLoggedIn) {
      navigate('/guest/login', { state: { from: '/guest/promo' } })
      return { redirect: true }
    }
    const result = claimPromo(promo)
    if (result.alreadyClaimed) {
      showToast('Kamu sudah mengklaim promo ini sebelumnya.', 'warning')
      return { alreadyClaimed: true }
    }
    if (result.success) {
      showToast(`✓ Promo berhasil diklaim! Cek halaman Voucher Saya.`, 'success')
      return { success: true, voucher: result.voucher }
    }
    showToast(result.message || 'Gagal mengklaim promo.', 'error')
    return { success: false }
  }

  // ─── Countdown ───────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      const result = {}
      promos.forEach((p) => {
        if (!p.validUntil || p.validUntil === 'Tidak Ada Batas' || p.validUntil === 'Bulan Ulang Tahun') {
          result[p.id] = 'Tidak Ada Batas'
          return
        }
        const diff = new Date(p.validUntil) - Date.now()
        if (isNaN(diff) || diff <= 0) { result[p.id] = 'Berakhir'; return }
        const d = Math.floor(diff / 86400000)
        const h = Math.floor((diff % 86400000) / 3600000)
        const m = Math.floor((diff % 3600000) / 60000)
        const s = Math.floor((diff % 60000) / 1000)
        result[p.id] = d > 0 ? `${d} hari ${h} jam` : `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      })
      setCountdown(result)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // ─── Auto-rotate featured promo ──────────────────────────────
  const featuredPromos = promos.filter(p => p.active !== false).slice(0, 3)
  useEffect(() => {
    if (featuredPromos.length === 0) return
    const timer = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % featuredPromos.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [featuredPromos.length])

  const filtered = promos.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
                        p.desc.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'Semua' ||
      (filter === 'Promo' && p.type === 'promo') ||
      (filter === 'Birthday' && p.type === 'birthday') ||
      (filter === 'Loyalty' && p.type === 'loyalty') ||
      (filter === 'Member' && p.type === 'member')
    return matchSearch && matchFilter && p.active !== false
  })

  const featured = featuredPromos[featuredIndex] || featuredPromos[0]

  return (
    <div className="pt-16 min-h-screen overflow-x-hidden" style={{ background: '#0F172A' }}>

      {/* ─── HERO BANNER ────────────────────────────────────────── */}
      <section className="relative h-[400px] md:h-[480px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1607881471759-54a341d16091?w=1600&q=80&auto=format&fit=crop"
            alt="Promo Spesial Esther Garage"
            className="w-full h-full object-cover object-center"
            style={{ transform: 'scale(1.05)' }}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/90 via-[#0F172A]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-[#0F172A]/20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(37,99,235,0.1),transparent_60%)]" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-widest mb-4">
              <MdDiscount className="text-sm" /> Promo Spesial
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              Diskon hingga <br />
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                30%
              </span>{' '}
              untuk Layanan Pilihan
            </h1>
            <p className="text-gray-300 text-base mt-4 max-w-lg">
              Dapatkan promo menarik untuk servis berkala, tune up, ganti oli, dan berbagai layanan lainnya.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <motion.a
                href="#promo-list"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-400 hover:to-orange-300 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-orange-500/30 transition-all"
              >
                Klaim Promo <MdArrowForward />
              </motion.a>
              <motion.a
                href="#booking"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 glass-dark hover:bg-white/10 text-white font-semibold px-6 py-3 rounded-xl border border-white/10 hover:border-blue-500/30 transition-all"
              >
                Booking Sekarang
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── STATISTIK ──────────────────────────────────────────── */}
      <section className="py-16 px-6 sm:px-10 lg:px-16 bg-[#0F172A] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="glass-card rounded-2xl p-5 text-center bg-[#1E293B]/40 border border-white/5 hover:border-blue-500/30 transition-all hover:-translate-y-1">
              <AnimatedCounter target={15} suffix="+" label="Promo Aktif" />
            </div>
            <div className="glass-card rounded-2xl p-5 text-center bg-[#1E293B]/40 border border-white/5 hover:border-blue-500/30 transition-all hover:-translate-y-1">
              <AnimatedCounter target={3000} suffix="+" label="Voucher Digunakan" />
            </div>
            <div className="glass-card rounded-2xl p-5 text-center bg-[#1E293B]/40 border border-white/5 hover:border-blue-500/30 transition-all hover:-translate-y-1">
              <AnimatedCounter target={5000} suffix="+" label="Member Aktif" />
            </div>
            <div className="glass-card rounded-2xl p-5 text-center bg-[#1E293B]/40 border border-white/5 hover:border-blue-500/30 transition-all hover:-translate-y-1">
              <AnimatedCounter target={98} suffix="%" label="Kepuasan Pelanggan" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURED PROMO ─────────────────────────────────────── */}
      {featured && (
        <section className="px-6 sm:px-10 lg:px-16 py-12 bg-[#0F172A]">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">🔥 Pilihan Terbaik</span>
                <h2 className="text-2xl font-extrabold text-white mt-1">Promo Unggulan Bulan Ini</h2>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={featured.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5 }}
                  className="relative bg-gradient-to-r from-orange-600/30 via-blue-600/20 to-purple-600/30 border border-white/10 rounded-2xl p-6 md:p-8 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />

                  <div className="relative flex flex-col md:flex-row items-center gap-6">
                    {/* Thumbnail featured */}
                    <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={featured.image || 'https://images.unsplash.com/photo-1487754180451-c456f719ce6b?w=400&q=80&auto=format&fit=crop'}
                        alt={featured.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider bg-orange-500/30 text-orange-400 px-3 py-1 rounded-full border border-orange-500/30">
                          🔥 HOT
                        </span>
                        <span className="text-xs text-gray-400">
                          {featured.validUntil && featured.validUntil !== 'Tidak Ada Batas' && featured.validUntil !== 'Bulan Ulang Tahun'
                            ? `Berlaku hingga ${new Date(featured.validUntil).toLocaleDateString('id-ID')}`
                            : featured.validUntil || 'Berlaku sekarang'}
                        </span>
                      </div>
                      <h3 className="text-2xl font-extrabold text-white">{featured.title}</h3>
                      <p className="text-gray-300 text-sm mt-1 max-w-md">{featured.desc}</p>
                      <div className="flex items-center gap-4 mt-4">
                        <span className="text-4xl font-extrabold text-orange-400">
                          {featured.diskon ? `${featured.diskon}%` : 'Diskon'}
                        </span>
                        {countdown[featured.id] && countdown[featured.id] !== 'Tidak Ada Batas' && countdown[featured.id] !== 'Berakhir' && (
                          <div className="flex items-center gap-1 text-white font-mono text-sm bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
                            <MdTimer className="text-orange-400" />
                            <span>{countdown[featured.id]}</span>
                          </div>
                        )}
                        {countdown[featured.id] === 'Berakhir' && (
                          <div className="text-red-400 text-sm font-semibold">⏰ Telah Berakhir</div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <a
                        href="#booking"
                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-orange-500/30 hover:scale-[1.02] transition-all"
                      >
                        Klaim Sekarang <MdArrowForward />
                      </a>
                      <div className="flex gap-2 justify-center">
                        {featuredPromos.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setFeaturedIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${idx === featuredIndex ? 'w-6 bg-orange-400' : 'bg-white/20 hover:bg-white/40'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>
      )}

      {/* ─── SEARCH & FILTER ────────────────────────────────────── */}
      <section className="px-6 sm:px-10 lg:px-16 py-6 bg-[#0F172A] border-t border-white/5" id="promo-list">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search bar upgrade */}
            <motion.div
              className="relative w-full md:max-w-sm"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari promo atau voucher..."
                className="w-full bg-white/5 backdrop-blur-sm border border-white/10 focus:border-blue-500/50 rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder-gray-500 outline-none transition-all duration-300 focus:shadow-xl focus:shadow-blue-500/10"
              />
            </motion.div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <motion.button
                  key={f}
                  onClick={() => setFilter(f)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    filter === f
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-md shadow-blue-500/20'
                      : 'bg-white/5 text-gray-400 border border-white/8 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {f}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROMO GRID ──────────────────────────────────────────── */}
      <section className="px-6 sm:px-10 lg:px-16 py-10 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-20"
              >
                <div className="text-5xl mb-4">🏷️</div>
                <p className="text-white font-semibold text-lg mb-2">Tidak ada promo ditemukan</p>
                <p className="text-gray-500 text-sm">Coba kata kunci lain atau lihat semua promo</p>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-gray-500 text-sm mb-5">{filtered.length} promo tersedia</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.map((p) => (
                    <PromoCard key={p.id} promo={{ ...p, countdown: countdown[p.id] }} showCode onClaim={handleClaim} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ─── CARA MENDAPATKAN VOUCHER ──────────────────────────── */}
      <section className="px-6 sm:px-10 lg:px-16 py-16 bg-[#0F172A] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-blue-400 text-sm font-semibold uppercase tracking-widest">Cara Mendapatkan</span>
            <h2 className="text-3xl font-extrabold text-white mt-2">Dapatkan Voucher Mudah</h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto mt-2">Ikuti langkah-langkah berikut untuk klaim promo.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { icon: <MdPersonAdd className="text-3xl text-blue-400" />, title: 'Daftar Member', desc: 'Registrasi gratis di dashboard.' },
              { icon: <MdVerified className="text-3xl text-orange-400" />, title: 'Lengkapi Profil', desc: 'Isi data diri dengan benar.' },
              { icon: <MdEmojiEvents className="text-3xl text-yellow-400" />, title: 'Kumpulkan Poin', desc: 'Setiap transaksi dapat poin.' },
              { icon: <MdCardGiftcard className="text-3xl text-emerald-400" />, title: 'Klaim Voucher', desc: 'Tukar poin dengan voucher.' },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="glass-card rounded-2xl p-6 text-center bg-[#1E293B]/40 border border-white/5 hover:border-blue-500/30 transition-all hover:-translate-y-2"
              >
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-blue-500/10">
                  {step.icon}
                </div>
                <div className="text-white font-bold text-sm">{step.title}</div>
                <p className="text-gray-400 text-xs mt-1">{step.desc}</p>
                {idx < 3 && (
                  <div className="hidden md:block text-gray-600 text-2xl mt-3">↓</div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VOUCHER ULANG TAHUN PREMIUM ───────────────────────── */}
      <section className="px-6 sm:px-10 lg:px-16 py-16 bg-[#0F172A] border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-orange-600/20 via-blue-600/20 to-purple-600/20 border border-white/10 p-8 md:p-12"
          >
            <div className="absolute top-0 right-0 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-blue-500/10 rounded-full blur-3xl" />

            <div className="relative flex flex-col md:flex-row items-center gap-8">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500/30 to-orange-600/10 flex items-center justify-center text-5xl flex-shrink-0">
                🎂
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-widest mb-3">
                  🎉 Eksklusif
                </div>
                <h3 className="text-2xl font-extrabold text-white">Voucher Ulang Tahun</h3>
                <p className="text-gray-400 text-sm max-w-md mt-1">
                  Dapatkan diskon 20% otomatis setiap ulang tahun Anda.
                </p>
                <div className="flex flex-wrap gap-3 mt-4">
                  {['Diskon 20%', 'Otomatis dikirim', 'Berlaku 30 hari', 'Via WhatsApp & Email'].map((benefit) => (
                    <span key={benefit} className="flex items-center gap-1.5 text-xs text-green-300 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">
                      <MdCheckCircle className="text-green-400 text-sm" /> {benefit}
                    </span>
                  ))}
                </div>
              </div>
              <a
                href="/member/dashboard"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-400 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-orange-500/30 hover:scale-[1.02] transition-all whitespace-nowrap"
              >
                Daftar Sekarang <MdArrowForward />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── PROGRAM LOYALITAS ──────────────────────────────────── */}
      <section className="px-6 sm:px-10 lg:px-16 py-16 bg-[#0F172A] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-blue-400 text-sm font-semibold uppercase tracking-widest">Loyalitas</span>
            <h2 className="text-3xl font-extrabold text-white mt-2">Program Loyalitas Member</h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto mt-2">Semakin sering servis, semakin banyak keuntungan.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <MdStars className="text-3xl text-yellow-400" />, title: 'Kumpulkan Poin', desc: 'Dapatkan poin dari setiap transaksi servis.' },
              { icon: <MdRedeem className="text-3xl text-emerald-400" />, title: 'Tukar Voucher', desc: 'Tukarkan poin dengan voucher diskon.' },
              { icon: <MdLocalOffer className="text-3xl text-orange-400" />, title: 'Promo Eksklusif', desc: 'Akses promo khusus untuk member.' },
              { icon: <MdCalendarToday className="text-3xl text-blue-400" />, title: 'Prioritas Booking', desc: 'Booking lebih cepat dengan prioritas.' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="glass-card rounded-2xl p-6 text-center bg-[#1E293B]/40 border border-white/5 hover:border-blue-500/30 transition-all hover:-translate-y-2"
              >
                <div className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center bg-blue-500/10">
                  {item.icon}
                </div>
                <h3 className="text-white font-bold text-base">{item.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ PROMO ──────────────────────────────────────────── */}
      <section className="px-6 sm:px-10 lg:px-16 py-16 bg-[#0F172A] border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-blue-400 text-sm font-semibold uppercase tracking-widest">FAQ</span>
            <h2 className="text-3xl font-extrabold text-white mt-2">Pertanyaan Seputar Promo</h2>
          </div>
          <div className="space-y-3">
            <FaqItem
              question="Bagaimana cara menggunakan voucher?"
              answer="Masukkan kode voucher pada saat booking atau tunjukkan kode di bengkel. Pastikan voucher masih berlaku."
            />
            <FaqItem
              question="Apakah promo bisa digabung?"
              answer="Promo tidak dapat digabung dengan promo lain kecuali disebutkan khusus. Pilih promo dengan keuntungan terbaik."
            />
            <FaqItem
              question="Berapa lama masa berlaku voucher?"
              answer="Masa berlaku voucher bervariasi, biasanya 30 hari sejak diterbitkan. Cek tanggal kedaluwarsa di halaman voucher."
            />
            <FaqItem
              question="Bagaimana mendapatkan voucher ulang tahun?"
              answer="Daftar sebagai member dan isi data diri lengkap. Voucher akan otomatis dikirim via WhatsApp & Email di bulan ulang tahun."
            />
            <FaqItem
              question="Apakah promo berlaku untuk semua layanan?"
              answer="Setiap promo memiliki ketentuan tersendiri. Baca detail promo untuk mengetahui layanan yang berlaku."
            />
          </div>
        </div>
      </section>

      {/* ─── CTA MEMBER ──────────────────────────────────────────── */}
      <section className="relative py-20 px-6 sm:px-10 lg:px-16 overflow-hidden">
        <div className="absolute inset-0">
            <img
              src="https://images.pexels.com/photos/3807329/pexels-photo-3807329.jpeg?auto=compress&cs=tinysrgb&w=1600"
              alt="Esther Garage Member"
              className="w-full h-full object-cover"
            />
          <div className="absolute inset-0 bg-[#0F172A]/85" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="text-5xl mb-4">🎁</div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
              Belum Menjadi Member?
            </h2>
            <p className="text-gray-300 text-base max-w-lg mx-auto mb-8">
              Nikmati promo eksklusif, voucher ulang tahun, loyalty point, dan prioritas booking servis.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3.5">
              <a
                href="/member/dashboard"
                className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02]"
              >
                Daftar Member <MdArrowForward />
              </a>
              <a
                href="https://wa.me/6288708230676"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2.5 glass-dark hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all"
              >
                <MdWhatsapp className="text-green-400 text-xl" /> Hubungi Kami
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────── */}
      <footer className="py-8 px-6 sm:px-10 lg:px-16 bg-[#0B1120] border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xl font-extrabold text-white">EG</span>
            <span className="text-xs text-gray-500">© 2026 Esther Garage. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <a href="#" className="hover:text-blue-400 transition">Privacy</a>
            <a href="#" className="hover:text-blue-400 transition">Terms</a>
            <a href="#" className="hover:text-blue-400 transition">Contact</a>
          </div>
        </div>
      </footer>

      {/* ─── FLOATING WHATSAPP ──────────────────────────────────── */}
      <a
        href="https://wa.me/6288708230676"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl bg-green-500 hover:scale-110 transition-transform hover:shadow-green-500/40"
        style={{ boxShadow: '0 8px 24px rgba(37,211,102,0.4)' }}
      >
        <MdWhatsapp className="text-white text-3xl" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
      </a>

      {/* ─── TOAST ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold backdrop-blur-sm border"
            style={
              toast.type === 'success'
                ? { background: 'rgba(16,185,129,0.15)', color: '#34D399', borderColor: 'rgba(52,211,153,0.25)' }
                : toast.type === 'warning'
                ? { background: 'rgba(234,179,8,0.15)', color: '#FCD34D', borderColor: 'rgba(252,211,77,0.25)' }
                : { background: 'rgba(239,68,68,0.15)', color: '#F87171', borderColor: 'rgba(248,113,113,0.25)' }
            }
          >
            <span>{toast.type === 'success' ? '🎉' : toast.type === 'warning' ? '⚠️' : '❌'}</span>
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 opacity-50 hover:opacity-100">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── GLOBAL STYLES ──────────────────────────────────────── */}
      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .glass-dark {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}