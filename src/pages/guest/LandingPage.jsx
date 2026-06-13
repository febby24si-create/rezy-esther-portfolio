import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdArrowForward, MdStar, MdVerified, MdSupportAgent,
  MdCalendarMonth, MdGpsFixed, MdStars, MdCardGiftcard,
  MdWhatsapp, MdPhone, MdCheckCircle, MdLocationOn,
  MdAccessTime, MdNavigation, MdInfoOutline
} from 'react-icons/md'
import { bengkelProfile, layanan, promos, testimonials, customerJourney } from '../../data/guestData'
import ServiceCard from '../../components/guest/ServiceCard'
import PromoCard from '../../components/guest/PromoCard'

// ── Intersection Observer hook (enhanced) ──
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

function FadeInUp({ children, delay = 0, className = '' }) {
  const { ref, isInView } = useInView({ threshold: 0.1, triggerOnce: true })
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${className} ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

function StaggerContainer({ children, className = '' }) {
  const { ref, isInView } = useInView({ threshold: 0.1, triggerOnce: true })
  return (
    <div ref={ref} className={className}>
      {isInView && children}
      {!isInView && <div className="opacity-0">{children}</div>}
    </div>
  )
}

function AnimatedCounter({ target, suffix = '', duration = 2000, trigger = false }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!trigger) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration, trigger])
  return <>{count.toLocaleString('id-ID')}{suffix}</>
}

// ── Floating particles ──
function Particles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${10 + Math.random() * 80}%`,
    top: `${5 + Math.random() * 90}%`,
    size: Math.random() * 2.5 + 1,
    delay: Math.random() * 6,
    dur: Math.random() * 5 + 4,
  }))
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <div key={p.id} className="absolute rounded-full bg-green-400"
          style={{
            left: p.left, top: p.top, width: p.size, height: p.size, opacity: 0,
            animation: `particleFloat ${p.dur}s ease-in-out ${p.delay}s infinite alternate`
          }} />
      ))}
    </div>
  )
}

// ── Tooltip component ──
function Tooltip({ children, text }) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-gray-300 text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
        {text}
      </div>
    </div>
  )
}

// ── Floating WhatsApp + Scroll to Top ──
function FloatingButtons() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <>
      <a
        href="https://wa.me/6288708230676?text=Halo%20Esther%20Garage%2C%20saya%20mau%20tanya%20servis"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-lg transition-all hover:scale-110 hover:shadow-green-500/40"
        style={{ background: '#25D366', boxShadow: '0 4px 12px rgba(37,211,102,0.4)' }}
      >
        <MdWhatsapp className="text-white text-2xl" />
      </a>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-50 p-2.5 rounded-full shadow-lg transition-all hover:scale-110"
          style={{ background: 'rgba(34,197,94,0.9)', backdropFilter: 'blur(4px)' }}
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </>
  )
}

// ── FORM KIRIM PESAN (komponen baru) ──
function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [isSent, setIsSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) {
      alert('Harap isi semua bidang!')
      return
    }
    setIsSubmitting(true)
    // Simulasi pengiriman (ganti dengan API endpoint nyata jika ada)
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Pesan terkirim:', formData)
    setIsSent(true)
    setIsSubmitting(false)
    setFormData({ name: '', email: '', message: '' })
    setTimeout(() => setIsSent(false), 4000)
  }

  return (
    <div className="rounded-2xl p-6 md:p-8 transition-all hover:shadow-xl"
      style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.15)' }}>
      <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        📩 Kirim Pesan
      </h3>
      <p className="text-gray-400 text-sm mb-6">Kami akan membalas dalam 24 jam.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1">NAMA LENGKAP</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-green-500/50 focus:outline-none text-white transition-all"
            placeholder="Nama kamu"
            required
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1">EMAIL</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-green-500/50 focus:outline-none text-white transition-all"
            placeholder="email@kamu.com"
            required
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-1">PESAN</label>
          <textarea
            name="message"
            rows="4"
            value={formData.message}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 focus:border-green-500/50 focus:outline-none text-white transition-all resize-none"
            placeholder="Tulis pesanmu di sini..."
            required
          />
        </div>
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          style={{ background: 'linear-gradient(135deg, #22c55e, #10b981)' }}
        >
          {isSubmitting ? 'Mengirim...' : 'Kirim Pesan'}
          {!isSubmitting && <MdArrowForward />}
        </motion.button>
      </form>

      <AnimatePresence>
        {isSent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-5 py-2 rounded-full text-sm shadow-lg z-50"
          >
            ✅ Pesan terkirim! Kami akan segera merespon.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── MAPS COMPONENT ──
function LocationMap() {
  const mapSrc = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.829975739129!2d100.370128!3d-0.304922!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2fd53bc8b9f5f6c3%3A0x8c2b8d6f1e9f3b1!2sBukittinggi%2C%20Kota%20Bukittinggi%2C%20Sumatera%20Barat!5e0!3m2!1sid!2sid!4v1710000000000!5m2!1sid!2sid"
  return (
    <div className="rounded-2xl overflow-hidden shadow-xl border border-green-500/20 transition-all hover:border-green-500/40">
      <iframe
        title="Esther Garage Location"
        src={mapSrc}
        width="100%"
        height="350"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="pointer-events-auto"
      ></iframe>
    </div>
  )
}

const features = [
  { icon: MdCalendarMonth, title: 'Booking Online 24/7', desc: 'Pesan slot servis kapan saja, tanpa antri di bengkel.', color: 'green', tooltip: 'Tersedia 24 jam nonstop' },
  { icon: MdGpsFixed, title: 'Tracking Real-Time', desc: 'Pantau progress kendaraan Anda langsung dari smartphone.', color: 'blue', tooltip: 'Update status via WhatsApp' },
  { icon: MdStars, title: 'Loyalty Points', desc: 'Kumpulkan poin setiap servis dan tukarkan dengan reward.', color: 'yellow', tooltip: '1 poin = Rp 1000' },
  { icon: MdCardGiftcard, title: 'Voucher & Promo', desc: 'Diskon eksklusif member, voucher ulang tahun, dan promo rutin.', color: 'purple', tooltip: 'Cek halaman promo' },
  { icon: MdVerified, title: 'Mekanik Bersertifikat', desc: 'Seluruh mekanik tersertifikasi TAM, AHM, dan Bosch.', color: 'green', tooltip: 'Sertifikasi resmi' },
  { icon: MdSupportAgent, title: 'Support WhatsApp', desc: 'Tim CS siap membantu via WhatsApp setiap hari kerja.', color: 'blue', tooltip: 'Respon cepat < 10 menit' },
]

export default function LandingPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  const { ref: statsRef, isInView: statsVisible } = useInView({ threshold: 0.3, triggerOnce: true })

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial((p) => (p + 1) % testimonials.length), 4000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/mobil.png"
            alt="Esther Garage"
            className="w-full h-full object-cover object-center"
            style={{ transform: `scale(1.08) translateY(${scrollY * 0.03}px)`, transition: 'transform 0.1s linear' }}
          />
          <div className="absolute inset-0" style={{ background: 'rgba(2,10,6,0.55)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(2,10,6,0.92) 0%, rgba(2,10,6,0.75) 40%, rgba(2,10,6,0.2) 75%, rgba(2,10,6,0.1) 100%)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-48" style={{ background: 'linear-gradient(to bottom, transparent, #020f09)' }} />
          <div className="absolute top-0 left-0 right-0 h-32" style={{ background: 'linear-gradient(to bottom, rgba(2,10,6,0.6), transparent)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 75% 60%, rgba(34,197,94,0.08) 0%, transparent 55%)' }} />
        </div>

        <div className="absolute inset-0 opacity-[0.018]"
          style={{ backgroundImage: 'linear-gradient(rgba(34,197,94,1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,1) 1px, transparent 1px)', backgroundSize: '70px 70px' }} />

        <Particles />

        <div className="relative z-10 flex flex-col justify-center min-h-screen pt-20 pb-10 px-6 sm:px-10 lg:px-20 max-w-7xl mx-auto w-full">
          <div className="max-w-xl hero-enter">
            <div className="inline-flex items-center gap-2 mb-6 rounded-full px-4 py-1.5 border border-green-500/30 bg-green-500/10 backdrop-blur-sm">
              <MdVerified className="text-green-400 text-sm" />
              <span className="text-green-400 text-xs font-semibold tracking-wider">BENGKEL TERPERCAYA BUKITTINGGI #1</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] mb-6 tracking-tight">
              Servis<br />
              Kendaraan<br />
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-green-500">
                  Lebih Mudah
                </span>
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #22c55e, #10b981)', boxShadow: '0 0 12px rgba(34,197,94,0.6)' }} />
              </span>
            </h1>
            <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-10 max-w-md">
              Booking online, tracking real-time, loyalty points, dan reminder otomatis.
              <span className="text-green-400 font-semibold"> Esther Garage CRM</span> — bengkel modern untuk Anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-12">
              <Link to="/guest/booking"
                className="inline-flex items-center justify-center gap-2 text-white font-bold px-7 py-4 rounded-2xl transition-all text-sm hover:scale-105 active:scale-95 hover:shadow-lg"
                style={{ background: 'linear-gradient(135deg, #22c55e, #10b981)', boxShadow: '0 0 24px rgba(34,197,94,0.4), 0 4px 20px rgba(0,0,0,0.4)' }}>
                🚗 Booking Service Sekarang
                <MdArrowForward className="text-lg" />
              </Link>
              <a href="https://wa.me/6288708230676" target="_blank" rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 backdrop-blur-sm bg-white/8 hover:bg-white/14 border border-white/20 hover:border-green-500/40 text-white font-semibold px-7 py-4 rounded-2xl transition-all text-sm hover:scale-105">
                <MdWhatsapp className="text-lg text-green-400" />
                Hubungi via WhatsApp
              </a>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { dot: 'bg-green-400', label: 'ENGINE OK', color: 'border-green-500/25 text-green-400', tooltip: 'Diagnostik mesin akurat' },
                { dot: 'bg-blue-400', label: 'OBD2 LINKED', color: 'border-blue-500/25 text-blue-400', tooltip: 'Sistem terhubung' },
                { dot: 'bg-yellow-400', label: 'BOSCH CERTIFIED', color: 'border-yellow-500/25 text-yellow-400', tooltip: 'Tools Bosch resmi' },
              ].map(b => (
                <Tooltip key={b.label} text={b.tooltip}>
                  <div className={`inline-flex items-center gap-1.5 border rounded-lg px-2.5 py-1 backdrop-blur-sm bg-black/40 ${b.color}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${b.dot} animate-pulse`} />
                    <span className="text-xs font-mono font-semibold">{b.label}</span>
                  </div>
                </Tooltip>
              ))}
            </div>
          </div>

          <div ref={statsRef} className="absolute bottom-10 left-6 sm:left-10 lg:left-20 right-6 sm:right-10 lg:right-20 max-w-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 bg-gradient-to-r from-green-500/40 to-transparent" />
              <span className="text-green-500/50 text-xs font-mono tracking-widest">LIVE STATS</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Pelanggan', target: bengkelProfile.stats.customers, suffix: '+' },
                { label: 'Service', target: bengkelProfile.stats.serviceDone, suffix: '+' },
                { label: 'Mekanik', target: bengkelProfile.stats.mechanics, suffix: '' },
                { label: 'Kepuasan', target: bengkelProfile.stats.satisfaction, suffix: '%' },
              ].map(({ label, target, suffix }) => (
                <div key={label} className="rounded-xl p-3 text-center backdrop-blur-sm transition-all hover:scale-105 hover:bg-green-500/10"
                  style={{ background: 'rgba(2,15,9,0.65)', border: '1px solid rgba(34,197,94,0.15)' }}>
                  <div className="text-lg sm:text-xl font-extrabold text-white leading-none">
                    <AnimatedCounter target={target} suffix={suffix} trigger={statsVisible} />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROMO */}
      <FadeInUp delay={100}>
        <section className="py-20 px-4 sm:px-6" style={{ background: 'linear-gradient(180deg, #020f09 0%, #041C15 100%)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-2">🔥 Promo Terbatas</p>
                <h2 className="text-3xl font-extrabold text-white">Penawaran Spesial Minggu Ini</h2>
              </div>
              <Link to="/guest/promo" className="hidden sm:flex items-center gap-1 text-green-400 hover:text-green-300 text-sm font-semibold transition-all hover:gap-2">
                Lihat Semua <MdArrowForward />
              </Link>
            </div>
            <StaggerContainer>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {promos.slice(0, 3).map((p, i) => (
                  <div key={p.id} style={{ animationDelay: `${i * 100}ms` }} className="animate-slide-up">
                    <PromoCard promo={p} />
                  </div>
                ))}
              </div>
            </StaggerContainer>
            <Link to="/guest/promo" className="sm:hidden flex items-center justify-center gap-2 mt-5 text-green-400 text-sm font-semibold">
              Lihat Semua Promo <MdArrowForward />
            </Link>
          </div>
        </section>
      </FadeInUp>

      {/* LAYANAN */}
      <FadeInUp delay={200}>
        <section className="py-20 px-4 sm:px-6" style={{ background: '#041C15' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-2">Apa Yang Kami Tawarkan</p>
              <h2 className="text-3xl font-extrabold text-white mb-3">Layanan Bengkel Lengkap</h2>
              <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
                Dari perawatan rutin hingga perbaikan besar, semua dikerjakan oleh mekanik bersertifikat dengan peralatan modern.
              </p>
            </div>
            <StaggerContainer>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {layanan.slice(0, 8).map((s, i) => (
                  <div key={s.id} style={{ animationDelay: `${i * 80}ms` }} className="animate-slide-up">
                    <ServiceCard service={s} />
                  </div>
                ))}
              </div>
            </StaggerContainer>
            <div className="text-center mt-8">
              <Link to="/guest/layanan" className="inline-flex items-center gap-2 border border-green-500/30 hover:border-green-500/60 text-green-400 font-semibold px-6 py-3 rounded-xl transition-all hover:bg-green-500/10 hover:scale-105 hover:gap-3">
                Lihat Semua Layanan <MdArrowForward />
              </Link>
            </div>
          </div>
        </section>
      </FadeInUp>

      {/* KEUNGGULAN */}
      <FadeInUp delay={300}>
        <section className="py-20 px-4 sm:px-6" style={{ background: 'linear-gradient(180deg, #041C15 0%, #020f09 100%)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-2">Kenapa Esther Garage?</p>
              <h2 className="text-3xl font-extrabold text-white mb-3">Bengkel Modern yang Berbeda</h2>
            </div>
            <StaggerContainer>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {features.map(({ icon: Icon, title, desc, color, tooltip }, i) => (
                  <Tooltip key={title} text={tooltip}>
                    <div style={{ animationDelay: `${i * 80}ms`, background: 'rgba(34,197,94,0.03)', borderColor: 'rgba(34,197,94,0.08)' }}
                      className="animate-slide-up group p-6 rounded-2xl border hover:border-green-500/30 transition-all hover:-translate-y-2 hover:shadow-lg hover:shadow-green-500/10">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${color === 'green' ? 'bg-green-500/15  text-green-400' :
                          color === 'blue' ? 'bg-blue-500/15   text-blue-400' :
                            color === 'yellow' ? 'bg-yellow-500/15 text-yellow-400' :
                              'bg-purple-500/15 text-purple-400'}`}>
                        <Icon className="text-2xl" />
                      </div>
                      <h3 className="text-white font-bold mb-2">{title}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                    </div>
                  </Tooltip>
                ))}
              </div>
            </StaggerContainer>
          </div>
        </section>
      </FadeInUp>

      {/* CUSTOMER JOURNEY */}
      <FadeInUp delay={400}>
        <section className="py-20 px-4 sm:px-6" style={{ background: '#020f09' }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-2">Perjalanan Pelanggan</p>
              <h2 className="text-3xl font-extrabold text-white mb-3">Dari Pengunjung Menjadi Pelanggan Setia</h2>
            </div>
            <div className="relative">
              <div className="hidden lg:block absolute top-10 left-[7%] right-[7%] h-0.5 bg-gradient-to-r from-blue-500/30 via-green-500/50 to-green-600/30" />
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                {customerJourney.map((j, i) => (
                  <div key={j.step} className="flex flex-col items-center text-center gap-2 relative animate-float-up" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl z-10 transition-all hover:-translate-y-1 hover:scale-110"
                      style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                      {j.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">{j.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-tight hidden sm:block">{j.desc}</p>
                    </div>
                    {i < customerJourney.length - 1 && (
                      <div className="lg:hidden absolute top-6 -right-2 text-green-500/30 text-lg animate-pulse">→</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </FadeInUp>

      {/* TESTIMONI */}
      <FadeInUp delay={500}>
        <section className="py-20 px-4 sm:px-6" style={{ background: '#041C15' }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-2">Kata Pelanggan Kami</p>
              <h2 className="text-3xl font-extrabold text-white">Mereka Sudah Merasakan Perbedaannya</h2>
            </div>
            <div className="rounded-2xl p-8 mb-6 transition-all duration-500 hover:shadow-xl hover:shadow-green-500/10"
              style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.12)' }}>
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonials[activeTestimonial].rating }).map((_, i) => (
                  <MdStar key={i} className="text-yellow-400 text-lg animate-pulse" />
                ))}
              </div>
              <p className="text-gray-200 text-lg leading-relaxed mb-6 italic">
                "{testimonials[activeTestimonial].text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-400 font-bold text-sm">
                  {testimonials[activeTestimonial].name[0]}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{testimonials[activeTestimonial].name}</p>
                  <p className="text-gray-500 text-xs">{testimonials[activeTestimonial].vehicle} · {testimonials[activeTestimonial].tier} Member</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-2">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setActiveTestimonial(i)}
                  className={`rounded-full transition-all duration-300 ${i === activeTestimonial ? 'w-6 h-2 bg-green-400' : 'w-2 h-2 bg-white/20 hover:bg-white/40 hover:scale-125'}`} />
              ))}
            </div>
          </div>
        </section>
      </FadeInUp>

      {/* CTA VOUCHER */}
      <FadeInUp delay={600}>
        <section className="relative py-24 px-4 sm:px-6 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #041C15 0%, #06281F 50%, #041C15 100%)' }} />
            <img src="/mobil.png" alt="" className="absolute right-0 top-0 h-full w-1/2 object-cover object-left opacity-10"
              style={{ maskImage: 'linear-gradient(to right, transparent, rgba(0,0,0,0.8))', WebkitMaskImage: 'linear-gradient(to right, transparent, rgba(0,0,0,0.8))' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, #041C15 30%, transparent 80%, #041C15 100%)' }} />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <div className="text-6xl mb-5 animate-bounce">🎁</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Daftar Gratis & Klaim Voucher <span className="text-green-400">Diskon 15%</span>
            </h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Jadilah member Esther Garage dan nikmati voucher selamat datang, loyalty points, reminder otomatis, dan promo eksklusif member.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {['Voucher Welcome 15%', 'Loyalty Points', 'Reminder Service', 'Promo Ulang Tahun'].map((b) => (
                <span key={b} className="flex items-center gap-1.5 text-sm text-green-300 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full hover:scale-105 transition-transform">
                  <MdCheckCircle className="text-green-400 text-base" /> {b}
                </span>
              ))}
            </div>
            <Link to="/guest/dashboard"
              className="inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-2xl transition-all text-base hover:scale-105 hover:shadow-xl"
              style={{ background: 'linear-gradient(135deg, #22c55e, #10b981)', boxShadow: '0 0 30px rgba(34,197,94,0.3)' }}>
              Daftar Sekarang — Gratis!
              <MdArrowForward className="text-xl" />
            </Link>
          </div>
        </section>
      </FadeInUp>


      {/* CONTACT STRIP (telepon & WA) */}
      <FadeInUp delay={800}>
        <section className="py-10 px-4 sm:px-6" style={{ background: '#020f09', borderTop: '1px solid rgba(34,197,94,0.08)' }}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-white font-bold text-lg">Butuh bantuan atau informasi lebih lanjut?</p>
              <p className="text-gray-400 text-sm">Tim kami siap melayani Senin–Sabtu, 08.00–18.00 WIB</p>
            </div>
            <div className="flex items-center gap-3">
              <a href="tel:02155887799"
                className="flex items-center gap-2 border border-white/15 hover:border-green-500/40 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all hover:bg-green-500/10 hover:scale-105">
                <MdPhone className="text-green-400" /> (021) 5588-7799
              </a>
              <a href="https://wa.me/6281288990011" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 text-green-400 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all hover:scale-105">
                <MdWhatsapp className="text-lg" /> WhatsApp
              </a>
            </div>
          </div>
        </section>
      </FadeInUp>

      {/* ═══════════════════════════════════════════════════
          MAPS + CRM (LOKASI & JAM OPERASIONAL) - PALING BAWAH
      ═══════════════════════════════════════════════════ */}
      <FadeInUp delay={900}>
        <section className="py-20 px-4 sm:px-6" style={{ background: '#020f09' }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                <MdLocationOn className="text-lg" /> Kunjungi Kami
              </p>
              <h2 className="text-3xl font-extrabold text-white mb-3">Lokasi & Waktu Operasional</h2>
              <p className="text-gray-400 max-w-xl mx-auto">Temukan bengkel kami dengan mudah, tersedia peta interaktif dan jam layanan terbaru.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Kolom informasi CRM */}
              <div className="md:col-span-1 space-y-4">
                <div className="rounded-2xl p-5 border transition-all hover:-translate-y-1"
                  style={{ background: 'rgba(34,197,94,0.05)', borderColor: 'rgba(34,197,94,0.15)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-green-500/15">
                      <MdLocationOn className="text-green-400 text-xl" />
                    </div>
                    <h3 className="text-white font-bold">Alamat</h3>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Jl. Sudirman No. 88, Kelurahan Benteng Pasar Atas,<br />
                    Kecamatan Guguk Panjang, Bukittinggi, Sumatera Barat 26113
                  </p>
                  <a
                    href="https://maps.google.com/?q=Bukittinggi+Esther+Garage"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 mt-3 text-green-400 text-xs hover:gap-2 transition-all"
                  >
                    <MdNavigation size={14} /> Buka di Google Maps
                  </a>
                </div>

                <div className="rounded-2xl p-5 border transition-all hover:-translate-y-1"
                  style={{ background: 'rgba(34,197,94,0.05)', borderColor: 'rgba(34,197,94,0.15)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-green-500/15">
                      <MdAccessTime className="text-green-400 text-xl" />
                    </div>
                    <h3 className="text-white font-bold">Jam Operasional</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-400">Senin – Jumat</span><span className="text-white">08.00 – 18.00</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Sabtu</span><span className="text-white">08.00 – 16.00</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Minggu & Libur Nasional</span><span className="text-yellow-400">Tutup</span></div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-1 text-gray-500 text-xs">
                    <MdInfoOutline /> Layanan darurat? Hubungi WhatsApp
                  </div>
                </div>
              </div>

              {/* Peta interaktif */}
              <div className="md:col-span-2">
                <LocationMap />
                <div className="mt-3 text-center text-gray-500 text-xs flex items-center justify-center gap-1">
                  <MdGpsFixed className="text-green-400" /> Klik peta untuk memperbesar atau dapatkan rute langsung.
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeInUp>

      {/* Floating WhatsApp & Scroll to Top */}
      <FloatingButtons />

      {/* Global animations */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes particleFloat {
          from { transform: translateY(0px) translateX(0px); opacity: 0.08; }
          to   { transform: translateY(-25px) translateX(8px); opacity: 0.2; }
        }
        @keyframes heroEnter {
          0%   { opacity: 0; transform: translateX(-24px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .hero-enter { animation: heroEnter 1s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
        .animate-slide-up  { animation: slideUp 0.5s ease-out forwards; opacity: 0; }
        .animate-float-up  { animation: floatUp 0.6s ease-out forwards; opacity: 0; }
      `}</style>
    </div>
  )
}