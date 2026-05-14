import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MdNotifications, MdSearch, MdCalendarToday, MdLogout } from 'react-icons/md'

export default function Header() {
  const today = new Date().toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' })

  return (
    <header className="flex-shrink-0 flex items-center justify-between px-6 py-3" style={{background:'rgba(4,28,21,0.95)', backdropFilter:'blur(12px)', borderBottom:'1px solid rgba(34,197,94,0.08)'}}>
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Cari order, pelanggan, kendaraan..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm text-gray-300 outline-none transition-all"
            style={{background:'rgba(11,59,46,0.4)', border:'1px solid rgba(34,197,94,0.1)'}}
            onFocus={e => e.target.style.borderColor='rgba(34,197,94,0.35)'}
            onBlur={e => e.target.style.borderColor='rgba(34,197,94,0.1)'}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-400 px-3 py-2 rounded-xl" style={{background:'rgba(11,59,46,0.3)', border:'1px solid rgba(34,197,94,0.08)'}}>
          <MdCalendarToday size={14} className="text-green-500" />
          <span className="text-xs hidden md:block">{today}</span>
        </div>
        <button className="relative p-2 rounded-xl transition-all hover:bg-green-500/10" style={{border:'1px solid rgba(34,197,94,0.1)'}}>
          <MdNotifications className="text-gray-400 hover:text-green-400" size={20} />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{background:'#16A34A'}}>3</span>
        </button>
        <Link to="/login" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-red-400 transition-all" style={{border:'1px solid rgba(34,197,94,0.08)'}}>
          <MdLogout size={16} />
          <span className="hidden md:block">Logout</span>
        </Link>
      </div>
    </header>
  )
}
