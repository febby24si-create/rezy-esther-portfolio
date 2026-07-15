// ============================================================
// MemberLayout.jsx
// Layout khusus halaman Member yang sudah login.
// Terpisah dari GuestLayout — memiliki navbar dan sidebar sendiri.
// ============================================================
import { useState, useEffect } from 'react'
import { Outlet, useLocation, Link, useNavigate, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  MdDashboard, MdDirectionsCar, MdHistory, MdStars, MdCardGiftcard,
  MdPerson, MdLogout, MdBuild, MdGpsFixed, MdMenu, MdClose,
  MdLeaderboard, MdCreditCard, MdChevronRight, MdOpenInNew,
  MdShoppingBag, MdStorefront,
} from 'react-icons/md'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { calcTier, TIER_CONFIG } from '../lib/loyaltyConstants'
import { createContext, useContext } from 'react'
import { ToastContainer, useToast } from '../components/guest/Toast'

const ToastCtx = createContext(null)
export const useMemberToast = () => useContext(ToastCtx)

const NAV_ITEMS = [
  { path: '/member/dashboard', label: 'Dashboard',        icon: MdDashboard    },
  { path: '/member/kendaraan', label: 'Kendaraan Saya',   icon: MdDirectionsCar },
  { path: '/member/kartu',     label: 'Kartu Member',     icon: MdCreditCard   },
  { path: '/member/booking',   label: 'Booking',          icon: MdBuild        },
  { path: '/member/tracking',  label: 'Tracking',         icon: MdGpsFixed     },
  { path: '/guest/produk',     label: 'Produk / Sparepart', icon: MdStorefront, external: true },
  { path: '/member/loyalty',   label: 'Poin Loyalty',     icon: MdStars        },
  { path: '/member/voucher',   label: 'Voucher',          icon: MdCardGiftcard },
  { path: '/member/riwayat',   label: 'Riwayat Servis',   icon: MdHistory      },
  { path: '/member/pembelian', label: 'Riwayat Pembelian',icon: MdShoppingBag  },
  { path: '/member/profil',    label: 'Profil',           icon: MdPerson       },
  { path: '/member/leaderboard', label: 'Leaderboard',    icon: MdLeaderboard  },
]

function MemberNavbar({ sidebarOpen, setSidebarOpen }) {
  const { customer, logout } = useCustomerAuth()
  const navigate = useNavigate()
  const tier = customer ? calcTier(customer.points || 0) : 'Bronze'
  const tierCfg = TIER_CONFIG[tier]

  const handleLogout = () => {
    logout()
    navigate('/guest')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center px-4 sm:px-6"
      style={{
        background: 'rgba(4,14,9,0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(34,197,94,0.10)',
      }}>
      <div className="flex items-center gap-3 flex-1">
        {/* Sidebar toggle */}
        <button
          onClick={() => setSidebarOpen(v => !v)}
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all lg:hidden">
          {sidebarOpen ? <MdClose size={22} /> : <MdMenu size={22} />}
        </button>

        {/* Logo */}
        <Link to="/member/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)', boxShadow: '0 4px 12px rgba(34,197,94,0.3)' }}>
            <MdDirectionsCar className="text-white text-base" />
          </div>
          <div className="hidden sm:block">
            <span className="font-extrabold text-white text-sm tracking-tight leading-none">
              Esther <span className="text-green-400">Garage</span>
            </span>
            <p className="text-green-500/60 text-[8px] font-semibold tracking-widest uppercase leading-none mt-0.5">
              Member Area
            </p>
          </div>
        </Link>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Tier badge */}
        {customer && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ background: `${tierCfg.color}18`, border: `1px solid ${tierCfg.color}35` }}>
            <span className="text-sm">{tierCfg.icon}</span>
            <span className="text-xs font-bold" style={{ color: tierCfg.color }}>{tier}</span>
          </div>
        )}

        {/* Avatar */}
        {customer && (
          <Link to="/member/profil"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold text-white border-2 transition-all hover:scale-105"
            style={{ background: `${tierCfg.color}30`, borderColor: `${tierCfg.color}60` }}>
            {customer.name?.charAt(0).toUpperCase()}
          </Link>
        )}

        {/* Lihat Website */}
        <Link to="/"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-white/8 transition-all border border-white/8 hover:border-white/15"
          title="Lihat Website">
          <MdOpenInNew size={14} />
          <span>Website</span>
        </Link>

        {/* Logout */}
        <button onClick={handleLogout}
          className="p-2 rounded-xl text-red-400 hover:bg-red-500/15 transition-all" title="Logout">
          <MdLogout size={18} />
        </button>
      </div>
    </header>
  )
}

function MemberSidebar({ open, onClose }) {
  const location = useLocation()
  const { customer } = useCustomerAuth()
  const tier = customer ? calcTier(customer.points || 0) : 'Bronze'
  const tierCfg = TIER_CONFIG[tier]

  return (
    <>
      {/* Overlay mobile */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={onClose} />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 z-40 w-60 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          background: 'rgba(4,12,8,0.98)',
          borderRight: '1px solid rgba(34,197,94,0.08)',
        }}>

        {/* User info */}
        {customer && (
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold text-white flex-shrink-0"
                style={{ background: `${tierCfg.color}30`, border: `1.5px solid ${tierCfg.color}50` }}>
                {customer.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold text-sm truncate">{customer.name}</p>
                <p className="text-gray-500 text-[10px] font-mono truncate">{customer.membershipId || '—'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {NAV_ITEMS.map(({ path, label, icon: Icon, external }) => {
            const active = location.pathname.startsWith(path) && !external
            const cls = `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
              active
                ? 'bg-green-500/15 text-green-400 border border-green-500/25'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`
            return external ? (
              <Link key={path} to={path} onClick={onClose} className={cls}>
                <Icon size={18} className="text-amber-500 group-hover:text-amber-400" />
                <span>{label}</span>
                <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">
                  BARU
                </span>
              </Link>
            ) : (
              <NavLink key={path} to={path} onClick={onClose} className={cls}>
                <Icon size={18} className={active ? 'text-green-400' : 'text-gray-500 group-hover:text-gray-300'} />
                <span>{label}</span>
                {active && <MdChevronRight size={14} className="ml-auto text-green-400/60" />}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/5 space-y-1">
          <Link to="/"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/10">
            <MdDirectionsCar size={15} />
            <span>Lihat Website Guest</span>
          </Link>
        </div>
      </aside>
    </>
  )
}

export default function MemberLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { toasts, addToast, removeToast } = useToast()

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <ToastCtx.Provider value={addToast}>
      <div className="min-h-screen" style={{ background: '#040E09' }}>
        <MemberNavbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <MemberSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content */}
        <main className="lg:pl-60 pt-16 min-h-screen">
          <AnimatePresence mode="wait" initial={false}>
            <Outlet key={location.pathname} />
          </AnimatePresence>
        </main>

        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    </ToastCtx.Provider>
  )
}