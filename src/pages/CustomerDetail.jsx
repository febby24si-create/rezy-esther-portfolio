// ============================================================
// CustomerDetail.jsx
// Halaman profil lengkap satu customer — admin view.
// Dibuka dari Customers.jsx via navigasi atau modal.
// ============================================================
import { useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  MdArrowBack, MdEdit, MdSave, MdClose,
  MdPerson, MdPhone, MdEmail, MdLocationOn,
  MdCake, MdShoppingBag, MdStar, MdStarBorder,
  MdHistory, MdWarning, MdCampaign, MdDevices,
  MdCheck, MdContentCopy, MdOpenInNew,
  MdCalendarToday, MdPayment, MdInfo,
  MdNotifications, MdBadge, MdGroup,
  MdThumbUp, MdComment, MdAssignmentInd,
  MdTrendingUp, MdCardMembership, MdMessage,
} from 'react-icons/md'
import { FaInstagram, FaWhatsapp, FaTiktok, FaFacebook } from 'react-icons/fa'
import { useCustomerStore } from '../hooks/useCustomerStore'
import ordersData from '../data/ordersData.json'

// ─── Helpers ──────────────────────────────────────────────────
const fmt = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID')

const fmtDate = (d) => {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

const fmtDateShort = (d) => {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

const LOYALTY = {
  Platinum: { color: '#A855F7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.25)', icon: '💎' },
  Gold:     { color: '#FBBF24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.25)',  icon: '🥇' },
  Silver:   { color: '#94A3B8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.25)', icon: '🥈' },
  Bronze:   { color: '#F97316', bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.25)',  icon: '🥉' },
}

function calcAge(birthDate) {
  if (!birthDate) return null
  const diff = Date.now() - new Date(birthDate).getTime()
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000))
}

function daysSince(d) {
  if (!d) return 9999
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
}

// ─── Sub-components ───────────────────────────────────────────

function SectionCard({ title, icon: Icon, iconColor = '#22C55E', children, className = '' }) {
  return (
    <div
      className={`rounded-2xl border p-5 ${className}`}
      style={{ background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center gap-2 mb-4">
        {Icon && <Icon style={{ color: iconColor }} className="text-lg flex-shrink-0" />}
        <h3 className="text-white font-semibold text-sm">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function InfoRow({ label, value, mono = false, highlight = false, copyable = false }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!value || value === '-') return
    navigator.clipboard.writeText(String(value)).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b last:border-b-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <span className="text-gray-500 text-xs w-36 flex-shrink-0 pt-0.5">{label}</span>
      <div className="flex items-center gap-1.5 flex-1 justify-end min-w-0">
        <span
          className={`text-right text-sm break-all ${mono ? 'font-mono' : ''} ${highlight ? 'text-green-400 font-semibold' : value && value !== '-' ? 'text-white' : 'text-gray-600'}`}
        >
          {value || '-'}
        </span>
        {copyable && value && value !== '-' && (
          <button
            onClick={handleCopy}
            className="text-gray-600 hover:text-gray-400 transition-colors flex-shrink-0"
          >
            {copied ? <MdCheck size={13} className="text-green-400" /> : <MdContentCopy size={13} />}
          </button>
        )}
      </div>
    </div>
  )
}

function BadgeChip({ label, color = '#22C55E', bg, border }) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ color, background: bg || `${color}18`, border: `1px solid ${border || color + '30'}` }}
    >
      {label}
    </span>
  )
}

function StatusDot({ active }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${active ? 'bg-green-400' : 'bg-gray-600'}`} />
      <span className={`text-xs ${active ? 'text-green-400' : 'text-gray-500'}`}>
        {active ? 'Aktif' : 'Tidak Aktif'}
      </span>
    </span>
  )
}

// ─── Loading / Error States ───────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="p-6 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-white/5 mb-6" />
      <div className="flex gap-4 mb-6">
        <div className="w-24 h-24 rounded-2xl bg-white/5" />
        <div className="flex-1 space-y-3">
          <div className="h-6 w-48 rounded-lg bg-white/5" />
          <div className="h-4 w-32 rounded bg-white/5" />
          <div className="h-4 w-64 rounded bg-white/5" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-white/5" />
        ))}
      </div>
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <span className="text-4xl mb-3">🔍</span>
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────
const TABS = [
  { key: 'profil',       label: 'Profil',       icon: MdPerson },
  { key: 'transaksi',    label: 'Transaksi',     icon: MdShoppingBag },
  { key: 'interaksi',    label: 'Interaksi',     icon: MdMessage },
  { key: 'aktivitas',    label: 'Aktivitas',     icon: MdDevices },
  { key: 'marketing',    label: 'Marketing',     icon: MdCampaign },
]

// ─── Main Component ───────────────────────────────────────────
export default function CustomerDetail({ customerId: propId, onClose }) {
  const params = useParams()
  const navigate = useNavigate()
  const id = propId || params.id

  const { customers, updateCustomer } = useCustomerStore()
  const [activeTab, setActiveTab] = useState('profil')
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesValue, setNotesValue] = useState('')

  const customer = useMemo(() => customers.find(c => c.id === id), [customers, id])

  // Orders for this customer
  const customerOrders = useMemo(() => {
    const stored = localStorage.getItem('garage_orders')
    const allOrders = stored ? JSON.parse(stored) : ordersData
    return allOrders
      .filter(o => o.customer === customer?.name)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [customer])

  const handleSaveNotes = useCallback(() => {
    if (!customer) return
    updateCustomer(customer.id, { adminNotes: notesValue })
    setEditingNotes(false)
  }, [customer, notesValue, updateCustomer])

  const handleStartEditNotes = useCallback(() => {
    setNotesValue(customer?.adminNotes || '')
    setEditingNotes(true)
  }, [customer])

  if (!customer) {
    return (
      <div className="p-6">
        <button
          onClick={onClose ? onClose : () => navigate('/customers')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <MdArrowBack /> Kembali
        </button>
        <EmptyState message="Customer tidak ditemukan." />
      </div>
    )
  }

  const loyalty = LOYALTY[customer.loyalty] || LOYALTY.Bronze
  const age = calcAge(customer.birthDate)
  const totalSpentCalc = customerOrders.reduce((s, o) => s + (o.total || 0), 0)
  const lastOrderDays = daysSince(customer.lastOrderDate)

  // ─── Avatar initials ─────────────────────────────────────────
  const initials = customer.name?.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'

  return (
    <div className="p-4 sm:p-6 max-w-5xl">
      {/* Back button */}
      <button
        onClick={onClose ? onClose : () => navigate('/customers')}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-5 text-sm"
      >
        <MdArrowBack size={18} /> Kembali ke Customers
      </button>

      {/* ── Hero section ────────────────────────────────────── */}
      <div
        className="rounded-2xl border p-5 mb-5 flex flex-wrap items-start gap-5"
        style={{ background: 'rgba(4,28,21,0.7)', borderColor: 'rgba(34,197,94,0.15)' }}
      >
        {/* Avatar */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white flex-shrink-0"
          style={{ background: loyalty.color + '25', border: `2px solid ${loyalty.border}` }}
        >
          {customer.photo ? (
            <img src={customer.photo} alt={customer.name} className="w-full h-full object-cover rounded-2xl" />
          ) : initials}
        </div>

        {/* Identity */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-white">{customer.name}</h1>
            <BadgeChip
              label={`${loyalty.icon} ${customer.loyalty}`}
              color={loyalty.color}
              bg={loyalty.bg}
              border={loyalty.border}
            />
            <StatusDot active={customer.memberStatus === 'Aktif'} />
          </div>

          <p className="text-gray-500 text-xs mb-3">
            @{customer.username || '-'} · {customer.id} · Bergabung {fmtDate(customer.joinDate)}
          </p>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-4">
            {[
              { label: 'Total Order',   value: `${customer.totalOrders || customerOrders.length}×`,     color: '#22C55E' },
              { label: 'Total Pengeluaran', value: fmt(totalSpentCalc || customer.totalSpent), color: '#FBBF24' },
              { label: 'Poin Loyalty',  value: `${(customer.points || 0).toLocaleString('id-ID')} pt`,  color: loyalty.color },
              { label: 'Terakhir Servis', value: lastOrderDays < 9999 ? `${lastOrderDays} hari lalu` : '-', color: lastOrderDays > 180 ? '#EF4444' : lastOrderDays > 90 ? '#F97316' : '#22C55E' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-gray-500 text-xs">{s.label}</p>
                <p className="font-bold text-sm" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Creator code pill */}
        {customer.creatorCode && (
          <div
            className="px-3 py-1.5 rounded-xl text-xs font-mono font-semibold text-green-400 flex-shrink-0"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
          >
            🎯 {customer.creatorCode}
          </div>
        )}
      </div>

      {/* ── Tab bar ─────────────────────────────────────────── */}
      <div className="flex gap-1 flex-wrap mb-5">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === key
                ? 'bg-green-500/20 text-green-400 border border-green-500/25'
                : 'text-gray-400 hover:text-white border border-white/8 hover:bg-white/5'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab content ─────────────────────────────────────── */}

      {/* PROFIL TAB */}
      {activeTab === 'profil' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Identitas */}
          <SectionCard title="Data Identitas" icon={MdPerson} iconColor="#60A5FA">
            <InfoRow label="Nama Lengkap"   value={customer.name} />
            <InfoRow label="Username"        value={`@${customer.username || '-'}`} mono />
            <InfoRow label="Customer ID"     value={customer.id} mono copyable />
            <InfoRow label="Jenis Kelamin"   value={customer.gender} />
            <InfoRow label="Tanggal Lahir"   value={customer.birthDate ? `${fmtDate(customer.birthDate)} (${age} tahun)` : '-'} />
          </SectionCard>

          {/* Kontak */}
          <SectionCard title="Kontak" icon={MdPhone} iconColor="#22C55E">
            <InfoRow label="Nomor HP"  value={customer.phone} copyable />
            <InfoRow label="Email"     value={customer.email} copyable />
            <InfoRow label="Alamat"    value={customer.address} />
            <InfoRow label="Kota"      value={`${customer.city || '-'}, ${customer.province || '-'}`} />
            <div className="flex items-center gap-3 pt-3">
              {customer.instagram && (
                <a href={`https://instagram.com/${customer.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-pink-400 hover:text-pink-300 text-xs transition-colors">
                  <FaInstagram /> {customer.instagram}
                </a>
              )}
              {customer.whatsapp && (
                <span className="flex items-center gap-1.5 text-green-400 text-xs">
                  <FaWhatsapp /> {customer.whatsapp}
                </span>
              )}
            </div>
          </SectionCard>

          {/* Membership */}
          <SectionCard title="Data Akun & Membership" icon={MdCardMembership} iconColor="#FBBF24">
            <InfoRow label="Tanggal Daftar"    value={fmtDate(customer.joinDate)} />
            <InfoRow label="Status Member"     value={customer.memberStatus}
              highlight={customer.memberStatus === 'Aktif'} />
            <InfoRow label="Level Membership"  value={`${loyalty.icon} ${customer.loyalty}`} />
            <InfoRow label="Poin Loyalty"      value={`${(customer.points || 0).toLocaleString('id-ID')} poin`} />
            <InfoRow label="Membership ID"     value={customer.membershipId || '—'} mono copyable={!!customer.membershipId} />
            <InfoRow label="Member Sejak"      value={customer.memberSince ? fmtDate(customer.memberSince) : '—'} />
            <InfoRow label="Creator Code"      value={customer.creatorCode || '-'} mono copyable
              highlight={!!customer.creatorCode} />

            {/* Quick Point Adjustment */}
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="text-gray-500 text-xs mb-2 font-semibold uppercase tracking-wider">Kelola Poin</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const amt = parseInt(prompt(`Tambah poin untuk ${customer.name}?\nMasukkan jumlah poin:`))
                    if (!amt || isNaN(amt)) return
                    const customers = JSON.parse(localStorage.getItem('eg_customers') || '[]')
                    const idx = customers.findIndex(c => c.id === customer.id || c.name === customer.name)
                    if (idx === -1) { alert('Customer tidak ditemukan di localStorage.'); return }
                    customers[idx].points = (customers[idx].points || 0) + amt
                    customers[idx].pointHistory = [
                      { id: 'LP-ADM-'+Date.now(), type:'in', desc:'Penambahan poin oleh Admin (dari Customer Detail)', points: amt, date: new Date().toISOString().slice(0,10), createdBy:'admin' },
                      ...(customers[idx].pointHistory || []),
                    ]
                    localStorage.setItem('eg_customers', JSON.stringify(customers))
                    alert(`✅ +${amt} poin berhasil ditambahkan ke ${customer.name}`)
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.25)' }}>
                  + Tambah Poin
                </button>
                <button
                  onClick={() => {
                    const amt = parseInt(prompt(`Kurangi poin dari ${customer.name}?\nMasukkan jumlah poin:`))
                    if (!amt || isNaN(amt)) return
                    const customers = JSON.parse(localStorage.getItem('eg_customers') || '[]')
                    const idx = customers.findIndex(c => c.id === customer.id || c.name === customer.name)
                    if (idx === -1) { alert('Customer tidak ditemukan di localStorage.'); return }
                    customers[idx].points = Math.max(0, (customers[idx].points || 0) - amt)
                    customers[idx].pointHistory = [
                      { id: 'LP-ADM-'+Date.now(), type:'out', desc:'Pengurangan poin oleh Admin (dari Customer Detail)', points: -amt, date: new Date().toISOString().slice(0,10), createdBy:'admin' },
                      ...(customers[idx].pointHistory || []),
                    ]
                    localStorage.setItem('eg_customers', JSON.stringify(customers))
                    alert(`✅ −${amt} poin berhasil dikurangi dari ${customer.name}`)
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                  − Kurangi Poin
                </button>
              </div>
            </div>
          </SectionCard>

          {/* Admin Notes */}
          <SectionCard title="Catatan Admin" icon={MdAssignmentInd} iconColor="#A855F7">
            {editingNotes ? (
              <div>
                <textarea
                  value={notesValue}
                  onChange={e => setNotesValue(e.target.value)}
                  rows={4}
                  placeholder="Tambahkan catatan tentang customer ini..."
                  className="w-full text-sm text-white rounded-xl p-3 resize-none outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={handleSaveNotes}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/25 hover:bg-green-500/30 transition-all">
                    <MdSave size={13} /> Simpan
                  </button>
                  <button onClick={() => setEditingNotes(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-white border border-white/10 transition-all">
                    <MdClose size={13} /> Batal
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {customer.adminNotes ? (
                  <p className="text-gray-300 text-sm leading-relaxed mb-3">{customer.adminNotes}</p>
                ) : (
                  <p className="text-gray-600 text-sm italic mb-3">Belum ada catatan.</p>
                )}
                <button onClick={handleStartEditNotes}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                  <MdEdit size={13} /> {customer.adminNotes ? 'Edit Catatan' : 'Tambah Catatan'}
                </button>
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {/* TRANSAKSI TAB */}
      {activeTab === 'transaksi' && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Order',     value: customerOrders.length, suffix: '×', color: '#22C55E' },
              { label: 'Total Pengeluaran', value: fmt(totalSpentCalc), color: '#FBBF24' },
              { label: 'Order Selesai',   value: customerOrders.filter(o => o.status === 'Selesai').length, suffix: '×', color: '#60A5FA' },
              { label: 'Order Aktif',     value: customerOrders.filter(o => ['Antrian','Proses'].includes(o.status)).length, suffix: '×', color: '#A855F7' },
            ].map(s => (
              <div key={s.label} className="rounded-2xl border p-4"
                style={{ background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(255,255,255,0.08)' }}>
                <p className="text-gray-500 text-xs mb-1">{s.label}</p>
                <p className="font-bold text-lg" style={{ color: s.color }}>
                  {typeof s.value === 'number' ? s.value.toLocaleString('id-ID') : s.value}
                  {s.suffix && <span className="text-sm ml-0.5">{s.suffix}</span>}
                </p>
              </div>
            ))}
          </div>

          {/* Order history */}
          <SectionCard title="Riwayat Pembelian" icon={MdHistory} iconColor="#60A5FA">
            {customerOrders.length === 0 ? (
              <EmptyState message="Belum ada order dari customer ini." />
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {customerOrders.map(order => {
                  const statusColor = {
                    Selesai: '#22C55E', Proses: '#FBBF24', Antrian: '#60A5FA',
                    Batal: '#EF4444', Ditunda: '#F97316',
                  }[order.status] || '#6B7280'
                  return (
                    <div key={order.id} className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-white text-sm font-medium">{order.service}</span>
                          <span className="text-xs font-mono text-gray-500">{order.id}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-gray-500 text-xs">{order.vehicle}</span>
                          <span className="text-gray-600 text-xs">· {order.mechanic}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-white text-sm font-semibold">{fmt(order.total)}</p>
                        <div className="flex items-center gap-2 justify-end mt-0.5">
                          <span className="text-xs text-gray-500">{fmtDateShort(order.date)}</span>
                          <span className="text-xs font-semibold" style={{ color: statusColor }}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {/* INTERAKSI TAB */}
      {activeTab === 'interaksi' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SectionCard title="Riwayat Komplain" icon={MdWarning} iconColor="#F97316">
            <InfoRow label="Jumlah Komplain" value={`${customer.complaints || 0} kali`}
              highlight={(customer.complaints || 0) > 0} />
            {(customer.complaints || 0) === 0 ? (
              <p className="text-gray-600 text-xs mt-2 italic">Tidak ada riwayat komplain.</p>
            ) : (
              <p className="text-gray-500 text-xs mt-2 italic">Detail komplain tersimpan di sistem tiket.</p>
            )}
          </SectionCard>

          <SectionCard title="Feedback & Review" icon={MdThumbUp} iconColor="#FBBF24">
            {(() => {
              const reviews = JSON.parse(localStorage.getItem('garage_reviews') || '[]')
                .filter(r => r.customerId === customer.id || r.customerName === customer.name)
              return reviews.length === 0 ? (
                <EmptyState message="Belum ada review." />
              ) : (
                <div className="space-y-3">
                  {reviews.slice(0, 5).map(r => (
                    <div key={r.id} className="p-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <span key={s} className={`text-sm ${s <= r.rating ? 'text-yellow-400' : 'text-gray-700'}`}>★</span>
                          ))}
                        </div>
                        <span className="text-gray-600 text-xs">{fmtDateShort(r.date)}</span>
                      </div>
                      {r.reviewText && <p className="text-gray-300 text-xs leading-relaxed">{r.reviewText}</p>}
                      <p className="text-gray-600 text-xs mt-1">Mekanik: {r.mechanic}</p>
                    </div>
                  ))}
                </div>
              )
            })()}
          </SectionCard>

          <SectionCard title="Catatan Admin" icon={MdComment} iconColor="#A855F7" className="md:col-span-2">
            {editingNotes ? (
              <div>
                <textarea
                  value={notesValue}
                  onChange={e => setNotesValue(e.target.value)}
                  rows={4}
                  placeholder="Tambahkan catatan tentang customer ini..."
                  className="w-full text-sm text-white rounded-xl p-3 resize-none outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={handleSaveNotes}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/25">
                    <MdSave size={13} /> Simpan
                  </button>
                  <button onClick={() => setEditingNotes(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 border border-white/10">
                    <MdClose size={13} /> Batal
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {customer.adminNotes ? (
                  <p className="text-gray-300 text-sm leading-relaxed mb-3">{customer.adminNotes}</p>
                ) : (
                  <p className="text-gray-600 text-sm italic mb-3">Belum ada catatan admin.</p>
                )}
                <button onClick={handleStartEditNotes}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
                  <MdEdit size={13} /> {customer.adminNotes ? 'Edit' : 'Tambah Catatan'}
                </button>
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {/* AKTIVITAS TAB */}
      {activeTab === 'aktivitas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SectionCard title="Aktivitas Terkini" icon={MdDevices} iconColor="#60A5FA">
            <InfoRow label="Login Terakhir"   value={fmtDate(customer.lastLogin)} />
            <InfoRow label="Device"           value={customer.device} />
            <InfoRow label="Lokasi Login"     value={customer.loginLocation} />
            <InfoRow label="Terakhir Servis"  value={
              customer.lastOrderDate
                ? `${fmtDate(customer.lastOrderDate)} (${daysSince(customer.lastOrderDate)} hari lalu)`
                : '-'
            } />
          </SectionCard>

          <SectionCard title="Statistik Penggunaan" icon={MdTrendingUp} iconColor="#22C55E">
            <InfoRow label="Total Kunjungan" value={`${customer.totalOrders || customerOrders.length}×`} />
            <InfoRow label="Rata-rata Interval" value={
              customerOrders.length > 1
                ? `~${Math.round(
                    (new Date(customerOrders[0].date) - new Date(customerOrders[customerOrders.length-1].date))
                    / (customerOrders.length - 1) / 86400000
                  )} hari/kunjungan`
                : '-'
            } />
            <InfoRow label="Servis Terfavorit" value={
              (() => {
                if (!customerOrders.length) return '-'
                const counts = {}
                customerOrders.forEach(o => { counts[o.service] = (counts[o.service] || 0) + 1 })
                return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'
              })()
            } />
          </SectionCard>
        </div>
      )}

      {/* MARKETING TAB */}
      {activeTab === 'marketing' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SectionCard title="Sumber & Akuisisi" icon={MdCampaign} iconColor="#F97316">
            <InfoRow label="Sumber User"     value={customer.source} highlight={!!customer.source} />
            <InfoRow label="Campaign"        value={customer.campaignJoined || '-'} />
            <InfoRow label="Creator Code"    value={customer.creatorCode || '-'} mono copyable />
          </SectionCard>

          <SectionCard title="Subscription & Notifikasi" icon={MdNotifications} iconColor="#60A5FA">
            <div className="space-y-2">
              {[
                { label: 'Email Newsletter', active: customer.emailSubscribed },
                { label: 'SMS Notifikasi',   active: customer.smsSubscribed },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between py-2 border-b last:border-b-0"
                  style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <span className="text-gray-500 text-xs">{s.label}</span>
                  <StatusDot active={s.active} />
                </div>
              ))}
              <InfoRow label="Status Promo" value={customer.promoStatus}
                highlight={customer.promoStatus === 'Aktif'} />
            </div>
          </SectionCard>

          <SectionCard title="Ringkasan Engagement" icon={MdBarChart} iconColor="#A855F7" className="md:col-span-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Order',       value: `${customerOrders.length}×`,   color: '#22C55E' },
                { label: 'Total Pengeluaran', value: fmt(totalSpentCalc),            color: '#FBBF24' },
                { label: 'Poin Terkumpul',    value: `${(customer.points||0).toLocaleString('id-ID')} pt`, color: '#A855F7' },
                { label: 'Komplain',          value: `${customer.complaints||0}×`,  color: (customer.complaints||0)>0 ? '#EF4444' : '#6B7280' },
              ].map(s => (
                <div key={s.label} className="text-center p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <p className="text-gray-500 text-xs mb-1">{s.label}</p>
                  <p className="font-bold text-sm" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  )
}

// ─── MdBarChart alias (tidak ada di react-icons/md) ───────────
function MdBarChart(props) {
  return <MdTrendingUp {...props} />
}
