import { useState, useEffect } from 'react'
import {
  MdAdd, MdSearch, MdClose, MdEdit, MdDelete, MdInventory2,
  MdWarning, MdAddCircle, MdRemoveCircle, MdHistory, MdArrowBack,
  MdCheck, MdTrendingUp, MdTrendingDown, MdShoppingCart,
  MdOilBarrel, MdFilterAlt, MdCarRepair, MdSettings,
  MdLocalGasStation, MdFlashOn, MdLightbulb, MdCircle,
  MdMoreVert, MdBuild
} from 'react-icons/md'
import { motion, AnimatePresence } from 'framer-motion'
import inventoryData from '../data/inventoryData.json'

const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID')

// ─── Ikon dan Warna per Kategori ──────────────────────────────────────
const categoryIcons = {
  'Oli Mesin': <MdOilBarrel size={20} />,
  'Oli Transmisi': <MdOilBarrel size={20} />,
  'Filter Oli': <MdFilterAlt size={20} />,
  'Filter Udara': <MdFilterAlt size={20} />,
  'Busi': <MdFlashOn size={20} />,
  'Kampas Rem': <MdCarRepair size={20} />,
  'Aki': <MdFlashOn size={20} />,
  'Ban': <MdCircle size={20} />,
  'Cairan Radiator': <MdLocalGasStation size={20} />,
  'Lampu Kendaraan': <MdLightbulb size={20} />,
  'Bearing': <MdSettings size={20} />,
  'Belt': <MdSettings size={20} />,
  'Fuse': <MdFlashOn size={20} />,
  'Sensor Kendaraan': <MdBuild size={20} />,
  'Sparepart Fast Moving': <MdCarRepair size={20} />,
  'Tools & Consumables': <MdBuild size={20} />,
  'Lainnya': <MdMoreVert size={20} />,
}

const categoryColors = {
  'Oli Mesin': '#3B82F6',
  'Oli Transmisi': '#3B82F6',
  'Filter Oli': '#3B82F6',
  'Filter Udara': '#3B82F6',
  'Busi': '#F59E0B',
  'Kampas Rem': '#EF4444',
  'Aki': '#8B5CF6',
  'Ban': '#14B8A6',
  'Cairan Radiator': '#06B6D4',
  'Lampu Kendaraan': '#FBBF24',
  'Bearing': '#6B7280',
  'Belt': '#6B7280',
  'Fuse': '#F59E0B',
  'Sensor Kendaraan': '#8B5CF6',
  'Sparepart Fast Moving': '#EC4899',
  'Tools & Consumables': '#F97316',
  'Lainnya': '#9CA3AF',
}

const getCategoryIcon = (cat) => categoryIcons[cat] || <MdInventory2 size={20} />
const getCategoryColor = (cat) => categoryColors[cat] || '#9CA3AF'

const getStockStatus = (stock, minStock) => {
  if (stock === 0)          return { label: 'Habis',   cls: 'text-red-400', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' }
  if (stock <= minStock)    return { label: 'Menipis', cls: 'text-yellow-400', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)' }
  return                     { label: 'Aman',    cls: 'text-blue-400', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' }
}

const CATEGORIES = [
  'Semua', 'Oli Mesin', 'Oli Transmisi', 'Filter Oli', 'Filter Udara',
  'Busi', 'Kampas Rem', 'Aki', 'Ban', 'Cairan Radiator', 'Lampu Kendaraan',
  'Bearing', 'Belt', 'Fuse', 'Sensor Kendaraan', 'Sparepart Fast Moving',
  'Tools & Consumables', 'Lainnya'
]

const initialForm = { code: '', name: '', category: 'Oli Mesin', stock: '', unit: 'pcs', minStock: '5', buyPrice: '', sellPrice: '' }

const inputCls = 'w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all focus:ring-2 focus:ring-blue-500/20'
const inputStyle = { background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(59,130,246,0.15)' }

// ─── Load data dengan merge ──────────────────────────────────────────
function loadInventory() {
  let stored = []
  try {
    const raw = sessionStorage.getItem('garage_inventory')
    stored = raw ? JSON.parse(raw) : []
  } catch { stored = [] }

  if (stored.length === 0) return inventoryData

  const storedIds = new Set(stored.map(i => i.id))
  const storedCodes = new Set(stored.map(i => i.code))
  const newOnes = inventoryData.filter(i => !storedIds.has(i.id) && !storedCodes.has(i.code))
  return [...stored, ...newOnes]
}

// ─── Restock Modal ────────────────────────────────────────────────────
function RestockModal({ item, onClose, onConfirm }) {
  const [qty, setQty] = useState('')
  const [type, setType] = useState('add')
  const [note, setNote] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const n = parseInt(qty)
    if (!n || n <= 0) return
    onConfirm(item.id, type === 'add' ? n : -n, note || (type === 'add' ? 'Restock' : 'Pengeluaran'))
  }

  const preview = type === 'add' ? item.stock + (parseInt(qty) || 0) : item.stock - (parseInt(qty) || 0)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-sm rounded-2xl overflow-hidden"
          style={{ background: 'linear-gradient(160deg,#0a1222,#0f172a)', border: '1px solid rgba(59,130,246,0.2)', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(59,130,246,0.08)' }}>
            <div>
              <h3 className="text-white font-bold">Ubah Stok</h3>
              <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[220px]">{item.name}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-all">
              <MdClose size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(59,130,246,0.1)' }}>
              <span className="text-xs text-gray-500">Stok saat ini</span>
              <span className="text-white font-black text-lg">{item.stock} <span className="text-gray-500 text-sm font-normal">{item.unit}</span></span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'add',    label: '+ Tambah',  icon: MdAddCircle,    color: '#3B82F6', bg: 'rgba(59,130,246,0.12)'  },
                { id: 'reduce', label: '− Kurangi', icon: MdRemoveCircle, color: '#EF4444', bg: 'rgba(239,68,68,0.1)'   },
              ].map(t => (
                <button key={t.id} type="button" onClick={() => setType(t.id)}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all"
                  style={type === t.id
                    ? { background: t.bg, color: t.color, border: `1.5px solid ${t.color}40` }
                    : { background: 'rgba(15,23,42,0.3)', color: '#4B5563', border: '1px solid rgba(59,130,246,0.08)' }}>
                  <t.icon size={15} /> {t.label}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Jumlah ({item.unit})</label>
              <input type="number" required min="1" value={qty} onChange={e => setQty(e.target.value)}
                placeholder="0" className={inputCls} style={inputStyle} />
            </div>

            {qty && parseInt(qty) > 0 && (
              <div className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: type === 'add' ? 'rgba(59,130,246,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${type === 'add' ? 'rgba(59,130,246,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                <span className="text-xs text-gray-400">Stok setelah</span>
                <span className="font-black" style={{ color: type === 'add' ? '#3B82F6' : preview < 0 ? '#EF4444' : '#FBBF24' }}>
                  {Math.max(0, preview)} {item.unit}
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Catatan</label>
              <input value={note} onChange={e => setNote(e.target.value)}
                placeholder={type === 'add' ? 'Restock dari supplier...' : 'Digunakan untuk order...'}
                className={inputCls} style={inputStyle} />
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-all"
                style={{ border: '1px solid rgba(59,130,246,0.12)' }}>Batal</button>
              <button type="submit"
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
                style={{ background: type === 'add' ? 'linear-gradient(135deg,#3B82F6,#2563eb)' : 'linear-gradient(135deg,#ef4444,#dc2626)' }}>
                <MdCheck size={15} /> Simpan
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── History Drawer ───────────────────────────────────────────────────
function HistoryDrawer({ item, history, onClose }) {
  const itemHistory = history.filter(h => h.itemId === item.id).reverse()
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex justify-end"
        style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="w-full max-w-sm h-full overflow-y-auto"
          style={{ background: 'linear-gradient(160deg,#0a1222,#0f172a)', borderLeft: '1px solid rgba(59,130,246,0.15)', boxShadow: '-30px 0 80px rgba(0,0,0,0.6)' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="h-0.5" style={{ background: 'linear-gradient(90deg,#3B82F6,#2563eb)' }} />

          <div className="flex items-center gap-3 px-5 py-4">
            <button onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:scale-110 transition-all"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              <MdArrowBack size={18} />
            </button>
            <div>
              <h3 className="text-white font-bold">Riwayat Stok</h3>
              <p className="text-xs text-gray-500 truncate max-w-[200px]">{item.name}</p>
            </div>
          </div>

          <div className="mx-5 mb-5 rounded-2xl p-4 text-center" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
            <p className="text-xs text-gray-500 mb-1">Stok Sekarang</p>
            <p className="text-4xl font-black text-white">{item.stock}</p>
            <p className="text-gray-500 text-sm">{item.unit}</p>
          </div>

          <div className="px-5 pb-8">
            <p className="text-xs text-gray-600 uppercase tracking-wider mb-3">Riwayat Perubahan</p>
            {itemHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-600 text-sm">Belum ada riwayat</div>
            ) : (
              <div className="space-y-2">
                {itemHistory.map((h, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'rgba(15,23,42,0.3)', border: '1px solid rgba(59,130,246,0.07)' }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={h.delta > 0
                        ? { background: 'rgba(59,130,246,0.12)', color: '#3B82F6' }
                        : { background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                      {h.delta > 0 ? <MdTrendingUp size={16} /> : <MdTrendingDown size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-300 font-medium">{h.note}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{h.date} · Stok: {h.before} → {h.after}</p>
                    </div>
                    <span className="text-sm font-black flex-shrink-0" style={{ color: h.delta > 0 ? '#3B82F6' : '#EF4444' }}>
                      {h.delta > 0 ? '+' : ''}{h.delta}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Detail Drawer ────────────────────────────────────────────────────
function DetailDrawer({ item, onClose, onEdit, onRestock, onAddToOrder }) {
  if (!item) return null
  const st = getStockStatus(item.stock, item.minStock)
  const color = getCategoryColor(item.category)
  const Icon = getCategoryIcon(item.category)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex justify-end"
        style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="w-full max-w-sm h-full overflow-y-auto"
          style={{ background: 'linear-gradient(160deg,#0a1222,#0f172a)', borderLeft: '1px solid rgba(59,130,246,0.15)', boxShadow: '-30px 0 80px rgba(0,0,0,0.6)' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="h-1" style={{ background: `linear-gradient(90deg, ${color}, ${color}80)` }} />

          <div className="flex items-center justify-between px-5 py-4">
            <button onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:scale-110 transition-all"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              <MdArrowBack size={18} />
            </button>
            <div className="flex gap-1">
              <button onClick={() => { onClose(); onEdit(item) }}
                className="w-9 h-9 rounded-full flex items-center justify-center text-yellow-400 hover:scale-110 transition-all"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                <MdEdit size={16} />
              </button>
              <button onClick={() => { onClose(); onRestock(item) }}
                className="w-9 h-9 rounded-full flex items-center justify-center text-blue-400 hover:scale-110 transition-all"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                <MdAddCircle size={16} />
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center px-5 pb-6">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: `${color}15`, border: `2px solid ${color}25`, color }}>
              {Icon}
            </div>
            <h2 className="text-xl font-black text-white text-center">{item.name}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{item.code}</p>
            <span className="text-xs px-3 py-1 rounded-full font-semibold mt-2"
              style={{ background: st.bg, color: st.cls.replace('text-',''), border: `1px solid ${st.border}` }}>
              {st.label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mx-5 mb-5">
            {[
              { label: 'Stok', value: `${item.stock} ${item.unit}`, color: '#3B82F6' },
              { label: 'Min. Stok', value: `${item.minStock} ${item.unit}`, color: '#FBBF24' },
              { label: 'Harga Beli', value: fmt(item.buyPrice), color: '#60A5FA' },
              { label: 'Harga Jual', value: fmt(item.sellPrice), color: '#A78BFA' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-3 text-center"
                style={{ background: 'rgba(15,23,42,0.3)', border: '1px solid rgba(59,130,246,0.08)' }}>
                <p className="text-[10px] text-gray-500">{s.label}</p>
                <p className="text-lg font-black" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="mx-5 mb-5 rounded-xl p-3 flex items-center gap-3"
            style={{ background: 'rgba(11,59,46,0.2)', border: '1px solid rgba(59,130,246,0.08)' }}>
            <span className="text-xs text-gray-500">Kategori</span>
            <span className="text-sm text-white font-medium flex items-center gap-1.5">
              <span style={{ color }}>{getCategoryIcon(item.category)}</span>
              {item.category}
            </span>
          </div>

          <div className="px-5 pb-8 flex flex-col gap-2">
            <button onClick={() => { onClose(); onRestock(item) }}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #2563eb)', boxShadow: '0 8px 24px rgba(59,130,246,0.25)' }}>
              <MdAddCircle size={16} /> Restock / Ubah Stok
            </button>
            <button onClick={() => { onClose(); onAddToOrder(item) }}
              className="w-full py-3 rounded-xl text-sm font-bold text-black transition-all hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #FBBF24, #F59E0B)', boxShadow: '0 8px 24px rgba(251,191,36,0.25)' }}>
              <MdShoppingCart size={16} /> Tambah ke Order
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Form Modal ───────────────────────────────────────────────────────
function ItemModal({ isOpen, onClose, onSubmit, form, setForm, editId }) {
  if (!isOpen) return null
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-lg rounded-2xl overflow-hidden"
          style={{ background: 'linear-gradient(160deg,#0a1222,#0f172a)', border: '1px solid rgba(59,130,246,0.2)', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(59,130,246,0.08)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.12)' }}>
                <MdInventory2 size={15} className="text-blue-400" />
              </div>
              <h3 className="text-white font-bold">{editId ? 'Edit Barang' : 'Tambah Barang'}</h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-all">
              <MdClose size={18} />
            </button>
          </div>

          <form onSubmit={onSubmit} className="px-5 py-4 space-y-4 max-h-[65vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Kode Barang</label>
                <input required value={form.code} onChange={e => setForm(f => ({...f, code: e.target.value}))}
                  placeholder="OL-001" className={inputCls} style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Kategori</label>
                <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}
                  className={inputCls} style={inputStyle}>
                  {CATEGORIES.filter(c => c !== 'Semua').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Nama Barang</label>
              <input required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                placeholder="Oli Mesin Shell 10W-40" className={inputCls} style={inputStyle} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Stok Awal</label>
                <input type="number" min="0" required value={form.stock} onChange={e => setForm(f => ({...f, stock: e.target.value}))}
                  placeholder="50" className={inputCls} style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Satuan</label>
                <select value={form.unit} onChange={e => setForm(f => ({...f, unit: e.target.value}))}
                  className={inputCls} style={inputStyle}>
                  {['pcs','liter','set','buah','roll'].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Min. Stok</label>
                <input type="number" min="0" required value={form.minStock} onChange={e => setForm(f => ({...f, minStock: e.target.value}))}
                  placeholder="5" className={inputCls} style={inputStyle} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Harga Beli (Rp)</label>
                <input type="number" min="0" required value={form.buyPrice} onChange={e => setForm(f => ({...f, buyPrice: e.target.value}))}
                  placeholder="45000" className={inputCls} style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Harga Jual (Rp)</label>
                <input type="number" min="0" required value={form.sellPrice} onChange={e => setForm(f => ({...f, sellPrice: e.target.value}))}
                  placeholder="65000" className={inputCls} style={inputStyle} />
              </div>
            </div>
          </form>

          <div className="flex gap-3 px-5 py-4" style={{ borderTop: '1px solid rgba(59,130,246,0.08)' }}>
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-all"
              style={{ border: '1px solid rgba(59,130,246,0.12)' }}>Batal</button>
            <button type="submit" form="form-item"
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-black transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#3B82F6,#2563eb)' }}>
              {editId ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Halaman Utama ────────────────────────────────────────────────────
export default function Inventory() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState(() => {
    try { const s = sessionStorage.getItem('garage_inventory_history'); return s ? JSON.parse(s) : [] } catch { return [] }
  })

  // Load dari Supabase
  useEffect(() => {
    const load = async () => {
      try {
        const { productAPI } = await import('../services/productAPI')
        const data = await productAPI.fetchAll()
        setItems(data)
      } catch (err) {
        console.error('Gagal load inventory:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    try { sessionStorage.setItem('garage_inventory_history', JSON.stringify(history)) } catch {}
  }, [history])

  const [search, setSearch]           = useState('')
  const [category, setCategory]       = useState('Semua')
  const [showModal, setShowModal]     = useState(false)
  const [form, setForm]               = useState(initialForm)
  const [editId, setEditId]           = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [restockTarget, setRestockTarget] = useState(null)
  const [historyTarget, setHistoryTarget] = useState(null)
  const [detailTarget, setDetailTarget]   = useState(null)

  const filtered = items.filter(it => {
    const q = search.toLowerCase()
    return (it.name.toLowerCase().includes(q) || it.code.toLowerCase().includes(q)) &&
      (category === 'Semua' || it.category === category)
  })

  const totalSKU   = items.length
  const totalValue = items.reduce((s, it) => s + it.stock * it.buyPrice, 0)
  const lowStock   = items.filter(it => it.stock > 0 && it.stock <= it.minStock).length
  const outOfStock = items.filter(it => it.stock === 0).length

  const openAdd  = () => { setForm(initialForm); setEditId(null); setShowModal(true) }
  const openEdit = (it) => {
    setForm({ code: it.code, name: it.name, category: it.category, stock: String(it.stock), unit: it.unit, minStock: String(it.minStock), buyPrice: String(it.buyPrice), sellPrice: String(it.sellPrice) })
    setEditId(it.id); setShowModal(true)
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const parsed = { ...form, stock: parseInt(form.stock)||0, min_stock: parseInt(form.minStock)||5, buy_price: parseInt(form.buyPrice)||0, sell_price: parseInt(form.sellPrice)||0 }
    const { productAPI } = await import('../services/productAPI')
    if (editId) {
      const updated = await productAPI.update(editId, parsed)
      if (updated) setItems(prev => prev.map(it => it.id === editId ? { ...it, ...updated } : it))
    } else {
      const created = await productAPI.create({ ...parsed, is_active: true })
      if (created) setItems(prev => [created, ...prev])
    }
    setShowModal(false)
  }

  const handleRestock = async (itemId, delta, note) => {
    const item = items.find(it => it.id === itemId)
    if (!item) return
    const before = item.stock
    const after  = Math.max(0, before + delta)
    const entry  = { itemId, delta, before, after, note, date: new Date().toISOString().slice(0,10) + ' ' + new Date().toTimeString().slice(0,5) }
    setHistory(h => [entry, ...h])
    const { productAPI } = await import('../services/productAPI')
    await productAPI.update(itemId, { stock: after })
    setItems(prev => prev.map(it => it.id === itemId ? { ...it, stock: after } : it))
    setRestockTarget(null)
  }

  const handleDelete = async () => {
    const { productAPI } = await import('../services/productAPI')
    await productAPI.delete(deleteTarget.id)
    setItems(prev => prev.filter(it => it.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const handleAddToOrder = (item) => {
    alert(`🛒 Menambahkan ${item.name} ke order. (Simulasi)`)
    setDetailTarget(null)
  }

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(circle at 10% 20%, #0a1222, #050810)' }}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <span className="bg-gradient-to-r from-blue-300 to-blue-600 bg-clip-text text-transparent">
                Inventaris Spare Part
              </span>
              <span className="text-sm font-normal text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                {totalSKU} SKU
              </span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Nilai stok: <span className="text-white font-medium">{fmt(totalValue)}</span>
            </p>
          </div>
          <button onClick={openAdd}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-black transition-all hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #2563eb)', boxShadow: '0 8px 24px rgba(59,130,246,0.35)' }}>
            <MdAdd size={18} /> Tambah Barang
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total SKU', value: totalSKU, icon: <MdInventory2 size={18}/>, color: '#3B82F6', bg: 'rgba(59,130,246,0.06)' },
            { label: 'Nilai Stok', value: `Rp ${(totalValue/1000000).toFixed(1)}jt`, icon: <MdTrendingUp size={18}/>, color: '#60A5FA', bg: 'rgba(96,165,250,0.06)' },
            { label: 'Menipis', value: lowStock, icon: <MdWarning size={18}/>, color: '#FBBF24', bg: 'rgba(251,191,36,0.06)' },
            { label: 'Habis', value: outOfStock, icon: <MdRemoveCircle size={18}/>, color: '#EF4444', bg: 'rgba(239,68,68,0.06)' },
          ].map(s => (
            <motion.div key={s.label} whileHover={{ scale: 1.02 }} className="rounded-2xl px-4 py-3 transition-all"
              style={{ background: s.bg, border: `1px solid ${s.color}15` }}>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">{s.label}</p>
                <span style={{ color: s.color, opacity: 0.6 }}>{s.icon}</span>
              </div>
              <p className="text-2xl font-black mt-1" style={{ color: s.color }}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Alert */}
        {(lowStock > 0 || outOfStock > 0) && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl mb-6 text-sm text-yellow-400"
            style={{ background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.2)' }}>
            <MdWarning size={18} className="flex-shrink-0" />
            <span>
              {outOfStock > 0 && <><strong>{outOfStock} barang habis</strong>. </>}
              {lowStock > 0 && <><strong>{lowStock} barang menipis</strong> dan perlu restock.</>}
              {' Klik tombol + untuk restock.'}
            </span>
          </div>
        )}

        {/* Filter & Search */}
        <div className="rounded-2xl p-4 mb-6"
          style={{ background: 'rgba(10,18,34,0.7)', border: '1px solid rgba(59,130,246,0.1)', backdropFilter: 'blur(8px)' }}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Cari nama atau kode barang..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-gray-300 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(59,130,246,0.12)' }} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap"
                  style={category === cat
                    ? { background: 'rgba(59,130,246,0.2)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.3)' }
                    : { background: 'rgba(15,23,42,0.3)', color: '#6B7280', border: '1px solid rgba(59,130,246,0.08)' }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid Cards */}
        <AnimatePresence>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((it) => {
              const st = getStockStatus(it.stock, it.minStock)
              const color = getCategoryColor(it.category)
              const Icon = getCategoryIcon(it.category)
              const pct = it.minStock > 0 ? Math.min(100, (it.stock / (it.minStock * 3)) * 100) : 100

              return (
                <motion.div
                  key={it.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -4, boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer"
                  style={{
                    background: 'linear-gradient(160deg, rgba(15,23,42,0.95) 0%, rgba(10,18,34,0.9) 100%)',
                    border: '1px solid rgba(59,130,246,0.1)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  }}
                  onClick={() => setDetailTarget(it)}
                >
                  <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${color}, ${color}60)` }} />

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${color}15`, border: `1px solid ${color}20`, color }}>
                          {Icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-500 font-mono">{it.code}</p>
                          <p className="text-sm text-white font-bold truncate">{it.name}</p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0"
                        style={{ background: st.bg, color: st.cls.replace('text-',''), border: `1px solid ${st.border}` }}>
                        {st.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="rounded-xl p-2 text-center" style={{ background: 'rgba(15,23,42,0.3)' }}>
                        <p className="text-[10px] text-gray-500">Stok</p>
                        <p className={`text-lg font-black ${it.stock === 0 ? 'text-red-400' : it.stock <= it.minStock ? 'text-yellow-400' : 'text-white'}`}>
                          {it.stock}
                          <span className="text-xs text-gray-500 font-normal ml-1">{it.unit}</span>
                        </p>
                      </div>
                      <div className="rounded-xl p-2 text-center" style={{ background: 'rgba(15,23,42,0.3)' }}>
                        <p className="text-[10px] text-gray-500">Harga Jual</p>
                        <p className="text-sm font-black text-blue-400">{fmt(it.sellPrice)}</p>
                      </div>
                    </div>

                    <div className="h-1 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: it.stock === 0 ? '#EF4444' : it.stock <= it.minStock ? '#FBBF24' : '#3B82F6' }} />
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                        {it.category}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setRestockTarget(it)} title="Restock"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-blue-400 hover:bg-blue-500/15 hover:scale-110 transition-all"
                          style={{ background: 'rgba(59,130,246,0.08)' }}>
                          <MdAddCircle size={14} />
                        </button>
                        <button onClick={() => setHistoryTarget(it)} title="Riwayat"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-blue-400 hover:bg-blue-500/15 transition-all">
                          <MdHistory size={14} />
                        </button>
                        <button onClick={() => { setDetailTarget(null); openEdit(it) }} title="Edit"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-yellow-400 hover:bg-yellow-500/15 transition-all">
                          <MdEdit size={14} />
                        </button>
                        <button onClick={() => setDeleteTarget(it)} title="Hapus"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/15 transition-all">
                          <MdDelete size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 opacity-20">📦</div>
            <p className="text-gray-500 text-sm">Tidak ada barang ditemukan</p>
          </div>
        )}

        <div className="mt-4 text-center text-xs text-gray-600">
          Menampilkan {filtered.length} dari {items.length} barang
        </div>
      </div>

      {/* Modals & Drawers */}
      <ItemModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setForm(initialForm); setEditId(null) }}
        onSubmit={handleSubmit}
        form={form} setForm={setForm}
        editId={editId}
      />
      {showModal && <form id="form-item" onSubmit={handleSubmit} className="hidden" />}

      {restockTarget && (
        <RestockModal item={restockTarget} onClose={() => setRestockTarget(null)} onConfirm={handleRestock} />
      )}

      {historyTarget && (
        <HistoryDrawer item={historyTarget} history={history} onClose={() => setHistoryTarget(null)} />
      )}

      {detailTarget && (
        <DetailDrawer
          item={detailTarget}
          onClose={() => setDetailTarget(null)}
          onEdit={openEdit}
          onRestock={setRestockTarget}
          onAddToOrder={handleAddToOrder}
        />
      )}

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm rounded-2xl p-6 text-center"
              style={{ background: 'linear-gradient(160deg, #0f172a, #0a1222)', border: '1px solid rgba(239,68,68,0.3)', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.2)' }}>
                <MdDelete size={28} className="text-red-500" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Hapus Barang?</h3>
              <p className="text-gray-400 text-sm mb-6">
                <span className="text-blue-400 font-bold">{deleteTarget.name}</span> akan dihapus permanen.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}>Batal</button>
                <button onClick={handleDelete}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}>Hapus</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}