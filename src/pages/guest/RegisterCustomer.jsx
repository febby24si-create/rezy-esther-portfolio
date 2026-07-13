import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { MdPerson, MdEmail, MdLock, MdPhone, MdVisibility, MdVisibilityOff, MdArrowBack, MdCake } from 'react-icons/md'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { motion } from 'framer-motion'
import logo from '../../assets/logo2.png'
import VideoBackground from '../../components/VideoBackground'

export default function RegisterCustomer() {
  const navigate = useNavigate()
  const { register, isLoggedIn } = useCustomerAuth()

  // Hooks BEFORE early return — react-hooks/rules-of-hooks
  const [form, setForm] = useState({ name: '', email: '', phone: '', birthDate: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [showPass, setShowPass] = useState(false)

  if (isLoggedIn) return <Navigate to="/member/dashboard" replace />

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('Konfirmasi password tidak cocok.')
      return
    }
    if (form.password.length < 6) {
      setError('Password minimal 6 karakter.')
      return
    }
    setLoading(true)
    const result = await register({ name: form.name, email: form.email, phone: form.phone, birthDate: form.birthDate, password: form.password })
    if (result.success) {
      navigate('/member/dashboard')
    } else {
      setError(result.message || 'Pendaftaran gagal.')
    }
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-garage-950 text-white font-body selection:bg-garage-400/30 selection:text-white px-4 py-8"
    >
      {/* ── VIDEO BACKGROUND ── */}
      <VideoBackground
        poster="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1920&auto=format&fit=crop"
        className="z-0"
      />
      <div className="absolute inset-0 bg-black/40 z-[2]" />
      <div className="absolute inset-0 bg-gradient-to-t from-garage-950 via-transparent to-black/60 z-[2]" />
      <div className="absolute inset-0 bg-gradient-to-r from-garage-950/90 via-transparent to-garage-950/90 z-[2]" />
      <div
        className="absolute inset-0 z-[3] opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(6,182,212,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.04) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />

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
                background: 'linear-gradient(135deg, #061c3f, #04132c)'
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
                Portal Pendaftaran Customer
              </p>
            </div>
          </div>
        </motion.div>

        {/* REGISTER CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full backdrop-blur-xl bg-garage-900/40 border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 relative overflow-hidden"
        >
          {/* Subtle top ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-garage-400/50 to-transparent" />

          <h2 className="text-2xl font-display font-extrabold text-white tracking-wide mb-1">Daftar Member Gratis</h2>
          <p className="text-gray-400 text-sm mb-6">Dapatkan 50 poin + voucher welcome setelah mendaftar</p>

          {/* Benefit badges */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {['50 Poin Gratis', 'Voucher 15% Off', 'Booking Online', 'Tracking Real-time'].map(b => (
              <span key={b} className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-garage-400/10 border border-garage-400/20 text-garage-400">
                ✓ {b}
              </span>
            ))}
          </div>

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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
              <div className="relative group">
                <MdPerson className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-garage-400" size={18} />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Nama lengkap Anda"
                  className="w-full pl-11 pr-4 py-3 bg-garage-950/60 border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-garage-400/50 focus:ring-1 focus:ring-garage-400/30"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
              <div className="relative group">
                <MdEmail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-garage-400" size={18} />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={set('email')}
                  placeholder="email@gmail.com"
                  className="w-full pl-11 pr-4 py-3 bg-garage-950/60 border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-garage-400/50 focus:ring-1 focus:ring-garage-400/30"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Nomor HP</label>
              <div className="relative group">
                <MdPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-garage-400" size={18} />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full pl-11 pr-4 py-3 bg-garage-950/60 border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-garage-400/50 focus:ring-1 focus:ring-garage-400/30"
                />
              </div>
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Tanggal Lahir <span className="text-gray-500 font-normal lowercase">(opsional — untuk voucher ultah)</span>
              </label>
              <div className="relative group">
                <MdCake className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-garage-400" size={18} />
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={set('birthDate')}
                  className="w-full pl-11 pr-4 py-3 bg-garage-950/60 border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-garage-400/50 focus:ring-1 focus:ring-garage-400/30 color-scheme-dark"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative group">
                <MdLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-garage-400" size={18} />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Min. 6 karakter"
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

            {/* Konfirmasi Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Konfirmasi Password</label>
              <div className="relative group">
                <MdLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-garage-400" size={18} />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.confirm}
                  onChange={set('confirm')}
                  placeholder="Ulangi password"
                  className="w-full pl-11 pr-4 py-3 bg-garage-950/60 border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-garage-400/50 focus:ring-1 focus:ring-garage-400/30"
                />
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.01, boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)' }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-white relative transition-all duration-300 cursor-pointer bg-gradient-to-r from-garage-500 to-garage-400 border-none flex items-center justify-center mt-2 disabled:opacity-75"
              style={{ boxShadow: '0 4px 15px rgba(6,182,212,0.25)' }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mendaftar Member...
                </span>
              ) : (
                'Daftar Sekarang — Gratis!'
              )}
            </motion.button>
          </form>

          <p className="text-center text-xs sm:text-sm text-gray-400 mt-6">
            Sudah punya akun?{' '}
            <Link to="/guest/login" className="text-garage-300 hover:text-garage-200 font-semibold transition-colors">
              Masuk di sini
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}