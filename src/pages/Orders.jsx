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

// ─── Status config ────────────────────────────────────────────────────
const STATUS = {
  Selesai:           { color: '#22C55E', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.25)',   dot: '#22C55E', icon: MdCheckCircle },
  'Sedang Dikerjakan': { color: '#FBBF24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.25)',  dot: '#FBBF24', icon: MdSchedule   },
  Menunggu:          { color: '#94A3B8', bg: 'rgba(148,163,184,0.1)',  border: 'rgba(148,163,184,0.2)',  dot: '#94A3B8', icon: MdPending    },
}

// ─── StatusBadge ──────────────────────────────────────────────────────
function StatusBadge({ status, size = 'md' }) {
  const cfg = STATUS[status] || STATUS.Menunggu
  const pad = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${pad}`}
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse" style={{ background: cfg.dot }} />
      {status}
    </span>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────
function Avatar({ name, size = 32 }) {
  const hue = stringToHue(name)
  return (
    <div className="rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0"
      style={{
        width: size, height: size, fontSize: size * 0.35,
        background: `hsl(${hue},55%,22%)`,
        border: `1px solid hsl(${hue},55%,32%)`,
        color: `hsl(${hue},75%,65%)`
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
    <div className="fixed inset-0 z-50 flex justify-end"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="relative w-full max-w-md h-full overflow-y-auto flex flex-col"
        style={{
          background: 'linear-gradient(160deg,#061a14 0%,#082b1e 100%)',
          borderLeft: '1px solid rgba(34,197,94,0.2)',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.5)'
        }}
        onClick={e => e.stopPropagation()}>

        <div className="h-1 flex-shrink-0" style={{ background: `linear-gradient(90deg,${cfg.color},${cfg.color}88)` }} />

        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0">
          <button onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:scale-110 transition-all"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            <MdArrowBack size={18} />
          </button>
          <div className="flex gap-2">
            <button onClick={() => { onClose(); onEdit(order) }}
              className="w-9 h-9 rounded-full flex items-center justify-center text-yellow-400 hover:scale-110 transition-all"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              <MdEdit size={16} />
            </button>
            <button onClick={() => { onClose(); onDelete(order) }}
              className="w-9 h-9 rounded-full flex items-center justify-center text-red-400 hover:scale-110 transition-all"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              <MdDelete size={16} />
            </button>
          </div>
        </div>

        <div className="px-5 pb-5 flex-shrink-0">
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
              className="w-6 h-6 rounded-md flex items-center justify-center transition-all hover:bg-white/10"
              style={{ color: copied ? '#22C55E' : '#4B5563' }}>
              {copied ? <MdCheck size={13} /> : <MdContentCopy size={13} />}
            </button>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="mx-5 mb-5 rounded-2xl p-4 flex-shrink-0"
          style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
          <p className="text-xs text-gray-500 mb-1">Total Pembayaran</p>
          <p className="text-3xl font-black text-white">{formatCurrency(order.total)}</p>
        </div>

        <div className="mx-5 mb-5 rounded-2xl overflow-hidden flex-shrink-0"
          style={{ border: '1px solid rgba(34,197,94,0.1)', background: 'rgba(11,59,46,0.2)' }}>
          {[
            { icon: <MdBuild size={15}/>,         label: 'Layanan',   value: order.service },
            { icon: <MdDirectionsCar size={15}/>,  label: 'Kendaraan', value: order.vehicle.split(' - ')[0] },
            { icon: <MdPerson size={15}/>,         label: 'Mekanik',   value: order.mechanic || 'Belum ditugaskan' },
            { icon: <MdCalendarToday size={15}/>,  label: 'Tanggal',   value: order.date },
          ].map((row, i, arr) => (
            <div key={i} className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(34,197,94,0.07)' : 'none' }}>
              <div className="flex items-center gap-2.5">
                <span className="text-green-800">{row.icon}</span>
                <span className="text-xs text-gray-500">{row.label}</span>
              </div>
              <span className="text-sm text-gray-200 font-medium text-right max-w-[200px] truncate">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="mx-5 mb-5 flex-shrink-0">
          <p className="text-xs text-gray-600 uppercase tracking-wider mb-3">Progress</p>
          <div className="space-y-2.5">
            {statusOrder.map((s, idx) => {
              const done = idx <= currentIdx
              const current = idx === currentIdx
              const lineDone = idx < currentIdx
              return (
                <div key={s} className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                      style={done
                        ? { background: cfg.color + '22', border: `1.5px solid ${cfg.color}` }
                        : { background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)' }}>
                      {done && <MdCheck size={13} style={{ color: cfg.color }} />}
                    </div>
                    {idx < statusOrder.length - 1 && (
                      <div className="w-0.5 h-4 mt-1 rounded-full"
                        style={{ background: lineDone ? cfg.color + '60' : 'rgba(255,255,255,0.06)' }} />
                    )}
                  </div>
                  <span className="text-sm pb-4" style={{ color: done ? (current ? '#fff' : cfg.color + 'cc') : '#374151' }}>
                    {s}
                    {current && <span className="ml-2 text-xs" style={{ color: cfg.color }}>← sekarang</span>}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="px-5 pb-8 mt-auto flex-shrink-0">
          <button onClick={() => { onClose(); onInvoice(order) }}
            className="w-full py-3 rounded-xl text-sm font-bold text-black transition-all hover:opacity-90 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(90deg,#22C55E,#16a34a)' }}>
            <MdReceipt size={16} /> Lihat Invoice
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Order Card ────────────────────────────────────────────────────────
function OrderCard({ order, onDetail, onEdit, onDelete, onInvoice }) {
  const cfg = STATUS[order.status] || STATUS.Menunggu
  return (
    <div
      onClick={() => onDetail(order)}
      className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.015] hover:-translate-y-0.5"
      style={{
        background: 'linear-gradient(145deg,rgba(6,40,31,0.95),rgba(11,59,46,0.8))',
        border: '1px solid rgba(34,197,94,0.15)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.2)'
      }}>
      <div className="h-0.5" style={{ background: cfg.color }} />
      <div className="p-4">
        <div className="absolute top-4 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={e => e.stopPropagation()}>
          <button onClick={() => onInvoice(order)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-blue-400 transition-all hover:bg-blue-500/15"
            style={{ background: 'rgba(0,0,0,0.3)' }}>
            <MdReceipt size={13} />
          </button>
          <button onClick={() => onEdit(order)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-yellow-400 transition-all hover:bg-yellow-500/15"
            style={{ background: 'rgba(0,0,0,0.3)' }}>
            <MdEdit size={13} />
          </button>
          <button onClick={() => onDelete(order)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 transition-all hover:bg-red-500/15"
            style={{ background: 'rgba(0,0,0,0.3)' }}>
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
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.15)' }}>
            {order.service}
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
          <MdDirectionsCar size={13} className="text-gray-700" />
          {order.vehicle.split(' - ')[0]}
        </p>
        <div className="flex items-center justify-between pt-3"
          style={{ borderTop: '1px solid rgba(34,197,94,0.08)' }}>
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
    <style>body{font-family:Arial,sans-serif;margin:0;padding:20px;background:white;color:#111;}
    .c{max-width:600px;margin:0 auto;padding:20px;border:1px solid #ddd;}
    .hd{display:flex;justify-content:space-between;margin-bottom:30px;}
    table{width:100%;border-collapse:collapse;margin-bottom:20px;}
    th{text-align:left;padding:8px;background:#f3f4f6;}td{padding:8px;border-bottom:1px solid #e5e7eb;}
    .tot{background:#f3f4f6;font-weight:bold;}
    </style></head><body><div class="c">
    <div class="hd"><div><div style="font-size:22px;font-weight:bold;color:#16A34A">EstherGarage</div>
    <div style="font-size:11px;color:#999">Bengkel Terpercaya</div></div>
    <div style="text-align:right"><div style="font-weight:bold">INVOICE</div>
    <div style="color:#16A34A;font-weight:bold">${order.id}</div>
    <div style="font-size:12px">${order.date}</div></div></div>
    <div style="border-top:1px solid #ccc;border-bottom:1px solid #ccc;padding:10px 0;margin-bottom:20px">
    <div style="font-size:11px;color:#666">Kepada:</div><div style="font-weight:bold">${order.customer}</div>
    <div style="font-size:12px">${order.vehicle}</div></div>
    <table><thead><tr><th>Layanan</th><th style="text-align:right">Harga</th></tr></thead>
    <tbody><tr><td>${order.service}</td><td style="text-align:right">${formatCurrency(order.total)}</td></tr></tbody>
    <tfoot><tr class="tot"><td>TOTAL</td><td style="text-align:right">${formatCurrency(order.total)}</td></tr></tfoot>
    </table><div style="margin-top:20px;font-size:12px">Status: <strong style="color:${order.status==='Selesai'?'#16A34A':'#f59e0b'}">${order.status}</strong></div>
    <div style="font-size:11px;margin-top:8px;color:#666">Terima kasih atas kepercayaan Anda!</div>
    </div></body></html>`)
    w.document.close(); w.print()
    w.onafterprint = () => w.close()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#061a14,#0a2e1e)', border: '1px solid rgba(34,197,94,0.2)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(34,197,94,0.1)' }}>
          <div className="flex items-center gap-2"><MdReceipt size={18} className="text-green-400" /><h3 className="text-white font-bold">Invoice</h3></div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5"><MdClose size={18} /></button>
        </div>
        <div className="p-5">
          <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(11,59,46,0.4)', border: '1px solid rgba(34,197,94,0.1)' }}>
            <div className="flex justify-between mb-3">
              <div><p className="text-green-400 font-black text-lg">EstherGarage</p><p className="text-gray-600 text-xs">Bengkel Terpercaya</p></div>
              <div className="text-right"><p className="text-white font-bold text-sm">INVOICE</p><p className="text-green-400 text-xs font-mono">{order.id}</p><p className="text-gray-600 text-xs">{order.date}</p></div>
            </div>
            <div className="py-3 mb-3" style={{ borderTop: '1px solid rgba(34,197,94,0.1)', borderBottom: '1px solid rgba(34,197,94,0.1)' }}>
              <p className="text-gray-600 text-xs mb-1">Kepada:</p><p className="text-white font-semibold">{order.customer}</p><p className="text-gray-500 text-xs">{order.vehicle}</p>
            </div>
            <div className="flex justify-between py-2 text-sm"><span className="text-gray-400">{order.service}</span><span className="text-white">{formatCurrency(order.total)}</span></div>
            <div className="flex justify-between py-2 mt-1 text-sm font-bold" style={{ borderTop: '1px solid rgba(34,197,94,0.1)' }}>
              <span className="text-gray-300">TOTAL</span><span className="text-green-400">{formatCurrency(order.total)}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 transition-all hover:bg-white/5" style={{ border: '1px solid rgba(34,197,94,0.12)' }}>Tutup</button>
            <button onClick={printInvoice} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-black transition-all hover:opacity-90 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(90deg,#22C55E,#16a34a)' }}><MdPrint size={15} /> Cetak</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Form Modal (dengan autocomplete pelanggan & mekanik) ─────────────
const SERVICE_OPTIONS = ['Servis Berkala','Ganti Oli','Tune Up','Servis Rem','Ganti Ban','Servis AC','Ganti Kampas Rem','Spooring & Balancing','Cuci Mobil','Detailing']
const inputCls = 'w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all focus:ring-2 focus:ring-green-500/20'
const inputStyle = { background: 'rgba(11,59,46,0.5)', border: '1px solid rgba(34,197,94,0.15)' }

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(160deg,#061a14,#0a2e1e)', border: '1px solid rgba(34,197,94,0.2)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(34,197,94,0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.15)' }}>
              {editId ? <MdEdit size={15} className="text-green-400" /> : <MdAdd size={15} className="text-green-400" />}
            </div>
            <h3 className="text-white font-bold">{editId ? 'Edit Order' : 'Tambah Order Baru'}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5"><MdClose size={18} /></button>
        </div>
        <form id="order-form" onSubmit={handleSubmit} className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
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
          <div><label className="block text-xs text-gray-400 mb-1.5">Kendaraan <span className="text-red-500">*</span></label><input required value={form.vehicle || ''} onChange={e => setForm(f => ({...f, vehicle: e.target.value}))} placeholder="Toyota Avanza - B 1234 ABC" className={inputCls} style={inputStyle} /></div>
          <div><label className="block text-xs text-gray-400 mb-1.5">Layanan <span className="text-red-500">*</span></label><select required value={form.service || ''} onChange={e => setForm(f => ({...f, service: e.target.value}))} className={inputCls} style={inputStyle}><option value="">Pilih Layanan</option>{SERVICE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="block text-xs text-gray-400 mb-1.5">Total (Rp) <span className="text-red-500">*</span></label><input type="number" required min="0" step="1000" value={form.total || ''} onChange={e => setForm(f => ({...f, total: e.target.value}))} placeholder="350000" className={inputCls} style={inputStyle} /></div>
          <div><label className="block text-xs text-gray-400 mb-1.5">Tanggal <span className="text-red-500">*</span></label><input type="date" required value={form.date || ''} onChange={e => setForm(f => ({...f, date: e.target.value}))} className={inputCls} style={inputStyle} /></div></div>
          <div>
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
          <div><label className="block text-xs text-gray-400 mb-1.5">Status</label><select value={form.status || 'Menunggu'} onChange={e => setForm(f => ({...f, status: e.target.value}))} className={inputCls} style={inputStyle}>{Object.keys(STATUS).map(s => <option key={s} value={s}>{s}</option>)}</select></div>
        </form>
        <div className="flex gap-3 px-5 py-4" style={{ borderTop: '1px solid rgba(34,197,94,0.1)' }}>
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-all" style={{ border: '1px solid rgba(34,197,94,0.12)' }}>Batal</button>
          <button type="submit" form="order-form" className="flex-1 py-2.5 rounded-xl text-sm font-bold text-black transition-all hover:opacity-90 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(90deg,#22C55E,#16a34a)' }}><MdCheck size={15} /> {editId ? 'Simpan' : 'Buat Order'}</button>
        </div>
      </div>
    </div>
  )
}

// ─── Delete confirm ───────────────────────────────────────────────────
function DeleteConfirm({ target, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }} onClick={onCancel}>
      <div className="w-full max-w-xs rounded-2xl p-6 text-center" style={{ background: '#06281F', border: '1px solid rgba(239,68,68,0.3)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} onClick={e => e.stopPropagation()}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.2)' }}><MdDelete size={26} className="text-red-500" /></div>
        <h3 className="text-white font-bold text-lg mb-2">Hapus Order?</h3>
        <p className="text-gray-400 text-sm mb-6">Order <span className="text-green-400 font-mono font-bold">{target?.id}</span> akan dihapus permanen.</p>
        <div className="flex gap-3"><button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-white/5 transition-all" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>Batal</button><button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90" style={{ background: 'linear-gradient(90deg,#ef4444,#dc2626)' }}>Hapus</button></div>
      </div>
    </div>
  )
}

// ─── Sort Icon ────────────────────────────────────────────────────────
const SortIcon = ({ column, sortColumn, sortDirection }) => {
  if (sortColumn !== column) return <MdUnfoldMore size={13} className="text-gray-700" />
  return sortDirection === 'asc' ? <MdExpandLess size={13} className="text-green-400" /> : <MdExpandMore size={13} className="text-green-400" />
}

// ─── Halaman Utama ────────────────────────────────────────────────────
export default function Orders() {
  const [orders, setOrders] = useState(() => {
    try { const s = localStorage.getItem('garage_orders'); return s ? JSON.parse(s) : ordersData } catch { return ordersData }
  })
  useEffect(() => {
    try { localStorage.setItem('garage_orders', JSON.stringify(orders)) } catch {}
  }, [orders])

  // State untuk daftar pelanggan (untuk autocomplete)
  const [customersList, setCustomersList] = useState([])
  // State untuk daftar mekanik (untuk autocomplete)
  const [mechanicsList, setMechanicsList] = useState([])

  useEffect(() => {
    // Ambil data pelanggan dari shared store (garage_customers / customersData.json)
    import('../hooks/useCustomerStore').then(({ getAllCustomersFromStore }) => {
      setCustomersList(getAllCustomersFromStore())
    }).catch(() => {
      import('../data/customersData.json').then(module => setCustomersList(module.default)).catch(() => {})
    })
  }, [])

  useEffect(() => {
    // Ambil data mekanik dari localStorage
    const storedMechanics = localStorage.getItem('garage_mechanics')
    if (storedMechanics) {
      setMechanicsList(JSON.parse(storedMechanics))
    } else {
      // Jika belum ada, coba import dari file JSON (fallback)
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
    if (editId) {
      // Cek apakah status berubah menjadi "Selesai" — trigger addPoints
      const prevOrder = orders.find(o => o.id === editId)
      const isNewlySelesai = prevOrder?.status !== 'Selesai' && data.status === 'Selesai'
      const alreadyAwarded = prevOrder?.pointsAwarded === true

      if (isNewlySelesai && !alreadyAwarded && data.customer && data.total) {
        const result = adminAddPointsToCustomer(data.customer, editId, data.total, data.service)
        if (result.success) {
          setPointToast({
            name: data.customer,
            earned: result.earned,
            tierUpgraded: result.tierUpgraded,
            newTier: result.newTier,
          })
          setTimeout(() => setPointToast(null), 4000)
        }
        setOrders(prev => prev.map(o => o.id === editId ? { ...o, ...data, pointsAwarded: true } : o))
      } else {
        setOrders(prev => prev.map(o => o.id === editId ? { ...o, ...data } : o))
      }
    } else {
      setOrders(prev => [{ ...data, id: generateId(), pointsAwarded: false }, ...prev])
    }
    setShowForm(false); setEditId(null)
  }, [editId, orders])
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
  const thCls = "text-left py-3 px-3 text-xs text-gray-600 font-semibold uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-gray-400 transition-colors"

  return (
    <div className="page-animate">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div><h1 className="text-2xl font-black text-white tracking-tight">Order Servis</h1><p className="text-sm text-gray-500 mt-0.5">{orders.length} order terdaftar</p></div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-green-400 transition-all hover:bg-green-500/10" style={{ border: '1px solid rgba(34,197,94,0.2)' }}><MdDownload size={16} /> Export</button>
          <button onClick={handleAdd} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-black transition-all hover:opacity-90 hover:scale-105" style={{ background: 'linear-gradient(90deg,#22C55E,#16a34a)', boxShadow: '0 4px 18px rgba(34,197,94,0.35)' }}><MdAdd size={18} /> Tambah Order</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Order', value: orders.length, color: '#94A3B8', bg: 'rgba(148,163,184,0.08)' },
          { label: 'Selesai', value: counts.selesai, color: '#22C55E', bg: 'rgba(34,197,94,0.08)' },
          { label: 'Sedang Dikerjakan', value: counts.proses, color: '#FBBF24', bg: 'rgba(251,191,36,0.08)' },
          { label: 'Pendapatan Masuk', value: `Rp ${(totalPendapatan/1000000).toFixed(1)}jt`, color: '#60A5FA', bg: 'rgba(96,165,250,0.08)' },
        ].map(s => (
          <div key={s.label} className="rounded-xl px-4 py-3 transition-all hover:scale-[1.02]" style={{ background: s.bg, border: `1px solid ${s.color}20` }}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(6,28,20,0.8)', border: '1px solid rgba(34,197,94,0.1)', backdropFilter: 'blur(6px)' }}>
        <div className="flex flex-col sm:flex-row gap-3 p-4" style={{ borderBottom: '1px solid rgba(34,197,94,0.08)' }}>
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari order, pelanggan, layanan..." className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-gray-300 outline-none transition-all focus:ring-2 focus:ring-green-500/20" style={{ background: 'rgba(11,59,46,0.5)', border: '1px solid rgba(34,197,94,0.12)' }} />
          </div>
          <div className="flex gap-2">
            <div className="relative" ref={filterRef}>
              <button onClick={() => setShowFilter(p => !p)} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm transition-all" style={activeFilters > 0 ? { background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' } : { background: 'rgba(11,59,46,0.4)', color: '#6B7280', border: '1px solid rgba(34,197,94,0.1)' }}><MdFilterList size={16} />{activeFilters > 0 && <span className="w-4 h-4 rounded-full text-xs font-bold text-black flex items-center justify-center" style={{ background: '#22C55E' }}>{activeFilters}</span>}</button>
              {showFilter && (
                <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl p-4 z-30" style={{ background: '#051A0E', border: '1px solid rgba(34,197,94,0.2)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">Filter</p>
                  <div className="space-y-3">
                    <div><label className="block text-xs text-gray-500 mb-1.5">Status</label><select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none" style={{ background: 'rgba(11,59,46,0.5)', border: '1px solid rgba(34,197,94,0.15)' }}><option value="">Semua Status</option>{Object.keys(STATUS).map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                    <div className="grid grid-cols-2 gap-2"><div><label className="block text-xs text-gray-500 mb-1.5">Dari</label><input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none" style={{ background: 'rgba(11,59,46,0.5)', border: '1px solid rgba(34,197,94,0.15)' }} /></div><div><label className="block text-xs text-gray-500 mb-1.5">Sampai</label><input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none" style={{ background: 'rgba(11,59,46,0.5)', border: '1px solid rgba(34,197,94,0.15)' }} /></div></div>
                    <button onClick={resetFilters} className="w-full py-2 rounded-xl text-xs text-red-400 transition-all hover:bg-red-500/10" style={{ border: '1px solid rgba(239,68,68,0.2)' }}>Reset Semua</button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(34,197,94,0.12)' }}>
              {[{ id: 'table', icon: <MdTableRows size={16}/> }, { id: 'grid', icon: <MdGridView size={16}/> }].map(v => (
                <button key={v.id} onClick={() => setViewMode(v.id)} className="w-9 h-9 flex items-center justify-center transition-all" style={viewMode === v.id ? { background: 'rgba(34,197,94,0.2)', color: '#22C55E' } : { background: 'rgba(11,59,46,0.4)', color: '#4B5563' }}>{v.icon}</button>
              ))}
            </div>
          </div>
        </div>

        {viewMode === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 700 }}>
              <thead><tr style={{ borderBottom: '1px solid rgba(34,197,94,0.08)' }}>{[
                { key: 'id', label: 'No. Order' }, { key: 'customer', label: 'Pelanggan' }, { key: 'vehicle', label: 'Kendaraan', noSort: true },
                { key: 'service', label: 'Layanan' }, { key: 'status', label: 'Status' }, { key: 'total', label: 'Total' },
                { key: 'date', label: 'Tanggal' }, { key: 'aksi', label: 'Aksi', noSort: true }
              ].map(col => (<th key={col.key} className={thCls} onClick={() => !col.noSort && handleSort(col.key)}><span className="flex items-center gap-1">{col.label}{!col.noSort && <SortIcon column={col.key} sortColumn={sortColumn} sortDirection={sortDir} />}</span></th>))}</tr></thead>
              <tbody>{paginatedData.map(order => (
                <tr key={order.id} onClick={() => setDetailTarget(order)} className="cursor-pointer transition-colors hover:bg-green-500/[0.04]" style={{ borderBottom: '1px solid rgba(34,197,94,0.05)' }}>
                  <td className="py-3 px-3 text-xs text-green-400 font-mono font-semibold whitespace-nowrap">{order.id}</td>
                  <td className="py-3 px-3 whitespace-nowrap"><div className="flex items-center gap-2.5"><Avatar name={order.customer} size={32} /><span className="text-sm text-white font-medium">{order.customer}</span></div></td>
                  <td className="py-3 px-3 text-sm text-gray-400 whitespace-nowrap max-w-[160px] truncate">{order.vehicle.split(' - ')[0]}</td>
                  <td className="py-3 px-3"><span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.08)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.12)' }}>{order.service}</span></td>
                  <td className="py-3 px-3 whitespace-nowrap"><StatusBadge status={order.status} size="sm" /></td>
                  <td className="py-3 px-3 text-sm text-white font-bold whitespace-nowrap">{formatCurrency(order.total)}</td>
                  <td className="py-3 px-3 text-xs text-gray-500 whitespace-nowrap">{order.date}</td>
                  <td className="py-3 px-3 whitespace-nowrap"><div className="flex items-center gap-1" onClick={e => e.stopPropagation()}><button onClick={() => setInvoiceTarget(order)} className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-400 hover:bg-blue-500/15 transition-all"><MdReceipt size={15} /></button><button onClick={() => handleEdit(order)} className="w-8 h-8 rounded-lg flex items-center justify-center text-yellow-400 hover:bg-yellow-500/15 transition-all"><MdEdit size={15} /></button><button onClick={() => setDeleteTarget(order)} className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/15 transition-all"><MdDelete size={15} /></button></div></td>
                </tr>
              ))}</tbody>
            </table>
            {filtered.length === 0 && (<div className="text-center py-16 flex flex-col items-center gap-3"><MdReceipt size={48} className="text-gray-700" /><p className="text-gray-600 text-sm">Tidak ada order ditemukan</p><button onClick={resetFilters} className="text-green-500 text-xs hover:underline flex items-center gap-1"><MdRefresh size={13} /> Reset filter</button></div>)}
          </div>
        )}

        {viewMode === 'grid' && (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginatedData.map(order => (<OrderCard key={order.id} order={order} onDetail={setDetailTarget} onEdit={handleEdit} onDelete={setDeleteTarget} onInvoice={setInvoiceTarget} />))}
            {filtered.length === 0 && (<div className="col-span-3 text-center py-16 flex flex-col items-center gap-3"><MdReceipt size={48} className="text-gray-700" /><p className="text-gray-600 text-sm">Tidak ada order ditemukan</p></div>)}
          </div>
        )}

        <div className="px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid rgba(34,197,94,0.06)' }}>
          <p className="text-xs text-gray-600">Menampilkan <span className="text-gray-300 font-semibold">{filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-gray-300 font-semibold">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> dari <span className="text-green-500 font-semibold">{filtered.length}</span> order {activeFilters > 0 && "(disaring)"}</p>
          {filtered.length > 0 && totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
        </div>
      </div>

      {detailTarget && <DetailDrawer order={detailTarget} onClose={() => setDetailTarget(null)} onEdit={(o) => { setDetailTarget(null); handleEdit(o) }} onDelete={(o) => { setDetailTarget(null); setDeleteTarget(o) }} onInvoice={(o) => { setDetailTarget(null); setInvoiceTarget(o) }} />}
      <FormModal isOpen={showForm} onClose={() => { setShowForm(false); setEditId(null) }} onSubmit={handleSubmit} initialData={editId ? orders.find(o => o.id === editId) || {} : { customer: '', vehicle: '', service: '', status: 'Menunggu', total: '', date: new Date().toISOString().slice(0,10), mechanic: '' }} editId={editId} customers={customersList} mechanics={mechanicsList} />
      {invoiceTarget && <InvoiceModal order={invoiceTarget} onClose={() => setInvoiceTarget(null)} />}
      {deleteTarget && <DeleteConfirm target={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}

      {/* ── Point Award Toast ── */}
      {pointToast && (
        <div className="fixed bottom-6 right-6 z-[100] animate-bounce-in"
          style={{
            background: 'linear-gradient(135deg,#052015,#082b1e)',
            border: '1px solid rgba(34,197,94,0.4)',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(34,197,94,0.2)',
            padding: '16px 20px',
            minWidth: 280,
            maxWidth: 340,
          }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(34,197,94,0.15)' }}>
              <MdStars size={22} className="text-green-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Poin Diberikan! 🎉</p>
              <p className="text-gray-400 text-xs mt-0.5">
                <span className="text-green-400 font-semibold">{pointToast.name}</span> mendapat{' '}
                <span className="text-yellow-400 font-bold">+{pointToast.earned} poin</span>
              </p>
              {pointToast.tierUpgraded && (
                <p className="text-xs mt-1 font-semibold" style={{ color: '#FBBF24' }}>
                  🏆 Naik ke tier {pointToast.newTier}!
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}