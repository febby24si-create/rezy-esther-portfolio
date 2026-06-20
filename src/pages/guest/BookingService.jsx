import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { layanan, availableTimeSlots } from '../../data/guestData'
import { searchCatalog } from '../../data/vehicleCatalog'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { syncCustomerVehicle } from '../../utils/syncVehicle'
import {
  MdArrowBack, MdArrowForward, MdCheckCircle,
  MdDirectionsCar, MdBuild, MdCalendarMonth, MdSend,
  MdClose, MdSearch, MdCloudUpload,
} from 'react-icons/md'

const STEPS = ['Kendaraan', 'Layanan', 'Jadwal', 'Konfirmasi']
const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID')

function getNextDates(n = 14) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1); return d
  })
}
function genOrderId() { return '#ORD-' + Math.random().toString(36).slice(2, 10).toUpperCase() }

// ── Catalog Search Autocomplete ───────────────────────────────────────
function CatalogSearch({ onSelect }) {
  const [query, setQuery]       = useState('')
  const [results, setResults]   = useState([])
  const [selEntry, setSelEntry] = useState(null)
  const [selYear, setSelYear]   = useState('')
  const [open, setOpen]         = useState(false)
  const wrapRef = useRef()

  useEffect(() => {
    if (query.length >= 1) setResults(searchCatalog(query))
    else setResults([])
  }, [query])

  useEffect(() => {
    const fn = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const pick = (entry) => {
    setSelEntry(entry)
    setQuery(`${entry.brand} ${entry.model}`)
    setResults([])
    setOpen(false)
    setSelYear('')
  }

  const confirm = () => {
    if (!selEntry || !selYear) return
    onSelect({ brand: selEntry.brand, model: selEntry.model, year: selYear,
      type: selEntry.type === 'Motor' ? 'motor' : 'mobil',
      photo: selEntry.photo, fromCatalog: true })
  }

  return (
    <div className="space-y-4" ref={wrapRef}>
      {/* Search input */}
      <div className="relative">
        <MdSearch size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-600 pointer-events-none" />
        <input
          type="text" value={query}
          onChange={e => { setQuery(e.target.value); setSelEntry(null); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Ketik merk atau model… Toyota, NMAX, Jazz"
          className="w-full pl-10 pr-10 py-3 rounded-xl text-sm text-white outline-none transition-all"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: open ? '1px solid rgba(34,197,94,0.5)' : '1px solid rgba(255,255,255,0.1)',
            boxShadow: open ? '0 0 0 3px rgba(34,197,94,0.08)' : 'none',
          }}
          autoComplete="off"
        />
        {query && (
          <button onClick={() => { setQuery(''); setSelEntry(null); setSelYear('') }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
            <MdClose size={16} />
          </button>
        )}

        {/* Dropdown */}
        <AnimatePresence>
          {open && results.length > 0 && !selEntry && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}
              className="absolute top-full mt-2 w-full rounded-2xl overflow-hidden z-30"
              style={{ background: '#061f14', border: '1px solid rgba(34,197,94,0.2)', boxShadow: '0 16px 40px rgba(0,0,0,0.6)' }}
            >
              {results.map((entry, i) => (
                <button key={`${entry.brand}-${entry.model}`} onClick={() => pick(entry)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-green-500/10"
                  style={{ borderBottom: i < results.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <img src={entry.photo} alt={entry.model}
                      className="w-full h-full object-cover"
                      onError={e => { e.target.style.display = 'none' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold">{entry.brand} {entry.model}</p>
                    <p className="text-gray-500 text-xs">{entry.type} · {entry.years[0]}–{entry.years[entry.years.length - 1]}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      background: entry.type === 'Motor' ? 'rgba(251,191,36,0.12)' : 'rgba(34,197,94,0.12)',
                      color: entry.type === 'Motor' ? '#FBBF24' : '#4ade80',
                    }}>
                    {entry.type === 'Motor' ? '🏍️' : '🚗'} {entry.type}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preview + pilih tahun */}
      <AnimatePresence>
        {selEntry && (
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="rounded-2xl overflow-hidden"
            style={{ border: '1px solid rgba(34,197,94,0.25)', background: 'rgba(34,197,94,0.04)' }}>
            <div className="relative h-40 overflow-hidden">
              <img src={selEntry.photo} alt={selEntry.model}
                className="w-full h-full object-cover"
                onError={e => { e.target.style.display = 'none' }} />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(6,31,20,0.92) 0%, transparent 60%)' }} />
              <div className="absolute bottom-3 left-4">
                <p className="text-white font-black text-lg">{selEntry.brand} {selEntry.model}</p>
                <p className="text-green-400 text-xs">{selEntry.type}</p>
              </div>
              <button onClick={() => { setSelEntry(null); setQuery(''); setSelYear('') }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.6)' }}>
                <MdClose size={13} className="text-white" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-300 text-xs font-medium mb-2">Pilih Tahun Kendaraan</p>
              <div className="flex flex-wrap gap-2">
                {[...selEntry.years].reverse().map(yr => (
                  <button key={yr} onClick={() => setSelYear(String(yr))}
                    className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      background: selYear === String(yr) ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)',
                      border: selYear === String(yr) ? '1px solid rgba(34,197,94,0.5)' : '1px solid rgba(255,255,255,0.1)',
                      color: selYear === String(yr) ? '#4ade80' : '#9ca3af',
                    }}>
                    {yr}
                  </button>
                ))}
              </div>
              <AnimatePresence>
                {selYear && (
                  <motion.button initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    onClick={confirm}
                    className="mt-4 w-full py-2.5 rounded-xl text-sm font-bold text-black flex items-center justify-center gap-2 transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #22C55E, #16a34a)' }}>
                    <MdCheckCircle size={16} />
                    Gunakan {selEntry.brand} {selEntry.model} {selYear}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {query.length >= 2 && results.length === 0 && !selEntry && (
        <p className="text-gray-600 text-xs text-center py-2">
          Kendaraan tidak ditemukan. Coba metode "Upload Foto" untuk input manual.
        </p>
      )}
    </div>
  )
}

// ── Manual Upload Form ────────────────────────────────────────────────
function ManualUploadForm({ nv, setNv }) {
  const fileRef = useRef()

  const handleFile = (file) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert('Ukuran foto maksimal 5MB.'); return }
    const reader = new FileReader()
    reader.onloadend = () => setNv(v => ({ ...v, photo: reader.result }))
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-4">
      {/* Drag & drop */}
      <div>
        <p className="text-gray-300 text-xs font-medium mb-2">
          Foto Kendaraan <span className="text-gray-600">(opsional)</span>
        </p>
        {nv.photo ? (
          <div className="relative w-full h-40 rounded-2xl overflow-hidden">
            <img src={nv.photo} alt="preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              style={{ background: 'rgba(0,0,0,0.5)' }}>
              <button onClick={() => setNv(v => ({ ...v, photo: '' }))}
                className="flex items-center gap-1.5 text-xs text-white px-3 py-1.5 rounded-lg"
                style={{ background: 'rgba(239,68,68,0.3)', border: '1px solid rgba(239,68,68,0.4)' }}>
                <MdClose size={13} /> Hapus Foto
              </button>
            </div>
          </div>
        ) : (
          <label
            className="flex flex-col items-center justify-center w-full h-36 rounded-2xl border-2 border-dashed cursor-pointer transition-all hover:border-blue-500/40"
            style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]) }}
          >
            <MdCloudUpload size={28} className="text-gray-600 mb-2" />
            <span className="text-gray-400 text-sm">Drag & drop atau klik untuk upload</span>
            <span className="text-gray-700 text-xs mt-1">JPG, PNG — maks 5MB</span>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => handleFile(e.target.files?.[0])} />
          </label>
        )}
      </div>

      {/* Fields */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { key: 'brand',  ph: 'Merk (Toyota, Honda…)' },
          { key: 'model',  ph: 'Model (Avanza, Beat…)' },
          { key: 'year',   ph: 'Tahun (2022)' },
          { key: 'plate',  ph: 'Plat Nomor (B 1234 ABC)' },
          { key: 'color',  ph: 'Warna (Putih, Hitam…)' },
          { key: 'km',     ph: 'KM saat ini (opsional)' },
        ].map(({ key, ph }) => (
          <input key={key} value={nv[key] || ''}
            onChange={e => setNv(v => ({ ...v, [key]: e.target.value }))}
            placeholder={ph}
            className="px-3 py-2.5 rounded-xl text-sm text-white outline-none transition-all focus:ring-1 focus:ring-green-500/30"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
        ))}
      </div>

      {/* Tipe */}
      <div className="flex gap-3">
        {[{ val: 'mobil', label: '🚗 Mobil' }, { val: 'motor', label: '🏍️ Motor' }].map(({ val, label }) => (
          <button key={val} onClick={() => setNv(v => ({ ...v, type: val }))}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: nv.type === val ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)',
              border: nv.type === val ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(255,255,255,0.1)',
              color: nv.type === val ? '#4ade80' : '#9ca3af',
            }}>
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Step 0 — Vehicle ──────────────────────────────────────────────────
function VehicleStep({ customer, form, setForm, updateCustomer }) {
  const [addMode, setAddMode] = useState(null) // null | 'catalog' | 'catalog_confirm' | 'upload'
  const [nv, setNv] = useState({ brand:'', model:'', year:'', plate:'', color:'', type:'mobil', km:'', photo:'' })

  const vehicles = customer?.vehicles || []

  const saveVehicle = (v) => {
    const updated = [...vehicles, v]
    updateCustomer({ ...customer, vehicles: updated })
    syncCustomerVehicle(v, customer)
    setForm(f => ({ ...f, vehicle: v }))
    setNv({ brand:'', model:'', year:'', plate:'', color:'', type:'mobil', km:'', photo:'' })
    setAddMode(null)
  }

  const handleSaveManual = () => {
    if (!nv.brand || !nv.plate) return
    saveVehicle({ id: 'V-' + Date.now(), ...nv, lastService: null, fromCatalog: false })
  }

  const handleCatalogSelect = (entry) => {
    setNv({ brand: entry.brand, model: entry.model, year: entry.year,
      type: entry.type, photo: entry.photo, fromCatalog: true,
      plate: '', color: '', km: '' })
    setAddMode('catalog_confirm')
  }

  const handleSaveCatalog = () => {
    if (!nv.plate) return
    saveVehicle({ id: 'V-' + Date.now(), ...nv, lastService: null, fromCatalog: true })
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <MdDirectionsCar className="text-green-400" /> Pilih Kendaraan
      </h2>

      {/* Kendaraan tersimpan */}
      {vehicles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {vehicles.map(v => (
            <motion.button key={v.id} onClick={() => setForm(f => ({ ...f, vehicle: v }))}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="p-4 rounded-2xl border text-left transition-all"
              style={{
                background: form.vehicle?.id === v.id ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)',
                border: form.vehicle?.id === v.id ? '1px solid rgba(34,197,94,0.5)' : '1px solid rgba(255,255,255,0.08)',
                boxShadow: form.vehicle?.id === v.id ? '0 0 20px rgba(34,197,94,0.12)' : 'none',
              }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>
                  {v.photo
                    ? <img src={v.photo} alt={v.model} className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = 'none' }} />
                    : <span className="text-2xl">{v.type === 'motor' ? '🏍️' : '🚗'}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{v.brand} {v.model} {v.year}</p>
                  <p className="text-gray-400 text-xs">{v.plate}{v.color ? ` · ${v.color}` : ''}</p>
                  {v.fromCatalog && <span className="text-xs text-green-600">✦ Dari katalog</span>}
                </div>
                {form.vehicle?.id === v.id && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                    <MdCheckCircle className="text-green-400 text-xl" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Tambah kendaraan */}
      <AnimatePresence mode="wait">
        {!addMode && (
          <motion.div key="prompt"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="rounded-2xl border-2 border-dashed p-5"
            style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-gray-400 text-sm text-center mb-4">
              {vehicles.length > 0 ? 'Tambah kendaraan lain' : 'Bagaimana Anda ingin menambahkan kendaraan?'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setAddMode('catalog')}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl text-center transition-all"
                style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <span className="text-3xl">🔍</span>
                <p className="text-green-400 font-semibold text-sm">Cari dari daftar kendaraan</p>
                <p className="text-gray-600 text-xs">Pilih dari ratusan merk &amp; model</p>
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setAddMode('upload')}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl text-center transition-all"
                style={{ background: 'rgba(96,165,250,0.04)', border: '1px solid rgba(96,165,250,0.2)' }}>
                <span className="text-3xl">📸</span>
                <p className="text-blue-400 font-semibold text-sm">Upload foto kendaraan</p>
                <p className="text-gray-600 text-xs">Input manual + foto sendiri</p>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Mode: katalog */}
        {addMode === 'catalog' && (
          <motion.div key="catalog"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-2xl border p-5"
            style={{ background: 'rgba(34,197,94,0.03)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-green-400 font-semibold text-sm">🔍 Cari dari Database Kendaraan</p>
              <button onClick={() => setAddMode(null)} className="text-gray-500 hover:text-white transition-colors">
                <MdClose size={16} />
              </button>
            </div>
            <CatalogSearch onSelect={handleCatalogSelect} />
          </motion.div>
        )}

        {/* Mode: konfirmasi katalog (isi plat) */}
        {addMode === 'catalog_confirm' && (
          <motion.div key="catalog_confirm"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-2xl border p-5 space-y-4"
            style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.2)' }}>
            {/* Preview */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                {nv.photo && <img src={nv.photo} alt={nv.model} className="w-full h-full object-cover" />}
              </div>
              <div>
                <p className="text-white font-bold">{nv.brand} {nv.model} {nv.year}</p>
                <span className="text-xs text-green-500">✦ Kendaraan dari katalog</span>
              </div>
            </div>
            {/* Plat & info */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'plate', ph: 'Plat Nomor (wajib)', cls: 'col-span-2' },
                { key: 'color', ph: 'Warna kendaraan', cls: '' },
                { key: 'km',    ph: 'KM saat ini (opsional)', cls: '' },
              ].map(({ key, ph, cls }) => (
                <input key={key} value={nv[key] || ''}
                  onChange={e => setNv(v => ({ ...v, [key]: e.target.value }))}
                  placeholder={ph}
                  className={`px-3 py-2.5 rounded-xl text-sm text-white outline-none ${cls}`}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setAddMode('catalog')}
                className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white border border-white/10 transition-all">
                ← Cari Lagi
              </button>
              <button onClick={handleSaveCatalog} disabled={!nv.plate}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-black transition-all disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #22C55E, #16a34a)' }}>
                Gunakan Kendaraan Ini
              </button>
            </div>
          </motion.div>
        )}

        {/* Mode: upload manual */}
        {addMode === 'upload' && (
          <motion.div key="upload"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-2xl border p-5"
            style={{ background: 'rgba(96,165,250,0.03)', border: '1px solid rgba(96,165,250,0.2)' }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-blue-400 font-semibold text-sm">📸 Upload Foto Kendaraan</p>
              <button onClick={() => setAddMode(null)} className="text-gray-500 hover:text-white transition-colors">
                <MdClose size={16} />
              </button>
            </div>
            <ManualUploadForm nv={nv} setNv={setNv} />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setAddMode(null)}
                className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white border border-white/10 transition-all">
                Batal
              </button>
              <button onClick={handleSaveManual} disabled={!nv.brand || !nv.plate}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-black transition-all disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #60A5FA, #3b82f6)' }}>
                Simpan Kendaraan
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────
export default function BookingService() {
  const navigate = useNavigate()
  const { customer, addPoints, updateCustomer, validateVoucher, useVoucher } = useCustomerAuth()
  const [step, setStep]         = useState(0)
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)
  const [orderId, setOrderId]   = useState('')
  const [form, setForm]         = useState({ vehicle: null, service: null, date: null, time: null, keluhan: '' })
  // ── Voucher state ──
  const [voucherCode, setVoucherCode]       = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState(null)
  const [voucherError, setVoucherError]     = useState('')

  const dates         = getNextDates(14)
  const totalEstimate = form.service ? Math.round((form.service.hargaMulai + form.service.hargaMaks) / 2) : 0
  const discountAmt   = appliedVoucher ? Math.round(totalEstimate * appliedVoucher.diskon / 100) : 0
  const finalTotal    = totalEstimate - discountAmt

  const handleApplyVoucher = () => {
    setVoucherError('')
    if (!voucherCode.trim()) return
    const result = validateVoucher(voucherCode.trim().toUpperCase())
    if (result.valid) {
      setAppliedVoucher(result.voucher)
    } else {
      setVoucherError(result.message)
    }
  }

  const isStepValid = () => {
    if (step === 0) return !!form.vehicle
    if (step === 1) return !!form.service
    if (step === 2) return !!form.date && !!form.time
    return true
  }

  const handleSubmit = () => {
    setLoading(true)
    const id = genOrderId(); setOrderId(id)
    setTimeout(() => {
      const orders = JSON.parse(sessionStorage.getItem('garage_orders') || '[]')
      sessionStorage.setItem('garage_orders', JSON.stringify([{
        id, customer: customer.name, customerId: customer.id,
        customerPhone: customer.phone || customer.whatsapp || '',
        vehicle: `${form.vehicle.brand} ${form.vehicle.model} - ${form.vehicle.plate}`,
        vehiclePlate: form.vehicle.plate,
        service: form.service.name, status: 'Antrian',
        total: finalTotal, date: form.date.toISOString().slice(0, 10),
        time: form.time, mechanic: '—', keluhan: form.keluhan,
        voucherUsed: appliedVoucher?.code || null,
        discountApplied: discountAmt,
        pointsAwarded: false,
        createdAt: new Date().toISOString(),
        // FIX: tandai asal order agar Orders.jsx tahu data ini sudah lengkap
        // dari booking online — admin tinggal assign mekanik, tanpa input ulang.
        source: 'online-booking',
        needsMechanicAssignment: true,
      }, ...orders]))
      // Gunakan voucher jika ada
      if (appliedVoucher) {
        useVoucher(appliedVoucher.code, id)
      }
      setLoading(false); setDone(true)
    }, 1800)
  }

  // ── Success screen ─────────────────────────────────────────
  if (done) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center px-4" style={{ background: '#020f09' }}>
        <div className="max-w-md w-full text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.4)' }}>
            <MdCheckCircle className="text-green-400 text-5xl" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h2 className="text-2xl font-extrabold text-white mb-2">Booking Berhasil!</h2>
            <p className="text-gray-400 text-sm mb-1">No. booking: <span className="text-green-400 font-bold font-mono">{orderId}</span></p>
            <p className="text-gray-500 text-xs mb-5">Konfirmasi dikirim via WhatsApp ke nomor terdaftar.</p>
            <div className="inline-flex items-center gap-2 text-sm text-yellow-400 px-4 py-2 rounded-xl mb-5"
              style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
              ⭐ +{Math.floor(totalEstimate / 1000)} poin loyalty ditambahkan!
            </div>
            <div className="rounded-xl p-4 mb-6 text-left space-y-2.5"
              style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }}>
              {form.vehicle?.photo && (
                <div className="w-full h-28 rounded-lg overflow-hidden mb-2">
                  <img src={form.vehicle.photo} alt={form.vehicle.model} className="w-full h-full object-cover" />
                </div>
              )}
              {[
                { label: 'Atas Nama',  value: customer?.name },
                { label: 'Kendaraan', value: `${form.vehicle?.brand} ${form.vehicle?.model} ${form.vehicle?.year}` },
                { label: 'Plat',      value: form.vehicle?.plate || '-' },
                { label: 'Layanan',   value: form.service?.name },
                { label: 'Tanggal',   value: form.date?.toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long' }) },
                { label: 'Jam',       value: form.time },
                { label: 'Estimasi',  value: fmt(totalEstimate) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-400">{label}</span>
                  <span className="text-white font-medium">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate('/member/tracking')}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-green-400 transition-all"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                Pantau Status
              </button>
              <button onClick={() => navigate('/member/dashboard')}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen px-4 sm:px-6" style={{ background: '#020f09' }}>
      <div className="max-w-3xl mx-auto py-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-extrabold text-white">Booking Service Online</h1>
          <p className="text-gray-400 text-sm mt-1">Isi form berikut untuk menjadwalkan servis kendaraan Anda.</p>
        </motion.div>

        {/* Step indicator */}
        <div className="flex items-center mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <motion.div
                  animate={i === step ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.4 }}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                  style={
                    i < step  ? { background: '#22C55E', color: 'white', boxShadow: '0 0 12px rgba(34,197,94,0.4)' }
                    : i === step ? { background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '2px solid #22C55E' }
                    : { background: 'rgba(255,255,255,0.04)', color: '#6B7280', border: '1px solid rgba(255,255,255,0.1)' }
                  }>
                  {i < step ? <MdCheckCircle className="text-lg" /> : i + 1}
                </motion.div>
                <span className={`text-xs mt-1 font-medium hidden sm:block ${i === step ? 'text-green-400' : i < step ? 'text-gray-300' : 'text-gray-600'}`}>
                  {s}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <motion.div className="h-full bg-green-500 rounded-full"
                    animate={{ width: i < step ? '100%' : '0%' }}
                    transition={{ duration: 0.4, ease: 'easeOut' }} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}>

            {/* Step 0: Kendaraan */}
            {step === 0 && (
              <VehicleStep customer={customer} form={form} setForm={setForm} updateCustomer={updateCustomer} />
            )}

            {/* Step 1: Layanan */}
            {step === 1 && (
              <div>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <MdBuild className="text-green-400" /> Pilih Layanan
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                  {layanan.map(l => (
                    <motion.button key={l.id} onClick={() => setForm(f => ({ ...f, service: l }))}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="p-4 rounded-xl border text-left transition-all"
                      style={{
                        background: form.service?.id === l.id ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)',
                        border: form.service?.id === l.id ? '1px solid rgba(34,197,94,0.5)' : '1px solid rgba(255,255,255,0.08)',
                      }}>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xl">{l.icon}</span>
                        <div className="flex-1">
                          <p className="text-white font-semibold text-sm">{l.name}</p>
                          <p className="text-gray-500 text-xs">{fmt(l.hargaMulai)} – {fmt(l.hargaMaks)}</p>
                        </div>
                        {form.service?.id === l.id && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                            <MdCheckCircle className="text-green-400 text-lg" />
                          </motion.div>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs pl-9">⏱ {l.durasi}</p>
                    </motion.button>
                  ))}
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Keluhan (opsional)</label>
                  <textarea value={form.keluhan}
                    onChange={e => setForm(f => ({ ...f, keluhan: e.target.value }))}
                    placeholder="Ceritakan keluhan kendaraan Anda..." rows={3}
                    className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none resize-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
              </div>
            )}

            {/* Step 2: Jadwal */}
            {step === 2 && (
              <div>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <MdCalendarMonth className="text-green-400" /> Pilih Tanggal &amp; Jam
                </h2>
                <p className="text-gray-400 text-sm mb-3">Tanggal Servis</p>
                <div className="flex gap-2 overflow-x-auto pb-3 mb-6" style={{ scrollbarWidth: 'none' }}>
                  {dates.map(d => {
                    const sel    = form.date?.toDateString() === d.toDateString()
                    const sunday = d.getDay() === 0
                    return (
                      <motion.button key={d.toDateString()} disabled={sunday}
                        onClick={() => setForm(f => ({ ...f, date: d }))}
                        whileHover={!sunday ? { scale: 1.05 } : {}}
                        whileTap={!sunday ? { scale: 0.95 } : {}}
                        className="flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-xl border w-16 transition-all"
                        style={{
                          background: sunday ? 'rgba(255,255,255,0.02)' : sel ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.03)',
                          border: sunday ? '1px solid rgba(255,255,255,0.05)' : sel ? '1px solid rgba(34,197,94,0.5)' : '1px solid rgba(255,255,255,0.08)',
                          opacity: sunday ? 0.3 : 1,
                          boxShadow: sel ? '0 0 16px rgba(34,197,94,0.2)' : 'none',
                        }}>
                        <span className={`text-xs font-medium ${sel ? 'text-green-400' : 'text-gray-300'}`}>
                          {d.toLocaleDateString('id-ID', { weekday: 'short' })}
                        </span>
                        <span className={`text-lg font-extrabold leading-tight ${sel ? 'text-green-400' : 'text-white'}`}>
                          {d.getDate()}
                        </span>
                        <span className={`text-xs ${sel ? 'text-green-400/70' : 'text-gray-500'}`}>
                          {d.toLocaleDateString('id-ID', { month: 'short' })}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
                <p className="text-gray-400 text-sm mb-3">Jam Servis</p>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {availableTimeSlots.map(t => (
                    <motion.button key={t} onClick={() => setForm(f => ({ ...f, time: t }))}
                      whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                      className="py-2.5 rounded-xl text-sm font-medium border transition-all"
                      style={{
                        background: form.time === t ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.03)',
                        border: form.time === t ? '1px solid rgba(34,197,94,0.5)' : '1px solid rgba(255,255,255,0.08)',
                        color: form.time === t ? '#4ade80' : '#D1D5DB',
                      }}>
                      {t}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Konfirmasi */}
            {step === 3 && (
              <div>
                <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                  <MdCheckCircle className="text-green-400" /> Ringkasan Booking
                </h2>
                <div className="rounded-2xl p-6 mb-5 space-y-3.5"
                  style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.12)' }}>
                  {form.vehicle?.photo && (
                    <div className="w-full h-32 rounded-xl overflow-hidden mb-3">
                      <img src={form.vehicle.photo} alt={form.vehicle.model} className="w-full h-full object-cover" />
                    </div>
                  )}
                  {[
                    { label: 'Atas Nama',   value: customer?.name },
                    { label: 'Kendaraan',   value: `${form.vehicle?.brand} ${form.vehicle?.model} ${form.vehicle?.year}` },
                    { label: 'Plat Nomor',  value: form.vehicle?.plate || '-' },
                    { label: 'Layanan',     value: form.service?.name },
                    { label: 'Tanggal',     value: form.date?.toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' }) },
                    { label: 'Jam',         value: form.time },
                    { label: 'Est. Durasi', value: form.service?.durasi },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">{label}</span>
                      <span className="text-white text-sm font-medium">{value}</span>
                    </div>
                  ))}
                  <div className="pt-3 flex items-center justify-between border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <span className="text-gray-300 font-semibold">Estimasi Biaya</span>
                    <span className="text-green-400 font-extrabold text-lg">{fmt(totalEstimate)}</span>
                  </div>
                </div>

                {/* ── Voucher Input ── */}
                <div className="mb-4 rounded-xl p-4"
                  style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.18)' }}>
                  <p className="text-white text-xs font-semibold mb-2 flex items-center gap-1.5">🎫 Punya Kode Voucher?</p>
                  {appliedVoucher ? (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg"
                      style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
                      <span className="text-green-400 text-sm">✓</span>
                      <div className="flex-1">
                        <p className="text-green-400 text-xs font-bold">{appliedVoucher.title}</p>
                        <p className="text-gray-400 text-xs">Hemat {fmt(discountAmt)} ({appliedVoucher.diskon}%)</p>
                      </div>
                      <button onClick={() => { setAppliedVoucher(null); setVoucherCode('') }}
                        className="text-gray-500 hover:text-red-400 text-xs">✕</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input value={voucherCode} onChange={e => { setVoucherCode(e.target.value.toUpperCase()); setVoucherError('') }}
                        placeholder="Masukkan kode voucher..."
                        className="flex-1 px-3 py-2 rounded-lg text-xs text-white outline-none"
                        style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${voucherError ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'}` }}
                        onKeyDown={e => e.key === 'Enter' && handleApplyVoucher()}
                      />
                      <button onClick={handleApplyVoucher}
                        className="px-3 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90"
                        style={{ background: 'linear-gradient(135deg,#7C3AED,#A855F7)' }}>
                        Pakai
                      </button>
                    </div>
                  )}
                  {voucherError && <p className="text-red-400 text-xs mt-1.5">{voucherError}</p>}
                </div>

                {/* Final Total (with discount) */}
                {appliedVoucher && (
                  <div className="mb-3 rounded-xl p-3"
                    style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="text-gray-300">{fmt(totalEstimate)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-purple-400">Diskon Voucher ({appliedVoucher.diskon}%)</span>
                      <span className="text-green-400">− {fmt(discountAmt)}</span>
                    </div>
                    <div className="flex justify-between font-extrabold pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <span className="text-white">Total Akhir</span>
                      <span className="text-green-400 text-lg">{fmt(finalTotal)}</span>
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl mb-4 flex items-center gap-3 text-sm"
                  style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}>
                  <span className="text-2xl">⭐</span>
                  <div>
                    <p className="text-yellow-400 font-semibold">+{Math.floor(finalTotal / 1000)} poin loyalty</p>
                    <p className="text-gray-400 text-xs">1 poin per Rp 1.000 (diberikan saat servis selesai)</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8">
          <motion.button onClick={() => step > 0 && setStep(s => s - 1)} disabled={step === 0}
            whileHover={step > 0 ? { x: -3 } : {}} whileTap={step > 0 ? { scale: 0.97 } : {}}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 text-sm font-medium">
            <MdArrowBack /> Kembali
          </motion.button>

          {step < 3 ? (
            <motion.button onClick={() => isStepValid() && setStep(s => s + 1)} disabled={!isStepValid()}
              whileHover={isStepValid() ? { scale: 1.04 } : {}} whileTap={isStepValid() ? { scale: 0.96 } : {}}
              className="flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all disabled:opacity-40"
              style={{
                background: isStepValid() ? 'linear-gradient(135deg,#16A34A,#22C55E)' : 'rgba(34,197,94,0.15)',
                boxShadow: isStepValid() ? '0 4px 20px rgba(34,197,94,0.25)' : 'none',
              }}>
              Lanjut <MdArrowForward />
            </motion.button>
          ) : (
            <motion.button onClick={handleSubmit} disabled={loading}
              whileHover={!loading ? { scale: 1.04 } : {}} whileTap={!loading ? { scale: 0.96 } : {}}
              className="flex items-center gap-2 text-white font-bold px-6 py-3 rounded-xl text-sm disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)', boxShadow: '0 4px 20px rgba(34,197,94,0.3)' }}>
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Memproses...</>
              ) : (
                <><MdSend /> Konfirmasi Booking</>
              )}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  )
}
