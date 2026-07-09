import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MdEmail, MdArrowBack, MdCheckCircle, MdPerson, MdAdminPanelSettings } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../../services/authAPI';
import AlertBox from '../../components/AlertBox';

const ROLES = [
  { key: 'member', label: 'Member', icon: MdPerson },
  { key: 'admin', label: 'Admin', icon: MdAdminPanelSettings },
];

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function ErrorAlert({ message }) {
  if (!message) return null;
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      className="p-3 rounded-xl text-sm text-red-400 flex items-center gap-2 border border-red-500/25 bg-red-500/10">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse shrink-0" />
      {message}
    </motion.div>
  );
}

// ── Member Forgot Form ──────────────────────
function MemberForgotForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Email wajib diisi.'); return; }
    if (!isValidEmail(email)) { setError('Format email tidak valid.'); return; }
    setLoading(true);
    try {
      const exists = await authAPI.checkEmailExists(email.trim());
      if (!exists) { setError('Email tidak ditemukan.'); return; }
      setSent(true);
    } catch (err) {
      setError('Terjadi kesalahan: ' + err.message);
    } finally { setLoading(false); }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center text-center py-6">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <MdCheckCircle className="text-green-400" size={28} />
        </div>
        <h3 className="text-white font-semibold text-sm mb-1">Instruksi Terkirim</h3>
        <p className="text-gray-400 text-xs leading-relaxed">
          Kami telah memverifikasi email <span className="text-blue-300 font-medium">{email}</span> pada sistem kami.
          Silakan cek email Anda untuk reset password.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorAlert message={error} />
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
        <div className="relative group">
          <MdEmail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-blue-400" size={18} />
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="email@contoh.com" disabled={loading}
            className="w-full pl-11 pr-4 py-3 bg-garage-950/60 border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/30 disabled:opacity-60" />
        </div>
      </div>
      <motion.button whileHover={{ scale: loading ? 1 : 1.01, boxShadow: '0 0 20px rgba(37,99,235,0.4)' }} whileTap={{ scale: loading ? 1 : 0.99 }}
        type="submit" disabled={loading}
        className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 cursor-pointer bg-gradient-to-r from-blue-600 to-blue-500 border-none flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
        style={{ boxShadow: '0 4px 15px rgba(37,99,235,0.3)' }}>
        {loading ? (
          <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Memverifikasi...</span>
        ) : 'Kirim Link Reset'}
      </motion.button>
    </form>
  );
}

// ── Admin Forgot Form ──────────────────────
function AdminForgotForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Email wajib diisi.'); return; }
    if (!isValidEmail(email)) { setError('Format email tidak valid.'); return; }
    setLoading(true);
    try {
      const exists = await authAPI.checkEmailExists(email.trim());
      if (!exists) { setError('Email tidak ditemukan.'); return; }
      setSent(true);
    } catch (err) {
      setError('Terjadi kesalahan: ' + err.message);
    } finally { setLoading(false); }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center text-center py-6">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}>
          <MdCheckCircle className="text-green-400" size={28} />
        </div>
        <h3 className="text-white font-semibold text-sm mb-1">Instruksi Terkirim</h3>
        <p className="text-gray-400 text-xs leading-relaxed">
          Email <span className="text-amber-300 font-medium">{email}</span> telah terverifikasi.
          Silakan cek email Anda untuk reset password.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <AlertBox type="error">{error}</AlertBox>}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
        <div className="relative group">
          <MdEmail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-blue-400" size={18} />
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@esthergarage.id" disabled={loading}
            className="w-full pl-11 pr-4 py-3 bg-garage-950/60 border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/30 disabled:opacity-60" />
        </div>
      </div>
      <motion.button whileHover={{ scale: loading ? 1 : 1.01, boxShadow: '0 0 20px rgba(37,99,235,0.4)' }} whileTap={{ scale: loading ? 1 : 0.99 }}
        type="submit" disabled={loading}
        className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 cursor-pointer bg-gradient-to-r from-blue-600 to-blue-500 border-none flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
        style={{ boxShadow: '0 4px 15px rgba(37,99,235,0.3)' }}>
        {loading ? (
          <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Memverifikasi...</span>
        ) : 'Kirim Link Reset'}
      </motion.button>
    </form>
  );
}

// ── Main Forgot Component ───────────────────
export default function Forgot() {
  const [role, setRole] = useState('member');

  return (
    <div className="w-full">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
        className="mb-5 text-center">
        <h1 className="text-2xl font-extrabold text-white">Reset Password</h1>
        <p className="text-gray-400 text-sm mt-1">Pilih peran untuk reset password</p>
      </motion.div>

      <div className="flex p-1 rounded-xl mb-5"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {ROLES.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setRole(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
              role === key
                ? 'bg-blue-500/15 text-blue-400 shadow-sm border border-blue-500/20'
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}>
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <div className="relative min-h-[160px]">
        <AnimatePresence mode="wait">
          <motion.div key={role} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}>
            {role === 'member' ? <MemberForgotForm /> : <AdminForgotForm />}
          </motion.div>
        </AnimatePresence>
      </div>

      <Link to="/login" className="flex items-center justify-center gap-1.5 text-xs sm:text-sm text-gray-400 hover:text-blue-300 transition-colors mt-5 font-medium">
        <MdArrowBack size={16} /> Kembali ke halaman login
      </Link>
    </div>
  );
}
