import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdMenu, MdClose, MdDirectionsCar, MdDashboard, MdBuild,
  MdCardGiftcard, MdHistory, MdStars, MdGpsFixed,
  MdNotifications, MdPerson, MdLogout, MdLogin, MdLeaderboard
} from 'react-icons/md'
import { useCustomerAuth, calcTier, TIER_CONFIG } from '../../context/CustomerAuthContext'

function getInitials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

const navLinks = [
  { path: '/guest',         label: 'Beranda', exact: true },
  { path: '/guest/layanan', label: 'Layanan'              },
  { path: '/guest/promo',   label: 'Promo'                },
  { path: '/guest/tentang', label: 'Tentang'              },
]

const customerLinks = [
  { path: '/guest/dashboard',   label: 'Dashboard',   icon: MdDashboard    },
  { path: '/guest/booking',     label: 'Booking',     icon: MdBuild        },
  { path: '/guest/tracking',    label: 'Tracking',    icon: MdGpsFixed     },
  { path: '/guest/loyalty',     label: 'Poin Saya',   icon: MdStars        },
  { path: '/guest/voucher',     label: 'Voucher',     icon: MdCardGiftcard },
  { path: '/guest/riwayat',     label: 'Riwayat',     icon: MdHistory      },
  { path: '/guest/leaderboard', label: 'Leaderboard', icon: MdLeaderboard  },
]

export default function GuestNavbar() {
  const [menuOpen, setMenuOpen]         = useState(false)
  const [scrolled, setScrolled]         = useState(false)
  const [customerOpen, setCustomerOpen] = useState(false)
  const location  = useLocation()
  const navigate  = useNavigate()
  const isLanding = location.pathname === '/guest'

  const { customer, isLoggedIn, logout } = useCustomerAuth()
  const tier    = isLoggedIn ? calcTier(customer?.points || 0) : null
  const tierCfg = tier ? TIER_CONFIG[tier] : null

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setCustomerOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/guest')
    setCustomerOpen(false)
  }

  // Navbar bg
  const showBg = !isLanding || scrolled

  return (
    <>
      <motion.nav
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: showBg ? 'rgba(2,15,9,0.92)' : 'transparent',
          backdropFilter: showBg ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: showBg ? 'blur(12px)' : 'none',
          borderBottom: showBg ? '1px solid rgba(34,197,94,0.08)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/guest" className="flex items-center gap-2.5 flex-shrink-0 group">
              <motion.div
                whileHover={{ rotate: [0, -8, 8, 0], scale: 1.08 }}
                transition={{ duration: 0.4 }}
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)', boxShadow: '0 4px 12px rgba(34,197,94,0.3)' }}
              >
                <MdDirectionsCar className="text-white text-lg" />
              </motion.div>
              <div>
                <span className="font-extrabold text-white text-base tracking-tight leading-none">
                  Esther <span className="text-green-400">Garage</span>
                </span>
                <p className="text-green-500/60 text-[9px] font-semibold tracking-widest uppercase leading-none mt-0.5">
                  Workshop
                </p>
              </div>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ path, label, exact }) => (
                <NavLink key={path} to={path} end={!!exact}>
                  {({ isActive }) => (
                    <div className="relative px-3 py-2">
                      <span className={`text-sm font-medium transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`}>
                        {label}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="nav-underline"
                          className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                          style={{ background: 'linear-gradient(90deg,#22C55E,#10B981)' }}
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </div>
                  )}
                </NavLink>
              ))}
            </div>

            {/* Desktop right */}
            <div className="hidden md:flex items-center gap-2">

              {/* Customer dropdown */}
              <div className="relative">
                <motion.button
                  onClick={() => setCustomerOpen(!customerOpen)}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
                >
                  {isLoggedIn ? (
                    <>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: tierCfg?.color || '#22C55E' }}
                      >
                        {getInitials(customer?.name)}
                      </motion.div>
                      <span className="text-white max-w-[90px] truncate">{customer?.name?.split(' ')[0]}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                        style={{ background: `${tierCfg?.color}22`, color: tierCfg?.color, border: `1px solid ${tierCfg?.color}44` }}>
                        {tier}
                      </span>
                    </>
                  ) : (
                    <>
                      <MdPerson className="text-lg text-gray-300" />
                      <span className="text-gray-300">Area Saya</span>
                    </>
                  )}
                  <motion.svg
                    animate={{ rotate: customerOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </motion.button>

                <AnimatePresence>
                  {customerOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl py-2 z-50"
                      style={{ background: '#041C15', border: '1px solid rgba(34,197,94,0.15)', boxShadow: '0 16px 48px rgba(0,0,0,0.5)' }}
                    >
                      {isLoggedIn ? (
                        <>
                          <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(34,197,94,0.1)' }}>
                            <p className="text-white font-bold text-sm truncate">{customer?.name}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                style={{ background: `${tierCfg?.color}22`, color: tierCfg?.color }}>
                                {tierCfg?.icon} {tier} Member
                              </span>
                              <span className="text-xs text-gray-500">{(customer?.points || 0).toLocaleString('id-ID')} poin</span>
                            </div>
                          </div>
                          {customerLinks.map(({ path, label, icon: Icon }, i) => (
                            <motion.div key={path}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.03 }}>
                              <NavLink to={path}
                                className={({ isActive }) =>
                                  `flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${isActive ? 'text-green-400 bg-green-500/10' : 'text-gray-300 hover:text-white hover:bg-white/5'}`
                                }
                              >
                                <Icon className="text-base flex-shrink-0" /> {label}
                              </NavLink>
                            </motion.div>
                          ))}
                          <div className="border-t mt-1 pt-1" style={{ borderColor: 'rgba(34,197,94,0.1)' }}>
                            <button onClick={handleLogout}
                              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                              <MdLogout className="text-base" /> Keluar
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(34,197,94,0.1)' }}>
                            <p className="text-gray-400 text-xs">Masuk untuk akses penuh fitur CRM</p>
                          </div>
                          <Link to="/guest/login"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                            <MdLogin className="text-base" /> Masuk
                          </Link>
                          <Link to="/guest/register"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-green-400 hover:bg-green-500/10 transition-colors">
                            <MdPerson className="text-base" /> Daftar Gratis
                          </Link>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Notif bell */}
              {isLoggedIn && (
                <Link to="/guest/dashboard">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative w-9 h-9 flex items-center justify-center rounded-xl text-gray-300 hover:text-white transition-all cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <MdNotifications className="text-lg" />
                    {(customer?.vouchers?.filter(v => v.status === 'active').length || 0) > 0 && (
                      <motion.span
                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-[#020f09]"
                      />
                    )}
                  </motion.div>
                </Link>
              )}

              {/* CTA booking */}
              <Link to={isLoggedIn ? '/guest/booking' : '/guest/login'}>
                <motion.div
                  whileHover={{ scale: 1.04, boxShadow: '0 8px 24px rgba(34,197,94,0.4)' }}
                  whileTap={{ scale: 0.97 }}
                  className="text-white text-sm font-bold px-4 py-2 rounded-xl cursor-pointer"
                  style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)', boxShadow: '0 4px 16px rgba(34,197,94,0.25)' }}
                >
                  Booking Sekarang
                </motion.div>
              </Link>
            </div>

            {/* Mobile hamburger */}
            <motion.button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-white"
              style={{ background: 'rgba(255,255,255,0.06)' }}
              onClick={() => setMenuOpen(!menuOpen)}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {menuOpen ? (
                  <motion.div key="close"
                    initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <MdClose className="text-xl" />
                  </motion.div>
                ) : (
                  <motion.div key="menu"
                    initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <MdMenu className="text-xl" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden overflow-hidden border-t px-4 pb-4 pt-2"
              style={{ background: 'rgba(2,15,9,0.98)', borderColor: 'rgba(34,197,94,0.1)' }}
            >
              {isLoggedIn && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl mb-3"
                  style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.1)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: tierCfg?.color || '#22C55E' }}>
                    {getInitials(customer?.name)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{customer?.name}</p>
                    <p className="text-xs" style={{ color: tierCfg?.color || '#22C55E' }}>
                      {tierCfg?.icon} {tier} · {(customer?.points || 0).toLocaleString('id-ID')} poin
                    </p>
                  </div>
                </motion.div>
              )}

              <div className="flex flex-col gap-0.5">
                {navLinks.map(({ path, label, exact }, i) => (
                  <motion.div key={path}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 + 0.05 }}>
                    <NavLink to={path} end={!!exact}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-green-500/15 text-green-400' : 'text-gray-300 hover:text-white hover:bg-white/5'}`
                      }
                    >
                      {label}
                    </NavLink>
                  </motion.div>
                ))}

                <div className="mt-2 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <p className="text-xs text-gray-600 uppercase tracking-widest px-3 mb-1.5 font-semibold">Area Pelanggan</p>
                  {isLoggedIn ? (
                    <>
                      {customerLinks.map(({ path, label, icon: Icon }, i) => (
                        <motion.div key={path}
                          initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.04 + 0.2 }}>
                          <NavLink to={path}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-green-500/15 text-green-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`
                            }
                          >
                            <Icon className="text-base" /> {label}
                          </NavLink>
                        </motion.div>
                      ))}
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors mt-1">
                        <MdLogout className="text-base" /> Keluar
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/guest/login" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                        <MdLogin className="text-base" /> Masuk
                      </Link>
                      <Link to="/guest/register" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-green-400 hover:bg-green-500/10 transition-colors">
                        <MdPerson className="text-base" /> Daftar Gratis
                      </Link>
                    </>
                  )}
                </div>

                <Link to={isLoggedIn ? '/guest/booking' : '/guest/login'}
                  className="mt-3 text-white text-sm font-bold px-4 py-3 rounded-xl text-center block"
                  style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)' }}>
                  🚗 Booking Service Sekarang
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {customerOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setCustomerOpen(false)} />
      )}
    </>
  )
}