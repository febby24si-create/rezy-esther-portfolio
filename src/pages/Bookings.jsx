// ============================================================
// pages/Bookings.jsx — Admin Booking Management
// ============================================================

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, Clock, User, Car, Wrench, CheckCircle2,
  XCircle, AlertTriangle, Search, RefreshCw, CalendarClock,
  Eye, X, Check, RotateCcw, UserX, ClipboardList, Inbox,
} from 'lucide-react'
import { AnimatedPage } from '../components/AnimatedPage'
import PageHeader from '../components/PageHeader'
import { BOOKING_STATUS, BOOKING_STATUS_CONFIG } from '../lib/bookingEngine'
import { availableTimeSlots } from '../data/guestData'

// ─── HELPERS ──────────────────────────────────────────────────
const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID')

function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    })
  } catch { return dateStr }
}

function timeAgo(isoStr) {
  if (!isoStr) return ''
  const diff = Date.now() - new Date(isoStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'baru saja'
  if (m < 60) return `${m} menit lalu`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} jam lalu`
  return `${Math.floor(h / 24)} hari lalu`
}

function getNextDates(n = 21) {
  const dates = []
  const today = new Date()
  for (let i = 1; i <= n; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    if (d.getDay() !== 0) dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

// ─── STATUS BADGE ─────────────────────────────────────────────
function BookingStatusBadge({ status, size = 'md' }) {
  const cfg = BOOKING_STATUS_CONFIG[status]
    || BOOKING_STATUS_CONFIG[BOOKING_STATUS.WAITING_CONFIRMATION]
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${pad}`}
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.pulse ? 'animate-pulse' : ''}`}
        style={{ background: cfg.dot }}
      />
      {cfg.label}
    </span>
  )
}

// ─── KPI STAT CARD ────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, border, sub }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="relative rounded-xl p-4 flex flex-col gap-2 overflow-hidden group transition-all duration-500 hover:scale-[1.03] hover:shadow-lg"
      style={{
        background: `linear-gradient(145deg, rgba(10, 26, 18, 0.9), rgba(4, 16, 11, 0.95))`,
        border: `1px solid ${border}`,
      }}
    >
      <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full opacity-10 group-hover:opacity-20 transition-all duration-700"
        style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }} />
      <div className="flex items-center justify-between relative z-10">
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{label}</p>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${color}20` }}>
          <Icon size={14} style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white relative z-10">{value}</p>
      {sub && <p className="text-gray-500 text-xs relative z-10">{sub}</p>}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-500 group-hover:h-1"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
    </motion.div>
  )
}

// ─── BOOKING DETAIL DRAWER ────────────────────────────────────
function BookingDrawer({ booking, onClose, onRefresh }) {
  const [loading, setLoading]           = useState(false)
  const [toast, setToast]               = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectForm, setShowRejectForm]   = useState(false)
  const [showReschedForm, setShowReschedForm] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')

  if (!booking) return null

  const cfg = BOOKING_STATUS_CONFIG[booking.status]
    || BOOKING_STATUS_CONFIG[BOOKING_STATUS.WAITING_CONFIRMATION]

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function act(apiFn) {
    setLoading(true)
    try {
      await apiFn()
      showToast('Berhasil!')
      onRefresh()
    } catch (err) {
      showToast(err.message || 'Gagal.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm    = () => act(async () => {
    const { bookingAPI } = await import('../services/bookingAPI')
    await bookingAPI.confirm(booking.id)
  })
  const handleReject     = () => {
    if (!rejectReason.trim()) { showToast('Alasan wajib diisi.', 'error'); return }
    act(async () => {
      const { bookingAPI } = await import('../services/bookingAPI')
      await bookingAPI.reject(booking.id, rejectReason)
      setShowRejectForm(false)
    })
  }
  const handleReschedule = () => {
    if (!newDate || !newTime) { showToast('Tanggal dan jam wajib dipilih.', 'error'); return }
    act(async () => {
      const { bookingAPI } = await import('../services/bookingAPI')
      await bookingAPI.reschedule(booking.id, newDate, newTime)
      setShowReschedForm(false)
    })
  }
  const handleNoShow = () => {
    if (window.confirm(`Tandai ${booking.customer_name || booking.customerName} sebagai No Show?`))
      act(async () => {
        const { bookingAPI } = await import('../services/bookingAPI')
        await bookingAPI.markNoShow(booking.id)
      })
  }

  const canConfirm    = booking.status === BOOKING_STATUS.WAITING_CONFIRMATION
  const canReject     = booking.status === BOOKING_STATUS.WAITING_CONFIRMATION
  const canReschedule = [BOOKING_STATUS.WAITING_CONFIRMATION, BOOKING_STATUS.CONFIRMED,
    BOOKING_STATUS.WAITING_CHECK_IN].includes(booking.status)
  const canNoShow     = [BOOKING_STATUS.CONFIRMED,
    BOOKING_STATUS.WAITING_CHECK_IN].includes(booking.status)

  const rowBg = { background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="ml-auto w-full max-w-md h-full overflow-y-auto flex flex-col"
        style={{ background: '#0a1a12', borderLeft: '1px solid rgba(34,197,94,0.15)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b flex items-start justify-between gap-3 sticky top-0 z-10"
          style={{ background: '#0a1a12', borderColor: 'rgba(34,197,94,0.1)' }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-green-400">{booking.id}</span>
              <BookingStatusBadge status={booking.status} size="sm" />
            </div>
            <p className="text-white font-bold text-base">{booking.customer_name || booking.customerName}</p>
            <p className="text-gray-500 text-xs">{booking.customerPhone}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white transition-colors flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mx-5 mt-4 px-4 py-2.5 rounded-xl text-sm font-medium"
              style={{
                background: toast.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
                color: toast.type === 'error' ? '#EF4444' : '#22C55E',
              }}>
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        {(canConfirm || canReject || canReschedule || canNoShow) && (
          <div className="px-5 pt-4 flex flex-wrap gap-2">
            {canConfirm && (
              <button onClick={handleConfirm} disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }}>
                <Check size={13} /> Konfirmasi
              </button>
            )}
            {canReschedule && (
              <button onClick={() => { setShowReschedForm(v => !v); setShowRejectForm(false) }} disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
                <RotateCcw size={13} /> Jadwalkan Ulang
              </button>
            )}
            {canReject && (
              <button onClick={() => { setShowRejectForm(v => !v); setShowReschedForm(false) }} disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                <XCircle size={13} /> Tolak
              </button>
            )}
            {canNoShow && (
              <button onClick={handleNoShow} disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'rgba(251,146,60,0.12)', color: '#FB923C', border: '1px solid rgba(251,146,60,0.25)' }}>
                <UserX size={13} /> No Show
              </button>
            )}
          </div>
        )}

        {/* Reject Form */}
        <AnimatePresence>
          {showRejectForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} className="mx-5 mt-3 p-4 rounded-xl overflow-hidden"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p className="text-red-400 text-xs font-semibold mb-2">Alasan Penolakan *</p>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                rows={2} placeholder="Contoh: Slot penuh, mekanik tidak tersedia..."
                className="w-full text-sm text-white rounded-lg px-3 py-2 resize-none outline-none"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(239,68,68,0.3)' }} />
              <div className="flex gap-2 mt-2">
                <button onClick={handleReject} disabled={loading}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors">
                  Tolak Booking
                </button>
                <button onClick={() => setShowRejectForm(false)}
                  className="px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-white transition-colors">
                  Batal
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reschedule Form */}
        <AnimatePresence>
          {showReschedForm && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }} className="mx-5 mt-3 p-4 rounded-xl overflow-hidden"
              style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <p className="text-yellow-400 text-xs font-semibold mb-3">Jadwalkan Ulang</p>
              <div className="space-y-2">
                <select value={newDate} onChange={e => setNewDate(e.target.value)}
                  className="w-full text-sm text-white rounded-lg px-3 py-2 outline-none"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(245,158,11,0.3)' }}>
                  <option value="">Pilih tanggal baru...</option>
                  {getNextDates().map(d => (
                    <option key={d} value={d}>{formatDate(d)}</option>
                  ))}
                </select>
                <select value={newTime} onChange={e => setNewTime(e.target.value)}
                  className="w-full text-sm text-white rounded-lg px-3 py-2 outline-none"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(245,158,11,0.3)' }}>
                  <option value="">Pilih jam baru...</option>
                  {availableTimeSlots.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={handleReschedule} disabled={loading}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 transition-colors">
                  Simpan Jadwal Baru
                </button>
                <button onClick={() => setShowReschedForm(false)}
                  className="px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-white transition-colors">
                  Batal
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Detail Content */}
        <div className="p-5 space-y-4 flex-1">
          <div className="rounded-xl p-4 space-y-2" style={rowBg}>
            <div className="flex items-center gap-2 mb-1">
              <Wrench size={13} className="text-green-400" />
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Layanan</span>
            </div>
            <p className="text-white font-semibold text-sm">{booking.service || booking.serviceName}</p>
            {booking.estimatedDuration && (
              <p className="text-gray-500 text-xs">Estimasi {booking.estimatedDuration}</p>
            )}
            {booking.estimatedPrice > 0 && (
              <p className="text-green-400 text-sm font-bold">{fmt(booking.estimatedPrice)}</p>
            )}
          </div>

          <div className="rounded-xl p-4 space-y-2" style={rowBg}>
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={13} className="text-blue-400" />
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Jadwal</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-white text-sm font-semibold">{formatDate(booking.booking_date || booking.date)}</p>
              <span className="text-blue-400 font-mono text-sm font-bold">{booking.booking_time || booking.time}</span>
            </div>
            {booking.rescheduledFrom && (
              <p className="text-gray-600 text-xs">
                Dijadwal ulang dari {formatDate(booking.rescheduledFrom)} {booking.rescheduledTime}
              </p>
            )}
          </div>

          <div className="rounded-xl p-4 space-y-2" style={rowBg}>
            <div className="flex items-center gap-2 mb-1">
              <Car size={13} className="text-purple-400" />
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Kendaraan</span>
            </div>
            <p className="text-white text-sm">{booking.vehicle_display || booking.vehicleDisplay}</p>
            {booking.vehiclePlate && (
              <span className="inline-block font-mono text-xs px-2 py-0.5 rounded"
                style={{ background: 'rgba(167,139,250,0.1)', color: '#A78BFA', border: '1px solid rgba(167,139,250,0.2)' }}>
                {booking.vehiclePlate}
              </span>
            )}
          </div>

          {booking.notes && (
            <div className="rounded-xl p-4" style={rowBg}>
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Keluhan / Catatan</p>
              <p className="text-gray-300 text-sm leading-relaxed">{booking.notes}</p>
            </div>
          )}

          <div className="rounded-xl p-4" style={rowBg}>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Riwayat Status</p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                <span>Dibuat</span>
                <span className="ml-auto text-gray-600">{timeAgo(booking.createdAt)}</span>
              </div>
              {booking.confirmedAt && (
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                  <span>Dikonfirmasi oleh {booking.confirmedBy}</span>
                  <span className="ml-auto text-gray-600">{timeAgo(booking.confirmedAt)}</span>
                </div>
              )}
              {booking.rescheduledAt && (
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 flex-shrink-0" />
                  <span>Dijadwalkan ulang</span>
                  <span className="ml-auto text-gray-600">{timeAgo(booking.rescheduledAt)}</span>
                </div>
              )}
              {booking.rejectedAt && (
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  <span>Ditolak: {booking.rejectedReason}</span>
                  <span className="ml-auto text-gray-600">{timeAgo(booking.rejectedAt)}</span>
                </div>
              )}
              {booking.noShowAt && (
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                  <span>No Show</span>
                  <span className="ml-auto text-gray-600">{timeAgo(booking.noShowAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── BOOKING ROW ──────────────────────────────────────────────
function BookingRow({ booking, onSelect }) {
  const isUrgent = booking.status === BOOKING_STATUS.WAITING_CONFIRMATION
  return (
    <motion.tr
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      onClick={() => onSelect(booking)}
      className="border-b cursor-pointer transition-all duration-150 hover:bg-white/[0.03] group"
      style={{ borderColor: 'rgba(34,197,94,0.06)' }}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-gray-500">{booking.id}</span>
          {isUrgent && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse flex-shrink-0" />}
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="text-white text-sm font-medium">{booking.customer_name || booking.customerName}</p>
        <p className="text-gray-600 text-xs">{booking.customerPhone}</p>
      </td>
      <td className="px-4 py-3">
        <p className="text-gray-300 text-sm">{booking.service || booking.serviceName}</p>
        <p className="text-gray-600 text-xs">{(booking.vehicle_display || booking.vehicleDisplay)?.split(' - ')[0]}</p>
      </td>
      <td className="px-4 py-3">
        <p className="text-white text-sm font-medium">{formatDate(booking.booking_date || booking.date)}</p>
        <p className="text-blue-400 font-mono text-xs">{booking.booking_time || booking.time}</p>
      </td>
      <td className="px-4 py-3">
        <BookingStatusBadge status={booking.status} size="sm" />
      </td>
      <td className="px-4 py-3">
        <p className="text-gray-500 text-xs">{timeAgo(booking.createdAt)}</p>
      </td>
      <td className="px-4 py-3">
        <button
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-gray-500 hover:text-white"
          style={{ background: 'rgba(255,255,255,0.05)' }}>
          <Eye size={13} />
        </button>
      </td>
    </motion.tr>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────
export default function Bookings() {
  const [bookings, setBookings]         = useState([])
  const [stats, setStats]               = useState({})
  const [selected, setSelected]         = useState(null)
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter]     = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      const { bookingAPI } = await import('../services/bookingAPI')
      const data = await bookingAPI.fetchAll()
      setBookings(data)
      setStats(bookingAPI.calcStats(data))
    } catch (err) {
      console.error('Gagal load bookings:', err)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleRefresh = useCallback(async () => {
    await load()
    if (selected) {
      const { bookingAPI } = await import('../services/bookingAPI')
      const fresh = await bookingAPI.fetchById(selected.id)
      setSelected(fresh || null)
    }
  }, [load, selected])

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    await load()
    setTimeout(() => setIsRefreshing(false), 600)
  }

  const filtered = useMemo(() => bookings.filter(b => {
    const matchSearch = !search ||
      b.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.id?.toString().toLowerCase().includes(search.toLowerCase()) ||
      b.vehicle_display?.toLowerCase().includes(search.toLowerCase()) ||
      b.service?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || b.status === statusFilter
    const matchDate   = !dateFilter || b.booking_date === dateFilter
    return matchSearch && matchStatus && matchDate
  }), [bookings, search, statusFilter, dateFilter])

  const statusOptions = [
    { value: 'all', label: 'Semua Status' },
    { value: BOOKING_STATUS.WAITING_CONFIRMATION, label: 'Menunggu Konfirmasi' },
    { value: BOOKING_STATUS.CONFIRMED,            label: 'Dikonfirmasi' },
    { value: BOOKING_STATUS.WAITING_CHECK_IN,     label: 'Menunggu Check In' },
    { value: BOOKING_STATUS.RESCHEDULED,          label: 'Dijadwalkan Ulang' },
    { value: BOOKING_STATUS.CHECKED_IN,           label: 'Check In' },
    { value: BOOKING_STATUS.NO_SHOW,              label: 'No Show' },
    { value: BOOKING_STATUS.REJECTED,             label: 'Ditolak' },
    { value: BOOKING_STATUS.CANCELLED_BY_CUSTOMER, label: 'Dibatalkan' },
    { value: BOOKING_STATUS.EXPIRED,              label: 'Expired' },
  ]

  return (
    <div>
      <PageHeader title="Booking Management" breadcrumb={['Operations', 'Booking Management']} />

      {/* KPI STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        <StatCard label="Pending"          value={stats.pendingConfirmation || 0} icon={Clock}
          color="#60A5FA" border="rgba(96,165,250,0.15)" sub="perlu konfirmasi" />
        <StatCard label="Hari Ini"         value={stats.today || 0}               icon={Calendar}
          color="#22C55E" border="rgba(34,197,94,0.15)"  sub="jadwal hari ini" />
        <StatCard label="Besok"            value={stats.tomorrow || 0}            icon={CalendarClock}
          color="#A78BFA" border="rgba(167,139,250,0.15)" />
        <StatCard label="Minggu Ini"       value={stats.thisWeek || 0}            icon={ClipboardList}
          color="#34D399" border="rgba(52,211,153,0.15)" />
        <StatCard label="Menunggu Check In" value={stats.waitingCheckIn || 0}    icon={User}
          color="#34D399" border="rgba(52,211,153,0.15)" />
        <StatCard label="No Show"          value={stats.noShow || 0}              icon={UserX}
          color="#FB923C" border="rgba(251,146,60,0.15)" />
        <StatCard label="Perlu Aksi"       value={stats.needsAction || 0}         icon={AlertTriangle}
          color="#EF4444" border="rgba(239,68,68,0.15)"  sub="segera ditangani" />
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-3 mb-5 animate-fadeInUp" style={{ animationDelay: '50ms', animationFillMode: 'both' }}>
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama, ID, plat, layanan..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-gray-300 outline-none transition-all duration-300 focus:ring-2 focus:ring-green-500/20 placeholder-gray-600"
            style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(34,197,94,0.08)' }} />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors">
              <X size={13} />
            </button>
          )}
        </div>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl text-sm text-gray-300 outline-none transition-all duration-300 focus:ring-2 focus:ring-green-500/20"
          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(34,197,94,0.08)' }}>
          {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl text-sm text-gray-300 outline-none transition-all duration-300 focus:ring-2 focus:ring-green-500/20"
          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(34,197,94,0.08)' }} />
        {dateFilter && (
          <button onClick={() => setDateFilter('')}
            className="px-3.5 py-2.5 rounded-xl text-xs text-gray-500 hover:text-white transition-all duration-300 hover:scale-105"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#EF4444' }}>
            Reset
          </button>
        )}

        <button onClick={handleManualRefresh}
          className={`p-2.5 rounded-xl text-gray-500 hover:text-white transition-all duration-300 hover:scale-105 ${isRefreshing ? 'animate-spin' : ''}`}
          style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(34,197,94,0.08)' }}>
          <RefreshCw size={15} />
        </button>
      </div>

      {/* TABLE */}
      <div className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(10, 26, 18, 0.9), rgba(4, 16, 11, 0.95))',
          border: '1px solid rgba(34,197,94,0.1)',
          backdropFilter: 'blur(6px)',
        }}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Inbox size={36} className="text-gray-700" />
            <p className="text-gray-500 text-sm">
              {bookings.length === 0 ? 'Belum ada booking.' : 'Tidak ada booking yang cocok dengan filter.'}
            </p>
            {bookings.length === 0 && (
              <p className="text-gray-700 text-xs">Booking dari customer akan muncul di sini secara otomatis.</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(34,197,94,0.08)' }}>
                  {['ID', 'Customer', 'Layanan', 'Jadwal', 'Status', 'Dibuat', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-gray-600 font-semibold uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <BookingRow key={b.id} booking={b} onSelect={setSelected} />
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3 flex items-center justify-between"
              style={{ borderTop: '1px solid rgba(34,197,94,0.06)' }}>
              <p className="text-gray-600 text-xs">
                Menampilkan <span className="text-gray-400">{filtered.length}</span> dari{' '}
                <span className="text-gray-400">{bookings.length}</span> booking
              </p>
            </div>
          </div>
        )}
      </div>

      {/* DRAWER */}
      <AnimatePresence>
        {selected && (
          <BookingDrawer booking={selected} onClose={() => setSelected(null)} onRefresh={handleRefresh} />
        )}
      </AnimatePresence>
    </div>
  )
}