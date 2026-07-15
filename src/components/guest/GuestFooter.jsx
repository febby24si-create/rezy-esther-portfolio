import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MdPhone, MdEmail, MdLocationOn, MdAccessTime, MdArrowForward } from 'react-icons/md'
import { FaInstagram, FaFacebookF, FaYoutube, FaWhatsapp } from 'react-icons/fa'
import logo from '../../assets/logo2.png'

const footerLinks = {
  layanan: ['Service Berkala', 'Tune Up', 'Ganti Oli', 'Spooring & Balancing', 'Service AC', 'Service Kelistrikan'],
  pelanggan: [
    { label: 'Dashboard Saya', path: '/member/dashboard' },
    { label: 'Booking Online', path: '/member/booking' },
    { label: 'Tracking Status', path: '/member/tracking' },
    { label: 'Riwayat Service', path: '/member/riwayat' },
    { label: 'Loyalty Point', path: '/member/loyalty' },
    { label: 'Voucher Saya', path: '/member/voucher' },
  ],
  info: ['Tentang Kami', 'Promo & Voucher', 'FAQ', 'Kebijakan Privasi', 'Syarat & Ketentuan'],
}

function FooterColumn({ title, children }) {
  return (
    <div>
      <h4 className="text-white font-semibold text-sm uppercase tracking-widest mb-5">{title}</h4>
      <ul className="space-y-3">
        {children}
      </ul>
    </div>
  )
}

export default function GuestFooter() {
  return (
    <footer className="border-t border-auto-800/50 bg-auto-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand - 2 cols */}
          <div className="lg:col-span-2">
            <Link to="/guest" className="flex items-center gap-3 mb-6 group">
              <motion.div
                whileHover={{ rotate: [0, -8, 8, 0], scale: 1.08 }}
                transition={{ duration: 0.4 }}
                className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center shadow-lg bg-white"
              >
                <img src={logo} alt="Esther Garage" className="w-full h-full object-contain" />
              </motion.div>
              <div>
                <span className="font-extrabold text-white text-xl tracking-tight leading-none">
                  Esther <span className="gradient-text-brand">Garage</span>
                </span>
                <p className="text-brand-400 text-[10px] font-semibold tracking-widest uppercase mt-0.5">Premium Automotive Workshop</p>
              </div>
            </Link>
            
            <p className="text-auto-400 text-sm leading-relaxed mb-8 max-w-sm">
              Bengkel modern terpercaya di Sumatera Barat sejak 2015. Teknologi diagnostik terkini, 
              mekanik bersertifikat, dan transparansi harga tanpa kejutan.
            </p>
            
            <div className="space-y-3 mb-8">
              {[
                { icon: MdLocationOn, text: 'Bukittinggi, Sumatera Barat' },
                { icon: MdPhone, text: '+62 887-082-30676' },
                { icon: MdEmail, text: 'febby24si@mahasiswa.pcr.ac.id' },
                { icon: MdAccessTime, text: 'Senin–Sabtu, 08.00–18.00 WIB' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3 text-sm text-auto-400">
                  <Icon className="text-brand-400 text-base mt-0.5 flex-shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              {[FaInstagram, FaFacebookF, FaYoutube].map((Icon, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-auto-400 hover:text-white bg-auto-800/50 hover:bg-brand-500/20 border border-auto-700/50 hover:border-brand-500/30 transition-all"
                >
                  <Icon className="text-sm" />
                </motion.button>
              ))}
              <a href="https://wa.me/6288708230676" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-brand-300 text-sm font-medium px-4 py-2 rounded-xl transition-all ml-2"
                style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}
              >
                <FaWhatsapp className="text-base" />
                WhatsApp
              </a>
            </div>
          </div>

          {/* Layanan */}
          <FooterColumn title="Layanan">
            {footerLinks.layanan.map((l) => (
              <li key={l}>
                <Link to="/guest/layanan" className="text-auto-400 hover:text-brand-300 text-sm transition-colors flex items-center gap-1 group">
                  <span className="w-1 h-1 rounded-full bg-auto-600 group-hover:bg-brand-400 transition-colors" />
                  {l}
                </Link>
              </li>
            ))}
          </FooterColumn>

          {/* Area Pelanggan */}
          <FooterColumn title="Area Pelanggan">
            {footerLinks.pelanggan.map(({ label, path }) => (
              <li key={label}>
                <Link to={path} className="text-auto-400 hover:text-brand-300 text-sm transition-colors flex items-center gap-1 group">
                  <span className="w-1 h-1 rounded-full bg-auto-600 group-hover:bg-brand-400 transition-colors" />
                  {label}
                </Link>
              </li>
            ))}
          </FooterColumn>

          {/* Info */}
          <FooterColumn title="Informasi">
            {footerLinks.info.map((l) => (
              <li key={l}>
                <Link to="/guest" className="text-auto-400 hover:text-brand-300 text-sm transition-colors flex items-center gap-1 group">
                  <span className="w-1 h-1 rounded-full bg-auto-600 group-hover:bg-brand-400 transition-colors" />
                  {l}
                </Link>
              </li>
            ))}
            <li className="mt-6">
              <p className="text-auto-500 text-xs uppercase tracking-widest mb-3 font-semibold">Sertifikasi</p>
              <div className="flex flex-wrap gap-2">
                {['ISO 9001', 'AHM', 'TAM', 'Bosch'].map((c) => (
                  <span key={c} className="text-xs px-3 py-1.5 rounded-lg font-medium bg-brand-500/10 text-brand-300 border border-brand-500/20">
                    {c}
                  </span>
                ))}
              </div>
            </li>
          </FooterColumn>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t border-auto-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-auto-500 text-xs">
            © {new Date().getFullYear()} Esther Garage. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/guest" className="text-auto-500 hover:text-brand-300 text-xs transition-colors">Privacy</Link>
            <Link to="/guest" className="text-auto-500 hover:text-brand-300 text-xs transition-colors">Terms</Link>
            <span className="text-auto-600 text-xs">Powered by Esther Garage CRM v2.5</span>
          </div>
        </div>
      </div>
    </footer>
  )
}