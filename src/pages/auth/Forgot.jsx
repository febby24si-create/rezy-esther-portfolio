import { Link } from 'react-router-dom'
import { MdEmail, MdArrowBack } from 'react-icons/md'
import { motion } from 'framer-motion'

export default function Forgot() {
  return (
    <div className="backdrop-blur-xl bg-garage-900/40 border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 relative overflow-hidden">
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

      <h2 className="text-2xl font-display font-extrabold text-white tracking-wide mb-1">Reset Password</h2>
      <p className="text-gray-400 text-sm mb-6">Masukkan email untuk menerima tautan reset password</p>
      
      <form className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
          <div className="relative group">
            <MdEmail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-amber-400" size={18} />
            <input
              type="email"
              required
              placeholder="email@contoh.com"
              className="w-full pl-11 pr-4 py-3 bg-garage-950/60 border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30"
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01, boxShadow: '0 0 20px rgba(245, 158, 11, 0.45)' }}
          whileTap={{ scale: 0.99 }}
          type="button"
          className="w-full py-3.5 rounded-xl text-sm font-semibold text-white relative transition-all duration-300 cursor-pointer bg-gradient-to-r from-amber-600 to-amber-400 border-none flex items-center justify-center shadow-[0_4px_15px_rgba(245,158,11,0.25)] mt-2"
        >
          Kirim Link Reset
        </motion.button>
      </form>
      
      <Link to="/login" className="flex items-center justify-center gap-1.5 text-xs sm:text-sm text-gray-400 hover:text-amber-300 transition-colors mt-6 font-medium">
        <MdArrowBack size={16} /> Kembali ke halaman login
      </Link>
    </div>
  )
}
