// ============================================================
// MembershipAdmin.jsx — /membership
// Halaman manajemen membership untuk admin
// Tab: Overview | Daftar Member | Kelola Poin | Reward & Voucher
// ============================================================
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdPeople, MdStars, MdCardMembership, MdBarChart, MdAdd, MdRemove,
  MdSearch, MdDownload, MdClose, MdCheck, MdEdit, MdDelete,
  MdFilterList, MdEmojiEvents, MdTrendingUp, MdCardGiftcard,
  MdPerson, MdHistory, MdSave,
} from 'react-icons/md'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from 'recharts'
import {
  getAllCustomers,
  calcTier,
  calcLoyaltyProgress,
  TIER_CONFIG,
  adminAddPointsToCustomer,
} from '../context/CustomerAuthContext'

// ─── Palette ─────────────────────────────────────────────────
const TIER_COLORS = {
  Bronze: '#F97316', Silver: '#94A3B8', Gold: '#FBBF24', Platinum: '#A855F7',
}

const REWARD_CATALOG = [
  { id: 'R01', name: 'Diskon 10% Service',   category: 'Voucher',      points: 500,  diskonPct: 10, minTier: 'Bronze'  },
  { id: 'R02', name: 'Cuci Mobil Gratis',    category: 'Service',      points: 300,  diskonPct: 100, minTier: 'Bronze' },
  { id: 'R03', name: 'Voucher Rp 100.000',   category: 'Voucher',      points: 800,  diskonPct: 15, minTier: 'Silver'  },
  { id: 'R04', name: 'Ganti Oli Gratis',     category: 'Service',      points: 1000, diskonPct: 100, minTier: 'Silver' },
  { id: 'R05', name: 'Tune Up Gratis',       category: 'Service',      points: 2000, diskonPct: 100, minTier: 'Gold'   },
  { id: 'R06', name: 'Service Berkala Gratis',category:'Service',      points: 2500, diskonPct: 100, minTier: 'Gold'   },
  { id: 'R07', name: 'Merchandise Esther',   category: 'Merchandise',  points: 1500, diskonPct: 0,  minTier: 'Silver'  },
  { id: 'R08', name: 'Diskon 20% Platinum',  category: 'Voucher',      points: 600,  diskonPct: 20, minTier: 'Platinum'},
]

const POINT_REASONS = [
  'Bonus Servis Terjadwal', 'Kompensasi Keluhan Customer', 'Campaign Loyalitas',
  'Koreksi Poin', 'Bonus Ulang Tahun', 'Referral Program', 'Event Khusus',
]

// ─── Stat Card ───────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-2xl p-5"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18` }}>
          <Icon size={20} style={{ color }} />
        </div>
      </div>
      <p className="text-white font-extrabold text-2xl">{value}</p>
      <p className="text-gray-400 text-xs mt-0.5">{label}</p>
      {sub && <p className="text-xs mt-1" style={{ color }}>{sub}</p>}
    </motion.div>
  )
}

// ─── Manual Point Adjustment Modal ───────────────────────────
function PointAdjustModal({ customer, onClose, onSave }) {
  const [amount, setAmount]  = useState('')
  const [type, setType]      = useState('add') // 'add' | 'reduce'
  const [reason, setReason]  = useState(POINT_REASONS[0])
  const [note, setNote]      = useState('')
  const [saving, setSaving]  = useState(false)

  const handleSave = () => {
    const val = parseInt(amount)
    if (!val || val <= 0) return
    setSaving(true)
    const finalAmount = type === 'add' ? val : -val
    onSave(customer.id, finalAmount, reason, note)
    setTimeout(() => { setSaving(false); onClose() }, 600)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: '#041C15', border: '1px solid rgba(34,197,94,0.2)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold">Kelola Poin — {customer.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><MdClose size={20} /></button>
        </div>

        <div className="mb-4 p-3 rounded-xl text-center"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-gray-400 text-xs mb-0.5">Saldo Poin Saat Ini</p>
          <p className="text-white font-extrabold text-3xl">{(customer.points || 0).toLocaleString('id-ID')}</p>
          <p className="text-xs mt-0.5" style={{ color: TIER_CONFIG[calcTier(customer.points || 0)].color }}>
            {TIER_CONFIG[calcTier(customer.points || 0)].icon} {calcTier(customer.points || 0)}
          </p>
        </div>

        <div className="space-y-4">
          {/* Type toggle */}
          <div className="flex gap-2">
            {[
              { id: 'add',    label: '+ Tambah Poin', color: '#22C55E' },
              { id: 'reduce', label: '− Kurangi Poin', color: '#EF4444' },
            ].map(t => (
              <button key={t.id} onClick={() => setType(t.id)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={type === t.id
                  ? { background: `${t.color}20`, color: t.color, border: `1px solid ${t.color}50` }
                  : { background: 'rgba(255,255,255,0.04)', color: '#6B7280', border: '1px solid rgba(255,255,255,0.08)' }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Jumlah Poin</label>
            <input type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="Contoh: 100"
              className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>

          {/* Reason */}
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Alasan</label>
            <select value={reason} onChange={e => setReason(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none"
              style={{ background: '#041C15', border: '1px solid rgba(255,255,255,0.1)' }}>
              {POINT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Note */}
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Catatan Admin (opsional)</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
              placeholder="Catatan tambahan..."
              className="w-full px-4 py-2 rounded-xl text-white text-sm outline-none resize-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>

          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-gray-400 text-sm border border-white/10 hover:border-white/20">
              Batal
            </button>
            <button onClick={handleSave} disabled={!amount || saving}
              className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: type === 'add' ? 'linear-gradient(135deg,#16A34A,#22C55E)' : 'linear-gradient(135deg,#DC2626,#EF4444)' }}>
              {saving ? '...' : <><MdSave size={14} /> Simpan</>}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Create Voucher Modal ─────────────────────────────────────
function CreateVoucherModal({ customer, onClose, onSave }) {
  const [form, setForm] = useState({
    title: '', diskon: 10, validDays: 30,
  })

  const handleSave = () => {
    const validUntil = new Date(Date.now() + form.validDays * 86400000).toISOString().slice(0, 10)
    onSave(customer.id, { ...form, validUntil })
    onClose()
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: '#041C15', border: '1px solid rgba(168,85,247,0.25)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold">Buat Voucher Manual — {customer.name}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><MdClose size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Nama Voucher</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Contoh: Voucher VIP Spesial"
              className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Diskon (%)</label>
            <input type="number" min="1" max="100" value={form.diskon}
              onChange={e => setForm(p => ({ ...p, diskon: Number(e.target.value) }))}
              className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
          <div>
            <label className="text-gray-400 text-xs mb-1 block">Berlaku (hari dari sekarang)</label>
            <input type="number" min="1" value={form.validDays}
              onChange={e => setForm(p => ({ ...p, validDays: Number(e.target.value) }))}
              className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
          <div className="flex gap-3 mt-2">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-gray-400 text-sm border border-white/10">Batal</button>
            <button onClick={handleSave} disabled={!form.title}
              className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#A855F7)' }}>
              Buat Voucher
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────
export default function MembershipAdmin() {
  const navigate  = useNavigate()
  const [tab, setTab] = useState('overview')
  const [customers, setCustomers] = useState([])
  const [search, setSearch]       = useState('')
  const [tierFilter, setTierFilter] = useState('all')
  const [pointModal, setPointModal] = useState(null) // customer obj
  const [voucherModal, setVoucherModal] = useState(null)
  const [toast, setToast]         = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // FIX: Load semua customer (merge LS + JSON) setiap refreshKey berubah
  // dan juga saat storage event dari tab lain
  useEffect(() => {
    setCustomers(getAllCustomers())
  }, [refreshKey])

  useEffect(() => {
    // Sync jika ada perubahan dari tab/window lain (eg_customers berubah)
    const handleStorageSync = () => setCustomers(getAllCustomers())
    window.addEventListener('storage', handleStorageSync)
    return () => window.removeEventListener('storage', handleStorageSync)
  }, [])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // ── Stats ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    const active   = customers.filter(c => c.membershipStatus === 'active')
    const byTier   = { Bronze: 0, Silver: 0, Gold: 0, Platinum: 0 }
    active.forEach(c => { byTier[calcTier(c.points || 0)]++ })
    const totalPts = active.reduce((s, c) => s + (c.points || 0), 0)
    const topCustomer = [...active].sort((a, b) => (b.points || 0) - (a.points || 0))[0]
    const convRate = customers.length > 0 ? Math.round((active.length / customers.length) * 100) : 0
    return { active, byTier, totalPts, topCustomer, convRate, total: customers.length }
  }, [customers])

  const tierPieData = Object.entries(stats.byTier)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value, color: TIER_COLORS[name] }))

  // Monthly member growth (simulated from joinDate)
  const growthData = useMemo(() => {
    const months = {}
    customers.filter(c => c.memberSince).forEach(c => {
      const m = c.memberSince.slice(0, 7)
      months[m] = (months[m] || 0) + 1
    })
    return Object.entries(months).sort(([a], [b]) => a.localeCompare(b))
      .slice(-6).map(([month, count]) => ({
        month: new Date(month).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
        count,
      }))
  }, [customers])

  // ── Filtered member list ───────────────────────────────────
  const filteredMembers = useMemo(() => {
    return customers
      .filter(c => c.membershipStatus === 'active')
      .filter(c => tierFilter === 'all' ? true : calcTier(c.points || 0) === tierFilter)
      .filter(c => {
        if (!search) return true
        const q = search.toLowerCase()
        return c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
      })
      .sort((a, b) => (b.points || 0) - (a.points || 0))
  }, [customers, search, tierFilter])

  // ── CSV Export ─────────────────────────────────────────────
  const exportCSV = () => {
    const header = 'ID,Nama,Email,Tier,Poin,Total Servis,Total Pengeluaran,Bergabung'
    const rows = filteredMembers.map(c =>
      [c.id, c.name, c.email, calcTier(c.points||0), c.points||0,
       c.totalOrders||0, c.totalSpent||0, c.memberSince||''].join(',')
    )
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url
    a.download = `esther-members-${new Date().toISOString().slice(0,10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  // ── Handler: adjust points ─────────────────────────────────
  const handleAdjustPoints = (customerId, amount, reason, note) => {
    const customers = getAllCustomers()
    const idx = customers.findIndex(c => c.id === customerId)
    if (idx === -1) return
    const isPositive = amount > 0
    customers[idx] = {
      ...customers[idx],
      points: Math.max(0, (customers[idx].points || 0) + amount),
      pointHistory: [
        {
          id: 'LP-ADM-' + Date.now(),
          type: isPositive ? 'in' : 'out',
          desc: reason,
          points: amount,
          date: new Date().toISOString().slice(0, 10),
          createdBy: 'admin',
          adminNote: note,
        },
        ...(customers[idx].pointHistory || []),
      ],
    }
    localStorage.setItem('eg_customers', JSON.stringify(customers))
    setRefreshKey(k => k + 1)
    showToast(`Poin berhasil ${isPositive ? 'ditambahkan' : 'dikurangi'} untuk ${customers[idx].name}`)
  }

  // ── Handler: create voucher ────────────────────────────────
  const handleCreateVoucher = (customerId, voucherData) => {
    const customers = getAllCustomers()
    const idx = customers.findIndex(c => c.id === customerId)
    if (idx === -1) return
    const newVoucher = {
      id:         'VC-MANUAL-' + Date.now(),
      code:       'MANUAL-' + Math.random().toString(36).slice(2,8).toUpperCase(),
      title:      voucherData.title,
      diskon:     voucherData.diskon,
      status:     'active',
      validUntil: voucherData.validUntil,
      type:       'manual',
      createdBy:  'admin',
    }
    customers[idx] = {
      ...customers[idx],
      vouchers: [newVoucher, ...(customers[idx].vouchers || [])],
    }
    localStorage.setItem('eg_customers', JSON.stringify(customers))
    setRefreshKey(k => k + 1)
    showToast(`Voucher berhasil dibuat untuk ${customers[idx].name}`)
  }

  const TABS = [
    { id: 'overview',  label: 'Overview',       icon: MdBarChart        },
    { id: 'members',   label: 'Daftar Member',  icon: MdPeople          },
    { id: 'points',    label: 'Kelola Poin',     icon: MdStars           },
    { id: 'rewards',   label: 'Reward & Voucher',icon: MdCardGiftcard    },
  ]

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ background: '#020f09' }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-white font-medium text-sm flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)', boxShadow: '0 8px 32px rgba(34,197,94,0.3)' }}>
            <MdCheck size={16} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {pointModal && (
          <PointAdjustModal
            customer={pointModal}
            onClose={() => setPointModal(null)}
            onSave={handleAdjustPoints}
          />
        )}
        {voucherModal && (
          <CreateVoucherModal
            customer={voucherModal}
            onClose={() => setVoucherModal(null)}
            onSave={handleCreateVoucher}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)' }}>
            <MdCardMembership size={20} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-white font-extrabold text-xl">Manajemen Membership</h1>
            <p className="text-gray-500 text-xs">{stats.active.length} member aktif dari {stats.total} customer</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-8 overflow-x-auto"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"
            style={tab === t.id
              ? { background: 'rgba(168,85,247,0.15)', color: '#A855F7', border: '1px solid rgba(168,85,247,0.25)' }
              : { color: '#6B7280' }}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: OVERVIEW ── */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={MdPeople}       label="Member Aktif"        value={stats.active.length}                      color="#22C55E"  delay={0}   />
            <StatCard icon={MdStars}        label="Total Poin Aktif"     value={stats.totalPts.toLocaleString('id-ID')}   color="#FBBF24"  delay={0.06} />
            <StatCard icon={MdTrendingUp}   label="Konversi Member"      value={`${stats.convRate}%`}                     color="#A855F7"  delay={0.12}
              sub={`${stats.total} total customer`} />
            <StatCard icon={MdEmojiEvents}  label="Top Member"           value={stats.topCustomer?.name?.split(' ')[0] || '—'}
              sub={stats.topCustomer ? `${stats.topCustomer.points || 0} poin` : ''}                                     color="#F97316"  delay={0.18} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Pie Chart Tier */}
            <div className="rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h3 className="text-white font-bold text-sm mb-4">Distribusi Tier</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={tierPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                      dataKey="value" nameKey="name" paddingAngle={3}>
                      {tierPieData.map(entry => (
                        <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v + ' member', n]}
                      contentStyle={{ background: '#041C15', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                      labelStyle={{ color: '#fff' }} itemStyle={{ color: '#9CA3AF' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-2">
                {tierPieData.map(t => (
                  <div key={t.name} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />
                    <span className="text-gray-400">{t.name}</span>
                    <span className="text-white font-bold">{t.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Growth Chart */}
            <div className="rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <h3 className="text-white font-bold text-sm mb-4">Pertumbuhan Member</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData}>
                    <defs>
                      <linearGradient id="memberGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#A855F7" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#A855F7" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#041C15', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                      labelStyle={{ color: '#fff' }} itemStyle={{ color: '#A855F7' }} />
                    <Area type="monotone" dataKey="count" stroke="#A855F7" strokeWidth={2}
                      fill="url(#memberGrad)" name="Member Baru" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top 5 Member */}
          <div className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h3 className="text-white font-bold text-sm mb-4">🏆 Top 5 Member Terloyalis</h3>
            <div className="space-y-3">
              {stats.active.sort((a,b) => (b.points||0)-(a.points||0)).slice(0,5).map((c, i) => {
                const tier = calcTier(c.points || 0)
                const cfg  = TIER_CONFIG[tier]
                const maxPts = stats.active[0]?.points || 1
                return (
                  <div key={c.id} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0"
                      style={{ background: i === 0 ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.05)',
                               color: i === 0 ? '#FBBF24' : '#6B7280' }}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-white text-sm font-semibold truncate">{c.name}</p>
                        <span className="text-xs px-1.5 py-0.5 rounded-md"
                          style={{ background: cfg.bg, color: cfg.color }}>{cfg.icon}</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${((c.points||0)/maxPts)*100}%`, background: cfg.color }} />
                      </div>
                    </div>
                    <p className="text-white font-bold text-sm flex-shrink-0">{(c.points||0).toLocaleString('id-ID')}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: DAFTAR MEMBER ── */}
      {tab === 'members' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama atau email..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-white text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
            <div className="flex gap-2">
              {['all','Bronze','Silver','Gold','Platinum'].map(t => (
                <button key={t} onClick={() => setTierFilter(t)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all"
                  style={tierFilter === t
                    ? { background: t === 'all' ? 'rgba(34,197,94,0.15)' : `${TIER_COLORS[t]}20`,
                        color: t === 'all' ? '#22C55E' : TIER_COLORS[t],
                        border: `1px solid ${t === 'all' ? '#22C55E' : TIER_COLORS[t]}50` }
                    : { background: 'rgba(255,255,255,0.04)', color: '#6B7280', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {t === 'all' ? 'Semua' : t}
                </button>
              ))}
            </div>
            <button onClick={exportCSV}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-white whitespace-nowrap"
              style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}>
              <MdDownload size={14} /> Export CSV
            </button>
          </div>

          <p className="text-gray-500 text-xs">{filteredMembers.length} member ditemukan</p>

          <div className="space-y-2">
            {filteredMembers.map((c, i) => {
              const tier = calcTier(c.points || 0)
              const cfg  = TIER_CONFIG[tier]
              return (
                <motion.div key={c.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="rounded-xl p-4 flex items-center gap-4"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: cfg.bg, color: cfg.color }}>
                    {c.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-semibold text-sm">{c.name}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                        {cfg.icon} {tier}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs">{c.email} · {c.membershipId || '—'}</p>
                  </div>
                  <div className="hidden sm:block text-right flex-shrink-0">
                    <p className="text-white font-bold text-sm">{(c.points||0).toLocaleString('id-ID')} poin</p>
                    <p className="text-gray-500 text-xs">{c.totalOrders||0}× servis</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => setPointModal(c)} title="Kelola Poin"
                      className="p-2 rounded-lg text-yellow-400 hover:bg-yellow-400/10 transition-colors">
                      <MdStars size={16} />
                    </button>
                    <button onClick={() => setVoucherModal(c)} title="Buat Voucher"
                      className="p-2 rounded-lg text-purple-400 hover:bg-purple-400/10 transition-colors">
                      <MdCardGiftcard size={16} />
                    </button>
                    <button onClick={() => navigate(`/customers/${c.id}`)} title="Detail"
                      className="p-2 rounded-lg text-blue-400 hover:bg-blue-400/10 transition-colors">
                      <MdPerson size={16} />
                    </button>
                  </div>
                </motion.div>
              )
            })}
            {filteredMembers.length === 0 && (
              <div className="py-16 text-center text-gray-600 text-sm">
                Tidak ada member yang sesuai filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: KELOLA POIN ── */}
      {tab === 'points' && (
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">Pilih member untuk melakukan penyesuaian poin secara manual.</p>
          <div className="relative mb-4">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari member..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-white text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
          <div className="space-y-2">
            {filteredMembers.map((c, i) => {
              const tier = calcTier(c.points || 0)
              const cfg  = TIER_CONFIG[tier]
              const lastAdj = (c.pointHistory||[]).find(h => h.createdBy === 'admin')
              return (
                <motion.div key={c.id}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.025 }}
                  className="rounded-xl p-4 flex items-center gap-4"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold text-sm">{c.name}</p>
                      <span className="text-xs font-bold" style={{ color: cfg.color }}>{cfg.icon} {tier}</span>
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {(c.points||0).toLocaleString('id-ID')} poin aktif
                      {lastAdj && <span className="ml-2 text-blue-400/70">· Terakhir disesuaikan: {lastAdj.date}</span>}
                    </p>
                  </div>
                  <button onClick={() => setPointModal(c)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-yellow-400 whitespace-nowrap"
                    style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
                    <MdStars size={14} /> Kelola Poin
                  </button>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── TAB: REWARD & VOUCHER ── */}
      {tab === 'rewards' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
              <MdCardGiftcard className="text-purple-400" /> Katalog Reward
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {REWARD_CATALOG.map(r => {
                const cfg = TIER_CONFIG[r.minTier]
                return (
                  <motion.div key={r.id} whileHover={{ scale: 1.03, y: -4 }} transition={{ type: 'spring', stiffness: 300 }}
                    className="rounded-2xl p-4"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-2xl">
                        {r.category === 'Voucher' ? '🎫' : r.category === 'Service' ? '🔧' : '🛍️'}
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                        {cfg.icon} {r.minTier}+
                      </span>
                    </div>
                    <p className="text-white font-semibold text-sm">{r.name}</p>
                    <p className="text-gray-500 text-xs">{r.category}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-yellow-400 font-extrabold">{r.points.toLocaleString('id-ID')} poin</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
              <MdCardGiftcard className="text-green-400" /> Buat Voucher Manual
            </h3>
            <p className="text-gray-500 text-sm mb-3">Pilih member dari tab "Daftar Member" untuk membuat voucher manual, atau gunakan daftar di bawah.</p>
            <div className="space-y-2">
              {customers.filter(c => c.membershipStatus === 'active').slice(0,10).map(c => (
                <div key={c.id} className="rounded-xl p-3 flex items-center gap-3"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold">{c.name}</p>
                    <p className="text-gray-500 text-xs">{c.email}</p>
                  </div>
                  <button onClick={() => setVoucherModal(c)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-purple-400"
                    style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
                    <MdAdd size={14} /> Buat Voucher
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
