// ============================================================
// ProfilCustomer.jsx — /guest/profil
// Halaman profil customer + kartu membership digital
// ============================================================
import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdPerson, MdEmail, MdPhone, MdCake, MdEdit, MdSave, MdClose,
  MdCardMembership, MdStars, MdEmojiEvents, MdHistory,
  MdArrowBack, MdCopyAll, MdCheck, MdLogout, MdDownload,
} from 'react-icons/md'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { calcLoyaltyProgress, TIER_CONFIG, TIER_BENEFITS, calcAchievements } from '../../lib/loyaltyConstants'
import { AnimatedPage, ScrollReveal, AnimatedProgress } from '../../components/AnimatedPage'

// ─── Tier Card Visual ────────────────────────────────────────
const TIER_GRADIENT = {
  Bronze:   'linear-gradient(135deg, #78350F 0%, #92400E 50%, #78350F 100%)',
  Silver:   'linear-gradient(135deg, #1E293B 0%, #334155 50%, #1E293B 100%)',
  Gold:     'linear-gradient(135deg, #78350F 0%, #B45309 50%, #78350F 100%)',
  Platinum: 'linear-gradient(135deg, #3B0764 0%, #581C87 50%, #3B0764 100%)',
  'VIP Mahkota': 'linear-gradient(135deg, #4C0519 0%, #831843 50%, #4C0519 100%)',
}
const TIER_GLOW = {
  Bronze: 'rgba(249,115,22,0.4)', Silver: 'rgba(148,163,184,0.3)',
  Gold: 'rgba(251,191,36,0.4)', Platinum: 'rgba(168,85,247,0.4)',
  'VIP Mahkota': 'rgba(236,72,153,0.4)',
}

function MembershipCard({ customer, tier, tierCfg }) {
  const [copied, setCopied] = useState(false)

  const copyId = () => {
    navigator.clipboard.writeText(customer.membershipId || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ rotateY: -20, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={{ duration: 0.6, type: 'spring' }}
      whileHover={{ scale: 1.02, rotateY: 3 }}
      className="relative rounded-2xl overflow-hidden p-6 cursor-pointer"
      style={{
        background: TIER_GRADIENT[tier],
        boxShadow: `0 16px 48px ${TIER_GLOW[tier]}`,
        perspective: '1000px',
        minHeight: 200,
      }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${tierCfg.color}44 0%, transparent 70%)`, transform: 'translate(30%,-30%)' }} />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${tierCfg.color}22 0%, transparent 70%)`, transform: 'translate(-30%,30%)' }} />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-1">Esther Garage</p>
            <p className="text-white/70 text-xs">Membership Card</p>
          </div>
          <div className="text-right">
            <div className="text-3xl">{tierCfg.icon}</div>
            <p className="text-white font-bold text-sm mt-1">{tier}</p>
          </div>
        </div>

        {/* Member Name */}
        <div className="mb-4">
          <p className="text-white text-xl font-extrabold tracking-wide">{customer.name}</p>
          <p className="text-white/50 text-xs">{customer.email}</p>
        </div>

        {/* Bottom row */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-white/40 text-xs mb-0.5">Member ID</p>
            <div className="flex items-center gap-2">
              <p className="text-white font-mono text-sm font-bold">
                {customer.membershipId || 'NON-MEMBER'}
              </p>
              {customer.membershipId && (
                <motion.button whileTap={{ scale: 0.9 }} onClick={copyId}
                  className="p-1 rounded text-white/50 hover:text-white transition-colors">
                  {copied ? <MdCheck size={14} className="text-green-400" /> : <MdCopyAll size={14} />}
                </motion.button>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-xs mb-0.5">Bergabung</p>
            <p className="text-white/80 text-sm font-semibold">
              {customer.memberSince
                ? new Date(customer.memberSince).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
                : '—'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Point History Item ──────────────────────────────────────
function PointHistoryItem({ item, index }) {
  const isIn = item.type === 'in'
  return (
    <motion.div
      initial={{ opacity: 0, x: isIn ? -16 : 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-3 py-3 border-b last:border-0"
      style={{ borderColor: 'rgba(255,255,255,0.05)' }}
    >
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
        style={{ background: isIn ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)' }}>
        {isIn ? '↑' : '↓'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-xs font-medium truncate">{item.desc}</p>
        <p className="text-gray-500 text-xs">{item.date}
          {item.createdBy === 'admin' && <span className="ml-1 text-blue-400">(Admin)</span>}
        </p>
      </div>
      <p className={`font-bold text-sm flex-shrink-0 ${isIn ? 'text-green-400' : 'text-red-400'}`}>
        {isIn ? '+' : ''}{item.points?.toLocaleString('id-ID')}
      </p>
    </motion.div>
  )
}

// ─── Edit Profile Form ───────────────────────────────────────
function EditProfileModal({ customer, onSave, onClose }) {
  const [form, setForm] = useState({
    name:      customer.name || '',
    phone:     customer.phone || '',
    birthDate: customer.birthDate || '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl p-6"
        style={{ background: '#052015', border: '1px solid rgba(34,197,94,0.2)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold">Edit Profil</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><MdClose size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Nama Lengkap', key: 'name',      type: 'text', icon: MdPerson },
            { label: 'Nomor HP',     key: 'phone',     type: 'tel',  icon: MdPhone  },
            { label: 'Tanggal Lahir',key: 'birthDate', type: 'date', icon: MdCake   },
          ].map(({ label, key, type, icon: Icon }) => (
            <div key={key}>
              <label className="text-gray-400 text-xs mb-1 block">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input type={type} value={form[key]}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white outline-none focus:border-green-500/50 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </div>
            </div>
          ))}
          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-gray-400 text-sm border border-white/10 hover:border-white/20 transition-colors">
              Batal
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)' }}>
              <MdSave size={16} /> Simpan
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ─── MAIN ────────────────────────────────────────────────────
export default function ProfilCustomer() {
  const { customer, updateCustomer, logout } = useCustomerAuth()
  const navigate = useNavigate()
  const [showEdit, setShowEdit] = useState(false)
  const [showAllHistory, setShowAllHistory] = useState(false)
  const [historyFilter, setHistoryFilter] = useState('all') // 'all' | 'in' | 'out'
  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState('profil') // 'profil' | 'poin' | 'achievement'

  if (!customer) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#020f09' }}>
      <div className="text-gray-500">Memuat...</div>
    </div>
  )

  const loyalty      = calcLoyaltyProgress(customer.points || 0)
  const tierCfg      = TIER_CONFIG[loyalty.tier]
  const achievements = calcAchievements(customer)
  const unlockedCount = achievements.filter(a => a.unlocked).length

  const pointHistory = (customer.pointHistory || [])
    .filter(h => historyFilter === 'all' ? true : h.type === historyFilter)

  const handleSaveProfile = (formData) => {
    updateCustomer({ ...customer, ...formData })
    setShowEdit(false)
    setToast({ message: 'Profil berhasil diperbarui!', type: 'success' })
    setTimeout(() => setToast(null), 3000)
  }

  const handleActivateMembership = async () => {
    await updateCustomer({ membership_status: 'active' })
    setToast({ message: '🎉 Membership berhasil diaktifkan!', type: 'success' })
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <AnimatedPage>
      <div className="min-h-screen pt-16" style={{ background: '#020f09' }}>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-white font-medium flex items-center gap-3"
              style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)', boxShadow: '0 8px 32px rgba(34,197,94,0.3)' }}>
              ✨ {toast.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Modal */}
        <AnimatePresence>
          {showEdit && (
            <EditProfileModal customer={customer} onSave={handleSaveProfile} onClose={() => setShowEdit(false)} />
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="relative overflow-hidden"
          style={{ background: 'linear-gradient(180deg, #041C15 0%, #020f09 100%)', borderBottom: '1px solid rgba(34,197,94,0.08)' }}>
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${TIER_GLOW[loyalty.tier]} 0%, transparent 70%)`, transform: 'translate(30%,-30%)' }} />
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => navigate(-1)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                <MdArrowBack size={20} />
              </button>
              <h1 className="text-white font-bold text-lg">Profil Saya</h1>
            </div>

            {/* Avatar + Name */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-extrabold text-white"
                  style={{ background: `${tierCfg.color}25`, border: `2px solid ${tierCfg.color}40`, boxShadow: `0 8px 32px ${TIER_GLOW[loyalty.tier]}` }}>
                  {customer.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="absolute -bottom-1 -right-1 text-lg">{tierCfg.icon}</div>
              </div>
              <div className="flex-1">
                <h2 className="text-white font-extrabold text-xl">{customer.name}</h2>
                <p className="text-gray-400 text-sm">{customer.email}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                    style={{ background: tierCfg.bg, color: tierCfg.color, border: `1px solid ${tierCfg.border}` }}>
                    {tierCfg.icon} {loyalty.tier}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {customer.membershipStatus === 'active' ? (
                      <span className="text-green-400">● Member Aktif</span>
                    ) : (
                      <span className="text-gray-500">● Non-Member</span>
                    )}
                  </span>
                </div>
              </div>
              <button onClick={() => setShowEdit(true)}
                className="p-2.5 rounded-xl text-gray-400 hover:text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <MdEdit size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {[
              { id: 'profil', label: 'Profil', icon: MdPerson },
              { id: 'poin',   label: 'Riwayat Poin', icon: MdHistory },
              { id: 'achievement', label: 'Badge', icon: MdEmojiEvents },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all"
                style={activeTab === tab.id
                  ? { background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.25)' }
                  : { color: '#6B7280' }}>
                <tab.icon size={14} />{tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Profil */}
          {activeTab === 'profil' && (
            <div className="space-y-5">
              {/* Membership Card */}
              <ScrollReveal>
                {customer.membershipStatus === 'active' ? (
                  <MembershipCard customer={customer} tier={loyalty.tier} tierCfg={tierCfg} />
                ) : (
                  <div className="rounded-2xl p-5 text-center"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                    <div className="text-4xl mb-3">🎖️</div>
                    <p className="text-white font-bold mb-1">Belum Jadi Member</p>
                    <p className="text-gray-500 text-sm mb-4">Aktifkan membership gratis dan mulai kumpulkan poin.</p>
                    <button onClick={handleActivateMembership}
                      className="px-6 py-2.5 rounded-xl text-white font-bold text-sm"
                      style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)' }}>
                      Aktifkan Sekarang
                    </button>
                  </div>
                )}
              </ScrollReveal>

              {/* Tier Info & Progress */}
              <ScrollReveal>
                <div className="rounded-2xl p-5"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-sm flex items-center gap-2">
                      <MdStars style={{ color: tierCfg.color }} /> Poin & Progress
                    </h3>
                    <Link to="/member/loyalty" className="text-xs text-green-400 hover:text-green-300">Tukar Poin →</Link>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-white font-extrabold text-3xl">{(customer.points || 0).toLocaleString('id-ID')}</p>
                      <p className="text-gray-500 text-xs">poin aktif</p>
                    </div>
                    {loyalty.nextTier && (
                      <div className="text-right">
                        <p className="text-gray-400 text-sm font-semibold">{loyalty.pointsToNext.toLocaleString('id-ID')} lagi</p>
                        <p className="text-gray-600 text-xs">menuju {loyalty.nextTier}</p>
                      </div>
                    )}
                  </div>
                  <AnimatedProgress value={loyalty.progress} color={tierCfg.color} height={8} bg="rgba(255,255,255,0.06)" />
                  <div className="flex justify-between mt-1.5 text-xs text-gray-600">
                    <span>{loyalty.tier} ({TIER_CONFIG[loyalty.tier].min.toLocaleString('id-ID')} poin)</span>
                    {loyalty.nextTier && <span>{loyalty.nextTier} ({TIER_CONFIG[loyalty.nextTier].min.toLocaleString('id-ID')} poin)</span>}
                  </div>

                  {/* Benefits */}
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <p className="text-gray-400 text-xs font-semibold mb-2">Benefit {loyalty.tier}</p>
                    <div className="space-y-1">
                      {TIER_BENEFITS[loyalty.tier].map((b, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-gray-400">
                          <span className="text-green-400 mt-0.5">✓</span> {b}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Data Diri */}
              <ScrollReveal>
                <div className="rounded-2xl p-5"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-sm">Data Diri</h3>
                    <button onClick={() => setShowEdit(true)}
                      className="text-xs text-green-400 hover:text-green-300 flex items-center gap-1">
                      <MdEdit size={12} /> Edit
                    </button>
                  </div>
                  <div className="space-y-3">
                    {[
                      { icon: MdPerson, label: 'Nama',          value: customer.name },
                      { icon: MdEmail,  label: 'Email',         value: customer.email },
                      { icon: MdPhone,  label: 'Nomor HP',      value: customer.phone || '—' },
                      { icon: MdCake,   label: 'Tanggal Lahir', value: customer.birthDate ? new Date(customer.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
                      { icon: MdCardMembership, label: 'Bergabung', value: customer.joinDate ? new Date(customer.joinDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <Icon className="text-gray-500" size={16} />
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">{label}</p>
                          <p className="text-white text-sm">{value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              {/* Stats */}
              <ScrollReveal>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Total Servis',    value: customer.totalOrders || 0,   color: '#22C55E', suffix: '×' },
                    { label: 'Total Pengeluaran', value: customer.totalSpent || 0,  color: '#FBBF24', format: v => 'Rp ' + (v/1000000).toFixed(1) + 'jt' },
                    { label: 'Review Diberikan', value: customer.reviewCount || 0,  color: '#A855F7', suffix: '×' },
                  ].map(stat => (
                    <div key={stat.label} className="rounded-xl p-4 text-center"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <p className="font-extrabold text-xl text-white">
                        {stat.format ? stat.format(stat.value) : stat.value + (stat.suffix || '')}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>

              {/* Logout */}
              <button onClick={() => { if (confirm('Yakin keluar?')) logout() }}
                className="w-full py-3 rounded-xl text-red-400 text-sm font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-red-500/10"
                style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
                <MdLogout size={16} /> Keluar dari Akun
              </button>
            </div>
          )}

          {/* Tab: Riwayat Poin */}
          {activeTab === 'poin' && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Poin Masuk',  value: (customer.pointHistory||[]).filter(h=>h.type==='in').reduce((s,h)=>s+(h.points||0),0),  color: '#22C55E' },
                  { label: 'Poin Keluar', value: (customer.pointHistory||[]).filter(h=>h.type==='out').reduce((s,h)=>s+Math.abs(h.points||0),0), color: '#EF4444' },
                  { label: 'Saldo Aktif', value: customer.points || 0, color: '#FBBF24' },
                ].map(s => (
                  <div key={s.label} className="rounded-xl p-3 text-center"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="font-bold text-lg" style={{ color: s.color }}>{s.value.toLocaleString('id-ID')}</p>
                    <p className="text-gray-500 text-xs">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Filter */}
              <div className="flex gap-2">
                {['all','in','out'].map(f => (
                  <button key={f} onClick={() => setHistoryFilter(f)}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={historyFilter === f
                      ? { background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }
                      : { background: 'rgba(255,255,255,0.04)', color: '#6B7280', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {f === 'all' ? 'Semua' : f === 'in' ? '↑ Masuk' : '↓ Keluar'}
                  </button>
                ))}
              </div>

              {/* History List */}
              <div className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {pointHistory.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-6">Belum ada riwayat poin.</p>
                ) : (
                  (showAllHistory ? pointHistory : pointHistory.slice(0, 10)).map((item, i) => (
                    <PointHistoryItem key={item.id || i} item={item} index={i} />
                  ))
                )}
                {pointHistory.length > 10 && (
                  <button onClick={() => setShowAllHistory(p => !p)}
                    className="w-full mt-3 py-2 text-xs text-green-400 hover:text-green-300 transition-colors">
                    {showAllHistory ? 'Tampilkan lebih sedikit ↑' : `Tampilkan semua (${pointHistory.length}) ↓`}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tab: Achievement */}
          {activeTab === 'achievement' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-400 text-sm">{unlockedCount} dari {achievements.length} badge terbuka</p>
                <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full bg-yellow-400 transition-all"
                    style={{ width: `${(unlockedCount/achievements.length)*100}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {achievements.map((a, i) => (
                  <motion.div key={a.id}
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={a.unlocked ? { scale: 1.03, y: -3 } : {}}
                    className="p-4 rounded-xl flex items-center gap-3"
                    style={{
                      background: a.unlocked ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${a.unlocked ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.06)'}`,
                      opacity: a.unlocked ? 1 : 0.5,
                    }}>
                    <div className="text-2xl">{a.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{a.label}</p>
                      <p className="text-gray-500 text-xs leading-tight">{a.desc}</p>
                    </div>
                    {a.unlocked && <span className="text-yellow-400 text-lg">✓</span>}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  )
}
