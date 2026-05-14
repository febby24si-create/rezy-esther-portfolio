import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MdPerson, MdEmail, MdLock } from 'react-icons/md'

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'' })
  return (
    <div className="glass-card neon-border p-8 animate-fade-in">
      <h2 className="text-2xl font-display font-bold text-white mb-1">Buat Akun Baru</h2>
      <p className="text-gray-500 text-sm mb-6">Bergabung dengan EstherGarage</p>
      <form className="space-y-4">
        {[
          { label:'Nama Lengkap', key:'name', icon:MdPerson, placeholder:'Nama Anda', type:'text' },
          { label:'Email', key:'email', icon:MdEmail, placeholder:'email@contoh.com', type:'email' },
          { label:'Password', key:'password', icon:MdLock, placeholder:'Min. 8 karakter', type:'password' },
        ].map(({ label, key, icon:Icon, placeholder, type }) => (
          <div key={key}>
            <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
            <div className="relative">
              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={placeholder}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white outline-none" style={{background:'rgba(11,59,46,0.4)', border:'1px solid rgba(34,197,94,0.15)'}} />
            </div>
          </div>
        ))}
        <button type="button" className="btn-primary w-full py-3 rounded-xl text-sm font-semibold">Daftar Sekarang</button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-5">
        Sudah punya akun? <Link to="/login" className="text-green-400 hover:text-green-300 font-semibold transition-colors">Masuk</Link>
      </p>
    </div>
  )
}
