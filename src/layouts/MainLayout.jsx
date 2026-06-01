import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { MdMenu } from 'react-icons/md'

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#041C15' }}>
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — drawer on mobile, static on desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-40 md:static md:translate-x-0 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

<div className="flex flex-col flex-1 overflow-visible min-w-0">        {/* Mobile topbar with hamburger */}
        <div className="flex items-center gap-3 px-4 py-3 md:hidden" style={{ background: '#041C15', borderBottom: '1px solid rgba(34,197,94,0.08)' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-green-400 transition-colors"
            style={{ background: 'rgba(11,59,46,0.4)', border: '1px solid rgba(34,197,94,0.12)' }}
          >
            <MdMenu size={20} />
          </button>
          <span className="font-display font-bold text-white text-base">Esther<span className="text-green-400">Garage</span></span>
        </div>

        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6" style={{ background: 'linear-gradient(135deg, #041C15 0%, #06281F 50%, #041C15 100%)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}