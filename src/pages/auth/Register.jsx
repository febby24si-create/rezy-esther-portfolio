import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MdPerson, MdEmail, MdLock, MdAdminPanelSettings } from 'react-icons/md'
import { authAPI } from '../../services/authAPI'
import { motion } from 'framer-motion'
import AlertBox from '../../components/AlertBox'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await authAPI.registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      })

      setSuccess('Registrasi berhasil! Silakan login.')
      setForm({ name: '', email: '', password: '', role: 'user' })

      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(`Registrasi gagal: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="backdrop-blur-xl bg-garage-900/40 border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 relative overflow-hidden">
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

      <h2 className="text-2xl font-display font-extrabold text-white tracking-wide mb-1">Buat Akun Baru</h2>
      <p className="text-gray-400 text-sm mb-6">Bergabung dengan ekosistem EstherGarage</p>

      {error && <AlertBox type="error">{error}</AlertBox>}
      {success && <AlertBox type="success">{success}</AlertBox>}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nama Lengkap */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Nama Lengkap</label>
          <div className="relative group">
            <MdPerson className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-cyan-400" size={18} />
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Nama Anda"
              disabled={loading}
              className="w-full pl-11 pr-4 py-3 bg-garage-950/60 border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 disabled:opacity-60"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email</label>
          <div className="relative group">
            <MdEmail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-cyan-400" size={18} />
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="email@contoh.com"
              disabled={loading}
              className="w-full pl-11 pr-4 py-3 bg-garage-950/60 border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 disabled:opacity-60"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
          <div className="relative group">
            <MdLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-cyan-400" size={18} />
            <input
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 6 karakter"
              disabled={loading}
              className="w-full pl-11 pr-4 py-3 bg-garage-950/60 border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 disabled:opacity-60"
            />
          </div>
        </div>

        {/* Role */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Role</label>
          <div className="relative group">
            <MdAdminPanelSettings className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-cyan-400" size={18} />
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              disabled={loading}
              className="w-full pl-11 pr-4 py-3 bg-garage-950/60 border border-white/5 rounded-xl text-sm text-white outline-none transition-all focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 disabled:opacity-60 appearance-none"
            >
              <option value="user" className="bg-garage-900">User</option>
              <option value="admin" className="bg-garage-900">Admin</option>
              <option value="mekanik" className="bg-garage-900">Mekanik</option>
            </select>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01, boxShadow: '0 0 20px rgba(6, 182, 212, 0.45)' }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl text-sm font-semibold text-white relative transition-all duration-300 cursor-pointer bg-gradient-to-r from-cyan-600 to-cyan-400 border-none flex items-center justify-center shadow-[0_4px_15px_rgba(6,182,212,0.25)] mt-2 disabled:opacity-75"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Menyimpan ke Supabase...
            </span>
          ) : (
            'Daftar Sekarang'
          )}
        </motion.button>
      </form>

      <p className="text-center text-xs sm:text-sm text-gray-400 mt-6">
        Sudah punya akun?{' '}
        <Link to="/login" className="text-cyan-300 hover:text-cyan-200 font-semibold transition-colors">
          Masuk
        </Link>
      </p>
    </div>
  )
}
