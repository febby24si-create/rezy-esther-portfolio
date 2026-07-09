import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import logo from '../assets/logo2.png'
import VideoBackground from '../components/VideoBackground'

const routeConfigs = {
  '/login': {
    glowColor: 'rgba(34,197,94,0.3)', // Emerald green
    accentText: 'text-garage-400',
    titleGlow: 'drop-shadow-[0_0_12px_rgba(34,197,94,0.4)]',
    tagline: 'Sistem Manajemen Bengkel Modern'
  },
  '/register': {
    glowColor: 'rgba(6,182,212,0.35)', // Cyan/Electric Blue
    accentText: 'text-cyan-400',
    titleGlow: 'drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]',
    tagline: 'Mulai Pengalaman Premium Anda'
  },
  '/forgot': {
    glowColor: 'rgba(245,158,11,0.35)', // Gold/Amber
    accentText: 'text-amber-400',
    titleGlow: 'drop-shadow-[0_0_12px_rgba(245,158,11,0.4)]',
    tagline: 'Pemulihan Kredensial Keamanan'
  }
}

export default function AuthLayout() {
  const location = useLocation()
  const currentPath = location.pathname
  const config = routeConfigs[currentPath] || routeConfigs['/login']

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-garage-950 text-white font-body selection:bg-garage-400/30 selection:text-white"
    >
      {/* ── VIDEO BACKGROUND ── */}
      <VideoBackground
        poster="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1920&auto=format&fit=crop"
        className="z-0"
      />

      {/* Dark overlay for additional contrast */}
      <div className="absolute inset-0 bg-black/40 z-[2]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#020f09] via-transparent to-black/60 z-[2]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#020f09]/90 via-transparent to-[#020f09]/90 z-[2]" />

      {/* Subtle decorative grid lines overlay */}
      <div
        className="absolute inset-0 z-[3] opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(34,197,94,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.04) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />

      {/* ── CARD & CONTENT WRAPPER ── */}
      <div className="relative z-20 w-full max-w-md px-6 py-12 flex flex-col items-center">

        {/* BRANDING HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-8 w-full"
        >
          <Link to="/" className="inline-flex flex-col items-center gap-4 group">
            {/* LOGO CONTAINER */}
            <div
              className="
                w-20 h-20 rounded-2xl
                overflow-hidden
                border
                relative transition-all duration-500
                group-hover:scale-105
              "
              style={{
                background: 'linear-gradient(135deg, #0B3B2E, #020f09)',
                borderColor: config.glowColor.replace('0.35', '0.2').replace('0.3', '0.2'),
                boxShadow: `0 0 30px ${config.glowColor}`
              }}
            >
              <img
                src={logo}
                alt="EstherGarage Logo"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Subtle light sheen effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>

            {/* TEXT BRANDING */}
            <div>
              <h1 className="text-3xl font-display font-extrabold tracking-[0.25em] text-white flex items-center justify-center">
                ESTHER
                <span className={`${config.accentText} ${config.titleGlow} ml-2 transition-all duration-500`}>
                  GARAGE
                </span>
              </h1>
              <p className="text-xs text-gray-400 font-display tracking-[0.2em] uppercase mt-2 opacity-80 transition-colors duration-500">
                {config.tagline}
              </p>
            </div>
          </Link>
        </motion.div>

        {/* RENDER ACTIVE FORM (Login / Register / Forgot) */}
        <motion.div
          key={currentPath}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <Outlet />
        </motion.div>

      </div>
    </div>
  )
}