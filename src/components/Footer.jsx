/**
 * Footer — dark garage themed footer
 */
import { MdBuild, MdLocationOn, MdPhone, MdEmail } from 'react-icons/md'
import { Link } from 'react-router-dom'

const LINKS = [
  { label: 'Dashboard', to: '/' },
  { label: 'Order Servis', to: '/orders' },
  { label: 'Pelanggan', to: '/customers' },
  { label: 'Kendaraan', to: '/vehicles' },
  { label: 'Mekanik', to: '/mechanics' },
  { label: 'Laporan', to: '/reports' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer
      className="mt-16 border-t"
      style={{
        borderColor: 'rgba(34,197,94,0.1)',
        background: 'linear-gradient(180deg, rgba(4,28,21,0) 0%, rgba(4,28,21,0.95) 100%)',
      }}
    >
      <div className="px-6 pt-10 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #16A34A, #22C55E)' }}
              >
                <MdBuild size={18} className="text-white" />
              </div>
              <p className="font-display font-bold text-white text-lg tracking-wider">
                Esther<span className="text-green-400">Garage</span>
              </p>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Sistem manajemen bengkel modern. Kelola order, pelanggan, dan mekanik dalam satu platform terintegrasi.
            </p>
          </div>

          {/* Nav links */}
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-4">Navigasi</p>
            <div className="grid grid-cols-2 gap-2">
              {LINKS.map(({ label, to }) => (
                <Link
                  key={to}
                  to={to}
                  className="text-sm text-gray-500 hover:text-green-400 transition-colors duration-150"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold mb-4">Kontak</p>
            <div className="space-y-3">
              {[
                { icon: MdLocationOn, text: 'Bukittinggi, Sumatera Barat' },
                { icon: MdPhone, text: '+62 887-082-30676' },
                { icon: MdEmail, text: 'admin@esthergarage.id' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-2.5">
                  <Icon size={15} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-500">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between pt-6 gap-3"
          style={{ borderTop: '1px solid rgba(34,197,94,0.08)' }}
        >
          <p className="text-xs text-gray-600">
            © {year} EstherGarage. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full bg-green-400"
              style={{ boxShadow: '0 0 6px rgba(34,197,94,0.6)' }}
            />
            <span className="text-xs text-gray-600">Sistem online</span>
          </div>
        </div>
      </div>
    </footer>
  )
}