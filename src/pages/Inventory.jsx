import { useState, useEffect } from 'react'
import {
  MdAdd, MdSearch, MdClose, MdEdit, MdDelete, MdInventory2,
  MdWarning, MdAddCircle, MdRemoveCircle, MdHistory, MdArrowBack,
  MdCheck, MdTrendingUp, MdTrendingDown
} from 'react-icons/md'
import inventoryData from '../data/inventoryData.json'

const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID')

const getStockStatus = (stock, minStock) => {
  if (stock === 0)          return { label: 'Habis',   cls: 'text-red-400',    bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)'   }
  if (stock <= minStock)    return { label: 'Menipis', cls: 'text-yellow-400', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)'  }
  return                           { label: 'Aman',    cls: 'text-green-400',  bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)'    }
}

const CATEGORIES = [
  'Semua', 'Oli Mesin', 'Oli Transmisi', 'Filter Oli', 'Filter Udara',
  'Busi', 'Kampas Rem', 'Aki', 'Ban', 'Cairan Radiator', 'Lampu Kendaraan',
  'Bearing', 'Belt', 'Fuse', 'Sensor Kendaraan', 'Sparepart Fast Moving',
  'Tools & Consumables', 'Lainnya'
]

const initialForm = { code: '', name: '', category: 'Oli Mesin', stock: '', unit: 'pcs', minStock: '5', buyPrice: '', sellPrice: '' }

const inputCls = 'w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all focus:ring-2 focus:ring-green-500/20'
const inputStyle = { background: 'rgba(11,59,46,0.5)', border: '1px solid rgba(34,197,94,0.15)' }

// ─── Restock Modal ────────────────────────────────────────────────────
function RestockModal({ item, onClose, onConfirm }) {
  const [qty, setQty] = useState('')
  const [type, setType] = useState('add') // 'add' | 'reduce'
  const [note, setNote] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const n = parseInt(qty)
    if (!n || n <= 0) return
    onConfirm(item.id, type === 'add' ? n : -n, note || (type === 'add' ? 'Restock' : 'Pengeluaran'))
  }

  const preview = type === 'add' ? item.stock + (parseInt(qty) || 0) : item.stock - (parseInt(qty) || 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#061a14,#0a2e1e)', border: '1px solid rgba(34,197,94,0.2)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(34,197,94,0.1)' }}>
          <div>
            <h3 className="text-white font-bold">Ubah Stok</h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[220px]">{item.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5">
            <MdClose size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Stok sekarang */}
          <div className="flex items-center justify-between p-3 rounded-xl"
            style={{ background: 'rgba(11,59,46,0.4)', border: '1px solid rgba(34,197,94,0.1)' }}>
            <span className="text-xs text-gray-500">Stok saat ini</span>
            <span className="text-white font-black text-lg">{item.stock} <span className="text-gray-500 text-sm font-normal">{item.unit}</span></span>
          </div>

          {/* Tipe */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'add',    label: '+ Tambah Stok',  icon: MdAddCircle,    color: '#22C55E', bg: 'rgba(34,197,94,0.12)'  },
              { id: 'reduce', label: '− Kurangi Stok', icon: MdRemoveCircle, color: '#EF4444', bg: 'rgba(239,68,68,0.1)'   },
            ].map(t => (
              <button key={t.id} type="button" onClick={() => setType(t.id)}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all"
                style={type === t.id
                  ? { background: t.bg, color: t.color, border: `1.5px solid ${t.color}40` }
                  : { background: 'rgba(11,59,46,0.3)', color: '#4B5563', border: '1px solid rgba(34,197,94,0.08)' }}>
                <t.icon size={15} /> {t.label}
              </button>
            ))}
          </div>

          {/* Jumlah */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Jumlah ({item.unit})</label>
            <input type="number" required min="1" value={qty} onChange={e => setQty(e.target.value)}
              placeholder="0" className={inputCls} style={inputStyle} />
          </div>

          {/* Preview */}
          {qty && parseInt(qty) > 0 && (
            <div className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: type === 'add' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${type === 'add' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
              <span className="text-xs text-gray-400">Stok setelah</span>
              <span className="font-black" style={{ color: type === 'add' ? '#22C55E' : preview < 0 ? '#EF4444' : '#FBBF24' }}>
                {Math.max(0, preview)} {item.unit}
              </span>
            </div>
          )}

          {/* Catatan */}
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Catatan</label>
            <input value={note} onChange={e => setNote(e.target.value)}
              placeholder={type === 'add' ? 'Restock dari supplier...' : 'Digunakan untuk order #...'}
              className={inputCls} style={inputStyle} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-all"
              style={{ border: '1px solid rgba(34,197,94,0.12)' }}>Batal</button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-black transition-all hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: type === 'add' ? 'linear-gradient(90deg,#22C55E,#16a34a)' : 'linear-gradient(90deg,#ef4444,#dc2626)', color: '#fff' }}>
              <MdCheck size={15} /> Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── History Drawer ───────────────────────────────────────────────────
function HistoryDrawer({ item, history, onClose }) {
  const itemHistory = history.filter(h => h.itemId === item.id).reverse()
  return (
    <div className="fixed inset-0 z-50 flex justify-end"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-sm h-full overflow-y-auto"
        style={{ background: 'linear-gradient(160deg,#061a14,#082b1e)', borderLeft: '1px solid rgba(34,197,94,0.2)', boxShadow: '-20px 0 60px rgba(0,0,0,0.5)' }}
        onClick={e => e.stopPropagation()}>
        <div className="h-0.5" style={{ background: 'linear-gradient(90deg,#22C55E,#16a34a)' }} />

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

        {/* Stok sekarang */}
        <div className="mx-5 mb-5 rounded-2xl p-4 text-center"
          style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
          <p className="text-xs text-gray-500 mb-1">Stok Sekarang</p>
          <p className="text-4xl font-black text-white">{item.stock}</p>
          <p className="text-gray-500 text-sm">{item.unit}</p>
        </div>

        {/* History list */}
        <div className="px-5 pb-8">
          <p className="text-xs text-gray-600 uppercase tracking-wider mb-3">Riwayat Perubahan</p>
          {itemHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-600 text-sm">Belum ada riwayat</div>
          ) : (
            <div className="space-y-2">
              {itemHistory.map((h, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(11,59,46,0.3)', border: '1px solid rgba(34,197,94,0.07)' }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={h.delta > 0
                      ? { background: 'rgba(34,197,94,0.12)', color: '#22C55E' }
                      : { background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
                    {h.delta > 0 ? <MdTrendingUp size={16} /> : <MdTrendingDown size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-300 font-medium">{h.note}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{h.date} · Stok: {h.before} → {h.after}</p>
                  </div>
                  <span className="text-sm font-black flex-shrink-0" style={{ color: h.delta > 0 ? '#22C55E' : '#EF4444' }}>
                    {h.delta > 0 ? '+' : ''}{h.delta}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Form Modal ───────────────────────────────────────────────────────
function ItemModal({ isOpen, onClose, onSubmit, form, setForm, editId }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#061a14,#0a2e1e)', border: '1px solid rgba(34,197,94,0.2)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(34,197,94,0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.15)' }}>
              <MdInventory2 size={15} className="text-green-400" />
            </div>
            <h3 className="text-white font-bold">{editId ? 'Edit Barang' : 'Tambah Barang'}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5">
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
                {['Oli','Ban','Aki','Filter','Rem','Lainnya'].map(c => <option key={c}>{c}</option>)}
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

        <div className="flex gap-3 px-5 py-4" style={{ borderTop: '1px solid rgba(34,197,94,0.1)' }}>
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-all"
            style={{ border: '1px solid rgba(34,197,94,0.12)' }}>Batal</button>
          <button type="submit" form="form-item"
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-black transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(90deg,#22C55E,#16a34a)' }}>
            {editId ? 'Simpan' : 'Tambah'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Halaman Utama ────────────────────────────────────────────────────
// FIX (terkait isu localStorage #1): jika localStorage('garage_inventory')
// sudah pernah ter-set dengan data lama (6 item versi sebelumnya), maka
// item baru dari inventoryData.json (79 item, 16 kategori) TIDAK akan
// muncul karena localStorage selalu diprioritaskan dan menimpa seluruhnya.
// Solusi: merge by id — data localStorage tetap menang untuk item yang
// sudah ada (preserve stok yang sudah diubah admin), tapi item baru dari
// JSON yang belum pernah ada di localStorage akan ditambahkan otomatis.
function loadInventory() {
  let stored = []
  try {
    const raw = localStorage.getItem('garage_inventory')
    stored = raw ? JSON.parse(raw) : []
  } catch { stored = [] }

  if (stored.length === 0) return inventoryData

  const storedIds = new Set(stored.map(i => i.id))
  const storedCodes = new Set(stored.map(i => i.code))
  const newOnes = inventoryData.filter(i => !storedIds.has(i.id) && !storedCodes.has(i.code))
  return [...stored, ...newOnes]
}

export default function Inventory() {
  const [items, setItems] = useState(() => loadInventory())
  const [history, setHistory] = useState(() => {
    try { const s = localStorage.getItem('garage_inventory_history'); return s ? JSON.parse(s) : [] } catch { return [] }
  })

  useEffect(() => {
    try { localStorage.setItem('garage_inventory', JSON.stringify(items)) } catch {}
  }, [items])
  useEffect(() => {
    try { localStorage.setItem('garage_inventory_history', JSON.stringify(history)) } catch {}
  }, [history])

  const [search, setSearch]           = useState('')
  const [category, setCategory]       = useState('Semua')
  const [showModal, setShowModal]     = useState(false)
  const [form, setForm]               = useState(initialForm)
  const [editId, setEditId]           = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [restockTarget, setRestockTarget] = useState(null)
  const [historyTarget, setHistoryTarget] = useState(null)

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

  const handleSubmit = (ev) => {
    ev.preventDefault()
    const parsed = { ...form, stock: parseInt(form.stock)||0, minStock: parseInt(form.minStock)||5, buyPrice: parseInt(form.buyPrice)||0, sellPrice: parseInt(form.sellPrice)||0 }
    if (editId) {
      setItems(prev => prev.map(it => it.id === editId ? { ...it, ...parsed } : it))
    } else {
      setItems(prev => [{ ...parsed, id: `INV-${Date.now()}` }, ...prev])
    }
    setShowModal(false)
  }

  const handleRestock = (itemId, delta, note) => {
    setItems(prev => prev.map(it => {
      if (it.id !== itemId) return it
      const before = it.stock
      const after = Math.max(0, before + delta)
      const entry = { itemId, delta, before, after, note, date: new Date().toISOString().slice(0,10) + ' ' + new Date().toTimeString().slice(0,5) }
      setHistory(h => [entry, ...h])
      return { ...it, stock: after }
    }))
    setRestockTarget(null)
  }

  const handleDelete = () => {
    setItems(prev => prev.filter(it => it.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <div className="page-animate">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Stok Spare Part</h1>
          <p className="text-sm text-gray-500 mt-0.5">{totalSKU} SKU terdaftar</p>
        </div>
        <button onClick={openAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-black transition-all hover:opacity-90 hover:scale-105"
          style={{ background: 'linear-gradient(90deg,#22C55E,#16a34a)', boxShadow: '0 4px 18px rgba(34,197,94,0.35)' }}>
          <MdAdd size={18} /> Tambah Barang
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total SKU',         value: totalSKU,                                    color: '#22C55E', bg: 'rgba(34,197,94,0.08)'   },
          { label: 'Nilai Total Stok',  value: `Rp ${(totalValue/1000000).toFixed(1)}jt`,  color: '#60A5FA', bg: 'rgba(96,165,250,0.08)'  },
          { label: 'Stok Menipis',      value: lowStock,                                    color: '#FBBF24', bg: 'rgba(251,191,36,0.08)'  },
          { label: 'Stok Habis',        value: outOfStock,                                  color: '#EF4444', bg: 'rgba(239,68,68,0.08)'   },
        ].map(s => (
          <div key={s.label} className="rounded-xl px-4 py-3 transition-all hover:scale-[1.02]"
            style={{ background: s.bg, border: `1px solid ${s.color}20` }}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Alert */}
      {(lowStock > 0 || outOfStock > 0) && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl mb-5 text-sm text-yellow-400"
          style={{ background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.2)' }}>
          <MdWarning size={18} className="flex-shrink-0" />
          <span>
            {outOfStock > 0 && <><strong>{outOfStock} barang habis</strong>. </>}
            {lowStock > 0 && <><strong>{lowStock} barang menipis</strong> dan perlu restock.</>}
            {' Klik tombol + untuk restock.'}
          </span>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(6,28,20,0.8)', border: '1px solid rgba(34,197,94,0.1)', backdropFilter: 'blur(6px)' }}>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 p-4"
          style={{ borderBottom: '1px solid rgba(34,197,94,0.08)' }}>
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama atau kode barang..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-gray-300 outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
              style={{ background: 'rgba(11,59,46,0.5)', border: '1px solid rgba(34,197,94,0.12)' }} />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
                style={category === cat
                  ? { background: 'rgba(34,197,94,0.2)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }
                  : { background: 'rgba(11,59,46,0.3)', color: '#6B7280', border: '1px solid rgba(34,197,94,0.08)' }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: 800 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(34,197,94,0.08)' }}>
                {['Kode','Nama Barang','Kategori','Stok','Min. Stok','Harga Beli','Harga Jual','Status','Aksi'].map(h => (
                  <th key={h} className="text-left py-3 px-3 text-xs text-gray-600 font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((it) => {
                const st = getStockStatus(it.stock, it.minStock)
                const pct = it.minStock > 0 ? Math.min(100, (it.stock / (it.minStock * 3)) * 100) : 100
                return (
                  <tr key={it.id} className="transition-colors hover:bg-green-500/[0.03]"
                    style={{ borderBottom: '1px solid rgba(34,197,94,0.05)' }}>
                    <td className="py-3 px-3 text-xs text-green-400 font-mono whitespace-nowrap">{it.code}</td>
                    <td className="py-3 px-3">
                      <p className="text-sm text-white font-medium whitespace-nowrap">{it.name}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-xs px-2 py-1 rounded-lg text-gray-400"
                        style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.1)' }}>
                        {it.category}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div>
                        <span className={`text-sm font-black ${it.stock === 0 ? 'text-red-400' : it.stock <= it.minStock ? 'text-yellow-400' : 'text-white'}`}>
                          {it.stock}
                        </span>
                        <span className="text-gray-600 text-xs ml-1">{it.unit}</span>
                        {/* mini progress bar */}
                        <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ width: 48, background: 'rgba(255,255,255,0.06)' }}>
                          <div className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: it.stock === 0 ? '#EF4444' : it.stock <= it.minStock ? '#FBBF24' : '#22C55E' }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-xs text-gray-500 whitespace-nowrap">{it.minStock} {it.unit}</td>
                    <td className="py-3 px-3 text-sm text-gray-400 whitespace-nowrap">{fmt(it.buyPrice)}</td>
                    <td className="py-3 px-3 text-sm text-white font-semibold whitespace-nowrap">{fmt(it.sellPrice)}</td>
                    <td className="py-3 px-3">
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                        style={{ background: st.bg, color: st.cls.replace('text-','').replace('-400',''), border: `1px solid ${st.border}` }}
                        style2={{ color: it.stock === 0 ? '#EF4444' : it.stock <= it.minStock ? '#FBBF24' : '#22C55E' }}>
                        <span style={{ color: it.stock === 0 ? '#EF4444' : it.stock <= it.minStock ? '#FBBF24' : '#22C55E' }}>{st.label}</span>
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setRestockTarget(it)} title="Restock"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-green-400 transition-all hover:bg-green-500/15 hover:scale-110"
                          style={{ background: 'rgba(34,197,94,0.08)' }}>
                          <MdAddCircle size={15} />
                        </button>
                        <button onClick={() => setHistoryTarget(it)} title="Riwayat"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-blue-400 transition-all hover:bg-blue-500/15">
                          <MdHistory size={15} />
                        </button>
                        <button onClick={() => openEdit(it)} title="Edit"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-yellow-400 transition-all hover:bg-yellow-500/15">
                          <MdEdit size={15} />
                        </button>
                        <button onClick={() => setDeleteTarget(it)} title="Hapus"
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 transition-all hover:bg-red-500/15">
                          <MdDelete size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-14 text-gray-600 text-sm flex flex-col items-center gap-2">
              <MdInventory2 size={40} className="opacity-20" />
              Tidak ada barang ditemukan
            </div>
          )}
        </div>

        <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(34,197,94,0.06)' }}>
          <p className="text-xs text-gray-600">Menampilkan {filtered.length} dari {items.length} barang</p>
        </div>
      </div>

      {/* Modals */}
      <ItemModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        form={form} setForm={setForm}
        editId={editId}
      />
      {/* hidden form id for submit */}
      {showModal && <form id="form-item" onSubmit={handleSubmit} className="hidden" />}

      {restockTarget && (
        <RestockModal item={restockTarget} onClose={() => setRestockTarget(null)} onConfirm={handleRestock} />
      )}

      {historyTarget && (
        <HistoryDrawer item={historyTarget} history={history} onClose={() => setHistoryTarget(null)} />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={() => setDeleteTarget(null)}>
          <div className="w-full max-w-xs rounded-2xl p-6 text-center"
            style={{ background: '#06281F', border: '1px solid rgba(239,68,68,0.3)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
            onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.2)' }}>
              <MdDelete size={26} className="text-red-500" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Hapus Barang?</h3>
            <p className="text-gray-400 text-sm mb-6">
              <span className="text-green-400 font-bold">{deleteTarget.name}</span> akan dihapus permanen.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-white/5 transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}>Batal</button>
              <button onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(90deg,#ef4444,#dc2626)' }}>Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}