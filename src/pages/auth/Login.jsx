import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdPerson, MdAdminPanelSettings } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { authAPI } from '../../services/authAPI';
import { motion, AnimatePresence } from 'framer-motion';

const ROLES = [
  { key: 'member', label: 'Member', icon: MdPerson },
  { key: 'admin', label: 'Admin', icon: MdAdminPanelSettings },
];

// ── Error Alert ─────────────────────────────
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

// ── Member Login Form ────────────────────────
function MemberLoginForm() {
  const navigate = useNavigate();
  const { login } = useCustomerAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(form.email, form.password);
    if (result.success) {
      navigate('/member/dashboard');
    } else {
      setError(result.message || 'Email atau password salah.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorAlert message={error} />
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
        <div className="relative group">
          <MdEmail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-blue-400" size={18} />
          <input type="email" required value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="vip@esthergarage.id"
            className="w-full pl-11 pr-4 py-3 bg-garage-950/60 border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/30 disabled:opacity-60" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
        <div className="relative group">
          <MdLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-blue-400" size={18} />
          <input type={showPass ? 'text' : 'password'} required value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            placeholder="Min. 6 karakter"
            className="w-full pl-11 pr-11 py-3 bg-garage-950/60 border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/30 disabled:opacity-60" />
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
            {showPass ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs">
        <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
          <input type="checkbox" className="w-3.5 h-3.5 rounded border-white/20 bg-garage-950/60 accent-blue-500" />
          Remember me
        </label>
        <Link to="/forgot" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Lupa Password?</Link>
      </div>
      <motion.button whileHover={{ scale: 1.01, boxShadow: '0 0 20px rgba(37,99,235,0.4)' }} whileTap={{ scale: 0.99 }}
        type="submit" disabled={loading}
        className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 cursor-pointer bg-gradient-to-r from-blue-600 to-blue-500 border-none flex items-center justify-center mt-2 disabled:opacity-75 shadow-lg"
        style={{ boxShadow: '0 4px 15px rgba(37,99,235,0.3)' }}>
        {loading ? (
          <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Memproses...</span>
        ) : 'Masuk Portal Member'}
      </motion.button>
      <div className="mt-4 p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/10 space-y-1.5">
        <p className="text-[10px] text-blue-300 font-bold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> Demo Member
        </p>
        <div className="grid grid-cols-2 gap-1 text-[11px]">
          <p className="text-gray-500">Email: <span className="text-blue-300 font-mono">vip@esthergarage.id</span></p>
          <p className="text-gray-500">Pass: <span className="text-blue-300 font-mono">vip123</span></p>
        </div>
      </div>
    </form>
  );
}

// ── Admin Login Form ────────────────────────
function AdminLoginForm() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await authAPI.loginUser(form.email, form.password);
      if (result.length === 0) {
        setError('Email atau password salah.');
        return;
      }
      const found = result[0];
      loginWithToken('supabase_' + Date.now(), { name: found.name, email: found.email, role: found.role, id: found.id });
      navigate('/dashboard');
    } catch (err) {
      setError('Terjadi kesalahan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorAlert message={error} />
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email Address</label>
        <div className="relative group">
          <MdEmail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-blue-400" size={18} />
          <input type="email" required value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="admin@esthergarage.id"
            className="w-full pl-11 pr-4 py-3 bg-garage-950/60 border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/30 disabled:opacity-60" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
        <div className="relative group">
          <MdLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-blue-400" size={18} />
          <input type={showPass ? 'text' : 'password'} required value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            placeholder="Min. 8 karakter"
            className="w-full pl-11 pr-11 py-3 bg-garage-950/60 border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/30 disabled:opacity-60" />
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
            {showPass ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs">
        <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
          <input type="checkbox" className="w-3.5 h-3.5 rounded border-white/20 bg-garage-950/60 accent-blue-500" />
          Remember me
        </label>
        <Link to="/forgot" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Lupa Password?</Link>
      </div>
      <motion.button whileHover={{ scale: 1.01, boxShadow: '0 0 20px rgba(37,99,235,0.4)' }} whileTap={{ scale: 0.99 }}
        type="submit" disabled={loading}
        className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 cursor-pointer bg-gradient-to-r from-blue-600 to-blue-500 border-none flex items-center justify-center mt-2 disabled:opacity-75 shadow-lg"
        style={{ boxShadow: '0 4px 15px rgba(37,99,235,0.3)' }}>
        {loading ? (
          <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menghubungkan...</span>
        ) : 'Masuk ke Dashboard Admin'}
      </motion.button>
    </form>
  );
}

// ── Google Button ───────────────────────────
function GoogleButton() {
  return (
    <button type="button"
      className="w-full py-2.5 rounded-xl text-sm font-medium text-gray-300 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2.5 border border-white/10 hover:border-white/20 hover:bg-white/5 mt-3">
      <svg className="w-4 h-4" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      Lanjutkan dengan Google
    </button>
  );
}

// ── Main Login Component ────────────────────
export default function Login() {
  const [role, setRole] = useState('member');

  return (
    <div className="w-full">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
        className="mb-6 text-center">
        <h1 className="text-2xl font-extrabold text-white">Masuk</h1>
        <p className="text-gray-400 text-sm mt-1">Pilih peran untuk melanjutkan</p>
      </motion.div>

      <div className="flex p-1 rounded-xl mb-6"
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

      <div className="relative min-h-[280px]">
        <AnimatePresence mode="wait">
          <motion.div key={role} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}>
            {role === 'member' ? <MemberLoginForm /> : <AdminLoginForm />}
          </motion.div>
        </AnimatePresence>
      </div>

      <GoogleButton />

      <p className="text-center text-xs sm:text-sm text-gray-400 mt-6">
        Belum punya akun?{' '}
        <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
          Daftar Sekarang
        </Link>
      </p>
    </div>
  );
}
