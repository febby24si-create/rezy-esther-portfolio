import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  MdMenu, MdClose, MdDirectionsCar, MdDashboard, MdBuild,
  MdCardGiftcard, MdHistory, MdStars, MdLocalOffer, MdGpsFixed,
  MdNotifications, MdPerson, MdLogout, MdLogin, MdLeaderboard
} from 'react-icons/md'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { calcTier } from '../../context/CustomerAuthContext'

const TIER_COLOR = {
  Bronze:   '#F97316',
  Silver:   '#94A3B8',
  Gold:     '#FBBF24',
  Platinum: '#A855F7',
}

const navLinks = [
  { path: '/guest',          label: 'Beranda', exact: true },
  { path: '/guest/layanan',  label: 'Layanan'              },
  { path: '/guest/promo',    label: 'Promo'                },
  { path: '/guest/tentang',  label: 'Tentang'              },
]

const customerLinks = [
  { path: '/guest/dashboard',    label: 'Dashboard',  icon: MdDashboard    },
  { path: '/guest/booking',      label: 'Booking',    icon: MdBuild        },
  { path: '/guest/tracking',     label: 'Tracking',   icon: MdGpsFixed     },
  { path: '/guest/loyalty',      label: 'Poin Saya',  icon: MdStars        },
  { path: '/guest/voucher',      label: 'Voucher',    icon: MdCardGiftcard },
  { path: '/guest/riwayat',      label: 'Riwayat',    icon: MdHistory      },
  { path: '/guest/leaderboard',  label: 'Leaderboard',icon: MdLeaderboard  },
]

function getInitials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

export default function GuestNavbar() {
  const [menuOpen, setMenuOpen]         = useState(false)
  const [scrolled, setScrolled]         = useState(false)
  const [customerOpen, setCustomerOpen] = useState(false)
  const location  = useLocation()
  const navigate  = useNavigate()
  const isLanding = location.pathname === '/guest'

  const { customer, isLoggedIn, logout } = useCustomerAuth()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
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

  const navBg = isLanding && !scrolled
    ? 'bg-transparent'
    : 'bg-[#020f09]/95 backdrop-blur-md border-b border-green-500/10'

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-200 px-1 py-0.5 border-b-2 ${
      isActive
        ? 'text-green-400 border-green-400'
        : 'text-gray-300 hover:text-white border-transparent'
    }`

  const tier      = isLoggedIn ? calcTier(customer?.points || 0) : null
  const tierColor = tier ? TIER_COLOR[tier] : '#22C55E'

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/guest" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                <MdDirectionsCar className="text-white text-lg" />
              </div>
              <div>
                <span className="font-extrabold text-white text-base tracking-tight leading-none">Esther Garage</span>
                <p className="text-green-400 text-[10px] font-semibold tracking-widest uppercase leading-none mt-0.5">Workshop</p>
              </div>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map(({ path, label, exact }) => (
                <NavLink key={path} to={path} end={!!exact} className={linkClass}>
                  {label}
                </NavLink>
              ))}
            </div>

            {/* Desktop right */}
            <div className="hidden md:flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setCustomerOpen(!customerOpen)}
                  className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {isLoggedIn ? (
                    <>
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: tierColor }}>
                        {getInitials(customer?.name)}
                      </div>
                      <span className="text-white max-w-[100px] truncate">{customer?.name?.split(' ')[0]}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                        style={{ background: `${tierColor}22`, color: tierColor, border: `1px solid ${tierColor}44` }}>
                        {tier}
                      </span>
                    </>
                  ) : (
                    <>
                      <MdPerson className="text-lg text-gray-300" />
                      <span className="text-gray-300">Area Saya</span>
                    </>
                  )}
                  <svg className={`w-3 h-3 text-gray-400 transition-transform ${customerOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {customerOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-2xl py-2 z-50"
                    style={{ background: '#041C15', border: '1px solid rgba(34,197,94,0.15)' }}>
                    {isLoggedIn ? (
                      <>
                        {/* Customer info header */}
                        <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(34,197,94,0.1)' }}>
                          <p className="text-white font-bold text-sm truncate">{customer?.name}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{ background: `${tierColor}22`, color: tierColor }}>
                              {tier} Member
                            </span>
                            <span className="text-xs text-gray-500">{(customer?.points || 0).toLocaleString('id-ID')} poin</span>
                          </div>
                        </div>
                        {customerLinks.map(({ path, label, icon: Icon }) => (
                          <NavLink key={path} to={path}
                            className={({ isActive }) =>
                              `flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                                isActive ? 'text-green-400 bg-green-500/10' : 'text-gray-300 hover:text-white hover:bg-white/5'
                              }`
                            }
                          >
                            <Icon className="text-base" /> {label}
                          </NavLink>
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
                        <div className="border-t mt-1 pt-1" style={{ borderColor: 'rgba(34,197,94,0.1)' }}>
                          {customerLinks.map(({ path, label, icon: Icon }) => (
                            <Link key={path} to="/guest/login"
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-500 hover:text-gray-400 hover:bg-white/5 transition-colors">
                              <Icon className="text-base" /> {label}
                            </Link>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Notif badge */}
              {isLoggedIn && (
                <button className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-300 hover:text-white transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <MdNotifications className="text-lg" />
                  {(customer?.vouchers?.filter(v => v.status === 'active').length || 0) > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-[#020f09]" />
                  )}
                </button>
              )}

              <Link to={isLoggedIn ? '/guest/booking' : '/guest/login'}
                className="text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-lg shadow-green-500/25"
                style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)' }}>
                Booking Sekarang
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-white"
              style={{ background: 'rgba(255,255,255,0.05)' }}
              onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <MdClose className="text-xl" /> : <MdMenu className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t px-4 pb-4 pt-2" style={{ background: 'rgba(2,15,9,0.98)', borderColor: 'rgba(34,197,94,0.1)' }}>
            {isLoggedIn && (
              <div className="flex items-center gap-3 p-3 rounded-xl mb-3"
                style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.1)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: tierColor }}>
                  {getInitials(customer?.name)}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{customer?.name}</p>
                  <p className="text-xs" style={{ color: tierColor }}>{tier} · {(customer?.points || 0).toLocaleString('id-ID')} poin</p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1">
              {navLinks.map(({ path, label, exact }) => (
                <NavLink key={path} to={path} end={!!exact}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-green-500/15 text-green-400' : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}

              <div className="mt-2 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <p className="text-xs text-gray-600 uppercase tracking-widest px-3 mb-1.5 font-semibold">Area Pelanggan</p>
                {isLoggedIn ? (
                  <>
                    {customerLinks.map(({ path, label, icon: Icon }) => (
                      <NavLink key={path} to={path}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                            isActive ? 'bg-green-500/15 text-green-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`
                        }
                      >
                        <Icon className="text-base" /> {label}
                      </NavLink>
                    ))}
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors mt-1">
                      <MdLogout className="text-base" /> Keluar
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/guest/login"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                      <MdLogin className="text-base" /> Masuk
                    </Link>
                    <Link to="/guest/register"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-green-400 hover:bg-green-500/10 transition-colors">
                      <MdPerson className="text-base" /> Daftar Gratis
                    </Link>
                  </>
                )}
              </div>

              <Link to={isLoggedIn ? '/guest/booking' : '/guest/login'}
                className="mt-3 w-full text-white text-sm font-semibold px-4 py-3 rounded-xl text-center block"
                style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)' }}>
                🚗 Booking Service Sekarang
              </Link>
            </div>
          </div>
        )}
      </nav>
      {customerOpen && <div className="fixed inset-0 z-40" onClick={() => setCustomerOpen(false)} />}
    </>
  )
}