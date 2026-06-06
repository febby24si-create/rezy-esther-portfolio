import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MdPerson, MdEmail, MdLock, MdPhone, MdVisibility, MdVisibilityOff, MdArrowBack, MdCake } from 'react-icons/md'
import { useCustomerAuth } from '../../context/CustomerAuthContext'

const inputStyle = {
  background: 'rgba(11,59,46,0.4)',
  border: '1px solid rgba(34,197,94,0.15)',
}
const inputCls = 'w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white outline-none transition-all focus:border-green-500/40'

export default function RegisterCustomer() {
  const navigate = useNavigate()
  const { register } = useCustomerAuth()

  const [form, setForm] = useState({ name: '', email: '', phone: '', birthDate: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [showPass, setShowPass] = useState(false)

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
    await new Promise(r => setTimeout(r, 700))
    const result = register({ name: form.name, email: form.email, phone: form.phone, birthDate: form.birthDate, password: form.password })
    if (result.success) {
      navigate('/guest/dashboard')
    } else {
      setError(result.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: '#020f09' }}>
      <div className="w-full max-w-md">

        <Link to="/guest" className="inline-flex items-center gap-2 text-gray-400 hover:text-green-400 text-sm mb-8 transition-colors">
          <MdArrowBack size={18} /> Kembali ke Beranda
        </Link>

        <div className="rounded-2xl p-8" style={{ background: 'linear-gradient(160deg,#041C15,#06281F)', border: '1px solid rgba(34,197,94,0.15)' }}>

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <span className="text-3xl">🎉</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Daftar Member Gratis</h1>
            <p className="text-gray-500 text-sm mt-1">Dapatkan 50 poin + voucher welcome setelah daftar</p>
          </div>

          {/* Benefit badges */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {['50 Poin Gratis', 'Voucher 15% Off', 'Booking Online', 'Tracking Real-time'].map(b => (
              <span key={b} className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22C55E' }}>
                ✓ {b}
              </span>
            ))}
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl text-sm text-red-400"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Nama Lengkap</label>
              <div className="relative">
                <MdPerson className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input type="text" required value={form.name} onChange={set('name')}
                  placeholder="Nama lengkap Anda" className={inputCls} style={inputStyle} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Email</label>
              <div className="relative">
                <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input type="email" required value={form.email} onChange={set('email')}
                  placeholder="email@gmail.com" className={inputCls} style={inputStyle} />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Nomor HP</label>
              <div className="relative">
                <MdPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input type="tel" value={form.phone} onChange={set('phone')}
                  placeholder="0812-xxxx-xxxx" className={inputCls} style={inputStyle} />
              </div>
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                Tanggal Lahir <span className="text-gray-600">(opsional — untuk voucher ulang tahun)</span>
              </label>
              <div className="relative">
                <MdCake className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input type="date" value={form.birthDate} onChange={set('birthDate')}
                  className={inputCls} style={{ ...inputStyle, paddingLeft: '2.5rem', colorScheme: 'dark' }} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input type={showPass ? 'text' : 'password'} required value={form.password} onChange={set('password')}
                  placeholder="Min. 6 karakter" className={`${inputCls} pr-10`} style={inputStyle} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
            </div>

            {/* Konfirmasi */}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Konfirmasi Password</label>
              <div className="relative">
                <MdLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input type={showPass ? 'text' : 'password'} required value={form.confirm} onChange={set('confirm')}
                  placeholder="Ulangi password" className={inputCls} style={inputStyle} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all mt-2"
              style={{ background: loading ? 'rgba(34,197,94,0.4)' : 'linear-gradient(135deg,#16A34A,#22C55E)' }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mendaftar...
                </span>
              ) : 'Daftar Sekarang — Gratis!'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Sudah punya akun?{' '}
            <Link to="/guest/login" className="text-green-400 hover:text-green-300 font-semibold transition-colors">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}