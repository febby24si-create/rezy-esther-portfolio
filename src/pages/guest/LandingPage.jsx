import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  MdArrowForward, MdStar, MdVerified, MdSupportAgent,
  MdCalendarMonth, MdGpsFixed, MdStars, MdCardGiftcard,
  MdWhatsapp, MdPhone, MdCheckCircle
} from 'react-icons/md'
import { bengkelProfile, layanan, promos, testimonials, customerJourney } from '../../data/guestData'
import ServiceCard from '../../components/guest/ServiceCard'
import PromoCard from '../../components/guest/PromoCard'

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

const features = [
  { icon: MdCalendarMonth, title: 'Booking Online 24/7', desc: 'Pesan slot servis kapan saja, tanpa antri di bengkel.', color: 'green' },
  { icon: MdGpsFixed, title: 'Tracking Real-Time', desc: 'Pantau progress kendaraan Anda langsung dari smartphone.', color: 'blue' },
  { icon: MdStars, title: 'Loyalty Points', desc: 'Kumpulkan poin setiap servis dan tukarkan dengan reward.', color: 'yellow' },
  { icon: MdCardGiftcard, title: 'Voucher & Promo', desc: 'Diskon eksklusif member, voucher ulang tahun, dan promo rutin.', color: 'purple' },
  { icon: MdVerified, title: 'Mekanik Bersertifikat', desc: 'Seluruh mekanik tersertifikasi TAM, AHM, dan Bosch.', color: 'green' },
  { icon: MdSupportAgent, title: 'Support WhatsApp', desc: 'Tim CS siap membantu via WhatsApp setiap hari kerja.', color: 'blue' },
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
          HERO — Full cinematic with real car photo
      ═══════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">

        {/* ── Background: car photo full bleed ── */}
        <div className="absolute inset-0">
          <img
            src="/mobil.png"
            alt="Esther Garage"
            className="w-full h-full object-cover object-center"
            style={{ transform: `scale(1.08) translateY(${scrollY * 0.03}px)`, transition: 'transform 0.1s linear' }}
          />
          {/* Layered overlays for text readability */}
          {/* Dark vignette overall */}
          <div className="absolute inset-0" style={{ background: 'rgba(2,10,6,0.55)' }} />
          {/* Strong gradient: left side (text area) dark, right fades lighter */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(2,10,6,0.92) 0%, rgba(2,10,6,0.75) 40%, rgba(2,10,6,0.2) 75%, rgba(2,10,6,0.1) 100%)' }} />
          {/* Bottom fade to site bg */}
          <div className="absolute bottom-0 left-0 right-0 h-48" style={{ background: 'linear-gradient(to bottom, transparent, #020f09)' }} />
          {/* Top fade */}
          <div className="absolute top-0 left-0 right-0 h-32" style={{ background: 'linear-gradient(to bottom, rgba(2,10,6,0.6), transparent)' }} />
          {/* Green tint accent on right */}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 75% 60%, rgba(34,197,94,0.08) 0%, transparent 55%)' }} />
        </div>

        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.018]"
          style={{ backgroundImage: 'linear-gradient(rgba(34,197,94,1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,1) 1px, transparent 1px)', backgroundSize: '70px 70px' }} />

        <Particles />

        {/* ── Hero content (left-aligned for cinematic feel) ── */}
        <div className="relative z-10 flex flex-col justify-center min-h-screen pt-20 pb-10 px-6 sm:px-10 lg:px-20 max-w-7xl mx-auto w-full">
          <div className="max-w-xl hero-enter">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-6 rounded-full px-4 py-1.5 border border-green-500/30 bg-green-500/10 backdrop-blur-sm">
              <MdVerified className="text-green-400 text-sm" />
              <span className="text-green-400 text-xs font-semibold tracking-wider">BENGKEL TERPERCAYA BUKITTINGGI #1</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] mb-6 tracking-tight">
              Servis<br />
              Kendaraan<br />
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-green-500">
                  Lebih Mudah
                </span>
                {/* underline glow */}
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: 'linear-gradient(90deg, #22c55e, #10b981)', boxShadow: '0 0 12px rgba(34,197,94,0.6)' }} />
              </span>
            </h1>

            <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-10 max-w-md">
              Booking online, tracking real-time, loyalty points, dan reminder otomatis.
              <span className="text-green-400 font-semibold"> Esther Garage CRM</span> — bengkel modern untuk Anda.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-12">
              <Link to="/guest/booking"
                className="inline-flex items-center justify-center gap-2 text-white font-bold px-7 py-4 rounded-2xl transition-all text-sm hover:scale-105 active:scale-95"
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

            {/* Floating badges for diagnostic feel */}
            <div className="flex flex-wrap gap-2">
              {[
                { dot: 'bg-green-400', label: 'ENGINE OK', color: 'border-green-500/25 text-green-400' },
                { dot: 'bg-blue-400', label: 'OBD2 LINKED', color: 'border-blue-500/25 text-blue-400' },
                { dot: 'bg-yellow-400', label: 'BOSCH CERTIFIED', color: 'border-yellow-500/25 text-yellow-400' },
              ].map(b => (
                <div key={b.label} className={`inline-flex items-center gap-1.5 border rounded-lg px-2.5 py-1 backdrop-blur-sm bg-black/40 ${b.color}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${b.dot} animate-pulse`} />
                  <span className="text-xs font-mono font-semibold">{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Stats strip — bottom of hero ── */}
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
                <div key={label} className="rounded-xl p-3 text-center backdrop-blur-sm"
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

      {/* ═══════════════════════════════════════════════════
          PROMO
      ═══════════════════════════════════════════════════ */}
      <FadeInUp delay={100}>
        <section className="py-20 px-4 sm:px-6" style={{ background: 'linear-gradient(180deg, #020f09 0%, #041C15 100%)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-2">🔥 Promo Terbatas</p>
                <h2 className="text-3xl font-extrabold text-white">Penawaran Spesial Minggu Ini</h2>
              </div>
              <Link to="/guest/promo" className="hidden sm:flex items-center gap-1 text-green-400 hover:text-green-300 text-sm font-semibold transition-colors">
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

      {/* ═══════════════════════════════════════════════════
          LAYANAN
      ═══════════════════════════════════════════════════ */}
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
              <Link to="/guest/layanan" className="inline-flex items-center gap-2 border border-green-500/30 hover:border-green-500/60 text-green-400 font-semibold px-6 py-3 rounded-xl transition-all hover:bg-green-500/10 hover:scale-105">
                Lihat Semua Layanan <MdArrowForward />
              </Link>
            </div>
          </div>
        </section>
      </FadeInUp>

      {/* ═══════════════════════════════════════════════════
          KEUNGGULAN
      ═══════════════════════════════════════════════════ */}
      <FadeInUp delay={300}>
        <section className="py-20 px-4 sm:px-6" style={{ background: 'linear-gradient(180deg, #041C15 0%, #020f09 100%)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-2">Kenapa Esther Garage?</p>
              <h2 className="text-3xl font-extrabold text-white mb-3">Bengkel Modern yang Berbeda</h2>
            </div>
            <StaggerContainer>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {features.map(({ icon: Icon, title, desc, color }, i) => (
                  <div key={title} style={{ animationDelay: `${i * 80}ms`, background: 'rgba(34,197,94,0.03)', borderColor: 'rgba(34,197,94,0.08)' }}
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
                ))}
              </div>
            </StaggerContainer>
          </div>
        </section>
      </FadeInUp>

      {/* ═══════════════════════════════════════════════════
          CUSTOMER JOURNEY
      ═══════════════════════════════════════════════════ */}
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

      {/* ═══════════════════════════════════════════════════
          TESTIMONI
      ═══════════════════════════════════════════════════ */}
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
                  <MdStar key={i} className="text-yellow-400 text-lg" />
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
                  className={`rounded-full transition-all duration-300 ${i === activeTestimonial ? 'w-6 h-2 bg-green-400' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`} />
              ))}
            </div>
          </div>
        </section>
      </FadeInUp>

      {/* ═══════════════════════════════════════════════════
          CTA VOUCHER — with car image accent
      ═══════════════════════════════════════════════════ */}
      <FadeInUp delay={600}>
        <section className="relative py-24 px-4 sm:px-6 overflow-hidden">
          {/* Car image faded on right */}
          <div className="absolute inset-0">
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #041C15 0%, #06281F 50%, #041C15 100%)' }} />
            <img src="/mobil.png" alt="" className="absolute right-0 top-0 h-full w-1/2 object-cover object-left opacity-10"
              style={{ maskImage: 'linear-gradient(to right, transparent, rgba(0,0,0,0.8))', WebkitMaskImage: 'linear-gradient(to right, transparent, rgba(0,0,0,0.8))' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, #041C15 30%, transparent 80%, #041C15 100%)' }} />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <div className="text-6xl mb-5">🎁</div>
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
              className="inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-2xl transition-all text-base hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #22c55e, #10b981)', boxShadow: '0 0 30px rgba(34,197,94,0.3)' }}>
              Daftar Sekarang — Gratis!
              <MdArrowForward className="text-xl" />
            </Link>
          </div>
        </section>
      </FadeInUp>

      {/* ═══════════════════════════════════════════════════
          CONTACT STRIP
      ═══════════════════════════════════════════════════ */}
      <FadeInUp delay={700}>
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

      {/* ── Global animations ── */}
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