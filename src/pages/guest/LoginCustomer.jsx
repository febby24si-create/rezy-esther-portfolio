import { useState } from 'react'
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdArrowBack } from 'react-icons/md'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { motion } from 'framer-motion'
import logo from '../../assets/logo2.png'

export default function LoginCustomer() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isLoggedIn } = useCustomerAuth()

  // Jika sudah login, arahkan ke member dashboard
  if (isLoggedIn) return <Navigate to="/member/dashboard" replace />
  const redirectTo = location.state?.from || '/member/dashboard'

  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [showPass, setShowPass] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e
    const x = (clientX - window.innerWidth / 2) / 60
    const y = (clientY - window.innerHeight / 2) / 60
    setMousePosition({ x, y })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await login(form.email, form.password)
    if (result.success) {
      navigate(redirectTo)
    } else {
      setError(result.message || 'Email atau password salah.')
    }
    setLoading(false)
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-garage-950 text-white font-body selection:bg-garage-400/30 selection:text-white px-4 py-8"
    >
      {/* ── BACKGROUND FULLSCREEN EXPERIENCE ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Dark overlay gradients for contrast & premium look */}
        <div className="absolute inset-0 bg-black/65 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020f09] via-transparent to-black/75 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020f09]/95 via-transparent to-[#020f09]/95 z-10" />

        {/* Subtle decorative grid lines overlay */}
        <div
          className="absolute inset-0 z-15 opacity-15"
          style={{
            backgroundImage:
              'linear-gradient(rgba(34,197,94,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.05) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />

        {/* Parallax + Fade-in + Blur-to-Focus Background Container */}
        <motion.div
          animate={{
            x: mousePosition.x,
            y: mousePosition.y,
          }}
          transition={{ type: "tween", ease: "easeOut", duration: 0.8 }}
          initial={{ filter: "blur(20px)", opacity: 0 }}
          animate={{ filter: "blur(0px)", opacity: 1 }}
          className="absolute inset-[-30px] w-[calc(100%+60px)] h-[calc(100%+60px)]"
        >
          {/* Ken Burns Zoom Loop */}
          <motion.div
            animate={{
              scale: [1, 1.06, 1],
            }}
            transition={{
              duration: 25,
              ease: "easeInOut",
              repeat: Infinity,
            }}
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1920&auto=format&fit=crop')`
            }}
          />
        </motion.div>
      </div>

      {/* ── CARD & CONTENT WRAPPER ── */}
      <div className="relative z-20 w-full max-w-md flex flex-col items-center">
        
        {/* Back to landing */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="self-start mb-6"
        >
          <Link to="/guest" className="inline-flex items-center gap-2 text-gray-400 hover:text-garage-300 text-sm transition-colors font-medium">
            <MdArrowBack size={18} /> Kembali ke Beranda
          </Link>
        </motion.div>

        {/* BRANDING HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-center mb-8 w-full"
        >
          <div className="inline-flex flex-col items-center gap-4 group">
            {/* LOGO CONTAINER */}
            <div
              className="
                w-20 h-20 rounded-2xl
                overflow-hidden
                border border-garage-400/20
                shadow-[0_0_30px_rgba(22,163,74,0.15)]
                relative transition-all duration-500
                group-hover:border-garage-400/50
                group-hover:shadow-[0_0_40px_rgba(22,163,74,0.3)]
              "
              style={{
                background: 'linear-gradient(135deg, #0B3B2E, #020f09)'
              }}
            >
              <img
                src={logo}
                alt="EstherGarage Logo"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>

            {/* TEXT BRANDING */}
            <div>
              <h1 className="text-3xl font-display font-extrabold tracking-[0.25em] text-white flex items-center justify-center">
                ESTHER
                <span className="text-garage-400 drop-shadow-[0_0_12px_rgba(34,197,94,0.4)] ml-2">
                  GARAGE
                </span>
              </h1>
              <p className="text-xs text-garage-300 font-display tracking-[0.2em] uppercase mt-2 opacity-80">
                Portal Booking & Loyalty Customer
              </p>
            </div>
          </div>
        </motion.div>

        {/* LOGIN CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full backdrop-blur-xl bg-garage-900/40 border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 relative overflow-hidden"
        >
          {/* Subtle top ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-garage-400/50 to-transparent" />

          <h2 className="text-2xl font-display font-extrabold text-white tracking-wide mb-1">Masuk Customer</h2>
          <p className="text-gray-400 text-sm mb-6">Akses loyalty, voucher, dan riwayat servis Anda</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-xl text-sm text-red-400 flex items-center gap-2 border border-red-500/25 bg-red-500/10"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative group">
                <MdEmail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-garage-400" size={18} />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="vip@esthergarage.id"
                  className="w-full pl-11 pr-4 py-3 bg-garage-950/60 border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-garage-400/50 focus:ring-1 focus:ring-garage-400/30"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative group">
                <MdLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-garage-400" size={18} />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-garage-950/60 border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-garage-400/50 focus:ring-1 focus:ring-garage-400/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPass ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01, boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)' }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-white relative transition-all duration-300 cursor-pointer bg-gradient-to-r from-garage-500 to-garage-400 border-none flex items-center justify-center shadow-[0_4px_15px_rgba(22,163,74,0.2)] mt-2 disabled:opacity-75"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Menghubungkan Portal...
                </span>
              ) : (
                'Masuk Portal Customer'
              )}
            </motion.button>
          </form>

          {/* Alternative Auth Navigation */}
          <p className="text-center text-xs sm:text-sm text-gray-400 mt-6">
            Belum punya akun customer?{' '}
            <Link to="/guest/register" className="text-garage-300 hover:text-garage-200 font-semibold transition-colors">
              Daftar Sekarang
            </Link>
          </p>

          {/* Demo Hint */}
          <div className="mt-5 p-4 rounded-2xl bg-garage-400/5 border border-garage-400/10 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-garage-300 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-garage-400 animate-pulse" />
              <span>Informasi Demo Customer</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-gray-500">Email</p>
                <p className="text-garage-300 font-mono">vip@esthergarage.id</p>
              </div>
              <div>
                <p className="text-gray-500">Password</p>
                <p className="text-garage-300 font-mono">vip123</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Admin Link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-gray-500 mt-6"
        >
          Anda admin bengkel?{' '}
          <Link to="/login" className="text-garage-300 hover:text-garage-200 transition-colors font-semibold">
            Masuk ke Dashboard Admin
          </Link>
        </motion.p>
      </div>
    </div>
  )
}