import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import {
  MdAdd, MdSearch, MdClose, MdEdit, MdDelete, MdFilterList,
  MdUnfoldMore, MdExpandLess, MdExpandMore, MdDownload,
  MdCheckCircle, MdReceipt, MdPrint, MdRefresh,
  MdSchedule, MdPending, MdCalendarToday, MdArrowBack,
  MdDirectionsCar, MdPerson, MdBuild,
  MdGridView, MdTableRows, MdContentCopy, MdCheck,
  MdStar, MdStars
} from 'react-icons/md'
import Pagination from '../components/Pagination'
import ordersData from '../data/ordersData.json'
import { adminAddPointsToCustomer } from '../context/CustomerAuthContext'

// ─── Animated Number ──────────────────────────────────────────────────
function AnimatedNumber({ value, duration = 800, format = (v) => v, prefix = '' }) {
  const [display, setDisplay] = useState(0)
  const startTime = useRef(null)
  const startValue = useRef(0)

  useEffect(() => {
    startValue.current = display
    startTime.current = null
    const step = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp
      const progress = Math.min((timestamp - startTime.current) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = startValue.current + (value - startValue.current) * eased
      setDisplay(current)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value, duration])

  return <>{prefix}{format(display)}</>
}

// ─── Utils ────────────────────────────────────────────────────────────
const formatCurrency = (amount) => {
  const num = Number(amount)
  if (isNaN(num)) return 'Rp 0'
  return 'Rp ' + num.toLocaleString('id-ID')
}
const generateId = () => '#ORD-' + crypto.randomUUID().slice(0, 8).toUpperCase()
const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return parts.length === 1 ? parts[0][0].toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
const stringToHue = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash) % 360
}

// ─── Status config (dark theme) ──────────────────────────────────────
const STATUS = {
  Selesai: {
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.15)',
    border: 'rgba(34,197,94,0.3)',
    dot: '#22C55E',
    icon: MdCheckCircle,
    label: 'Selesai'
  },
  'Sedang Dikerjakan': {
    color: '#FBBF24',
    bg: 'rgba(251,191,36,0.15)',
    border: 'rgba(251,191,36,0.3)',
    dot: '#FBBF24',
    icon: MdSchedule,
    label: 'Sedang Dikerjakan'
  },
  Menunggu: {
    color: '#94A3B8',
    bg: 'rgba(148,163,184,0.1)',
    border: 'rgba(148,163,184,0.2)',
    dot: '#94A3B8',
    icon: MdPending,
    label: 'Menunggu'
  },
  Dibatalkan: {
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.25)',
    dot: '#EF4444',
    icon: MdClose,
    label: 'Dibatalkan'
  }
}

// ─── StatusBadge ──────────────────────────────────────────────────────
function StatusBadge({ status, size = 'md' }) {
  const cfg = STATUS[status] || STATUS.Menunggu
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${pad} animate-pulse-ring`}
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────
function Avatar({ name, size = 32 }) {
  const hue = stringToHue(name)
  return (
    <div className="rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0 transition-all duration-300 hover:scale-110 hover:rotate-6"
      style={{
        width: size, height: size, fontSize: size * 0.35,
        background: `hsl(${hue},50%,12%)`,
        border: `1px solid hsl(${hue},50%,25%)`,
        color: `hsl(${hue},70%,60%)`
      }}>
      {getInitials(name)}
    </div>
  )
}

// ─── Detail Drawer ────────────────────────────────────────────────────
function DetailDrawer({ order, onClose, onEdit, onDelete, onInvoice }) {
  const [copied, setCopied] = useState(false)
  if (!order) return null
  const cfg = STATUS[order.status] || STATUS.Menunggu
  const statusOrder = ['Menunggu', 'Sedang Dikerjakan', 'Selesai']
  const currentIdx = statusOrder.indexOf(order.status)

  const copyId = () => {
    navigator.clipboard.writeText(order.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div className="relative w-full max-w-md h-full overflow-y-auto flex flex-col animate-slideRight"
        style={{
          background: 'linear-gradient(160deg,#06140e 0%,#0a1f16 100%)',
          borderLeft: '1px solid rgba(34,197,94,0.15)',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.6)'
        }}
        onClick={e => e.stopPropagation()}>

        <div className="h-1 flex-shrink-0 animate-pulse" style={{ background: `linear-gradient(90deg,${cfg.color},${cfg.color}66)` }} />

        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0">
          <button onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:scale-110 transition-all duration-300 hover:rotate-12"
            style={{ background: 'rgba(255,255,255,0.04)' }}>
            <MdArrowBack size={18} />
          </button>
          <div className="flex gap-2">
            <button onClick={() => { onClose(); onEdit(order) }}
              className="w-9 h-9 rounded-full flex items-center justify-center text-yellow-400 hover:scale-110 transition-all duration-300 hover:rotate-12"
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              <MdEdit size={16} />
            </button>
            <button onClick={() => { onClose(); onDelete(order) }}
              className="w-9 h-9 rounded-full flex items-center justify-center text-red-400 hover:scale-110 transition-all duration-300 hover:rotate-12"
              style={{ background: 'rgba(255,255,255,0.04)' }}>
              <MdDelete size={16} />
            </button>
          </div>
        </div>

        <div className="px-5 pb-5 flex-shrink-0 animate-fadeInUp" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          <div className="flex items-start gap-4 mb-4">
            <Avatar name={order.customer} size={52} />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-black text-white truncate">{order.customer}</h2>
              <p className="text-gray-500 text-sm">{order.vehicle.split(' - ')[0]}</p>
              <p className="text-gray-600 text-xs mt-0.5 font-mono">{order.vehicle.split(' - ')[1] || ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-mono font-bold text-green-400">{order.id}</span>
            <button onClick={copyId}
              className="w-6 h-6 rounded-md flex items-center justify-center transition-all duration-300 hover:bg-white/10 hover:scale-110"
              style={{ color: copied ? '#22C55E' : '#4B5563' }}>
              {copied ? <MdCheck size={13} className="animate-bounce-soft" /> : <MdContentCopy size={13} />}
            </button>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="mx-5 mb-5 rounded-2xl p-4 flex-shrink-0 animate-fadeInUp"
          style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)', animationDelay: '150ms', animationFillMode: 'both' }}>
          <p className="text-xs text-gray-500 mb-1">Total Pembayaran</p>
          <p className="text-3xl font-black text-white">
            <AnimatedNumber value={order.total} format={(v) => formatCurrency(Math.round(v))} duration={1000} />
          </p>
        </div>

        <div className="mx-5 mb-5 rounded-2xl overflow-hidden flex-shrink-0 animate-fadeInUp"
          style={{ border: '1px solid rgba(34,197,94,0.08)', background: 'rgba(0,0,0,0.3)', animationDelay: '200ms', animationFillMode: 'both' }}>
          {[
            { icon: <MdBuild size={15}/>,         label: 'Layanan',   value: order.service },
            { icon: <MdDirectionsCar size={15}/>,  label: 'Kendaraan', value: order.vehicle.split(' - ')[0] },
            { icon: <MdPerson size={15}/>,         label: 'Mekanik',   value: order.mechanic || 'Belum ditugaskan' },
            { icon: <MdCalendarToday size={15}/>,  label: 'Tanggal',   value: order.date },
          ].map((row, i, arr) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/5"
              style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(34,197,94,0.05)' : 'none' }}>
              <div className="flex items-center gap-2.5">
                <span className="text-green-900/70 transition-transform duration-300 group-hover:scale-110">{row.icon}</span>
                <span className="text-xs text-gray-500">{row.label}</span>
              </div>
              <span className="text-sm text-gray-300 font-medium text-right max-w-[200px] truncate">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="mx-5 mb-5 flex-shrink-0 animate-fadeInUp" style={{ animationDelay: '250ms', animationFillMode: 'both' }}>
          <p className="text-xs text-gray-600 uppercase tracking-wider mb-3">Progress</p>
          <div className="space-y-2.5">
            {statusOrder.map((s, idx) => {
              const done = idx <= currentIdx
              const current = idx === currentIdx
              const lineDone = idx < currentIdx
              return (
                <div key={s} className="flex items-center gap-3 animate-fadeInUp" style={{ animationDelay: `${300 + idx * 80}ms`, animationFillMode: 'both' }}>
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500"
                      style={done
                        ? { background: cfg.color + '22', border: `1.5px solid ${cfg.color}` }
                        : { background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.06)' }}>
                      {done && <MdCheck size={13} style={{ color: cfg.color }} className="animate-bounce-soft" />}
                    </div>
                    {idx < statusOrder.length - 1 && (
                      <div className="w-0.5 h-4 mt-1 rounded-full transition-all duration-700"
                        style={{ background: lineDone ? cfg.color + '40' : 'rgba(255,255,255,0.04)' }} />
                    )}
                  </div>
                  <span className="text-sm pb-4 transition-colors duration-300" style={{ color: done ? (current ? '#fff' : cfg.color + 'aa') : '#2a2a2a' }}>
                    {s}
                    {current && <span className="ml-2 text-xs animate-pulse" style={{ color: cfg.color }}>← sekarang</span>}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="px-5 pb-8 mt-auto flex-shrink-0 animate-fadeInUp" style={{ animationDelay: '350ms', animationFillMode: 'both' }}>
          <button onClick={() => { onClose(); onInvoice(order) }}
            className="w-full py-3 rounded-xl text-sm font-bold text-black transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(90deg,#22C55E,#16a34a)' }}>
            <MdReceipt size={16} className="animate-pulse" /> Lihat Invoice
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Order Card ────────────────────────────────────────────────────────
function OrderCard({ order, onDetail, onEdit, onDelete, onInvoice, onQuickAssign, delay = 0 }) {
  const cfg = STATUS[order.status] || STATUS.Menunggu
  return (
    <div
      onClick={() => onDetail(order)}
      className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1 hover:shadow-2xl hover:shadow-green-500/5 animate-fadeInUp"
      style={{
        background: 'linear-gradient(145deg,rgba(6,30,20,0.95),rgba(8,40,28,0.85))',
        border: '1px solid rgba(34,197,94,0.1)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        animationDelay: `${delay}ms`,
        animationFillMode: 'both',
      }}>
      <div className="h-0.5 transition-all duration-500 group-hover:h-1" style={{ background: cfg.color }} />
      <div className="p-4">
        <div className="absolute top-4 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-95 origin-top-right"
          onClick={e => e.stopPropagation()}>
          {order.needsMechanicAssignment && (
            <button onClick={() => onQuickAssign(order)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-blue-400 transition-all duration-300 hover:scale-110 hover:bg-blue-500/15"
              style={{ background: 'rgba(0,0,0,0.4)' }} title="Tugaskan Mekanik">
              <MdBuild size={13} />
            </button>
          )}
          <button onClick={() => onInvoice(order)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-blue-400 transition-all duration-300 hover:scale-110 hover:bg-blue-500/15"
            style={{ background: 'rgba(0,0,0,0.4)' }}>
            <MdReceipt size={13} />
          </button>
          <button onClick={() => onEdit(order)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-yellow-400 transition-all duration-300 hover:scale-110 hover:bg-yellow-500/15"
            style={{ background: 'rgba(0,0,0,0.4)' }}>
            <MdEdit size={13} />
          </button>
          <button onClick={() => onDelete(order)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 transition-all duration-300 hover:scale-110 hover:bg-red-500/15"
            style={{ background: 'rgba(0,0,0,0.4)' }}>
            <MdDelete size={13} />
          </button>
        </div>
        <div className="flex items-center gap-3 mb-3 pr-20">
          <Avatar name={order.customer} size={40} />
          <div className="min-w-0">
            <p className="text-white font-bold text-sm truncate">{order.customer}</p>
            <p className="text-gray-500 text-xs font-mono">{order.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs px-2.5 py-1 rounded-full font-medium transition-all duration-300 hover:scale-105"
            style={{ background: 'rgba(34,197,94,0.08)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.12)' }}>
            {order.service}
          </span>
          {order.needsMechanicAssignment && (
            <span className="text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 animate-pulse"
              style={{ background: 'rgba(96,165,250,0.08)', color: '#60A5FA', border: '1px solid rgba(96,165,250,0.15)' }}>
              <MdBuild size={11} /> Perlu Mekanik
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
          <MdDirectionsCar size={13} className="text-gray-700" />
          {order.vehicle.split(' - ')[0]}
        </p>
        <div className="flex items-center justify-between pt-3"
          style={{ borderTop: '1px solid rgba(34,197,94,0.06)' }}>
          <StatusBadge status={order.status} size="sm" />
          <div className="text-right">
            <p className="text-white font-black text-sm">{formatCurrency(order.total)}</p>
            <p className="text-gray-600 text-xs">{order.date}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Invoice Modal ────────────────────────────────────────────────────
function InvoiceModal({ order, onClose }) {
  const printInvoice = () => {
    const w = window.open('', '_blank', 'width=800,height=600')
    if (!w) { alert('Izinkan pop-up untuk mencetak invoice'); return }
    w.document.write(`<!DOCTYPE html><html><head><title>Invoice ${order.id}</title>
    <style>body{font-family:Arial,sans-serif;margin:0;padding:20px;background:#0a0a0a;color:#e0e0e0;}
    .c{max-width:600px;margin:0 auto;padding:20px;border:1px solid #222;background:#111;}
    .hd{display:flex;justify-content:space-between;margin-bottom:30px;}
    table{width:100%;border-collapse:collapse;margin-bottom:20px;}
    th{text-align:left;padding:8px;background:#1a1a1a;color:#aaa;}td{padding:8px;border-bottom:1px solid #222;color:#ccc;}
    .tot{background:#1a1a1a;font-weight:bold;color:#22C55E;}
    </style></head><body><div class="c">
    <div class="hd"><div><div style="font-size:22px;font-weight:bold;color:#22C55E">EstherGarage</div>
    <div style="font-size:11px;color:#666">Bengkel Terpercaya</div></div>
    <div style="text-align:right"><div style="font-weight:bold;color:#fff">INVOICE</div>
    <div style="color:#22C55E;font-weight:bold">${order.id}</div>
    <div style="font-size:12px;color:#666">${order.date}</div></div></div>
    <div style="border-top:1px solid #222;border-bottom:1px solid #222;padding:10px 0;margin-bottom:20px">
    <div style="font-size:11px;color:#666">Kepada:</div><div style="font-weight:bold;color:#fff">${order.customer}</div>
    <div style="font-size:12px;color:#888">${order.vehicle}</div></div>
    <table><thead><tr><th>Layanan</th><th style="text-align:right">Harga</th></tr></thead>
    <tbody><tr><td>${order.service}</td><td style="text-align:right">${formatCurrency(order.total)}</td></tr></tbody>
    <tfoot><tr class="tot"><td>TOTAL</td><td style="text-align:right">${formatCurrency(order.total)}</td></tr></tfoot>
    </table><div style="margin-top:20px;font-size:12px;color:#888">Status: <strong style="color:${order.status==='Selesai'?'#22C55E':'#f59e0b'}">${order.status}</strong></div>
    <div style="font-size:11px;margin-top:8px;color:#555">Terima kasih atas kepercayaan Anda!</div>
    </div></body></html>`)
    w.document.close(); w.print()
    w.onafterprint = () => w.close()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden animate-slideUp"
        style={{ background: 'linear-gradient(160deg,#06140e,#0a1f16)', border: '1px solid rgba(34,197,94,0.15)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(34,197,94,0.08)' }}>
          <div className="flex items-center gap-2"><MdReceipt size={18} className="text-green-400 animate-pulse" /><h3 className="text-white font-bold">Invoice</h3></div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-all duration-300 hover:rotate-90"><MdClose size={18} /></button>
        </div>
        <div className="p-5">
          <div className="rounded-2xl p-4 mb-4 animate-fadeInUp" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(34,197,94,0.08)', animationDelay: '100ms', animationFillMode: 'both' }}>
            <div className="flex justify-between mb-3">
              <div><p className="text-green-400 font-black text-lg">EstherGarage</p><p className="text-gray-600 text-xs">Bengkel Terpercaya</p></div>
              <div className="text-right"><p className="text-white font-bold text-sm">INVOICE</p><p className="text-green-400 text-xs font-mono">{order.id}</p><p className="text-gray-600 text-xs">{order.date}</p></div>
            </div>
            <div className="py-3 mb-3" style={{ borderTop: '1px solid rgba(34,197,94,0.08)', borderBottom: '1px solid rgba(34,197,94,0.08)' }}>
              <p className="text-gray-600 text-xs mb-1">Kepada:</p><p className="text-white font-semibold">{order.customer}</p><p className="text-gray-500 text-xs">{order.vehicle}</p>
            </div>
            <div className="flex justify-between py-2 text-sm"><span className="text-gray-400">{order.service}</span><span className="text-white">{formatCurrency(order.total)}</span></div>
            <div className="flex justify-between py-2 mt-1 text-sm font-bold" style={{ borderTop: '1px solid rgba(34,197,94,0.08)' }}>
              <span className="text-gray-300">TOTAL</span><span className="text-green-400">{formatCurrency(order.total)}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 transition-all duration-300 hover:bg-white/5 hover:scale-[1.02]" style={{ border: '1px solid rgba(34,197,94,0.08)' }}>Tutup</button>
            <button onClick={printInvoice} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-black transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(90deg,#22C55E,#16a34a)' }}><MdPrint size={15} /> Cetak</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Form Modal ──────────────────────────────────────────────────────
const SERVICE_OPTIONS = ['Servis Berkala','Ganti Oli','Tune Up','Servis Rem','Ganti Ban','Servis AC','Ganti Kampas Rem','Spooring & Balancing','Cuci Mobil','Detailing']
const inputCls = 'w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all duration-300 focus:ring-2 focus:ring-green-500/20 placeholder-gray-600'
const inputStyle = { background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(34,197,94,0.1)' }

function FormModal({ isOpen, onClose, onSubmit, initialData, editId, customers, mechanics }) {
  const [form, setForm] = useState(initialData)
  useEffect(() => { setForm(initialData) }, [initialData])
  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const total = parseFloat(form.total)
    if (isNaN(total) || total <= 0) return
    onSubmit({ ...form, total })
  }

  const isFromBooking = form.source === 'online-booking'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden animate-slideUp" style={{ background: 'linear-gradient(160deg,#06140e,#0a1f16)', border: '1px solid rgba(34,197,94,0.15)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(34,197,94,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform duration-300 hover:rotate-12" style={{ background: 'rgba(34,197,94,0.12)' }}>
              {editId ? <MdEdit size={15} className="text-green-400" /> : <MdAdd size={15} className="text-green-400" />}
            </div>
            <h3 className="text-white font-bold">{editId ? 'Edit Order' : 'Tambah Order Baru'}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-all duration-300 hover:rotate-90"><MdClose size={18} /></button>
        </div>
        {isFromBooking && (
          <div className="mx-5 mt-4 px-3.5 py-2.5 rounded-xl flex items-start gap-2.5 animate-fadeInUp" style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)' }}>
            <MdCheckCircle size={16} className="text-blue-400 flex-shrink-0 mt-0.5 animate-pulse" />
            <p className="text-xs text-blue-300">
              Order ini berasal dari <strong>booking online</strong> — data pelanggan, kendaraan, layanan & total sudah otomatis terisi. Anda hanya perlu menugaskan <strong>mekanik</strong>.
            </p>
          </div>
        )}
        <form id="order-form" onSubmit={handleSubmit} className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="animate-fadeInUp" style={{ animationDelay: '50ms', animationFillMode: 'both' }}>
            <label className="block text-xs text-gray-400 mb-1.5">Pelanggan <span className="text-red-500">*</span></label>
            <input
              list="customer-list"
              required
              value={form.customer || ''}
              onChange={e => setForm(f => ({...f, customer: e.target.value}))}
              placeholder="Pilih atau ketik nama pelanggan..."
              className={inputCls}
              style={inputStyle}
              autoComplete="off"
            />
            <datalist id="customer-list">
              {customers.map(c => <option key={c.id} value={c.name} />)}
            </datalist>
          </div>
          <div className="animate-fadeInUp" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            <label className="block text-xs text-gray-400 mb-1.5">Kendaraan <span className="text-red-500">*</span></label>
            <input required value={form.vehicle || ''} onChange={e => setForm(f => ({...f, vehicle: e.target.value}))} placeholder="Toyota Avanza - B 1234 ABC" className={inputCls} style={inputStyle} />
          </div>
          <div className="animate-fadeInUp" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
            <label className="block text-xs text-gray-400 mb-1.5">Layanan <span className="text-red-500">*</span></label>
            <select required value={form.service || ''} onChange={e => setForm(f => ({...f, service: e.target.value}))} className={inputCls} style={inputStyle}><option value="">Pilih Layanan</option>{SERVICE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="animate-fadeInUp" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
              <label className="block text-xs text-gray-400 mb-1.5">Total (Rp) <span className="text-red-500">*</span></label>
              <input type="number" required min="0" step="1000" value={form.total || ''} onChange={e => setForm(f => ({...f, total: e.target.value}))} placeholder="350000" className={inputCls} style={inputStyle} />
            </div>
            <div className="animate-fadeInUp" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
              <label className="block text-xs text-gray-400 mb-1.5">Tanggal <span className="text-red-500">*</span></label>
              <input type="date" required value={form.date || ''} onChange={e => setForm(f => ({...f, date: e.target.value}))} className={inputCls} style={inputStyle} />
            </div>
          </div>
          <div className="animate-fadeInUp" style={{ animationDelay: '250ms', animationFillMode: 'both' }}>
            <label className="block text-xs text-gray-400 mb-1.5">Mekanik</label>
            <input
              list="mechanic-list"
              value={form.mechanic || ''}
              onChange={e => setForm(f => ({...f, mechanic: e.target.value}))}
              placeholder="Pilih atau ketik nama mekanik..."
              className={inputCls}
              style={inputStyle}
              autoComplete="off"
            />
            <datalist id="mechanic-list">
              {mechanics.map(m => <option key={m.id} value={m.name} />)}
            </datalist>
          </div>
          <div className="animate-fadeInUp" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
            <label className="block text-xs text-gray-400 mb-1.5">Status</label>
            <select value={form.status || 'Menunggu'} onChange={e => setForm(f => ({...f, status: e.target.value}))} className={inputCls} style={inputStyle}>
              {Object.keys(STATUS).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </form>
        <div className="flex gap-3 px-5 py-4" style={{ borderTop: '1px solid rgba(34,197,94,0.08)' }}>
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-all duration-300 hover:bg-white/5 hover:scale-[1.02]" style={{ border: '1px solid rgba(34,197,94,0.08)' }}>Batal</button>
          <button type="submit" form="order-form" className="flex-1 py-2.5 rounded-xl text-sm font-bold text-black transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(90deg,#22C55E,#16a34a)' }}><MdCheck size={15} className="animate-bounce-soft" /> {editId ? 'Simpan' : 'Buat Order'}</button>
        </div>
      </div>
    </div>
  )
}

// ─── Quick Assign Mekanik ──────────────────────────────────────────
function QuickAssignMechanic({ order, mechanics, onClose, onAssign }) {
  const [mechanic, setMechanic] = useState(order?.mechanic && order.mechanic !== '—' ? order.mechanic : '')
  if (!order) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl p-5 animate-slideUp" style={{ background: 'linear-gradient(160deg,#06140e,#0a1f16)', border: '1px solid rgba(96,165,250,0.15)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2.5 mb-1">
          <MdBuild className="text-blue-400 animate-pulse" size={18} />
          <h3 className="text-white font-bold">Tugaskan Mekanik</h3>
        </div>
        <p className="text-xs text-gray-500 mb-4">Order <span className="text-green-400 font-mono">{order.id}</span> dari booking online — {order.customer} · {order.service}</p>
        <label className="block text-xs text-gray-400 mb-1.5">Pilih Mekanik</label>
        <input
          list="quick-mechanic-list"
          autoFocus
          value={mechanic}
          onChange={e => setMechanic(e.target.value)}
          placeholder="Pilih atau ketik nama mekanik..."
          className={inputCls}
          style={inputStyle}
          autoComplete="off"
        />
        <datalist id="quick-mechanic-list">
          {mechanics.map(m => <option key={m.id} value={m.name} />)}
        </datalist>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-all duration-300 hover:bg-white/5" style={{ border: '1px solid rgba(34,197,94,0.08)' }}>Batal</button>
          <button
            onClick={() => mechanic && onAssign(order.id, mechanic)}
            disabled={!mechanic}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-black transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-40 disabled:hover:scale-100"
            style={{ background: 'linear-gradient(90deg,#60A5FA,#3B82F6)' }}>
            <MdCheck size={15} className="animate-bounce-soft" /> Tugaskan
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Delete Confirm ───────────────────────────────────────────────────
function DeleteConfirm({ target, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fadeIn" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }} onClick={onCancel}>
      <div className="w-full max-w-xs rounded-2xl p-6 text-center animate-slideUp" style={{ background: '#0a1a12', border: '1px solid rgba(239,68,68,0.2)', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }} onClick={e => e.stopPropagation()}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse" style={{ background: 'rgba(239,68,68,0.08)', border: '2px solid rgba(239,68,68,0.15)' }}><MdDelete size={26} className="text-red-500" /></div>
        <h3 className="text-white font-bold text-lg mb-2">Hapus Order?</h3>
        <p className="text-gray-400 text-sm mb-6">Order <span className="text-green-400 font-mono font-bold">{target?.id}</span> akan dihapus permanen.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-all duration-300 hover:bg-white/5 hover:scale-[1.02]" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>Batal</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-95" style={{ background: 'linear-gradient(90deg,#ef4444,#dc2626)' }}>Hapus</button>
        </div>
      </div>
    </div>
  )
}

// ─── Sort Icon ────────────────────────────────────────────────────────
const SortIcon = ({ column, sortColumn, sortDirection }) => {
  const isActive = sortColumn === column
  return (
    <span className={`inline-block transition-all duration-300 ${isActive ? 'text-green-400' : 'text-gray-700'}`}>
      {!isActive && <MdUnfoldMore size={13} />}
      {isActive && sortDirection === 'asc' && <MdExpandLess size={13} className="animate-bounce-soft" />}
      {isActive && sortDirection === 'desc' && <MdExpandMore size={13} className="animate-bounce-soft" />}
    </span>
  )
}

// ─── Halaman Utama ────────────────────────────────────────────────────
export default function Orders() {
  const [orders, setOrders] = useState(() => {
    try { const s = sessionStorage.getItem('garage_orders'); return s ? JSON.parse(s) : ordersData } catch { return ordersData }
  })
  useEffect(() => {
    try { sessionStorage.setItem('garage_orders', JSON.stringify(orders)) } catch {}
  }, [orders])

  const [customersList, setCustomersList] = useState([])
  const [mechanicsList, setMechanicsList] = useState([])

  useEffect(() => {
    import('../hooks/useCustomerStore').then(({ getAllCustomersFromStore }) => {
      setCustomersList(getAllCustomersFromStore())
    }).catch(() => {
      import('../data/customersData.json').then(module => setCustomersList(module.default)).catch(() => {})
    })
  }, [])

  useEffect(() => {
    const storedMechanics = sessionStorage.getItem('garage_mechanics')
    if (storedMechanics) {
      setMechanicsList(JSON.parse(storedMechanics))
    } else {
      import('../data/mechanicsData.json').then(module => setMechanicsList(module.default)).catch(() => {})
    }
  }, [])

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')
  const [sortColumn, setSortColumn] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
  const [showFilter, setShowFilter] = useState(false)
  const [viewMode, setViewMode] = useState('table')
  const [showForm, setShowForm] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [editId, setEditId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [invoiceTarget, setInvoiceTarget] = useState(null)
  const [detailTarget, setDetailTarget] = useState(null)
  const [quickAssignTarget, setQuickAssignTarget] = useState(null)
  const filterRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilter(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSort = useCallback((col) => {
    if (sortColumn === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortColumn(col); setSortDir('asc') }
  }, [sortColumn])

  const filtered = useMemo(() => {
    let r = [...orders]
    if (search) { const s = search.toLowerCase(); r = r.filter(o => [o.customer, o.id, o.service, o.vehicle].some(v => v?.toLowerCase().includes(s))) }
    if (filterStatus) r = r.filter(o => o.status === filterStatus)
    if (filterFrom) r = r.filter(o => o.date >= filterFrom)
    if (filterTo) r = r.filter(o => o.date <= filterTo)
    if (sortColumn) r.sort((a, b) => {
      let av = sortColumn === 'total' ? Number(a[sortColumn]) : a[sortColumn]
      let bv = sortColumn === 'total' ? Number(b[sortColumn]) : b[sortColumn]
      return sortDir === 'asc' ? (av < bv ? -1 : av > bv ? 1 : 0) : (av > bv ? -1 : av < bv ? 1 : 0)
    })
    return r
  }, [orders, search, filterStatus, filterFrom, filterTo, sortColumn, sortDir])

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1
  useEffect(() => { setCurrentPage(1) }, [search, filterStatus, filterFrom, filterTo])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filtered.slice(start, start + itemsPerPage)
  }, [filtered, currentPage, itemsPerPage])

  const activeFilters = [filterStatus, filterFrom, filterTo].filter(Boolean).length
  const resetFilters = () => { setFilterStatus(''); setFilterFrom(''); setFilterTo(''); setSearch('') }

  const handleAdd = () => { setEditId(null); setShowForm(true) }
  const [pointToast, setPointToast] = useState(null)

  const handleEdit = (order) => { setEditId(order.id); setShowForm(true) }
  const handleSubmit = useCallback((data) => {
    const cleanedData = { ...data }
    if (cleanedData.mechanic && cleanedData.mechanic !== '—') {
      cleanedData.needsMechanicAssignment = false
    }

    if (editId) {
      const prevOrder = orders.find(o => o.id === editId)
      const isNewlySelesai = prevOrder?.status !== 'Selesai' && cleanedData.status === 'Selesai'
      const alreadyAwarded = prevOrder?.pointsAwarded === true

      if (isNewlySelesai && !alreadyAwarded && cleanedData.customer && cleanedData.total) {
        const result = adminAddPointsToCustomer(cleanedData.customer, editId, cleanedData.total, cleanedData.service)
        if (result.success) {
          setPointToast({
            name: cleanedData.customer,
            earned: result.earned,
            tierUpgraded: result.tierUpgraded,
            newTier: result.newTier,
          })
          setTimeout(() => setPointToast(null), 4000)
        }
        setOrders(prev => prev.map(o => o.id === editId ? { ...o, ...cleanedData, pointsAwarded: true } : o))
      } else {
        setOrders(prev => prev.map(o => o.id === editId ? { ...o, ...cleanedData } : o))
      }
    } else {
      setOrders(prev => [{ ...cleanedData, id: generateId(), pointsAwarded: false }, ...prev])
    }
    setShowForm(false); setEditId(null)
  }, [editId, orders])

  const handleQuickAssign = useCallback((orderId, mechanicName) => {
    setOrders(prev => prev.map(o => o.id === orderId
      ? { ...o, mechanic: mechanicName, needsMechanicAssignment: false }
      : o
    ))
    setQuickAssignTarget(null)
  }, [])
  const handleDelete = useCallback(() => {
    setOrders(prev => prev.filter(o => o.id !== deleteTarget.id))
    setDeleteTarget(null)
  }, [deleteTarget])
  const exportCSV = useCallback(() => {
    const rows = [['No. Order','Pelanggan','Kendaraan','Layanan','Status','Total','Tanggal'], ...filtered.map(o => [o.id, o.customer, o.vehicle, o.service, o.status, o.total, o.date])]
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `orders_${new Date().toISOString().slice(0,10)}.csv`; a.click()
  }, [filtered])

  const totalPendapatan = orders.filter(o => o.status === 'Selesai').reduce((s, o) => s + Number(o.total), 0)
  const counts = { selesai: orders.filter(o => o.status === 'Selesai').length, proses: orders.filter(o => o.status === 'Sedang Dikerjakan').length, menunggu: orders.filter(o => o.status === 'Menunggu').length }
  const thCls = "text-left py-3 px-3 text-[11px] text-gray-500 font-semibold uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-gray-300 transition-colors duration-300"

  return (
    <div className="page-animate bg-[#060f0a] min-h-screen p-4 md:p-6">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-fadeInUp">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Order Servis</h1>
          <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
            <AnimatedNumber value={orders.length} format={(v) => Math.round(v)} /> order terdaftar
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-green-400 transition-all duration-300 hover:bg-green-500/10 hover:scale-[1.04] active:scale-95"
            style={{ border: '1px solid rgba(34,197,94,0.15)' }}>
            <MdDownload size={16} className="transition-transform duration-300 group-hover:translate-y-0.5" /> Export
          </button>
          <button onClick={handleAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-black transition-all duration-300 hover:opacity-90 hover:scale-[1.04] active:scale-95"
            style={{ background: 'linear-gradient(90deg,#22C55E,#16a34a)', boxShadow: '0 4px 18px rgba(34,197,94,0.3)' }}>
            <MdAdd size={18} className="transition-transform duration-300 group-hover:rotate-90" /> Tambah Order
          </button>
        </div>
      </div>

      {/* ─── STATS CARDS ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Order', value: orders.length, color: '#94A3B8', bg: 'rgba(148,163,184,0.06)', delay: 0 },
          { label: 'Selesai', value: counts.selesai, color: '#22C55E', bg: 'rgba(34,197,94,0.06)', delay: 100 },
          { label: 'Sedang Dikerjakan', value: counts.proses, color: '#FBBF24', bg: 'rgba(251,191,36,0.06)', delay: 200 },
          { label: 'Pendapatan Masuk', value: totalPendapatan, color: '#60A5FA', bg: 'rgba(96,165,250,0.06)', delay: 300, format: (v) => `Rp ${(v/1000000).toFixed(1)}jt` },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl px-4 py-3 transition-all duration-500 hover:scale-[1.04] hover:shadow-lg hover:shadow-green-500/5 animate-fadeInUp"
            style={{
              background: s.bg,
              border: `1px solid ${s.color}15`,
              animationDelay: `${s.delay}ms`,
              animationFillMode: 'both',
            }}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-black" style={{ color: s.color }}>
              {s.format ? (
                <AnimatedNumber value={s.value} format={() => s.format(s.value)} duration={1000} />
              ) : (
                <AnimatedNumber value={s.value} format={(v) => Math.round(v)} duration={1000} />
              )}
            </p>
          </div>
        ))}
      </div>

      {/* ─── TABLE / GRID ─── */}
      <div className="rounded-2xl overflow-hidden animate-fadeInUp" style={{ background: 'rgba(10,26,18,0.8)', border: '1px solid rgba(34,197,94,0.06)', backdropFilter: 'blur(6px)', animationDelay: '100ms', animationFillMode: 'both' }}>
        {/* ─── TOOLBAR ─── */}
        <div className="flex flex-col sm:flex-row gap-3 p-4" style={{ borderBottom: '1px solid rgba(34,197,94,0.05)' }}>
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 transition-colors duration-300 focus-within:text-green-400" size={16} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari order, pelanggan, layanan..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-gray-300 outline-none transition-all duration-300 focus:ring-2 focus:ring-green-500/20 placeholder-gray-600"
              style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(34,197,94,0.08)' }}
            />
          </div>
          <div className="flex gap-2">
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setShowFilter(p => !p)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-300 hover:scale-[1.04] active:scale-95 ${
                  activeFilters > 0
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-green-500/5 text-gray-400 border border-green-500/10 hover:bg-green-500/10'
                }`}>
                <MdFilterList size={16} className={`transition-transform duration-300 ${showFilter ? 'rotate-180' : ''}`} />
                {activeFilters > 0 && (
                  <span className="w-4 h-4 rounded-full text-xs font-bold text-black flex items-center justify-center animate-pulse" style={{ background: '#22C55E' }}>
                    {activeFilters}
                  </span>
                )}
              </button>
              {showFilter && (
                <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl p-4 z-30 animate-fadeInUp" style={{ background: '#06140e', border: '1px solid rgba(34,197,94,0.12)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">Filter</p>
                  <div className="space-y-3">
                    <div className="animate-fadeInUp" style={{ animationDelay: '50ms', animationFillMode: 'both' }}>
                      <label className="block text-xs text-gray-500 mb-1.5">Status</label>
                      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none transition-all duration-300 focus:ring-2 focus:ring-green-500/20" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(34,197,94,0.08)' }}>
                        <option value="">Semua Status</option>
                        {Object.keys(STATUS).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="animate-fadeInUp" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
                        <label className="block text-xs text-gray-500 mb-1.5">Dari</label>
                        <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none transition-all duration-300 focus:ring-2 focus:ring-green-500/20" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(34,197,94,0.08)' }} />
                      </div>
                      <div className="animate-fadeInUp" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
                        <label className="block text-xs text-gray-500 mb-1.5">Sampai</label>
                        <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none transition-all duration-300 focus:ring-2 focus:ring-green-500/20" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(34,197,94,0.08)' }} />
                      </div>
                    </div>
                    <button onClick={resetFilters} className="w-full py-2 rounded-xl text-xs text-red-400 transition-all duration-300 hover:bg-red-500/10 hover:scale-[1.02] active:scale-95" style={{ border: '1px solid rgba(239,68,68,0.15)' }}>
                      Reset Semua
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(34,197,94,0.08)' }}>
              {[
                { id: 'table', icon: <MdTableRows size={16}/> },
                { id: 'grid', icon: <MdGridView size={16}/> }
              ].map(v => (
                <button
                  key={v.id}
                  onClick={() => setViewMode(v.id)}
                  className="w-9 h-9 flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={viewMode === v.id
                    ? { background: 'rgba(34,197,94,0.12)', color: '#22C55E' }
                    : { background: 'rgba(255,255,255,0.03)', color: '#4B5563' }}>
                  {v.icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ─── TABLE VIEW ─── */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 700 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(34,197,94,0.05)' }}>
                  {[
                    { key: 'id', label: 'No. Order' },
                    { key: 'customer', label: 'Pelanggan' },
                    { key: 'vehicle', label: 'Kendaraan', noSort: true },
                    { key: 'service', label: 'Layanan' },
                    { key: 'status', label: 'Status' },
                    { key: 'total', label: 'Total' },
                    { key: 'date', label: 'Tanggal' },
                    { key: 'aksi', label: 'Aksi', noSort: true }
                  ].map((col, idx) => (
                    <th
                      key={col.key}
                      className={thCls}
                      onClick={() => !col.noSort && handleSort(col.key)}
                      style={{ animationDelay: `${150 + idx * 50}ms`, animationFillMode: 'both' }}>
                      <span className="flex items-center gap-1">
                        {col.label}
                        {!col.noSort && <SortIcon column={col.key} sortColumn={sortColumn} sortDirection={sortDir} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((order, idx) => (
                  <tr
                    key={order.id}
                    onClick={() => setDetailTarget(order)}
                    className="cursor-pointer transition-all duration-300 hover:bg-green-500/[0.03] group animate-fadeInUp"
                    style={{
                      borderBottom: '1px solid rgba(34,197,94,0.03)',
                      animationDelay: `${200 + idx * 40}ms`,
                      animationFillMode: 'both',
                    }}>
                    <td className="py-3 px-3 text-xs text-green-400 font-mono font-semibold whitespace-nowrap">{order.id}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={order.customer} size={32} />
                        <span className="text-sm text-white font-medium">{order.customer}</span>
                        {order.needsMechanicAssignment && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5 animate-pulse" style={{ background: 'rgba(96,165,250,0.08)', color: '#60A5FA', border: '1px solid rgba(96,165,250,0.12)' }}>
                            <MdBuild size={9} /> Mekanik
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-400 whitespace-nowrap max-w-[160px] truncate">{order.vehicle.split(' - ')[0]}</td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] px-2 py-1 rounded-full transition-all duration-300 hover:scale-105" style={{ background: 'rgba(34,197,94,0.06)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.08)' }}>
                        {order.service}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap"><StatusBadge status={order.status} size="sm" /></td>
                    <td className="py-3 px-3 text-sm text-white font-bold whitespace-nowrap">{formatCurrency(order.total)}</td>
                    <td className="py-3 px-3 text-xs text-gray-500 whitespace-nowrap">{order.date}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        {order.needsMechanicAssignment && (
                          <button onClick={() => setQuickAssignTarget(order)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-400 transition-all duration-300 hover:scale-110 hover:bg-blue-500/10"
                            title="Tugaskan Mekanik">
                            <MdBuild size={15} />
                          </button>
                        )}
                        <button onClick={() => setInvoiceTarget(order)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-400 transition-all duration-300 hover:scale-110 hover:bg-blue-500/10">
                          <MdReceipt size={15} />
                        </button>
                        <button onClick={() => handleEdit(order)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-yellow-400 transition-all duration-300 hover:scale-110 hover:bg-yellow-500/10">
                          <MdEdit size={15} />
                        </button>
                        <button onClick={() => setDeleteTarget(order)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 transition-all duration-300 hover:scale-110 hover:bg-red-500/10">
                          <MdDelete size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8}>
                      <div className="text-center py-16 flex flex-col items-center gap-3 animate-fadeIn">
                        <MdReceipt size={48} className="text-gray-700 animate-pulse" />
                        <p className="text-gray-600 text-sm">Tidak ada order ditemukan</p>
                        <button onClick={resetFilters} className="text-green-500 text-xs hover:underline flex items-center gap-1 transition-all duration-300 hover:scale-105">
                          <MdRefresh size={13} className="transition-transform duration-300 hover:rotate-180" /> Reset filter
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── GRID VIEW ─── */}
        {viewMode === 'grid' && (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginatedData.map((order, idx) => (
              <OrderCard
                key={order.id}
                order={order}
                onDetail={setDetailTarget}
                onEdit={handleEdit}
                onDelete={setDeleteTarget}
                onInvoice={setInvoiceTarget}
                onQuickAssign={setQuickAssignTarget}
                delay={200 + idx * 80}
              />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-3 text-center py-16 flex flex-col items-center gap-3 animate-fadeIn">
                <MdReceipt size={48} className="text-gray-700 animate-pulse" />
                <p className="text-gray-600 text-sm">Tidak ada order ditemukan</p>
              </div>
            )}
          </div>
        )}

        {/* ─── PAGINATION ─── */}
        <div className="px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid rgba(34,197,94,0.04)' }}>
          <p className="text-xs text-gray-600 animate-fadeIn" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
            Menampilkan <span className="text-gray-300 font-semibold">{filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-gray-300 font-semibold">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> dari <span className="text-green-500 font-semibold">{filtered.length}</span> order {activeFilters > 0 && "(disaring)"}
          </p>
          {filtered.length > 0 && totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          )}
        </div>
      </div>

      {/* ─── MODALS ─── */}
      {detailTarget && (
        <DetailDrawer
          order={detailTarget}
          onClose={() => setDetailTarget(null)}
          onEdit={(o) => { setDetailTarget(null); handleEdit(o) }}
          onDelete={(o) => { setDetailTarget(null); setDeleteTarget(o) }}
          onInvoice={(o) => { setDetailTarget(null); setInvoiceTarget(o) }}
        />
      )}
      <FormModal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditId(null) }}
        onSubmit={handleSubmit}
        initialData={editId ? orders.find(o => o.id === editId) || {} : { customer: '', vehicle: '', service: '', status: 'Menunggu', total: '', date: new Date().toISOString().slice(0,10), mechanic: '' }}
        editId={editId}
        customers={customersList}
        mechanics={mechanicsList}
      />
      {quickAssignTarget && (
        <QuickAssignMechanic
          order={quickAssignTarget}
          mechanics={mechanicsList}
          onClose={() => setQuickAssignTarget(null)}
          onAssign={handleQuickAssign}
        />
      )}
      {invoiceTarget && <InvoiceModal order={invoiceTarget} onClose={() => setInvoiceTarget(null)} />}
      {deleteTarget && <DeleteConfirm target={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}

      {/* ─── POINT TOAST ─── */}
      {pointToast && (
        <div className="fixed bottom-6 right-6 z-[100] animate-bounce-in"
          style={{
            background: 'linear-gradient(135deg,#06140e,#0a1f16)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(34,197,94,0.15)',
            padding: '16px 20px',
            minWidth: 280,
            maxWidth: 340,
          }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse"
              style={{ background: 'rgba(34,197,94,0.1)' }}>
              <MdStars size={22} className="text-green-400 animate-spin-slow" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Poin Diberikan! 🎉</p>
              <p className="text-gray-400 text-xs mt-0.5">
                <span className="text-green-400 font-semibold">{pointToast.name}</span> mendapat{' '}
                <span className="text-yellow-400 font-bold animate-pulse">+{pointToast.earned} poin</span>
              </p>
              {pointToast.tierUpgraded && (
                <p className="text-xs mt-1 font-semibold animate-bounce-soft" style={{ color: '#FBBF24' }}>
                  🏆 Naik ke tier {pointToast.newTier}!
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── GLOBAL ANIMATION STYLES ─── */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.2); }
          70% { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
        @keyframes bounce-soft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.7) translateY(20px); }
          60% { opacity: 1; transform: scale(1.05) translateY(0); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease both;
        }
        .animate-slideUp {
          animation: slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .animate-slideRight {
          animation: slideRight 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s ease-out infinite;
        }
        .animate-bounce-soft {
          animation: bounce-soft 1.2s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 6s linear infinite;
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .page-animate > * {
          will-change: transform, opacity;
        }
      `}</style>
    </div>
  )
}