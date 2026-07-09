import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  MdVerified,
  MdBuild,
  MdStar,
  MdArrowForward,
  MdDirectionsCar,
  MdCheckCircle,
} from 'react-icons/md'
import VideoBackground from '../VideoBackground'

// ─────────────────────────────────────────────
// Typewriter Text (auto-cycle animation)
// ─────────────────────────────────────────────
const TypewriterText = ({ texts, delay = 3000 }) => {
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout;
    const currentText = texts[index];
    
    if (!isDeleting) {
      if (displayText.length < currentText.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentText.slice(0, displayText.length + 1));
        }, 50);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, delay);
      }
    } else {
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(currentText.slice(0, displayText.length - 1));
        }, 30);
      } else {
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % texts.length);
      }
    }
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, index, texts, delay]);

  return (
    <span className="inline-block">
      {displayText}
      <span className="animate-blink-cursor">|</span>
    </span>
  );
};

// ─────────────────────────────────────────────
// Animated Counter
// ─────────────────────────────────────────────
const AnimatedCounter = ({ target, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const [triggered, setTriggered] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!triggered) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration, triggered])

  return (
    <span ref={ref}>
      {count.toLocaleString('id-ID')}{suffix}
    </span>
  )
}

// ─────────────────────────────────────────────
// Floating Glass Card
// ─────────────────────────────────────────────
const FloatingCard = ({ icon, value, label, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 24, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{
      delay,
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
    }}
    className={`glass-card rounded-xl p-3 md:p-4 flex items-center gap-3 ${className}`}
    style={{
      background: 'rgba(2, 15, 9, 0.7)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(37, 99, 235, 0.15)',
    }}
  >
    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-blue-500/15">
      {icon}
    </div>
    <div>
      <div className="text-white font-bold text-sm md:text-base leading-tight">{value}</div>
      <div className="text-gray-400 text-[11px] md:text-xs leading-tight mt-0.5">{label}</div>
    </div>
  </motion.div>
)

// ─────────────────────────────────────────────
// Premium Scroll Indicator
// ─────────────────────────────────────────────
const ScrollIndicator = () => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY < 100)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
    >
      <motion.span
        className="text-[10px] tracking-[0.25em] uppercase text-gray-500 font-medium"
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        Scroll
      </motion.span>
      <div className="relative w-5 h-8 rounded-full border border-white/15 flex items-start justify-center p-1.5">
        <motion.div
          className="w-1 h-2 rounded-full bg-brand"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────
// Star Rating Display
// ─────────────────────────────────────────────
const StarRating = ({ rating = 4.9, total = 5, size = 'sm' }) => {
  const sizeClass = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'
  return (
    <div className="flex items-center gap-1">
      {[...Array(total)].map((_, i) => (
        <svg
          key={i}
          className={`${sizeClass} ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-yellow-400/30'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
// Main HeroSection Export
// ─────────────────────────────────────────────
export default function HeroSection({ poster, stats, navigate }) {
  const { scrollYProgress } = useScroll()
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.98])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0.3])
  const contentY = useTransform(scrollYProgress, [0, 0.15], [0, -40])
  const [scrollY, setScrollY] = useState(0)

  // Throttled scroll handler for parallax — rAF avoids re-render storm
  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ── Floating card positions (responsive) ──
  const [cardPositions, setCardPositions] = useState({
    mechanics: { top: '18%', right: '5%' },
    services: { top: '48%', right: '3%' },
    rating: { top: '72%', right: '7%' },
  })

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCardPositions({
          mechanics: { top: '15%', left: '5%' },
          services: { top: '40%', right: '3%' },
          rating: { bottom: '22%', left: '5%' },
        })
      } else if (window.innerWidth < 1280) {
        setCardPositions({
          mechanics: { top: '15%', right: '3%' },
          services: { top: '45%', right: '1%' },
          rating: { top: '70%', right: '5%' },
        })
      } else {
        setCardPositions({
          mechanics: { top: '18%', right: '5%' },
          services: { top: '48%', right: '3%' },
          rating: { top: '72%', right: '7%' },
        })
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // ── Parallax mouse effect on cards ──
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const handleMouse = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 12
      const y = (e.clientY / window.innerHeight - 0.5) * 12
      setMousePos({ x, y })
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  return (
    <motion.section
      id="home"
      style={{ scale: heroScale }}
      className="relative min-h-screen flex flex-col overflow-hidden"
    >
      {/* ── Video / Image Background ── */}
      <div className="absolute inset-0" style={{ transform: `translateY(${scrollY * 0.04}px)` }}>
        <VideoBackground poster={poster} />
      </div>

      {/* ── Floating Glass Cards ── */}
      <div className="absolute inset-0 z-10 pointer-events-none hidden lg:block">
        <motion.div
          style={{
            position: 'absolute',
            ...cardPositions.mechanics,
            x: mousePos.x * 0.6,
            y: mousePos.y * 0.6,
          }}
        >
          <FloatingCard
            icon={<MdVerified className="text-blue-400 text-lg" />}
            value="10+ Mekanik"
            label="Bersertifikat & Berpengalaman"
            delay={0.6}
          />
        </motion.div>

        <motion.div
          style={{
            position: 'absolute',
            ...cardPositions.services,
            x: mousePos.x * 0.3,
            y: mousePos.y * 0.3,
          }}
        >
          <FloatingCard
            icon={<MdBuild className="text-emerald-400 text-lg" />}
            value="5.000+ Servis"
            label="Telah Diselesaikan"
            delay={0.9}
          />
        </motion.div>

        <motion.div
          style={{
            position: 'absolute',
            ...cardPositions.rating,
            x: mousePos.x * 0.5,
            y: mousePos.y * 0.5,
          }}
        >
          <FloatingCard
            icon={<MdStar className="text-yellow-400 text-lg" />}
            value={
              <span className="flex items-center gap-1.5">
                4.9
                <StarRating rating={4.9} size="sm" />
              </span>
            }
            label="Rating Kepuasan Pelanggan"
            delay={1.2}
          />
        </motion.div>
      </div>

      {/* ── Mobile floating cards (simpler, at bottom) ── */}
      <div className="lg:hidden absolute bottom-32 left-0 right-0 z-10 px-6 space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          <FloatingCard
            icon={<MdVerified className="text-blue-400 text-lg" />}
            value="10+ Mekanik"
            label="Bersertifikat"
            delay={0.6}
            className="!w-auto shrink-0"
          />
          <FloatingCard
            icon={<MdBuild className="text-emerald-400 text-lg" />}
            value="5.000+ Servis"
            label="Terselesaikan"
            delay={0.8}
            className="!w-auto shrink-0"
          />
          <FloatingCard
            icon={<MdStar className="text-yellow-400 text-lg" />}
            value="4.9 Rating"
            label="Kepuasan"
            delay={1.0}
            className="!w-auto shrink-0"
          />
        </div>
      </div>

      {/* ── Main Content ── */}
      <motion.div
        style={{ y: contentY, opacity: heroOpacity }}
        className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 flex flex-col flex-1 pt-[12vh] md:pt-[15vh] lg:pt-[18vh] pb-6"
      >
        <div className="max-w-2xl">
          {/* Premium badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2.5 mb-6 px-4 py-1.5 rounded-full border-brand backdrop-blur-md"
            style={{
              background: 'rgba(37, 99, 235, 0.08)',
              border: '1px solid rgba(37, 99, 235, 0.25)',
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
            </span>
            <span className="text-blue-300 text-xs font-semibold tracking-widest uppercase">
              Bengkel Modern & Terpercaya — Bukittinggi
            </span>
          </motion.div>

          {/* Premium Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-[1.04] tracking-tight mb-5"
          >
            <span className="text-white">Bengkel</span>
            <br />
            <span className="gradient-text-brand animate-gradient-x bg-[length:200%]">
              Modern
            </span>
            <span className="text-white"> untuk</span>
            <br />
            <span className="text-white">Kendaraan</span>
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent animate-gradient-x bg-[length:200%] animation-delay-1000">
              {' '}
              Premium
            </span>
          </motion.h1>

          {/* Description — Auto-type animation */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-lg mb-8"
          >
            <TypewriterText texts={[
              'Servis berkala, perbaikan mesin, dan perawatan body dengan teknologi OBD2.',
              'Mekanik tersertifikasi siap membantu kendaraan Anda.',
              'Sistem booking online 24/7 untuk kenyamanan Anda.'
            ]} />
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row gap-3.5 mb-10"
          >
            <button
              onClick={() => navigate('/member/booking')}
              className="gradient-bg-brand text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg glow-brand hover:glow-brand hover:scale-[1.02] active:scale-95 text-sm group inline-flex items-center justify-center gap-2.5"
            >
              <MdDirectionsCar className="text-lg group-hover:rotate-[-8deg] transition-transform duration-300" />
              Booking Service
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('layanan')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}
              className="glass-dark hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 text-sm border border-white/10 hover:border-brand hover:scale-[1.02] group inline-flex items-center justify-center gap-2.5"
            >
              <MdArrowForward className="text-brand group-hover:translate-x-1 transition-transform" />
              Jelajahi Layanan
            </button>
          </motion.div>

          {/* Trust Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center gap-4 sm:gap-6"
          >
            {/* Avatars */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {[1, 5, 8].map((id) => (
                  <img
                    key={id}
                    src={`https://i.pravatar.cc/150?img=${id}`}
                    alt="customer"
                    className="w-8 h-8 rounded-full border-2 border-garage-950 object-cover"
                    loading="lazy"
                  />
                ))}
                <span className="w-8 h-8 rounded-full border-2 border-garage-950 bg-blue-600/20 flex items-center justify-center text-[10px] font-bold text-blue-300">
                  +{stats?.pelanggan > 100 ? Math.floor(stats.pelanggan / 100) * 100 : stats?.pelanggan || 500}
                </span>
              </div>
              <span className="text-gray-400 text-xs font-medium">
                <AnimatedCounter target={stats?.pelanggan || 5000} suffix="+" /> Pelanggan Puas
              </span>
            </div>

            <div className="w-px h-6 bg-white/10 hidden sm:block" />

            {/* Rating */}
            <div className="flex items-center gap-2">
              <StarRating rating={4.9} />
              <span className="text-gray-400 text-xs font-medium">4.9 / 5.0</span>
            </div>

            <div className="w-px h-6 bg-white/10 hidden sm:block" />

            {/* Garansi */}
            <div className="flex items-center gap-2">
              <MdCheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-gray-400 text-xs font-medium">Garansi 6 bulan</span>
            </div>

            {/* Experience */}
            <div className="flex items-center gap-2">
              <MdVerified className="w-4 h-4 text-brand" />
              <span className="text-gray-400 text-xs font-medium">
                <AnimatedCounter target={stats?.tahun || 8} suffix="+" /> Tahun Pengalaman
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ── Scroll Indicator ── */}
      <ScrollIndicator />
    </motion.section>
  )
}
