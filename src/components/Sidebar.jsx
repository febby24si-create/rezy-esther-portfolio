import { NavLink, Link, useNavigate } from 'react-router-dom'
import logo from '../assets/logo2.png'
import {
  MdDashboard, MdBuild, MdPeople, MdDirectionsCar, MdEngineering,
  MdBarChart, MdSettings, MdError, MdWarning, MdBlock, MdWidgets,
  MdInventory2, MdClose, MdLogout, MdCalendarMonth
} from 'react-icons/md'

const navItems = [
  { path: '/',           icon: MdDashboard,    label: 'Dashboard'    },
  { path: '/orders',     icon: MdBuild,        label: 'Order Servis' },
  { path: '/customers',  icon: MdPeople,       label: 'Pelanggan'    },
  { path: '/vehicles',   icon: MdDirectionsCar,label: 'Kendaraan'    },
  { path: '/mechanics',  icon: MdEngineering,  label: 'Mekanik'      },
  { path: '/schedule',   icon: MdCalendarMonth, label: 'Jadwal Mekanik' },
  { path: '/reports',    icon: MdBarChart,     label: 'Laporan'      },
  { path: '/inventory',  icon: MdInventory2,   label: 'Stok Barang'  },
]

const errorItems = [
  { path: '/error-400', icon: MdError,   label: 'Error 400' },
  { path: '/error-401', icon: MdWarning, label: 'Error 401' },
  { path: '/error-403', icon: MdBlock,   label: 'Error 403' },
]

const SectionLabel = ({ label }) => (
  <div className="pt-4 pb-2">
    <p className="text-xs text-gray-600 uppercase tracking-widest px-4 font-semibold">{label}</p>
  </div>
)

export default function Sidebar({ onClose }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('eg_token')
    localStorage.removeItem('eg_user')
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    `sidebar-link flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium
    ${isActive
      ? 'bg-green-500/15 text-green-400 border border-green-500/20'
      : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`

  return (
    <aside
      className="w-56 flex-shrink-0 flex flex-col h-screen"
      style={{
        background: 'linear-gradient(180deg, #041C15 0%, #06281F 100%)',
        borderRight: '1px solid rgba(34,197,94,0.08)',
      }}
    >
      {/* Logo + mobile close */}
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'rgba(34,197,94,0.1)' }}>
        <Link to="/" className="flex items-center gap-3" onClick={onClose}>
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-green-500/20 shadow-lg">
            <img src={logo} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-display font-bold text-white text-base leading-none tracking-wider">
              Esther<span className="text-green-400">Garage</span>
            </p>
            <p className="text-xs text-gray-500 tracking-widest uppercase mt-0.5" style={{ fontSize: '9px' }}>
              bengkel terpercaya
            </p>
          </div>
        </Link>
        {/* Close button — only visible on mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-white transition-colors"
            style={{ background: 'rgba(11,59,46,0.5)' }}
          >
            <MdClose size={16} />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink key={path} to={path} end={path === '/'} className={linkClass} onClick={onClose}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}

        <SectionLabel label="Developer" />
        <NavLink to="/components" className={linkClass} onClick={onClose}>
          <MdWidgets size={18} />
          <span>Components</span>
        </NavLink>

        <SectionLabel label="Error Pages" />
        {errorItems.map(({ path, icon: Icon, label }) => (
          <NavLink key={path} to={path} className={linkClass} onClick={onClose}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}

        <SectionLabel label="System" />
        <NavLink to="/settings" className={linkClass} onClick={onClose}>
          <MdSettings size={18} />
          <span>Pengaturan</span>
        </NavLink>
      </nav>

      {/* User profile + Logout */}
      <div className="p-4 border-t space-y-2" style={{ borderColor: 'rgba(34,197,94,0.1)' }}>
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(11,59,46,0.5)' }}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}
          >
            F
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">Febby Fahrezy</p>
            <p className="text-gray-500 text-xs">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
          style={{ border: '1px solid rgba(239,68,68,0.12)' }}
        >
          <MdLogout size={16} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  )
}