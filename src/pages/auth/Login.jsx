import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'
import { authAPI } from '../../services/authAPI'
import { motion } from 'framer-motion'
import AlertBox from '../../components/AlertBox'

export default function Login() {
  const navigate = useNavigate()
  const { loginWithToken } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await authAPI.loginUser(form.email, form.password)

      if (result.length === 0) {
        setError('Email atau password salah.')
        return
      }

      const found = result[0]
      const userData = { name: found.name, email: found.email, role: found.role, id: found.id }

      loginWithToken('supabase_' + Date.now(), userData)
      navigate('/dashboard')
    } catch (err) {
      setError(`Terjadi kesalahan: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="backdrop-blur-xl bg-garage-900/40 border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 relative overflow-hidden">
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-garage-400/50 to-transparent" />

      <h2 className="text-2xl font-display font-extrabold text-white tracking-wide mb-1">Masuk ke Akun</h2>
      <p className="text-gray-400 text-sm mb-6">Selamat datang kembali di portal manajemen</p>

      {error && (
        <AlertBox type="error">{error}</AlertBox>
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
              placeholder="admin@esthergarage.id"
              disabled={loading}
              className="w-full pl-11 pr-4 py-3 bg-garage-950/60 border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-garage-400/50 focus:ring-1 focus:ring-garage-400/30 disabled:opacity-60"
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
              disabled={loading}
              className="w-full pl-11 pr-11 py-3 bg-garage-950/60 border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-garage-400/50 focus:ring-1 focus:ring-garage-400/30 disabled:opacity-60"
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

        {/* Forgot Password */}
        <div className="flex justify-end text-xs sm:text-sm">
          <Link to="/forgot" className="text-garage-300 hover:text-garage-200 transition-colors font-medium">
            Lupa Password?
          </Link>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.01, boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)' }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl text-sm font-semibold text-white relative transition-all duration-300 cursor-pointer bg-gradient-to-r from-garage-500 to-garage-400 border-none flex items-center justify-center shadow-[0_4px_15px_rgba(22,163,74,0.2)] disabled:opacity-75"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Menghubungkan ke Supabase...
            </span>
          ) : (
            'Masuk ke Dashboard'
          )}
        </motion.button>
      </form>

      {/* Navigate to Register */}
      <p className="text-center text-xs sm:text-sm text-gray-400 mt-6">
        Belum punya akun?{' '}
        <Link to="/register" className="text-garage-300 hover:text-garage-200 font-semibold transition-colors">
          Daftar Sekarang
        </Link>
      </p>
    </div>
  )
}
