import { Link } from 'react-router-dom'
import { MdDirectionsCar, MdPhone, MdEmail, MdLocationOn, MdAccessTime } from 'react-icons/md'
import { FaInstagram, FaFacebookF, FaYoutube, FaWhatsapp } from 'react-icons/fa'

const layananLinks = ['Service Berkala', 'Tune Up', 'Ganti Oli', 'Spooring & Balancing', 'Service AC', 'Service Kelistrikan']
const pelangganLinks = [
  { label: 'Dashboard Saya', path: '/member/dashboard' },
  { label: 'Booking Online', path: '/member/booking' },
  { label: 'Tracking Status', path: '/member/tracking' },
  { label: 'Riwayat Service', path: '/member/riwayat' },
  { label: 'Loyalty Point', path: '/member/loyalty' },
  { label: 'Voucher Saya', path: '/member/voucher' },
]
const infoLinks = ['Tentang Kami', 'Promo & Voucher', 'FAQ', 'Kebijakan Privasi', 'Syarat & Ketentuan']

export default function GuestFooter() {
  return (
    <footer style={{ background: '#020f09', borderTop: '1px solid rgba(34,197,94,0.08)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/guest" className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                <MdDirectionsCar className="text-white text-2xl" />
              </div>
              <div>
                <span className="font-extrabold text-white text-xl tracking-tight">Esther Garage</span>
                <p className="text-green-400 text-xs font-semibold tracking-widest uppercase">Workshop</p>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
              Bengkel modern terpercaya di Sumatera Barat sejak 2015. Teknologi diagnostik terkini, mekanik bersertifikat, dan transparansi harga tanpa kejutan.
            </p>
            <div className="space-y-2.5 mb-6">
              {[
                { icon: MdLocationOn, text: 'Bukittinggi, Sumatera Barat' },
                { icon: MdPhone, text: '+62 887-082-30676' },
                { icon: MdEmail, text: 'febby24si@mahasiswa.pcr.ac.id' },
                { icon: MdAccessTime, text: 'Senin–Sabtu, 08.00–18.00 WIB' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3 text-sm text-gray-400">
                  <Icon className="text-green-400 text-base mt-0.5 flex-shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2.5">
              {[FaInstagram, FaFacebookF, FaYoutube].map((Icon, i) => (
                <button key={i} className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-white bg-white/5 hover:bg-green-500/20 transition-all">
                  <Icon className="text-sm" />
                </button>
              ))}
              <a href="https://wa.me/6281288990011" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400 text-sm font-medium px-3 py-2 rounded-lg transition-all ml-1">
                <FaWhatsapp className="text-base" /> WhatsApp
              </a>
            </div>
          </div>

          {/* Layanan */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">Layanan</h4>
            <ul className="space-y-2.5">
              {layananLinks.map((l) => (
                <li key={l}><Link to="/guest/layanan" className="text-gray-400 hover:text-green-400 text-sm transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Area Pelanggan */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">Area Pelanggan</h4>
            <ul className="space-y-2.5">
              {pelangganLinks.map(({ label, path }) => (
                <li key={label}><Link to={path} className="text-gray-400 hover:text-green-400 text-sm transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-4">Informasi</h4>
            <ul className="space-y-2.5">
              {infoLinks.map((l) => (
                <li key={l}><Link to="/guest" className="text-gray-400 hover:text-green-400 text-sm transition-colors">{l}</Link></li>
              ))}
            </ul>
            <div className="mt-6">
              <p className="text-xs text-gray-600 uppercase tracking-widest mb-3 font-semibold">Sertifikasi</p>
              <div className="flex flex-wrap gap-1.5">
                {['ISO 9001', 'AHM', 'TAM', 'Bosch'].map((c) => (
                  <span key={c} className="text-xs px-2 py-1 rounded-md bg-green-500/10 text-green-400 border border-green-500/20 font-medium">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">© {new Date().getFullYear()} Esther Garage. Semua hak cipta dilindungi.</p>
          <p className="text-gray-600 text-xs">Sistem ditenagai oleh <span className="text-green-400 font-semibold">Esther Garage CRM</span> v2.5</p>
        </div>
      </div>
    </footer>
  )
}