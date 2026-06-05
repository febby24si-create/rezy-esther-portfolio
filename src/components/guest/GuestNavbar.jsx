import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  MdMenu, MdClose, MdDirectionsCar, MdDashboard, MdBuild,
  MdCardGiftcard, MdHistory, MdStars, MdLocalOffer, MdGpsFixed,
  MdNotifications, MdPerson
} from 'react-icons/md'

const navLinks = [
  { path: '/guest',          label: 'Beranda', icon: MdDirectionsCar },
  { path: '/guest/layanan',  label: 'Layanan', icon: MdBuild         },
  { path: '/guest/promo',    label: 'Promo',   icon: MdLocalOffer    },
  { path: '/guest/tentang',  label: 'Tentang', icon: MdDirectionsCar },
]

const customerLinks = [
  { path: '/guest/dashboard', label: 'Dashboard', icon: MdDashboard    },
  { path: '/guest/booking',   label: 'Booking',   icon: MdBuild        },
  { path: '/guest/tracking',  label: 'Tracking',  icon: MdGpsFixed     },
  { path: '/guest/loyalty',   label: 'Poin Saya', icon: MdStars        },
  { path: '/guest/voucher',   label: 'Voucher',   icon: MdCardGiftcard },
  { path: '/guest/riwayat',   label: 'Riwayat',   icon: MdHistory      },
]

export default function GuestNavbar() {
  const [menuOpen, setMenuOpen]         = useState(false)
  const [scrolled, setScrolled]         = useState(false)
  const [customerOpen, setCustomerOpen] = useState(false)
  const location = useLocation()
  const isLanding = location.pathname === '/guest'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setCustomerOpen(false)
  }, [location.pathname])

  const navBg = isLanding && !scrolled
    ? 'bg-transparent'
    : 'bg-[#020f09]/95 backdrop-blur-md border-b border-green-500/10'

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-200 px-1 py-0.5 border-b-2 ${
      isActive
        ? 'text-green-400 border-green-400'
        : 'text-gray-300 hover:text-white border-transparent'
    }`

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

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map(({ path, label }) => (
                <NavLink key={path} to={path} end={path === '/guest'} className={linkClass}>
                  {label}
                </NavLink>
              ))}
            </div>

            {/* Desktop right */}
            <div className="hidden md:flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setCustomerOpen(!customerOpen)}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-sm font-medium px-3 py-2 rounded-lg transition-all border border-white/10"
                >
                  <MdPerson className="text-lg" />
                  Area Saya
                  <svg className={`w-3 h-3 transition-transform ${customerOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {customerOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-[#041C15] border border-green-500/15 rounded-xl shadow-2xl py-2 z-50">
                    {customerLinks.map(({ path, label, icon: Icon }) => (
                      <NavLink
                        key={path} to={path}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                            isActive ? 'text-green-400 bg-green-500/10' : 'text-gray-300 hover:text-white hover:bg-white/5'
                          }`
                        }
                      >
                        <Icon className="text-base" /> {label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>

              <button className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all">
                <MdNotifications className="text-lg" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-[#020f09]"></span>
              </button>

              <Link
                to="/guest/booking"
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-lg shadow-green-500/25"
              >
                Booking Sekarang
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg bg-white/5 text-white"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <MdClose className="text-xl" /> : <MdMenu className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-[#020f09]/98 border-t border-green-500/10 px-4 pb-4 pt-2">
            <div className="flex flex-col gap-1">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <NavLink
                  key={path} to={path} end={path === '/guest'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-green-500/15 text-green-400' : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="text-base" /> {label}
                </NavLink>
              ))}
              <div className="mt-2 pt-2 border-t border-white/5">
                <p className="text-xs text-gray-600 uppercase tracking-widest px-3 mb-1.5 font-semibold">Area Pelanggan</p>
                {customerLinks.map(({ path, label, icon: Icon }) => (
                  <NavLink
                    key={path} to={path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        isActive ? 'bg-green-500/15 text-green-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`
                    }
                  >
                    <Icon className="text-base" /> {label}
                  </NavLink>
                ))}
              </div>
              <Link
                to="/guest/booking"
                className="mt-3 w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold px-4 py-3 rounded-xl text-center block"
              >
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