import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MdPerson, MdEmail, MdLock } from 'react-icons/md'
import { motion } from 'framer-motion'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  
  return (
    <div className="backdrop-blur-xl bg-garage-900/40 border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 relative overflow-hidden">
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

      <h2 className="text-2xl font-display font-extrabold text-white tracking-wide mb-1">Buat Akun Baru</h2>
      <p className="text-gray-400 text-sm mb-6">Bergabung dengan ekosistem EstherGarage</p>
      
      <form className="space-y-5">
        {[
          { label: 'Nama Lengkap', key: 'name', icon: MdPerson, placeholder: 'Nama Anda', type: 'text' },
          { label: 'Email', key: 'email', icon: MdEmail, placeholder: 'email@contoh.com', type: 'email' },
          { label: 'Password', key: 'password', icon: MdLock, placeholder: 'Min. 8 karakter', type: 'password' },
        ].map(({ label, key, icon: Icon, placeholder, type }) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</label>
            <div className="relative group">
              <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-cyan-400" size={18} />
              <input
                type={type}
                required
                value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                className="w-full pl-11 pr-4 py-3 bg-garage-950/60 border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
              />
            </div>
          </div>
        ))}

        <motion.button
          whileHover={{ scale: 1.01, boxShadow: '0 0 20px rgba(6, 182, 212, 0.45)' }}
          whileTap={{ scale: 0.99 }}
          type="button"
          className="w-full py-3.5 rounded-xl text-sm font-semibold text-white relative transition-all duration-300 cursor-pointer bg-gradient-to-r from-cyan-600 to-cyan-400 border-none flex items-center justify-center shadow-[0_4px_15px_rgba(6,182,212,0.25)] mt-2"
        >
          Daftar Sekarang
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
