import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Small delay for UX
    await new Promise(r => setTimeout(r, 600))

    const result = login(form.email, form.password)
    if (result.success) {
      navigate('/')
    } else {
      setError(result.message || 'Email atau password salah.')
    }
    setLoading(false)
  }

  return (
    <div className="glass-card neon-border p-8 animate-fade-in">
      <h2 className="text-2xl font-display font-bold text-white mb-1">Masuk ke Akun</h2>
      <p className="text-gray-500 text-sm mb-6">Selamat datang kembali di EstherGarage</p>

      {error && (
        <div className="mb-4 p-3 rounded-xl text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Email</label>
          <div className="relative">
            <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="email" required value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="admin@esthergarage.id"
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
              style={{ background: 'rgba(11,59,46,0.4)', border: '1px solid rgba(34,197,94,0.15)' }}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Password</label>
          <div className="relative">
            <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type={showPass ? 'text' : 'password'} required value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-3 rounded-xl text-sm text-white outline-none transition-all"
              style={{ background: 'rgba(11,59,46,0.4)', border: '1px solid rgba(34,197,94,0.15)' }}
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              {showPass ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
            <input type="checkbox" className="rounded" /> Ingat saya
          </label>
          <Link to="/forgot" className="text-green-400 hover:text-green-300 transition-colors">Lupa Password?</Link>
        </div>

        <button
          type="submit" disabled={loading}
          className="btn-primary w-full py-3 rounded-xl text-sm font-semibold relative"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Memproses...
            </span>
          ) : 'Masuk'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-5">
        Belum punya akun? <Link to="/register" className="text-green-400 hover:text-green-300 font-semibold transition-colors">Daftar Sekarang</Link>
      </p>

      {/* Credential hint */}
      <div className="mt-4 p-3 rounded-xl space-y-1" style={{ background: 'rgba(11,59,46,0.3)', border: '1px solid rgba(34,197,94,0.08)' }}>
        <p className="text-xs text-gray-500 font-semibold">💡 Demo Login:</p>
        <p className="text-xs text-gray-600">
          Email: <span className="text-green-400">admin@esthergarage.id</span>
        </p>
        <p className="text-xs text-gray-600">
          Password: <span className="text-green-400">admin123</span>
        </p>
      </div>
    </div>
  )
}