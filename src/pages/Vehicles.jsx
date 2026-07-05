import { useState, useEffect, useRef, useMemo } from 'react'
import {
  MdAdd, MdSearch, MdDirectionsCar, MdTwoWheeler,
  MdEdit, MdDelete, MdPerson, MdBuild, MdClose,
  MdCloudUpload, MdCalendarToday, MdSpeed, MdStar,
  MdArrowBack, MdCamera, MdInfo, MdRefresh,
  MdVerified, MdPhotoCamera, MdOpenInNew, MdSort,
} from 'react-icons/md'
import { motion, AnimatePresence } from 'framer-motion'
import Pagination from '../components/Pagination'
import vehiclesData from '../data/vehiclesData.json'
import { getAllCustomersFromStore } from '../hooks/useCustomerStore'

// ─── Constants ────────────────────────────────────────────────────────
const defaultMechanics = [
  { id: 'M1', name: 'Ahmad Supriyadi',  specialization: 'Mesin & Transmisi' },
  { id: 'M2', name: 'Budi Santoso',     specialization: 'Kelistrikan & AC' },
  { id: 'M3', name: 'Cindy Permata',    specialization: 'Body & Cat' },
  { id: 'M4', name: 'Dedi Kurniawan',   specialization: 'Ban & Spooring' },
  { id: 'M5', name: 'Eka Fitriani',     specialization: 'Servis Rutin' },
]

const statusConfig = {
  Selesai:  { bg: 'rgba(34,197,94,0.12)',  text: '#22C55E', dot: '#22C55E' },
  Servis:   { bg: 'rgba(251,191,36,0.12)', text: '#FBBF24', dot: '#FBBF24' },
  Menunggu: { bg: 'rgba(148,163,184,0.12)',text: '#94A3B8', dot: '#94A3B8' },
}

const sourceConfig = {
  catalog:         { label: 'Database', color: '#22C55E', bg: 'rgba(34,197,94,0.12)',  icon: '✦' },
  customer_upload: { label: 'Upload Customer',  color: '#60A5FA', bg: 'rgba(96,165,250,0.12)', icon: '📸' },
  admin:           { label: 'Admin',      color: '#A855F7', bg: 'rgba(168,85,247,0.12)', icon: '🛡️' },
}

function getSourceCfg(v) {
  if (v.source === 'catalog')          return sourceConfig.catalog
  if (v.source === 'customer_upload')  return sourceConfig.customer_upload
  return sourceConfig.admin
}

const initialForm = {
  plate: '', brand: '', model: '', year: '', owner: '', customerId: '',
  type: 'Mobil', mechanicId: '', lastService: new Date().toISOString().slice(0,10),
  mileage: '', status: 'Menunggu', photo: null, source: 'admin',
}

const inputCls = `w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all focus:ring-2 focus:ring-green-500/30`
const inputStyle = { background: 'rgba(11,59,46,0.5)', border: '1px solid rgba(34,197,94,0.15)' }

// ─── Helpers ──────────────────────────────────────────────────────────
const LS_KEY_VEHICLES = 'garage_vehicles'

function loadVehicles() {
  try {
    const raw = sessionStorage.getItem(LS_KEY_VEHICLES)
    if (raw) {
      const stored = JSON.parse(raw)
      const storedPlates = new Set(stored.map(v => (v.plate || '').trim().toLowerCase()))
      const seedRemaining = vehiclesData.filter(
        v => !storedPlates.has((v.plate || '').trim().toLowerCase())
      )
      return [...seedRemaining, ...stored]
    }
  } catch { /* ignore */ }
  return vehiclesData
}

// ─── Source Badge ──────────────────────────────────────────────────────
function SourceBadge({ vehicle, small = false }) {
  const cfg = getSourceCfg(vehicle)
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${small ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'}`}
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}25` }}
    >
      {cfg.icon} {cfg.label}
    </span>
  )
}

// ─── Vehicle Card (diperbaiki: tambahan info dan badge) ──────────────
function VehicleCard({ vehicle, mechanic, customerName, onEdit, onDelete, onDetail }) {
  const st  = statusConfig[vehicle.status] || statusConfig.Menunggu

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(0,0,0,0.4)' }}
      className="group relative rounded-2xl overflow-hidden cursor-pointer transition-shadow duration-300"
      style={{
        background: 'linear-gradient(145deg, rgba(6,40,31,0.95) 0%, rgba(11,59,46,0.8) 100%)',
        border: '1px solid rgba(34,197,94,0.18)',
        backdropFilter: 'blur(6px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
      }}
      onClick={() => onDetail(vehicle)}
    >
      {/* Foto banner */}
      <div className="relative h-36 overflow-hidden" style={{ background: 'rgba(4,26,20,0.8)' }}>
        {vehicle.photo ? (
          <img src={vehicle.photo} alt={vehicle.plate} className="w-full h-full object-cover opacity-90"
            onError={e => { e.target.style.display='none' }} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 opacity-25">
            {vehicle.type === 'Motor'
              ? <MdTwoWheeler size={52} className="text-green-400" />
              : <MdDirectionsCar size={52} className="text-green-400" />}
            <span className="text-xs text-green-600 tracking-widest uppercase">No Photo</span>
          </div>
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(6,40,31,1) 0%, transparent 60%)' }} />

        {/* Status */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: st.bg, color: st.text, border: `1px solid ${st.dot}30` }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: st.dot }} />
          {vehicle.status}
        </div>

        {/* Source badge */}
        <div className="absolute top-3 right-10">
          <SourceBadge vehicle={vehicle} small />
        </div>

        {/* Actions */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={e => e.stopPropagation()}>
          <button onClick={() => onEdit(vehicle)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-yellow-400 backdrop-blur-sm transition-all hover:scale-110"
            style={{ background: 'rgba(0,0,0,0.55)' }}>
            <MdEdit size={14} />
          </button>
          <button onClick={() => onDelete(vehicle)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 backdrop-blur-sm transition-all hover:scale-110"
            style={{ background: 'rgba(0,0,0,0.55)' }}>
            <MdDelete size={14} />
          </button>
        </div>

        {/* Tipe */}
        <div className="absolute bottom-3 right-3">
          <span className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' }}>
            {vehicle.type === 'Motor' ? '🏍️' : '🚗'} {vehicle.type}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-xl font-bold text-white tracking-wider">{vehicle.plate || '—'}</h3>
          <MdInfo size={16} className="text-green-700 mt-1 group-hover:text-green-400 transition-colors" />
        </div>
        <p className="text-sm font-medium text-gray-300 mb-0.5">
          {vehicle.brand} <span className="text-white">{vehicle.model}</span>
        </p>
        <p className="text-xs text-gray-500 mb-3">{vehicle.year} · {vehicle.owner}</p>

        {customerName && (
          <div className="flex items-center gap-1.5 mb-2">
            <MdVerified size={12} className="text-green-500 flex-shrink-0" />
            <span className="text-xs text-green-400 truncate">{customerName}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-3"
          style={{ borderTop: '1px solid rgba(34,197,94,0.08)' }}>
          <div className="flex items-center gap-1.5">
            <MdPerson size={13} className="text-green-700" />
            <span className="text-xs text-green-400/80 truncate max-w-[120px]">{mechanic || 'Belum ditugaskan'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MdCalendarToday size={12} className="text-gray-600" />
            <span className="text-xs text-gray-500">{vehicle.lastService || '—'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Detail Drawer (perbaikan: tombol view customer) ──────────────
function DetailDrawer({ vehicle, mechanic, customerData, onClose, onEdit, onViewCustomer }) {
  if (!vehicle) return null
  const st  = statusConfig[vehicle.status] || statusConfig.Menunggu
  const rows = [
    { label: 'Nomor Plat',     value: vehicle.plate || '—',                     icon: <MdDirectionsCar size={15}/> },
    { label: 'Merek & Model',  value: `${vehicle.brand} ${vehicle.model}`,       icon: <MdStar size={15}/> },
    { label: 'Tahun',          value: vehicle.year || '—',                       icon: <MdCalendarToday size={15}/> },
    { label: 'Pemilik',        value: vehicle.owner || '—',                      icon: <MdPerson size={15}/> },
    { label: 'Kilometer',      value: vehicle.mileage ? `${vehicle.mileage} km` : '—', icon: <MdSpeed size={15}/> },
    { label: 'Servis Terakhir',value: vehicle.lastService || '—',                icon: <MdBuild size={15}/> },
    { label: 'Mekanik',        value: mechanic || 'Belum ditugaskan',            icon: <MdPerson size={15}/> },
    { label: 'Ditambahkan',    value: vehicle.addedAt || '—',                   icon: <MdCalendarToday size={15}/> },
  ]

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
          className="relative w-full max-w-md h-full overflow-y-auto"
          style={{
            background: 'linear-gradient(160deg, #061a14 0%, #082b1e 100%)',
            borderLeft: '1px solid rgba(34,197,94,0.2)',
            boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header foto */}
          <div className="relative h-56 overflow-hidden" style={{ background: '#041a10' }}>
            {vehicle.photo ? (
              <img src={vehicle.photo} alt={vehicle.plate} className="w-full h-full object-cover"
                onError={e => { e.target.style.display='none' }} />
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-20">
                {vehicle.type === 'Motor'
                  ? <MdTwoWheeler size={80} className="text-green-400" />
                  : <MdDirectionsCar size={80} className="text-green-400" />}
              </div>
            )}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #061a14 10%, transparent 70%)' }} />

            <button onClick={onClose}
              className="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center text-white"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}>
              <MdArrowBack size={18} />
            </button>
            <button onClick={() => onEdit(vehicle)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-white"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}>
              <MdEdit size={16} />
            </button>
          </div>

          <div className="px-5 pb-8 -mt-6 relative">
            {/* Title */}
            <div className="flex items-end justify-between mb-4">
              <div>
                <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                  <span className="text-2xl font-black text-white tracking-widest">{vehicle.plate || '—'}</span>
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                    style={{ background: st.bg, color: st.text }}>
                    <span className="w-1.5 h-1.5 rounded-full inline-block mr-1 animate-pulse" style={{ background: st.dot }} />
                    {vehicle.status}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{vehicle.brand} {vehicle.model} · {vehicle.year}</p>
                <div className="mt-2">
                  <SourceBadge vehicle={vehicle} />
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                {vehicle.type === 'Motor'
                  ? <MdTwoWheeler className="text-green-400" size={24} />
                  : <MdDirectionsCar className="text-green-400" size={24} />}
              </div>
            </div>

            {/* Customer link box - sekarang dengan tombol aksi */}
            {customerData && (
              <button
                onClick={() => onViewCustomer && onViewCustomer(customerData)}
                className="w-full flex items-center gap-3 p-3 rounded-xl mb-4 text-left transition-all hover:bg-green-500/10"
                style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}
              >
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: 'rgba(34,197,94,0.2)' }}>
                  {customerData.name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{customerData.name}</p>
                  <p className="text-gray-500 text-xs truncate">{customerData.email}</p>
                </div>
                <MdOpenInNew size={14} className="text-green-600 flex-shrink-0" />
              </button>
            )}

            {/* Detail rows */}
            <div className="rounded-2xl overflow-hidden mb-5"
              style={{ border: '1px solid rgba(34,197,94,0.12)', background: 'rgba(11,59,46,0.2)' }}>
              {rows.map((row, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3"
                  style={{ borderBottom: i < rows.length - 1 ? '1px solid rgba(34,197,94,0.08)' : 'none' }}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-green-700">{row.icon}</span>
                    <span className="text-xs text-gray-500">{row.label}</span>
                  </div>
                  <span className="text-sm text-gray-200 font-medium text-right max-w-[180px] truncate">{row.value}</span>
                </div>
              ))}
            </div>

            <button onClick={() => { onClose(); onEdit(vehicle) }}
              className="w-full py-3 rounded-xl text-sm font-semibold text-black transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(90deg, #22C55E, #16a34a)' }}>
              Edit Kendaraan
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Modal Form ───────────────────────────────────────────────────────
function VehicleModal({ isOpen, onClose, onSubmit, form, setForm, editId, mechanics, customers }) {
  const fileRef = useRef()
  const [errors, setErrors] = useState({})

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setForm(f => ({ ...f, photo: ev.target.result }))
    reader.readAsDataURL(file)
  }

  const handleOwnerSelect = (e) => {
    const name = e.target.value
    const cust = customers.find(c => c.name === name)
    setForm(f => ({ ...f, owner: name, customerId: cust?.id || '' }))
  }

  // Validasi sederhana sebelum submit
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.plate.trim()) {
      setErrors({ plate: 'Nomor plat wajib diisi' })
      return
    }
    setErrors({})
    onSubmit(e)
  }

  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #061a14 0%, #0a2e1e 100%)', border: '1px solid rgba(34,197,94,0.2)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(34,197,94,0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.15)' }}>
              {editId ? <MdEdit size={16} className="text-green-400" /> : <MdAdd size={16} className="text-green-400" />}
            </div>
            <h2 className="text-base font-bold text-white">{editId ? 'Edit Kendaraan' : 'Tambah Kendaraan'}</h2>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-all">
            <MdClose size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[72vh] overflow-y-auto space-y-4">
          <form id="form-vehicle" onSubmit={handleSubmit}>
            {/* Upload Foto */}
            <div className="mb-5">
              <label className="block text-sm text-gray-400 mb-2">Foto Kendaraan</label>
              <div className="relative rounded-2xl overflow-hidden cursor-pointer flex items-center justify-center transition-all hover:opacity-80"
                style={{ height: 140, background: 'rgba(11,59,46,0.4)', border: '2px dashed rgba(34,197,94,0.2)' }}
                onClick={() => fileRef.current?.click()}>
                {form.photo
                  ? <img src={form.photo} alt="preview" className="w-full h-full object-cover" />
                  : <div className="flex flex-col items-center gap-2 text-gray-500">
                      <MdCamera size={32} className="text-green-800" />
                      <span className="text-xs">Klik untuk upload foto</span>
                    </div>
                }
                {form.photo && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <span className="text-xs text-white flex items-center gap-1.5"><MdCloudUpload size={16}/> Ganti foto</span>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </div>

            {/* Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1.5">Nomor Plat <span className="text-red-400">*</span></label>
                <input type="text" value={form.plate || ''} placeholder="B 1234 ABC"
                  onChange={e => setForm(f => ({ ...f, plate: e.target.value }))}
                  className={`${inputCls} ${errors.plate ? 'border-red-500 ring-1 ring-red-500' : ''}`} style={inputStyle} />
                {errors.plate && <p className="text-red-400 text-xs mt-1">{errors.plate}</p>}
              </div>
              {[
                { label: 'Merek',  key: 'brand', placeholder: 'Toyota' },
                { label: 'Model',  key: 'model', placeholder: 'Avanza' },
                { label: 'Tahun', key: 'year',  placeholder: '2022', type: 'number' },
                { label: 'KM',    key: 'mileage', placeholder: '32000' },
              ].map(({ label, key, placeholder, type='text' }) => (
                <div key={key}>
                  <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
                  <input type={type} value={form[key] || ''} placeholder={placeholder}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className={inputCls} style={inputStyle} />
                </div>
              ))}

              {/* Pemilik */}
              <div className="col-span-2">
                <label className="block text-xs text-gray-400 mb-1.5">Pemilik</label>
                <div className="relative">
                  <input list="customer-list" value={form.owner || ''} placeholder="Nama pemilik atau pilih customer..."
                    onChange={handleOwnerSelect}
                    className={inputCls} style={inputStyle} />
                  <datalist id="customer-list">
                    {customers.map(c => <option key={c.id} value={c.name} />)}
                  </datalist>
                </div>
                {form.customerId && (
                  <p className="text-xs text-green-600 mt-1">✦ Tertaut ke customer ID: {form.customerId}</p>
                )}
              </div>
            </div>

            {/* Selects */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Tipe</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className={inputCls} style={inputStyle}>
                  <option value="Mobil">🚗 Mobil</option>
                  <option value="Motor">🏍️ Motor</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className={inputCls} style={inputStyle}>
                  <option>Menunggu</option>
                  <option>Servis</option>
                  <option>Selesai</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs text-gray-400 mb-1.5">Sumber Kendaraan</label>
              <select value={form.source || 'admin'} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                className={inputCls} style={inputStyle}>
                <option value="admin">🛡️ Admin Input</option>
                <option value="catalog">✦ Database Vehicle</option>
                <option value="customer_upload">📸 Customer Upload</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-xs text-gray-400 mb-1.5">Penanggung Jawab (Mekanik)</label>
              <select value={form.mechanicId || ''} onChange={e => setForm(f => ({ ...f, mechanicId: e.target.value }))}
                className={inputCls} style={inputStyle}>
                <option value="">— Pilih Mekanik —</option>
                {mechanics.map(m => <option key={m.id} value={m.id}>{m.name} · {m.specialization}</option>)}
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-xs text-gray-400 mb-1.5">Tanggal Servis Terakhir</label>
              <input type="date" value={form.lastService || ''}
                onChange={e => setForm(f => ({ ...f, lastService: e.target.value }))}
                className={inputCls} style={inputStyle} />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4"
          style={{ borderTop: '1px solid rgba(34,197,94,0.1)' }}>
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-all"
            style={{ border: '1px solid rgba(34,197,94,0.15)' }}>
            Batal
          </button>
          <button type="submit" form="form-vehicle"
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-black transition-all hover:opacity-90 flex items-center gap-2"
            style={{ background: 'linear-gradient(90deg,#22C55E,#16a34a)' }}>
            <MdAdd size={16} /> Simpan
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────
export default function Vehicles() {
  const [vehicles, setVehicles] = useState(loadVehicles)
  const [mechanics] = useState(() => {
    try {
      const s = sessionStorage.getItem('garage_mechanics')
      return s ? JSON.parse(s) : defaultMechanics
    } catch { return defaultMechanics }
  })

  const [customers, setCustomers] = useState([])
  useEffect(() => {
    import('../services/customerAPI').then(({ customerAPI }) => {
      customerAPI.fetchAll().then(setCustomers).catch(() => {})
    })
  }, [])

  // State filter & sort
  const [search,       setSearch]       = useState('')
  const [filterType,   setFilterType]   = useState('Semua')
  const [filterStatus, setFilterStatus] = useState('Semua')
  const [filterSource, setFilterSource] = useState('Semua')
  const [sortBy,       setSortBy]       = useState('plate')   // 'plate' | 'lastService' | 'mileage'
  const [sortOrder,    setSortOrder]    = useState('asc')

  const [showModal,    setShowModal]    = useState(false)
  const [form,         setForm]         = useState(initialForm)
  const [editId,       setEditId]       = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [detailVehicle,setDetailVehicle]= useState(null)
  const [currentPage,  setCurrentPage]  = useState(1)
  const itemsPerPage = 30

  // Refresh data (merge dengan sessionStorage)
  const handleRefresh = () => {
    setVehicles(loadVehicles())
    // notifikasi sederhana
    alert('Data kendaraan telah diperbarui dari penyimpanan.')
  }

  // Simpan ke sessionStorage setiap kali vehicles berubah
  useEffect(() => {
    try { sessionStorage.setItem(LS_KEY_VEHICLES, JSON.stringify(vehicles)) } catch {}
  }, [vehicles])

  // Reset halaman saat filter berubah
  useEffect(() => { setCurrentPage(1) }, [search, filterType, filterStatus, filterSource, sortBy, sortOrder])

  // Helper
  const getMechName  = id => mechanics.find(m => m.id === id)?.name || null
  const getCustomer  = v => {
    if (v.customerId) return customers.find(c => c.id === v.customerId) || null
    return customers.find(c => c.name === v.owner) || null
  }

  // Filter + Sort
  const filtered = useMemo(() => {
    let result = vehicles.filter(v => {
      const q = search.toLowerCase()
      const matchSearch = !q || [v.plate, v.owner, v.brand, v.model].some(s => (s||'').toLowerCase().includes(q))
      const matchType   = filterType   === 'Semua' || v.type   === filterType
      const matchStatus = filterStatus === 'Semua' || v.status === filterStatus
      const matchSource = filterSource === 'Semua' ||
        (filterSource === 'catalog'         && v.source === 'catalog') ||
        (filterSource === 'customer_upload' && v.source === 'customer_upload') ||
        (filterSource === 'admin'           && (!v.source || v.source === 'admin'))
      return matchSearch && matchType && matchStatus && matchSource
    })

    // Sorting
    const sortFn = (a, b) => {
      let valA = a[sortBy] || ''
      let valB = b[sortBy] || ''
      if (sortBy === 'mileage') {
        valA = parseInt(valA) || 0
        valB = parseInt(valB) || 0
        return sortOrder === 'asc' ? valA - valB : valB - valA
      }
      valA = valA.toString().toLowerCase()
      valB = valB.toString().toLowerCase()
      if (sortOrder === 'asc') return valA.localeCompare(valB)
      return valB.localeCompare(valA)
    }
    result.sort(sortFn)
    return result
  }, [vehicles, search, filterType, filterStatus, filterSource, sortBy, sortOrder])

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginated  = filtered.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage)

  const counts = useMemo(() => ({
    all:             vehicles.length,
    selesai:         vehicles.filter(v => v.status === 'Selesai').length,
    servis:          vehicles.filter(v => v.status === 'Servis').length,
    menunggu:        vehicles.filter(v => v.status === 'Menunggu').length,
    fromCustomer:    vehicles.filter(v => v.source === 'catalog' || v.source === 'customer_upload').length,
  }), [vehicles])

  // ── CRUD Handlers ──
  const handleAdd = () => {
    setForm(initialForm)
    setEditId(null)
    setShowModal(true)
  }

  const handleEdit = (v) => {
    setDetailVehicle(null)
    setForm({
      plate: v.plate, brand: v.brand, model: v.model, year: v.year,
      owner: v.owner, customerId: v.customerId || '', type: v.type,
      mechanicId: v.mechanicId || '', lastService: v.lastService || '',
      mileage: v.mileage || '', status: v.status || 'Menunggu',
      photo: v.photo || null, source: v.source || 'admin',
    })
    setEditId(v.id)
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editId) {
      setVehicles(prev => prev.map(v => v.id === editId ? { ...v, ...form } : v))
      alert('Kendaraan berhasil diperbarui!')
    } else {
      const newId = 'VA-' + Date.now()
      setVehicles(prev => [{ ...form, id: newId, addedAt: new Date().toISOString().slice(0,10) }, ...prev])
      alert('Kendaraan baru berhasil ditambahkan!')
    }
    setShowModal(false)
    setForm(initialForm)
    setEditId(null)
  }

  const handleDelete = () => {
    setVehicles(prev => prev.filter(v => v.id !== deleteTarget.id))
    setDeleteTarget(null)
    alert('Kendaraan berhasil dihapus.')
  }

  // Navigasi ke halaman customer (misal panggil navigate dari router)
  const handleViewCustomer = (customer) => {
    // Jika Anda menggunakan React Router, bisa panggil history.push atau navigate
    // Di sini kita hanya tampilkan alert sebagai contoh
    alert(`Buka profil customer: ${customer.name} (ID: ${customer.id})`)
  }

  return (
    <div style={{ background: 'radial-gradient(circle at 10% 20%, #072e1f, #03120c)', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-green-300 to-emerald-500 bg-clip-text text-transparent tracking-tight">
              Garasi Kendaraan
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {counts.all} kendaraan · {counts.fromCustomer} dari customer
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <MdRefresh size={16} /> Refresh
            </button>
            <button onClick={handleAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-black transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #22C55E, #0f7b3a)', boxShadow: '0 8px 20px rgba(34,197,94,0.3)' }}>
              <MdAdd size={18} /> Tambah Kendaraan
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total',           value: counts.all,         icon: '🚗', color: '#94A3B8', bg: 'rgba(148,163,184,0.1)' },
            { label: 'Selesai',         value: counts.selesai,     icon: '✅', color: '#22C55E', bg: 'rgba(34,197,94,0.1)'   },
            { label: 'Servis',          value: counts.servis,      icon: '🔧', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)'  },
            { label: 'Menunggu',        value: counts.menunggu,    icon: '⏳', color: '#60A5FA', bg: 'rgba(96,165,250,0.1)'  },
            { label: 'Dari Customer',   value: counts.fromCustomer,icon: '👤', color: '#A855F7', bg: 'rgba(168,85,247,0.1)'  },
          ].map(s => (
            <div key={s.label} className="rounded-2xl px-4 py-3 transition-all hover:scale-[1.02]"
              style={{ background: s.bg, border: `1px solid ${s.color}30` }}>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">{s.label}</p>
                <span className="text-lg">{s.icon}</span>
              </div>
              <p className="text-3xl font-black mt-1" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter & Sort */}
        <div className="rounded-2xl p-4 mb-8 flex flex-col sm:flex-row gap-3 flex-wrap items-center"
          style={{ background: 'rgba(6,40,31,0.5)', border: '1px solid rgba(34,197,94,0.2)', backdropFilter: 'blur(12px)' }}>
          <div className="relative flex-1 min-w-[180px]">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari plat, merek, model, pemilik..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-gray-200 outline-none bg-white/5 border border-green-900/30 focus:ring-2 focus:ring-green-500/30" />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* Filter tipe */}
            {['Semua','Mobil','Motor'].map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                style={filterType === t
                  ? { background: 'rgba(34,197,94,0.25)', color: '#86efac', border: '1px solid rgba(34,197,94,0.5)' }
                  : { background: 'rgba(255,255,255,0.03)', color: '#9ca3af', border: '1px solid rgba(34,197,94,0.1)' }}>
                {t}
              </button>
            ))}
            {/* Filter status */}
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs text-gray-300 outline-none bg-white/5 border border-green-900/30">
              {['Semua','Selesai','Servis','Menunggu'].map(s => <option key={s}>{s}</option>)}
            </select>
            {/* Filter sumber */}
            <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs text-gray-300 outline-none bg-white/5 border border-green-900/30">
              <option value="Semua">Semua Sumber</option>
              <option value="catalog">Database</option>
              <option value="customer_upload">Upload Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Sortir */}
          <div className="flex items-center gap-2 ml-auto">
            <MdSort size={18} className="text-green-600" />
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs text-gray-300 outline-none bg-white/5 border border-green-900/30">
              <option value="plate">Plat</option>
              <option value="lastService">Tanggal Servis</option>
              <option value="mileage">Kilometer</option>
            </select>
            <button onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 rounded-xl text-xs text-gray-300 hover:text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(34,197,94,0.1)' }}>
              {sortOrder === 'asc' ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {/* Grid */}
        <AnimatePresence>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginated.map(v => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                mechanic={getMechName(v.mechanicId)}
                customerName={getCustomer(v)?.name || null}
                onEdit={handleEdit}
                onDelete={setDeleteTarget}
                onDetail={setDetailVehicle}
              />
            ))}
          </div>
        </AnimatePresence>

        {paginated.length === 0 && (
          <div className="text-center py-20 text-gray-500 flex flex-col items-center gap-4">
            <MdDirectionsCar size={64} className="opacity-20" />
            <p className="text-sm">Tidak ada kendaraan ditemukan</p>
          </div>
        )}

        <p className="text-xs text-gray-600 mt-6 text-center">
          Menampilkan {paginated.length} dari {filtered.length} kendaraan
        </p>

        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {detailVehicle && (
        <DetailDrawer
          vehicle={detailVehicle}
          mechanic={getMechName(detailVehicle.mechanicId)}
          customerData={getCustomer(detailVehicle)}
          onClose={() => setDetailVehicle(null)}
          onEdit={handleEdit}
          onViewCustomer={handleViewCustomer}
        />
      )}

      {/* Modal */}
      <VehicleModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setForm(initialForm); setEditId(null) }}
        onSubmit={handleSubmit}
        form={form} setForm={setForm}
        editId={editId}
        mechanics={mechanics}
        customers={customers}
      />

      {/* Hapus confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
            onClick={() => setDeleteTarget(null)}>
            <motion.div
              initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }}
              className="w-full max-w-xs rounded-2xl p-6 text-center"
              style={{ background: '#0a2a1f', border: '1px solid rgba(239,68,68,0.4)', boxShadow: '0 25px 50px -12px black' }}
              onClick={e => e.stopPropagation()}>
              <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
                <MdDelete size={28} className="text-red-400" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Hapus Kendaraan?</h3>
              <p className="text-gray-400 text-sm mb-6">
                <span className="text-green-400 font-bold">{deleteTarget.plate}</span> akan dihapus permanen.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-all">
                  Batal
                </button>
                <button onClick={handleDelete}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                  style={{ background: 'linear-gradient(90deg, #EF4444, #b91c1c)' }}>
                  Ya, Hapus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}