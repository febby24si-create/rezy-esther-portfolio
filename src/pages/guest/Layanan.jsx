import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { layanan } from '../../data/guestData'
import ServiceCard from '../../components/guest/ServiceCard'
import {
  MdSearch, MdVerified, MdBuild, MdCardGiftcard,
  MdCalendarToday, MdGpsFixed, MdSupportAgent,
  MdWhatsapp, MdArrowForward, MdStar, MdStarBorder,
  MdInfoOutline, MdDiscount, MdTimer
} from 'react-icons/md'

const categories = ['Semua', 'Perawatan', 'Performa', 'Ban & Kaki', 'Kenyamanan', 'Elektronik']

// ── Intersection Observer hook ──
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

// ── FadeInUp ──
function FadeInUp({ children, delay = 0, className = '' }) {
  const { ref, isInView } = useInView({ threshold: 0.1, triggerOnce: true })
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${className} ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

// ── Stagger container ──
function StaggerContainer({ children, className = '' }) {
  const { ref, isInView } = useInView({ threshold: 0.1, triggerOnce: true })
  return (
    <div ref={ref} className={className}>
      {isInView && children}
      {!isInView && <div className="opacity-0">{children}</div>}
    </div>
  )
}

// ── Animated counter ──
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

// ── Animated counter statistik ──
function StatsCounter({ target, suffix = '', label }) {
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

// ── Service Card yang di-upgrade ──
const EnhancedServiceCard = ({ service, index }) => {
  // Generate gambar dari Unsplash berdasarkan nama layanan
  const getImage = (name) => {
    const query = name.replace(/\s/g, '+')
    return `https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&q=80&auto=format&fit=crop` // fallback
    // Sebenarnya kita bisa gunakan endpoint yang lebih baik, tapi untuk demo kita pakai gambar statis
  }
  // Rating dummy
  const rating = 4.5 + (index % 3) * 0.2
  const price = Math.floor(150000 + index * 25000)
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -8, transition: { type: 'spring', stiffness: 300 } }}
      className="glass-card rounded-2xl overflow-hidden group bg-[#0F172A]/60 border border-white/5 hover:border-blue-500/30 transition-all duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={`https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&q=80&auto=format&fit=crop&crop=center`}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent opacity-60" />
        <div className="absolute top-3 left-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-500/80 text-white px-2.5 py-0.5 rounded-full backdrop-blur-sm">
            {service.category || 'Umum'}
          </span>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <div className="flex items-center gap-1 text-yellow-400">
            {[...Array(5)].map((_, i) => (
              i < Math.floor(rating) ? <MdStar key={i} className="text-sm" /> : <MdStarBorder key={i} className="text-sm" />
            ))}
            <span className="text-white text-xs ml-1">{rating.toFixed(1)}</span>
          </div>
          <div className="text-white font-bold text-sm bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
            Mulai Rp{price.toLocaleString('id-ID')}
          </div>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-white font-bold text-base">{service.name}</h3>
        <p className="text-gray-400 text-xs leading-relaxed mt-1 line-clamp-2">{service.desc}</p>
        <button className="mt-4 w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 transition-all flex items-center justify-center gap-2 group-hover:gap-3">
          Lihat Detail <MdArrowForward className="text-sm" />
        </button>
      </div>
    </motion.div>
  )
}

// ── Scroll To Top ──
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
      className="fixed bottom-6 right-6 z-40 p-3 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-blue-500"
    >
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </motion.button>
  )
}

// ── MAIN ──
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

  useEffect(() => {
    setIsFilterAnim(true)
    const timer = setTimeout(() => setIsFilterAnim(false), 500)
    return () => clearTimeout(timer)
  }, [search, activeCategory])

  return (
    <div className="pt-16 min-h-screen overflow-x-hidden" style={{ background: '#0F172A' }}>

      {/* ─── HERO BANNER ─── */}
      <section className="relative h-[400px] md:h-[450px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1600&q=80&auto=format&fit=crop"
            alt="Bengkel Modern"
            className="w-full h-full object-cover object-center"
            style={{ transform: 'scale(1.05)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A]/90 via-[#0F172A]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-[#0F172A]/20" />
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <span className="text-blue-400 text-sm font-semibold uppercase tracking-widest">Layanan Kami</span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mt-2 leading-tight">
              Servis Lengkap untuk <br />
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Kendaraan Anda</span>
            </h1>
            <p className="text-gray-300 text-base mt-4 max-w-lg">
              Dari perawatan rutin hingga perbaikan mesin, semua dikerjakan oleh mekanik bersertifikat dengan peralatan diagnostik modern.
            </p>
            <motion.a
              href="#booking"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2.5 mt-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-blue-600/30 transition-all"
            >
              Booking Sekarang <MdArrowForward />
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* ─── STATISTIK ─── */}
      <section className="py-16 px-6 sm:px-10 lg:px-16 bg-[#0F172A] border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatsCounter target={5000} suffix="+" label="Pelanggan" />
            <StatsCounter target={10} suffix="+" label="Mekanik" />
            <StatsCounter target={8} suffix=" Tahun" label="Pengalaman" />
            <StatsCounter target={98} suffix="%" label="Kepuasan" />
          </div>
        </div>
      </section>

      {/* ─── KEUNGGULAN ─── */}
      <section className="py-16 px-6 sm:px-10 lg:px-16 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">Keunggulan</span>
            <h2 className="text-3xl font-extrabold text-white mt-2">Mengapa Memilih Esther Garage?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: <MdVerified className="text-2xl text-blue-400" />, title: 'Mekanik Bersertifikat', desc: 'Tersertifikasi TAM, AHM, dan Bosch.' },
              { icon: <MdBuild className="text-2xl text-orange-400" />, title: 'Garansi Servis', desc: 'Garansi 6 bulan untuk setiap pekerjaan.' },
              { icon: <MdCardGiftcard className="text-2xl text-emerald-400" />, title: 'Sparepart Berkualitas', desc: 'Suku cadang original dan berkualitas.' },
              { icon: <MdCalendarToday className="text-2xl text-blue-400" />, title: 'Booking Online', desc: 'Pesan slot servis 24/7 tanpa antri.' },
              { icon: <MdGpsFixed className="text-2xl text-purple-400" />, title: 'Diagnostik Modern', desc: 'Peralatan OBD2 dan scanner terkini.' },
              { icon: <MdSupportAgent className="text-2xl text-orange-400" />, title: 'Dukungan WhatsApp', desc: 'CS siap membantu setiap hari.' },
            ].map((item, idx) => (
              <FadeInUp key={idx} delay={idx * 100}>
                <div className="glass-card rounded-2xl p-6 text-center group hover:-translate-y-2 transition-all duration-300 bg-[#1E293B]/40 border border-white/5 hover:border-blue-500/30">
                  <div className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center bg-blue-500/10 group-hover:bg-blue-500/20 transition-all">
                    {item.icon}
                  </div>
                  <h3 className="text-white font-bold text-base">{item.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{item.desc}</p>
                </div>
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SEARCH & FILTER ─── */}
      <section className="px-6 sm:px-10 lg:px-16 py-8 bg-[#0F172A] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search bar upgrade dengan glassmorphism */}
            <motion.div
              className="relative w-full md:max-w-sm"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari layanan yang Anda butuhkan..."
                className="w-full bg-white/5 backdrop-blur-sm border border-white/10 focus:border-blue-500/50 rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder-gray-500 outline-none transition-all duration-300 focus:shadow-xl focus:shadow-blue-500/10"
              />
            </motion.div>

            {/* Category filter */}
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
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-md shadow-blue-500/20'
                      : 'bg-white/5 text-gray-400 border border-white/8 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {c}
                </motion.button>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── BANNER PROMO ─── */}
      <section className="px-6 sm:px-10 lg:px-16 py-6 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-orange-600/20 via-blue-600/20 to-purple-600/20 border border-white/10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-2xl">
                <MdDiscount />
              </div>
              <div>
                <span className="text-orange-400 text-xs font-semibold uppercase tracking-widest">Promo Bulan Ini</span>
                <h3 className="text-white font-bold text-lg">Diskon Servis Berkala 20%</h3>
                <p className="text-gray-400 text-sm">Untuk semua paket perawatan rutin.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-white font-mono text-lg bg-black/40 px-4 py-2 rounded-xl border border-white/10">
                <MdTimer className="text-orange-400" />
                <span>02:14:37</span>
              </div>
              <a
                href="#booking"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold px-5 py-2.5 rounded-xl transition-all"
              >
                Booking Sekarang <MdArrowForward />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── SERVICE GRID ─── */}
      <section className="px-6 sm:px-10 lg:px-16 py-10 bg-[#0F172A]">
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
                <div className="text-5xl mb-4">🔍</div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {filtered.map((s, i) => (
                    <EnhancedServiceCard key={s.id} service={s} index={i} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ─── FAQ LAYANAN ─── */}
      <section className="px-6 sm:px-10 lg:px-16 py-16 bg-[#0F172A] border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-blue-400 text-sm font-semibold uppercase tracking-widest">FAQ</span>
            <h2 className="text-3xl font-extrabold text-white mt-2">Pertanyaan Umum Layanan</h2>
          </div>
          <div className="space-y-3">
            {[
              { q: 'Berapa lama servis berkala?', a: 'Servis berkala biasanya memakan waktu 1–3 jam tergantung jenis servis. Untuk servis besar seperti tune up atau perbaikan mesin, bisa memakan waktu 4–8 jam.' },
              { q: 'Apakah harus booking terlebih dahulu?', a: 'Booking sangat disarankan untuk memastikan slot servis tersedia. Anda bisa booking melalui website atau WhatsApp kami 24/7.' },
              { q: 'Apakah tersedia garansi?', a: 'Ya, setiap pekerjaan servis kami berikan garansi selama 6 bulan. Jika ada masalah terkait pekerjaan, kami akan perbaiki tanpa biaya tambahan.' },
              { q: 'Apakah menerima semua merek kendaraan?', a: 'Ya, kami melayani semua merek kendaraan mulai dari Toyota, Honda, Suzuki, Mitsubishi, hingga mobil Eropa seperti BMW, Mercedes, dan Audi.' },
              { q: 'Bagaimana sistem booking online?', a: 'Anda dapat booking melalui website kami dengan memilih layanan, tanggal, dan jam yang diinginkan. Konfirmasi akan dikirim via WhatsApp.' },
            ].map((item, idx) => {
              const [open, setOpen] = useState(false)
              return (
                <FadeInUp key={idx} delay={idx * 100}>
                  <div className="glass-card rounded-xl overflow-hidden bg-[#1E293B]/40 border border-white/5 hover:border-blue-500/20 transition-all">
                    <button
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition"
                      onClick={() => setOpen(!open)}
                    >
                      <span className="text-white font-medium text-sm">{item.q}</span>
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
                        <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
                      </div>
                    </div>
                  </div>
                </FadeInUp>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA BESAR ─── */}
      <section className="relative py-20 px-6 sm:px-10 lg:px-16 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=80&auto=format&fit=crop"
            alt="Mobil"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0F172A]/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/60 to-transparent" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
              Siap Merawat <br />
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Kendaraan Anda?</span>
            </h2>
            <p className="text-gray-300 text-base max-w-lg mx-auto mb-8">
              Booking sekarang dan nikmati layanan terbaik dari mekanik profesional kami.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3.5">
              <a
                href="#booking"
                className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02]"
              >
                Booking Sekarang <MdArrowForward />
              </a>
              <a
                href="https://wa.me/6288708230676?text=Halo%20Esther%20Garage%2C%20saya%20mau%20konsultasi"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2.5 glass-dark hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all"
              >
                <MdWhatsapp className="text-green-400 text-xl" /> Hubungi WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FLOATING BUTTONS ─── */}
      <ScrollToTop />
      <a
        href="https://wa.me/6288708230676"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-20 right-6 z-40 w-12 h-12 rounded-full flex items-center justify-center shadow-lg bg-green-500 hover:scale-110 transition-transform"
      >
        <MdWhatsapp className="text-white text-2xl" />
      </a>

      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        .glass-dark {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.2); }
          70% { box-shadow: 0 0 0 10px rgba(37, 99, 235, 0); }
          100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
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