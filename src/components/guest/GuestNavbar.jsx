import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  MdMenu, MdClose, MdDashboard, MdBuild,
  MdCardGiftcard, MdHistory, MdStars, MdGpsFixed,
  MdNotifications, MdPerson, MdLogout, MdLogin, MdLeaderboard,
  MdCardMembership, MdOpenInNew, MdChevronRight,
  MdDarkMode, MdLightMode,
} from 'react-icons/md'
import { useTheme } from '../../context/ThemeContext'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { calcTier, TIER_CONFIG } from '../../lib/loyaltyConstants'
import NotificationBell from '../NotificationBell'
import { getCustomerAvatar } from '../../utils/randomAvatar'
import logo from '../../assets/logo2.png'

// ─── Nav links (halaman Guest yang boleh diakses siapa saja) ──
const GUEST_NAV = [
  { path: '/',               label: 'Beranda', exact: true },
  { path: '/guest/layanan', label: 'Layanan'              },
  { path: '/guest/produk',  label: 'Produk'               },
  { path: '/guest/promo',   label: 'Promo'                },
  { path: '/guest/tentang', label: 'Tentang'              },
]

// ─── Quick links saat logged-in (dropdown) ────────────────────
const MEMBER_QUICK = [
  { path: '/member/dashboard',   label: 'Dashboard',       icon: MdDashboard       },
  { path: '/member/kartu',       label: 'Kartu Member',    icon: MdCardMembership  },
  { path: '/member/booking',     label: 'Booking',         icon: MdBuild           },
  { path: '/member/tracking',    label: 'Tracking',        icon: MdGpsFixed        },
  { path: '/member/loyalty',     label: 'Poin Saya',       icon: MdStars           },
  { path: '/member/voucher',     label: 'Voucher',         icon: MdCardGiftcard    },
  { path: '/member/riwayat',     label: 'Riwayat',         icon: MdHistory         },
  { path: '/member/profil',      label: 'Profil',          icon: MdPerson          },
  { path: '/member/leaderboard', label: 'Leaderboard',     icon: MdLeaderboard     },
]

export default function GuestNavbar() {
  const [menuOpen, setMenuOpen]         = useState(false)
  const [scrolled, setScrolled]         = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const location  = useLocation()
  const navigate  = useNavigate()
  const isLanding = location.pathname === '/'

  const { theme, toggleTheme } = useTheme()
  const { customer, isLoggedIn, logout } = useCustomerAuth()
  const tier    = isLoggedIn ? calcTier(customer?.points || 0) : null
  const tierCfg = tier ? TIER_CONFIG[tier] : null

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const prevPathRef = useRef(location.pathname)
  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      setMenuOpen(false)
      setDropdownOpen(false)
      prevPathRef.current = location.pathname
    }
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/guest')
    setDropdownOpen(false)
    setMenuOpen(false)
  }

  const showBg = !isLanding || scrolled

  return (
    <>
      <motion.nav
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: showBg ? 'rgba(2,11,24,0.94)' : 'transparent',
          backdropFilter: showBg ? 'blur(14px)' : 'none',
          WebkitBackdropFilter: showBg ? 'blur(14px)' : 'none',
          borderBottom: showBg ? '1px solid rgba(6,182,212,0.08)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ── */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <motion.div
                whileHover={{ rotate: [0, -8, 8, 0], scale: 1.08 }}
                transition={{ duration: 0.4 }}
                className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-lg bg-white"
              >
                <img src={logo} alt="Esther Garage" className="w-full h-full object-contain" />
              </motion.div>
              <div>
                <span className="font-extrabold text-white text-base tracking-tight leading-none">
                  Esther <span className="text-cyan-400">Garage</span>
                </span>
                <p className="text-blue-400/60 text-[9px] font-semibold tracking-widest uppercase leading-none mt-0.5">
                  Workshop
                </p>
              </div>
            </Link>

            {/* ── Desktop Guest Nav ── */}
            <div className="hidden md:flex items-center gap-1">
              {GUEST_NAV.map(({ path, label, exact }) => (
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
                          style={{ background: 'linear-gradient(90deg,#2563eb,#06b6d4)' }}
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </div>
                  )}
                </NavLink>
              ))}

              {/* "Dashboard Member" shortcut — hanya saat logged in */}
              {isLoggedIn && (
                <Link to="/member/dashboard">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl ml-1 transition-all"
                    style={{
                      background: `${tierCfg?.color}18`,
                      color: tierCfg?.color,
                      border: `1px solid ${tierCfg?.color}35`,
                    }}
                  >
                    <MdDashboard size={15} />
                    Dashboard Member
                  </motion.div>
                </Link>
              )}
            </div>

            {/* ── Desktop Right Section ── */}
            <div className="hidden md:flex items-center gap-2">

              {/* Theme Toggle */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleTheme}
                className="p-2 rounded-xl transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
                title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
              >
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === 'dark' ? (
                    <MdLightMode size={18} className="text-yellow-400" />
                  ) : (
                    <MdDarkMode size={18} className="text-blue-400" />
                  )}
                </motion.div>
              </motion.button>

              {isLoggedIn ? (
                <>
                  {/* Notification bell — real-time dari Supabase */}
                  <NotificationBell customerId={customer?.id} />

                  {/* Avatar + Dropdown */}
                  <div className="relative">
                    <motion.button
                      onClick={() => setDropdownOpen(v => !v)}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-6 h-6 rounded-lg overflow-hidden flex-shrink-0"
                        style={{ border: `1.5px solid ${tierCfg?.color}66` }}
                      >
                        <img
                          src={getCustomerAvatar(customer?.name || '', 60)}
                          alt={customer?.name}
                          className="w-full h-full object-cover"
                          onError={e => {
                            e.target.onerror = null
                            e.target.style.display = 'none'
                            e.target.parentElement.style.background = tierCfg?.color || '#06b6d4'
                            e.target.parentElement.innerHTML = `<span style='color:white;font-size:9px;font-weight:bold;display:flex;align-items:center;justify-content:center;width:100%;height:100%'>${(customer?.name||'').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}</span>`
                          }}
                        />
                      </motion.div>
                      <span className="text-white max-w-[80px] truncate">{customer?.name?.split(' ')[0]}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                        style={{ background: `${tierCfg?.color}22`, color: tierCfg?.color, border: `1px solid ${tierCfg?.color}44` }}>
                        {tierCfg?.icon} {tier}
                      </span>
                      <motion.svg
                        animate={{ rotate: dropdownOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </motion.svg>
                    </motion.button>

                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -8 }}
                          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl py-2 z-50"
                          style={{ background: '#04132c', border: '1px solid rgba(6,182,212,0.15)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
                        >
                          {/* User info header */}
                          <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(6,182,212,0.1)' }}>
                            <p className="text-white font-bold text-sm truncate">{customer?.name}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                                style={{ background: `${tierCfg?.color}22`, color: tierCfg?.color }}>
                                {tierCfg?.icon} {tier} Member
                              </span>
                              <span className="text-xs text-gray-500">{(customer?.points || 0).toLocaleString('id-ID')} poin</span>
                            </div>
                          </div>

                          {/* Go to Member Dashboard */}
                          <div className="px-2 pt-2">
                            <Link to="/member/dashboard" onClick={() => setDropdownOpen(false)}
                              className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all mb-1"
                              style={{ background: `${tierCfg?.color}14`, color: tierCfg?.color, border: `1px solid ${tierCfg?.color}30` }}>
                              <div className="flex items-center gap-2">
                                <MdDashboard size={16} />
                                Masuk ke Area Member
                              </div>
                              <MdChevronRight size={16} />
                            </Link>
                          </div>

                          {/* Quick links */}
                          <div className="px-2 pb-1">
                            {MEMBER_QUICK.slice(1, 6).map(({ path, label, icon: Icon }, i) => (
                              <motion.div key={path}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.03 }}>
                                <NavLink to={path} onClick={() => setDropdownOpen(false)}
                                  className={({ isActive }) =>
                                    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'text-cyan-400 bg-cyan-500/10' : 'text-gray-300 hover:text-white hover:bg-white/5'}`
                                  }
                                >
                                  <Icon className="text-base flex-shrink-0 text-gray-500" /> {label}
                                </NavLink>
                              </motion.div>
                            ))}
                          </div>

                          {/* Logout */}
                          <div className="border-t mx-2 mt-1 pt-1" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                            <button onClick={handleLogout}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                              <MdLogout className="text-base" /> Keluar
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  {/* Guest: Login + Register */}
                  <Link to="/guest/login"
                    className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl text-gray-300 hover:text-white transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <MdLogin size={16} /> Masuk
                  </Link>
                  <Link to="/guest/register">
                    <motion.div
                      whileHover={{ scale: 1.04, boxShadow: '0 8px 24px rgba(6,182,212,0.4)' }}
                      whileTap={{ scale: 0.97 }}
                      className="text-white text-sm font-bold px-4 py-2 rounded-xl cursor-pointer"
                      style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)', boxShadow: '0 4px 16px rgba(6,182,212,0.25)' }}
                    >
                      Daftar Gratis
                    </motion.div>
                  </Link>
                </>
              )}

              {/* Booking CTA — always visible */}
              <Link to={isLoggedIn ? '/member/booking' : '/guest/login'}>
                <motion.div
                  whileHover={{ scale: 1.04, boxShadow: '0 8px 24px rgba(6,182,212,0.4)' }}
                  whileTap={{ scale: 0.97 }}
                  className="text-white text-sm font-bold px-4 py-2 rounded-xl cursor-pointer"
                  style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)', boxShadow: '0 4px 16px rgba(6,182,212,0.25)' }}
                >
                  Booking
                </motion.div>
              </Link>
            </div>

            {/* ── Mobile Hamburger ── */}
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

        {/* ── Mobile Menu ── */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden overflow-hidden border-t px-4 pb-4 pt-2"
              style={{ background: 'rgba(2,11,24,0.98)', borderColor: 'rgba(6,182,212,0.1)' }}
            >
              {/* Logged-in: user card */}
              {isLoggedIn && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl mb-3"
                  style={{ background: `${tierCfg?.color}10`, border: `1px solid ${tierCfg?.color}25` }}>
                  <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0"
                    style={{ border: `2px solid ${tierCfg?.color}55` }}>
                    <img
                      src={getCustomerAvatar(customer?.name || '', 80)}
                      alt={customer?.name}
                      className="w-full h-full object-cover"
                      onError={e => {
                        e.target.onerror = null
                        e.target.style.display = 'none'
                        e.target.parentElement.style.background = tierCfg?.color || '#06b6d4'
                        e.target.parentElement.style.display = 'flex'
                        e.target.parentElement.style.alignItems = 'center'
                        e.target.parentElement.style.justifyContent = 'center'
                        e.target.parentElement.innerHTML = `<span style='color:white;font-size:11px;font-weight:bold'>${(customer?.name||'').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase()}</span>`
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{customer?.name}</p>
                    <p className="text-xs" style={{ color: tierCfg?.color || '#06b6d4' }}>
                      {tierCfg?.icon} {tier} · {(customer?.points || 0).toLocaleString('id-ID')} poin
                    </p>
                  </div>
                  <Link to="/member/dashboard" onClick={() => setMenuOpen(false)}
                    className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all"
                    style={{ background: `${tierCfg?.color}20`, color: tierCfg?.color, border: `1px solid ${tierCfg?.color}35` }}>
                    <MdDashboard size={13} />
                    Area Member
                  </Link>
                </motion.div>
              )}

              {/* Guest nav links */}
              <div className="flex flex-col gap-0.5">
                {GUEST_NAV.map(({ path, label, exact }, i) => (
                  <motion.div key={path}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 + 0.05 }}>
                    <NavLink to={path} end={!!exact}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-500/15 text-cyan-400' : 'text-gray-300 hover:text-white hover:bg-white/5'}`
                      }
                    >
                      {label}
                    </NavLink>
                  </motion.div>
                ))}

                {/* Auth section */}
                <div className="mt-2 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  {isLoggedIn ? (
                    <>
                      <p className="text-xs text-gray-600 uppercase tracking-widest px-3 mb-1.5 font-semibold">Area Member</p>
                      {MEMBER_QUICK.map(({ path, label, icon: Icon }, i) => (
                        <motion.div key={path}
                          initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 + 0.2 }}>
                          <NavLink to={path} onClick={() => setMenuOpen(false)}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-cyan-500/15 text-cyan-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`
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
                      <p className="text-xs text-gray-600 uppercase tracking-widest px-3 mb-1.5 font-semibold">Akun</p>
                      <Link to="/guest/login" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                        <MdLogin className="text-base" /> Masuk
                      </Link>
                      <Link to="/guest/register" onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cyan-400 hover:bg-cyan-500/10 transition-colors">
                        <MdPerson className="text-base" /> Daftar Gratis
                      </Link>
                    </>
                  )}
                </div>

                {/* Booking CTA */}
                <Link to={isLoggedIn ? '/member/booking' : '/guest/login'}
                  onClick={() => setMenuOpen(false)}
                  className="mt-3 text-white text-sm font-bold px-4 py-3 rounded-xl text-center block"
                  style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)' }}>
                  🚗 Booking Service Sekarang
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Backdrop untuk dropdown */}
      {dropdownOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
      )}
    </>
  )
}