import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdPerson, MdEmail, MdLock, MdPhone, MdAdminPanelSettings, MdCake, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { authAPI } from '../../services/authAPI';
import { motion, AnimatePresence } from 'framer-motion';
import AlertBox from '../../components/AlertBox';

const ROLES = [
  { key: 'member', label: 'Member', icon: MdPerson },
  { key: 'admin', label: 'Admin', icon: MdAdminPanelSettings },
];

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

// ── Member Register Form ────────────────────
function MemberRegisterForm() {
  const navigate = useNavigate();
  const { register } = useCustomerAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', birthDate: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Konfirmasi password tidak cocok.'); return; }
    if (form.password.length < 6) { setError('Password minimal 6 karakter.'); return; }
    setLoading(true);
    const result = await register({ name: form.name, email: form.email, phone: form.phone, birthDate: form.birthDate, password: form.password });
    if (result.success) navigate('/member/dashboard');
    else setError(result.message || 'Pendaftaran gagal.');
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <ErrorAlert message={error} />
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
        <div className="relative group">
          <MdPerson className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-blue-400" size={18} />
          <input type="text" required value={form.name} onChange={set('name')} placeholder="Nama Anda"
            className="w-full pl-11 pr-4 py-2.5 bg-garage-950/60 border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/30" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
        <div className="relative group">
          <MdEmail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-blue-400" size={18} />
          <input type="email" required value={form.email} onChange={set('email')} placeholder="email@contoh.com"
            className="w-full pl-11 pr-4 py-2.5 bg-garage-950/60 border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/30" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">No. HP</label>
          <div className="relative group">
            <MdPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-blue-400" size={18} />
            <input type="tel" value={form.phone} onChange={set('phone')} placeholder="0812-xxxx"
              className="w-full pl-11 pr-4 py-2.5 bg-garage-950/60 border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/30" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Tgl. Lahir</label>
          <div className="relative group">
            <MdCake className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-blue-400" size={18} />
            <input type="date" value={form.birthDate} onChange={set('birthDate')}
              className="w-full pl-11 pr-4 py-2.5 bg-garage-950/60 border border-white/5 rounded-xl text-sm text-white outline-none transition-all focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/30" style={{ colorScheme: 'dark' }} />
          </div>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
        <div className="relative group">
          <MdLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-blue-400" size={18} />
          <input type={showPass ? 'text' : 'password'} required value={form.password} onChange={set('password')} placeholder="Min. 6 karakter"
            className="w-full pl-11 pr-11 py-2.5 bg-garage-950/60 border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/30" />
          <button type="button" onClick={() => setShowPass(!showPass)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
            {showPass ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Konfirmasi Password</label>
        <div className="relative group">
          <MdLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-blue-400" size={18} />
          <input type={showPass ? 'text' : 'password'} required value={form.confirm} onChange={set('confirm')} placeholder="Ulangi password"
            className="w-full pl-11 pr-4 py-2.5 bg-garage-950/60 border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/30" />
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 justify-center">
        {['50 Poin Gratis', 'Voucher 15% Off', 'Booking Online', 'Tracking Real-time'].map(b => (
          <span key={b} className="text-[10px] px-2.5 py-1 rounded-full font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400">&#10003; {b}</span>
        ))}
      </div>
      <motion.button whileHover={{ scale: 1.01, boxShadow: '0 0 20px rgba(37,99,235,0.4)' }} whileTap={{ scale: 0.99 }}
        type="submit" disabled={loading}
        className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 cursor-pointer bg-gradient-to-r from-blue-600 to-blue-500 border-none flex items-center justify-center mt-1 disabled:opacity-75 shadow-lg"
        style={{ boxShadow: '0 4px 15px rgba(37,99,235,0.3)' }}>
        {loading ? (
          <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Mendaftar...</span>
        ) : 'Daftar Gratis'}
      </motion.button>
    </form>
  );
}

// ── Admin Register Form ────────────────────
function AdminRegisterForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await authAPI.registerUser({ name: form.name, email: form.email, password: form.password, role: form.role });
      setSuccess('Registrasi berhasil! Silakan login.');
      setForm({ name: '', email: '', password: '', role: 'user' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError('Registrasi gagal: ' + err.message);
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {error && <AlertBox type="error">{error}</AlertBox>}
      {success && <AlertBox type="success">{success}</AlertBox>}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
        <div className="relative group">
          <MdPerson className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-blue-400" size={18} />
          <input type="text" name="name" required value={form.name} onChange={handleChange} placeholder="Nama Anda"
            className="w-full pl-11 pr-4 py-2.5 bg-garage-950/60 border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/30 disabled:opacity-60" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
        <div className="relative group">
          <MdEmail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-blue-400" size={18} />
          <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="admin@esthergarage.id"
            className="w-full pl-11 pr-4 py-2.5 bg-garage-950/60 border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/30 disabled:opacity-60" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Password</label>
        <div className="relative group">
          <MdLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-blue-400" size={18} />
          <input type="password" name="password" required value={form.password} onChange={handleChange} placeholder="Min. 6 karakter"
            className="w-full pl-11 pr-4 py-2.5 bg-garage-950/60 border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 outline-none transition-all focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/30 disabled:opacity-60" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Role</label>
        <div className="relative group">
          <MdAdminPanelSettings className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-blue-400" size={18} />
          <select name="role" value={form.role} onChange={handleChange} disabled={loading}
            className="w-full pl-11 pr-4 py-2.5 bg-garage-950/60 border border-white/5 rounded-xl text-sm text-white outline-none transition-all focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/30 disabled:opacity-60 appearance-none">
            <option value="user" className="bg-garage-900">User</option>
            <option value="admin" className="bg-garage-900">Admin</option>
            <option value="mekanik" className="bg-garage-900">Mekanik</option>
          </select>
        </div>
      </div>
      <motion.button whileHover={{ scale: 1.01, boxShadow: '0 0 20px rgba(37,99,235,0.4)' }} whileTap={{ scale: 0.99 }}
        type="submit" disabled={loading}
        className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 cursor-pointer bg-gradient-to-r from-blue-600 to-blue-500 border-none flex items-center justify-center mt-1 disabled:opacity-75 shadow-lg"
        style={{ boxShadow: '0 4px 15px rgba(37,99,235,0.3)' }}>
        {loading ? (
          <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</span>
        ) : 'Daftar Sekarang'}
      </motion.button>
    </form>
  );
}

// ── Main Register Component ─────────────────
export default function Register() {
  const [role, setRole] = useState('member');

  return (
    <div className="w-full">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
        className="mb-5 text-center">
        <h1 className="text-2xl font-extrabold text-white">Buat Akun</h1>
        <p className="text-gray-400 text-sm mt-1">Pilih peran untuk mendaftar</p>
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

      <div className="relative min-h-[320px]">
        <AnimatePresence mode="wait">
          <motion.div key={role} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}>
            {role === 'member' ? <MemberRegisterForm /> : <AdminRegisterForm />}
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="text-center text-xs sm:text-sm text-gray-400 mt-5">
        Sudah punya akun?{' '}
        <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
          Masuk di sini
        </Link>
      </p>
    </div>
  );
}
