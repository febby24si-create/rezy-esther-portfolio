import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdArrowBack } from 'react-icons/md'
import { useCustomerAuth } from '../../context/CustomerAuthContext'

export default function LoginCustomer() {
  const navigate = useNavigate()
  const { login } = useCustomerAuth()

  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 600))
    const result = login(form.email, form.password)
    if (result.success) {
      navigate('/guest/dashboard')
    } else {
      setError(result.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#020f09' }}>
      <div className="w-full max-w-md">

        {/* Back to landing */}
        <Link to="/guest" className="inline-flex items-center gap-2 text-gray-400 hover:text-green-400 text-sm mb-8 transition-colors">
          <MdArrowBack size={18} /> Kembali ke Beranda
        </Link>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background: 'linear-gradient(160deg,#041C15,#06281F)', border: '1px solid rgba(34,197,94,0.15)' }}>

          {/* Logo + title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <span className="text-3xl">🔑</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Masuk ke Portal Customer</h1>
            <p className="text-gray-500 text-sm mt-1">Akses loyalty, voucher, dan riwayat servis Anda</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 rounded-xl text-sm text-red-400"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email</label>
              <div className="relative">
                <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email" required value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="email@gmail.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white outline-none transition-all"
                  style={{ background: 'rgba(11,59,46,0.4)', border: '1px solid rgba(34,197,94,0.15)' }}
                />
              </div>
            </div>

            {/* Password */}
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
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all mt-2"
              style={{ background: loading ? 'rgba(34,197,94,0.4)' : 'linear-gradient(135deg,#16A34A,#22C55E)' }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </span>
              ) : 'Masuk'}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm text-gray-500 mt-5">
            Belum punya akun?{' '}
            <Link to="/guest/register" className="text-green-400 hover:text-green-300 font-semibold transition-colors">
              Daftar Sekarang
            </Link>
          </p>

          {/* Demo hint */}
          <div className="mt-5 p-3 rounded-xl" style={{ background: 'rgba(11,59,46,0.3)', border: '1px solid rgba(34,197,94,0.08)' }}>
            <p className="text-xs text-gray-500 font-semibold mb-1">💡 Demo Customer Login:</p>
            <p className="text-xs text-gray-600">Email: <span className="text-green-400">budi@esthergarage.id</span></p>
            <p className="text-xs text-gray-600">Password: <span className="text-green-400">budi123</span></p>
          </div>
        </div>

        {/* Admin link */}
        <p className="text-center text-xs text-gray-600 mt-4">
          Anda admin bengkel?{' '}
          <Link to="/login" className="text-green-500 hover:text-green-400 transition-colors">
            Masuk ke Dashboard Admin
          </Link>
        </p>
      </div>
    </div>
  )
}