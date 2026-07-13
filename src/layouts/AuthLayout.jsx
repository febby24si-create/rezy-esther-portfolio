import { motion } from 'framer-motion';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { MdVerified, MdBuild, MdStar } from 'react-icons/md';
import logo from '../assets/logo2.png';
import VideoBackground from '../components/VideoBackground';

const routeConfigs = {
  '/login': {
    title: 'Selamat Datang Kembali',
    subtitle: 'Masuk untuk mengelola bengkel atau akses layanan member',
    badge: 'Portal Masuk',
    tagline: 'Sistem Manajemen & Layanan',
  },
  '/register': {
    title: 'Bergabung dengan Kami',
    subtitle: 'Daftar sebagai admin bengkel atau member untuk layanan eksklusif',
    badge: 'Pendaftaran',
    tagline: 'Mulai Pengalaman Premium',
  },
  '/forgot': {
    title: 'Reset Password',
    subtitle: 'Masukkan email untuk menerima tautan reset password',
    badge: 'Pemulihan Akun',
    tagline: 'Pemulihan Kredensial',
  },
};

const statCards = [
  { icon: <MdBuild className="text-emerald-400 text-lg" />, value: '5.000+', label: 'Services Completed' },
  { icon: <MdStar className="text-yellow-400 text-lg" />, value: '4.9', label: 'Customer Rating' },
  { icon: <MdVerified className="text-blue-400 text-lg" />, value: '10+', label: 'Certified Mechanics' },
];

export default function AuthLayout() {
  const location = useLocation();
  const currentPath = location.pathname;
  const config = routeConfigs[currentPath] || routeConfigs['/login'];

  return (
    <div className="min-h-screen w-full flex relative overflow-hidden bg-garage-950 text-white font-body">
      {/* LEFT SIDE: BRANDING (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[48%] relative min-h-screen flex-col overflow-hidden">
        <VideoBackground
          poster="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1920&auto=format&fit=crop"
          className="z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-[2]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020f09] via-transparent to-black/40 z-[2]" />
        <div
          className="absolute inset-0 z-[3] opacity-8 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(37,99,235,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.04) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
        <div className="relative z-10 flex flex-col justify-between h-full p-12 xl:p-16">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-xl overflow-hidden border shadow-lg transition-all duration-500 group-hover:scale-105"
                style={{ borderColor: 'rgba(37,99,235,0.3)', boxShadow: '0 0 24px rgba(37,99,235,0.15)' }}>
                <img src={logo} alt="EstherGarage" className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold tracking-wide text-white">
                  ESTHER<span className="text-blue-400">GARAGE</span>
                </h2>
              </div>
            </Link>
          </motion.div>
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-widest uppercase border-brand"
                style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                {config.badge}
              </span>
              <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight">{config.title}</h1>
              <p className="text-gray-400 text-sm xl:text-base max-w-md leading-relaxed">{config.subtitle}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="space-y-3">
              {statCards.map((item, i) => (
                <motion.div key={item.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-md w-fit"
                  style={{ background: 'rgba(2,15,9,0.6)', border: '1px solid rgba(37,99,235,0.12)' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-500/15">{item.icon}</div>
                  <div>
                    <div className="text-white font-bold text-sm leading-tight">{item.value}</div>
                    <div className="text-gray-400 text-[11px] leading-tight mt-0.5">{item.label}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }}
            className="text-gray-500 text-xs tracking-wider">
            &copy; 2026 EstherGarage &mdash; {config.tagline}
          </motion.p>
        </div>
      </div>

      {/* RIGHT SIDE: FORM PANEL */}
      <div className="w-full lg:w-[55%] xl:w-[52%] min-h-screen flex items-center justify-center relative overflow-y-auto">
        <div className="absolute inset-0" style={{ background: '#020f09' }} />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(37,99,235,0.3) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-0 left-0 right-0 h-[1px] z-10"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.15), transparent)' }} />
        <div className="relative z-10 w-full max-w-md px-6 py-12">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden border shadow-lg"
                style={{ borderColor: 'rgba(37,99,235,0.3)', boxShadow: '0 0 20px rgba(37,99,235,0.15)' }}>
                <img src={logo} alt="EstherGarage" className="w-full h-full object-cover" />
              </div>
              <h2 className="text-lg font-extrabold tracking-wide text-white">
                ESTHER<span className="text-blue-400">GARAGE</span>
              </h2>
            </Link>
          </motion.div>
          <motion.div key={currentPath} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Outlet />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
