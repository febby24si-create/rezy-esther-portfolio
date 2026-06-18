import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { bengkelProfile, mechanics } from '../../data/guestData'
import {
  MdStar, MdVerified, MdBuild, MdArrowForward,
  MdWhatsapp, MdPeople, MdEmojiEvents, MdStars,
  MdSecurity, MdTimer, MdCheckCircle, MdLocationOn,
  MdCalendarToday, MdSchool, MdTrendingUp
} from 'react-icons/md'
import { getMechanicAvatar } from '../../utils/randomAvatar'

// ─── COMPONENT: Animated Counter ──────────────────────────────
function AnimatedCounter({ target, suffix = '', label, icon }) {
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

// ─── COMPONENT: Reveal on scroll ──────────────────────────────
function Reveal({ children, delay = 0 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
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

// ─── MAIN ──────────────────────────────────────────────────────
export default function TentangKami() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="pt-16 min-h-screen overflow-x-hidden" style={{ background: '#0F172A' }}>

      {/* ─── HERO BANNER ────────────────────────────────────────── */}
      <section className="relative h-[400px] md:h-[480px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1600&q=80&auto=format&fit=crop"
            alt="Esther Garage - Bengkel Modern"
            className="w-full h-full object-cover object-center"
            style={{ transform: `scale(1.05) translateY(${scrollY * 0.03}px)` }}
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
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
              <MdVerified className="text-sm" /> Tentang Kami
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              Bengkel Modern <br />
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Sejak 2015
              </span>
            </h1>
            <p className="text-gray-300 text-base mt-4 max-w-lg leading-relaxed">
              {bengkelProfile.description}
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <motion.a
                href="#layanan"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-blue-600/30 transition-all"
              >
                Layanan Kami <MdArrowForward />
              </motion.a>
              <motion.a
                href="#team"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 glass-dark hover:bg-white/10 text-white font-semibold px-6 py-3 rounded-xl border border-white/10 hover:border-blue-500/30 transition-all"
              >
                Tim Mekanik
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
              <AnimatedCounter target={bengkelProfile.stats.customers} suffix="+" label="Pelanggan" />
            </div>
            <div className="glass-card rounded-2xl p-5 text-center bg-[#1E293B]/40 border border-white/5 hover:border-blue-500/30 transition-all hover:-translate-y-1">
              <AnimatedCounter target={bengkelProfile.stats.mechanics} suffix="+" label="Mekanik" />
            </div>
            <div className="glass-card rounded-2xl p-5 text-center bg-[#1E293B]/40 border border-white/5 hover:border-blue-500/30 transition-all hover:-translate-y-1">
              <AnimatedCounter target={10} suffix=" Tahun" label="Pengalaman" />
            </div>
            <div className="glass-card rounded-2xl p-5 text-center bg-[#1E293B]/40 border border-white/5 hover:border-blue-500/30 transition-all hover:-translate-y-1">
              <AnimatedCounter target={bengkelProfile.stats.satisfaction} suffix="%" label="Kepuasan Pelanggan" />
            </div>
          </div>
        </div>
      </section>

      {/* ─── TENTANG KAMI ───────────────────────────────────────── */}
      <section className="py-20 px-6 sm:px-10 lg:px-16 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <Reveal>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-600/10">
                <img
                  src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&q=80&auto=format&fit=crop"
                  alt="Interior Bengkel Esther Garage"
                  className="w-full h-[400px] object-cover object-center"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent opacity-40" />
                <div className="absolute bottom-6 left-6 glass-dark rounded-xl px-5 py-3 flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-extrabold text-white">2015</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">Tahun Berdiri</div>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="text-center">
                    <div className="text-2xl font-extrabold text-white">12.500+</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider">Pelanggan</div>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="w-8 h-0.5 bg-blue-500 rounded-full" />
                <span className="text-blue-400 text-xs font-semibold tracking-widest uppercase">Tentang Kami</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
                Bengkel Modern & Terpercaya
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                {bengkelProfile.description}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <MdCheckCircle className="text-blue-400 text-lg mt-0.5" />
                  <div>
                    <h4 className="text-white font-bold text-sm">Mekanik Ahli</h4>
                    <p className="text-gray-500 text-xs">24+ mekanik bersertifikat</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MdCheckCircle className="text-blue-400 text-lg mt-0.5" />
                  <div>
                    <h4 className="text-white font-bold text-sm">Teknologi Modern</h4>
                    <p className="text-gray-500 text-xs">OBD2 & diagnostik digital</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MdCheckCircle className="text-blue-400 text-lg mt-0.5" />
                  <div>
                    <h4 className="text-white font-bold text-sm">Sparepart Original</h4>
                    <p className="text-gray-500 text-xs">Garansi keaslian</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MdCheckCircle className="text-blue-400 text-lg mt-0.5" />
                  <div>
                    <h4 className="text-white font-bold text-sm">Garansi Servis</h4>
                    <p className="text-gray-500 text-xs">6 bulan garansi pekerjaan</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── VISI MISI ──────────────────────────────────────────── */}
      <section className="py-20 px-6 sm:px-10 lg:px-16 bg-[#0F172A] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Reveal>
              <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">Visi & Misi</span>
              <h2 className="text-3xl font-extrabold text-white mt-2">Tujuan Kami</h2>
            </Reveal>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Reveal>
              <div className="glass-card rounded-2xl p-8 bg-[#1E293B]/40 border border-white/5 hover:border-blue-500/30 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <MdStars className="text-blue-400 text-2xl" />
                  </div>
                  <h3 className="text-white font-bold text-xl">Visi Kami</h3>
                </div>
                <p className="text-gray-300 leading-relaxed text-sm">{bengkelProfile.visi}</p>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="glass-card rounded-2xl p-8 bg-[#1E293B]/40 border border-white/5 hover:border-blue-500/30 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <MdBuild className="text-orange-400 text-2xl" />
                  </div>
                  <h3 className="text-white font-bold text-xl">Misi Kami</h3>
                </div>
                <ul className="space-y-3">
                  {bengkelProfile.misi.map((m, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                      <span className="text-blue-400 font-bold mt-0.5">✓</span>
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── TIMELINE / MILESTONE ───────────────────────────────── */}
      <section className="py-20 px-6 sm:px-10 lg:px-16 bg-[#0F172A] border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <Reveal>
              <span className="text-blue-400 text-sm font-semibold uppercase tracking-widest">Perjalanan</span>
              <h2 className="text-3xl font-extrabold text-white mt-2">Sejarah Esther Garage</h2>
              <p className="text-gray-400 text-sm max-w-md mx-auto mt-2">Setiap langkah adalah komitmen untuk pelayanan terbaik.</p>
            </Reveal>
          </div>

          <div className="relative">
            {/* Timeline vertical line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-orange-400 to-blue-500 opacity-30" />

            <div className="space-y-8">
              {bengkelProfile.milestones.map((m, i) => (
                <Reveal key={m.year} delay={i * 100}>
                  <div className={`relative flex flex-col md:flex-row ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-start gap-6`}>
                    {/* Timeline dot */}
                    <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-3 border-[#0F172A] shadow-[0_0_0_4px_rgba(37,99,235,0.25)] z-10"
                      style={{ background: i === bengkelProfile.milestones.length - 1 ? '#10b981' : '#2563eb' }}
                    />

                    <div className={`w-full md:w-[calc(50%-40px)] ${i % 2 === 0 ? 'md:pr-8' : 'md:pl-8'} pl-12 md:pl-0`}>
                      <div className="glass-card rounded-xl p-5 bg-[#1E293B]/40 border border-white/5 hover:border-blue-500/20 transition-all hover:-translate-y-1">
                        <div className={`font-extrabold text-xl ${i === bengkelProfile.milestones.length - 1 ? 'text-emerald-400' : 'text-blue-400'}`}>
                          {m.year}
                        </div>
                        <p className="text-white font-semibold text-sm mt-1">{m.event}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TIM MEKANIK ────────────────────────────────────────── */}
      <section id="team" className="py-20 px-6 sm:px-10 lg:px-16 bg-[#0F172A] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Reveal>
              <span className="text-blue-400 text-sm font-semibold uppercase tracking-widest">Tim Ahli</span>
              <h2 className="text-3xl font-extrabold text-white mt-2">Mekanik Profesional</h2>
              <p className="text-gray-400 text-sm max-w-md mx-auto mt-2">Mereka adalah garda terdepan kualitas servis kami.</p>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {mechanics.map((m, idx) => (
              <Reveal key={m.id} delay={idx * 100}>
                <div className="glass-card rounded-2xl overflow-hidden text-center bg-[#1E293B]/40 border border-white/5 hover:border-blue-500/30 transition-all hover:-translate-y-2 group">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={getMechanicAvatar(m.name, 300)}
                      alt={m.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.style.display = 'none'
                        const parent = e.target.parentElement
                        const fallback = document.createElement('div')
                        fallback.className = 'w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-blue-600/10'
                        fallback.innerHTML = `<span class="text-6xl font-bold text-blue-400">${m.name.split(' ').map(w => w[0]).slice(0, 2).join('')}</span>`
                        parent.appendChild(fallback)
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent opacity-40" />
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between">
                      <span className="text-[10px] bg-blue-600/30 text-blue-300 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                        {m.cert}
                      </span>
                      <span className="text-[10px] bg-emerald-600/30 text-emerald-300 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                        {m.exp}
                      </span>
                    </div>
                    {/* Rating badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                      <MdStar className="text-yellow-400 text-xs" />
                      <span className="text-white text-xs font-bold">{m.rating}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="text-white font-bold">{m.name}</h4>
                    <p className="text-blue-400 text-xs font-medium">{m.role}</p>
                    <p className="text-gray-500 text-xs mt-1">{m.specialty}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERTIFIKASI ────────────────────────────────────────── */}
      <section className="py-20 px-6 sm:px-10 lg:px-16 bg-[#0F172A] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Reveal>
              <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">Kredibilitas</span>
              <h2 className="text-3xl font-extrabold text-white mt-2">Sertifikasi & Penghargaan</h2>
              <p className="text-gray-400 text-sm max-w-md mx-auto mt-2">Standar kualitas yang kami pegang teguh.</p>
            </Reveal>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {bengkelProfile.certifications.map((c, idx) => (
              <Reveal key={c} delay={idx * 50}>
                <div className="flex items-center gap-3 px-6 py-4 rounded-xl border bg-[#1E293B]/40 border-white/5 hover:border-blue-500/30 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10">
                  <MdVerified className="text-blue-400 text-2xl" />
                  <span className="text-white font-semibold text-sm">{c}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MENGAPA MEMILIH KAMI ──────────────────────────────── */}
      <section className="py-20 px-6 sm:px-10 lg:px-16 bg-[#0F172A] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Reveal>
              <span className="text-blue-400 text-sm font-semibold uppercase tracking-widest">Keunggulan</span>
              <h2 className="text-3xl font-extrabold text-white mt-2">Mengapa Memilih Kami?</h2>
              <p className="text-gray-400 text-sm max-w-md mx-auto mt-2">Kami hadir dengan layanan terbaik untuk kendaraan Anda.</p>
            </Reveal>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: <MdSecurity className="text-2xl text-blue-400" />, title: 'Mekanik Bersertifikat', desc: 'Tersertifikasi TAM, AHM, dan Bosch.' },
              { icon: <MdVerified className="text-2xl text-orange-400" />, title: 'Garansi Servis', desc: 'Garansi 6 bulan untuk setiap pekerjaan.' },
              { icon: <MdStar className="text-2xl text-yellow-400" />, title: 'Sparepart Berkualitas', desc: 'Suku cadang original dan bergaransi.' },
              { icon: <MdCalendarToday className="text-2xl text-blue-400" />, title: 'Booking Online', desc: 'Pesan slot servis 24/7 tanpa antri.' },
              { icon: <MdBuild className="text-2xl text-purple-400" />, title: 'Diagnostik Modern', desc: 'Peralatan OBD2 dan scanner terkini.' },
              { icon: <MdWhatsapp className="text-2xl text-green-400" />, title: 'Dukungan WhatsApp', desc: 'CS siap membantu setiap hari.' },
            ].map((item, idx) => (
              <Reveal key={item.title} delay={idx * 100}>
                <div className="glass-card rounded-2xl p-6 text-center bg-[#1E293B]/40 border border-white/5 hover:border-blue-500/30 transition-all hover:-translate-y-2 group">
                  <div className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center bg-blue-500/10 group-hover:bg-blue-500/20 transition-all">
                    {item.icon}
                  </div>
                  <h3 className="text-white font-bold text-base">{item.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────────────── */}
      <section className="py-20 px-6 sm:px-10 lg:px-16 bg-[#0F172A] border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Reveal>
              <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">FAQ</span>
              <h2 className="text-3xl font-extrabold text-white mt-2">Pertanyaan Umum</h2>
            </Reveal>
          </div>

          <div className="space-y-3">
            <Reveal>
              <FaqItem
                question="Apa saja layanan yang tersedia di Esther Garage?"
                answer="Kami menyediakan berbagai layanan mulai dari servis berkala, tune up, ganti oli, spooring & balancing, service AC, service mesin, hingga service kelistrikan. Semua dikerjakan oleh mekanik bersertifikat."
              />
            </Reveal>
            <Reveal delay={100}>
              <FaqItem
                question="Apakah Esther Garage menerima semua merek kendaraan?"
                answer="Ya, kami melayani semua merek kendaraan mulai dari Toyota, Honda, Suzuki, Mitsubishi, hingga mobil Eropa seperti BMW, Mercedes, dan Audi."
              />
            </Reveal>
            <Reveal delay={200}>
              <FaqItem
                question="Berapa lama waktu pengerjaan servis?"
                answer="Waktu pengerjaan bervariasi tergantung jenis servis. Servis berkala biasanya 2-3 jam, tune up 3-4 jam, dan service besar bisa memakan waktu 1-3 hari."
              />
            </Reveal>
            <Reveal delay={300}>
              <FaqItem
                question="Apakah tersedia garansi setelah servis?"
                answer="Ya, setiap pekerjaan servis kami berikan garansi selama 6 bulan. Jika ada masalah terkait pekerjaan, kami akan perbaiki tanpa biaya tambahan."
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────── */}
      <section className="relative py-20 px-6 sm:px-10 lg:px-16 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&q=80&auto=format&fit=crop"
            alt="Siap Merawat Kendaraan"
            className="w-full h-full object-cover"
            loading="lazy"
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
            <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
              Siap Merawat <br />
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Kendaraan Anda?
              </span>
            </h2>
            <p className="text-gray-300 text-base max-w-lg mx-auto mb-8">
              Booking sekarang dan rasakan pengalaman servis modern dengan mekanik bersertifikat dan teknologi OBD2.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3.5">
              <a
                href="/member/booking"
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
      `}</style>
    </div>
  )
}