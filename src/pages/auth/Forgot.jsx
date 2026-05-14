import { Link } from 'react-router-dom'
import { MdEmail, MdArrowBack } from 'react-icons/md'

export default function Forgot() {
  return (
    <div className="glass-card neon-border p-8 animate-fade-in">
      <h2 className="text-2xl font-display font-bold text-white mb-1">Reset Password</h2>
      <p className="text-gray-500 text-sm mb-6">Masukkan email untuk menerima link reset password</p>
      <form className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Email</label>
          <div className="relative">
            <MdEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input type="email" placeholder="email@contoh.com" className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white outline-none" style={{background:'rgba(11,59,46,0.4)', border:'1px solid rgba(34,197,94,0.15)'}} />
          </div>
        </div>
        <button type="button" className="btn-primary w-full py-3 rounded-xl text-sm font-semibold">Kirim Link Reset</button>
      </form>
      <Link to="/login" className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-green-400 transition-colors mt-5">
        <MdArrowBack size={16} /> Kembali ke halaman login
      </Link>
    </div>
  )
}
