import { useState, useEffect, useRef } from 'react'
import {
  MdAdd, MdSearch, MdDirectionsCar, MdTwoWheeler,
  MdEdit, MdDelete, MdPerson, MdBuild, MdClose,
  MdCloudUpload, MdCalendarToday, MdSpeed, MdStar,
  MdArrowBack, MdMoreVert, MdCamera, MdInfo,
} from 'react-icons/md'
import Pagination from '../components/Pagination'
import vehiclesData from '../data/vehiclesData.json'


const defaultMechanics = [
  { id: 'M1', name: 'Ahmad Supriyadi', specialization: 'Mesin & Transmisi' },
  { id: 'M2', name: 'Budi Santoso', specialization: 'Kelistrikan & AC' },
  { id: 'M3', name: 'Cindy Permata', specialization: 'Body & Cat' },
  { id: 'M4', name: 'Dedi Kurniawan', specialization: 'Ban & Spooring' },
  { id: 'M5', name: 'Eka Fitriani', specialization: 'Servis Rutin' }
]

const statusConfig = {
  'Selesai':   { bg: 'rgba(34,197,94,0.12)',  text: '#22C55E', dot: '#22C55E' },
  'Servis':    { bg: 'rgba(251,191,36,0.12)', text: '#FBBF24', dot: '#FBBF24' },
  'Menunggu':  { bg: 'rgba(148,163,184,0.12)',text: '#94A3B8', dot: '#94A3B8' },
}

const initialForm = {
  plate: '', brand: '', model: '', year: '', owner: '',
  type: 'Mobil', mechanicId: '', lastService: new Date().toISOString().slice(0, 10),
  mileage: '', status: 'Menunggu', photo: null
}

const inputCls = `
  w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all
  focus:ring-2 focus:ring-green-500/30
`
const inputStyle = {
  background: 'rgba(11,59,46,0.5)',
  border: '1px solid rgba(34,197,94,0.15)',
}

// ─── Komponen Kartu Kendaraan ─────────────────────────────────────────
function VehicleCard({ vehicle, mechanic, onEdit, onDelete, onDetail }) {
  const st = statusConfig[vehicle.status] || statusConfig['Menunggu']
  return (
    <div
      className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.015] hover:-translate-y-0.5"
      style={{
        background: 'linear-gradient(145deg, rgba(6,40,31,0.95) 0%, rgba(11,59,46,0.8) 100%)',
        border: '1px solid rgba(34,197,94,0.18)',
        backdropFilter: 'blur(6px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.25)'
      }}
      onClick={() => onDetail(vehicle)}
    >
      {/* Foto banner */}
      <div className="relative h-36 overflow-hidden" style={{ background: 'rgba(4,26,20,0.8)' }}>
        {vehicle.photo
          ? <img src={vehicle.photo} alt={vehicle.plate} className="w-full h-full object-cover opacity-90" />
          : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 opacity-30">
              {vehicle.type === 'Motor'
                ? <MdTwoWheeler size={52} className="text-green-400" />
                : <MdDirectionsCar size={52} className="text-green-400" />}
              <span className="text-xs text-green-600 tracking-widest uppercase">No Photo</span>
            </div>
          )}
        {/* Gradient overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(6,40,31,1) 0%, transparent 60%)' }} />

        {/* Status badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: st.bg, color: st.text, border: `1px solid ${st.dot}30` }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: st.dot }} />
          {vehicle.status}
        </div>

        {/* Action buttons */}
        <div
          className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(vehicle)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-yellow-400 backdrop-blur-sm transition-all hover:scale-110"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          >
            <MdEdit size={15} />
          </button>
          <button
            onClick={() => onDelete(vehicle)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 backdrop-blur-sm transition-all hover:scale-110"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          >
            <MdDelete size={15} />
          </button>
        </div>

        {/* Tipe badge */}
        <div className="absolute bottom-3 right-3">
          <span className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: 'rgba(34,197,94,0.15)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.25)' }}>
            {vehicle.type === 'Motor' ? '🏍️' : '🚗'} {vehicle.type}
          </span>
        </div>
      </div>

      {/* Info utama */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-xl font-bold text-white tracking-wider">{vehicle.plate}</h3>
          <MdInfo size={16} className="text-green-700 mt-1 group-hover:text-green-400 transition-colors" />
        </div>
        <p className="text-sm font-medium text-gray-300 mb-0.5">
          {vehicle.brand} <span className="text-white">{vehicle.model}</span>
        </p>
        <p className="text-xs text-gray-500 mb-3">{vehicle.year} • {vehicle.owner}</p>

        {/* Footer info */}
        <div className="flex items-center justify-between pt-3"
          style={{ borderTop: '1px solid rgba(34,197,94,0.08)' }}>
          <div className="flex items-center gap-1.5">
            <MdPerson size={13} className="text-green-700" />
            <span className="text-xs text-green-400/80">{mechanic || 'Belum ditugaskan'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MdCalendarToday size={12} className="text-gray-600" />
            <span className="text-xs text-gray-500">{vehicle.lastService || '—'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Detail Drawer ────────────────────────────────────────────────────
function DetailDrawer({ vehicle, mechanic, onClose, onEdit }) {
  if (!vehicle) return null
  const st = statusConfig[vehicle.status] || statusConfig['Menunggu']
  const rows = [
    { label: 'Nomor Plat', value: vehicle.plate, icon: <MdDirectionsCar size={16}/> },
    { label: 'Merek & Model', value: `${vehicle.brand} ${vehicle.model}`, icon: <MdStar size={16}/> },
    { label: 'Tahun', value: vehicle.year, icon: <MdCalendarToday size={16}/> },
    { label: 'Pemilik', value: vehicle.owner, icon: <MdPerson size={16}/> },
    { label: 'Kilometer', value: vehicle.mileage ? `${vehicle.mileage} km` : '—', icon: <MdSpeed size={16}/> },
    { label: 'Servis Terakhir', value: vehicle.lastService || '—', icon: <MdBuild size={16}/> },
    { label: 'Mekanik', value: mechanic || 'Belum ditugaskan', icon: <MdPerson size={16}/> },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md h-full overflow-y-auto"
        style={{
          background: 'linear-gradient(160deg, #061a14 0%, #082b1e 100%)',
          borderLeft: '1px solid rgba(34,197,94,0.2)',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.5)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header foto */}
        <div className="relative h-56 overflow-hidden" style={{ background: '#041a10' }}>
          {vehicle.photo
            ? <img src={vehicle.photo} alt={vehicle.plate} className="w-full h-full object-cover" />
            : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 opacity-20">
                {vehicle.type === 'Motor'
                  ? <MdTwoWheeler size={80} className="text-green-400" />
                  : <MdDirectionsCar size={80} className="text-green-400" />}
              </div>
            )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #061a14 10%, transparent 70%)' }} />

          <button onClick={onClose}
            className="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}>
            <MdArrowBack size={18} />
          </button>

          <div className="absolute top-4 right-4">
            <button onClick={() => onEdit(vehicle)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}>
              <MdEdit size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pb-8 -mt-6 relative">
          <div className="flex items-end justify-between mb-5">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="text-2xl font-black text-white tracking-widest">{vehicle.plate}</span>
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
                  style={{ background: st.bg, color: st.text }}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block mr-1 animate-pulse" style={{ background: st.dot }} />
                  {vehicle.status}
                </span>
              </div>
              <p className="text-gray-400 text-sm">{vehicle.brand} {vehicle.model} · {vehicle.year}</p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
              {vehicle.type === 'Motor'
                ? <MdTwoWheeler className="text-green-400" size={24} />
                : <MdDirectionsCar className="text-green-400" size={24} />}
            </div>
          </div>

          {/* Detail rows */}
          <div className="rounded-2xl overflow-hidden mb-5"
            style={{ border: '1px solid rgba(34,197,94,0.12)', background: 'rgba(11,59,46,0.2)' }}>
            {rows.map((row, i) => (
              <div key={i}
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: i < rows.length - 1 ? '1px solid rgba(34,197,94,0.08)' : 'none' }}>
                <div className="flex items-center gap-2.5">
                  <span className="text-green-700">{row.icon}</span>
                  <span className="text-xs text-gray-500">{row.label}</span>
                </div>
                <span className="text-sm text-gray-200 font-medium text-right max-w-[180px]">{row.value}</span>
              </div>
            ))}
          </div>

          {/* CTA Edit */}
          <button
            onClick={() => { onClose(); onEdit(vehicle) }}
            className="w-full py-3 rounded-xl text-sm font-semibold text-black transition-all hover:opacity-90 active:scale-98"
            style={{ background: 'linear-gradient(90deg, #22C55E, #16a34a)' }}
          >
            Edit Kendaraan
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Form Modal ───────────────────────────────────────────────────────
function VehicleModal({ isOpen, onClose, onSubmit, form, setForm, editId, mechanics }) {
  const fileRef = useRef()

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setForm(f => ({ ...f, photo: ev.target.result }))
    reader.readAsDataURL(file)
  }

  if (!isOpen) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #061a14 0%, #0a2e1e 100%)',
          border: '1px solid rgba(34,197,94,0.2)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(34,197,94,0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(34,197,94,0.15)' }}>
              {editId ? <MdEdit size={16} className="text-green-400" /> : <MdAdd size={16} className="text-green-400" />}
            </div>
            <h2 className="text-base font-bold text-white">{editId ? 'Edit Kendaraan' : 'Tambah Kendaraan'}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-all">
            <MdClose size={18} />
          </button>
        </div>

        {/* Form body */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-4">
          <form id="form-vehicle" onSubmit={onSubmit}>
            {/* Upload Foto */}
            <div className="mb-5">
              <label className="block text-sm text-gray-400 mb-2">Foto Kendaraan</label>
              <div
                className="relative rounded-2xl overflow-hidden cursor-pointer transition-all hover:opacity-80 flex items-center justify-center"
                style={{ height: 140, background: 'rgba(11,59,46,0.4)', border: '2px dashed rgba(34,197,94,0.2)' }}
                onClick={() => fileRef.current?.click()}
              >
                {form.photo
                  ? <img src={form.photo} alt="preview" className="w-full h-full object-cover" />
                  : (
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <MdCamera size={32} className="text-green-800" />
                      <span className="text-xs">Klik untuk upload foto</span>
                    </div>
                  )}
                {form.photo && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(0,0,0,0.5)' }}>
                    <span className="text-xs text-white flex items-center gap-1.5"><MdCloudUpload size={16}/> Ganti foto</span>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </div>

            {/* Grid 2 kolom */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Nomor Plat', key: 'plate', placeholder: 'B 1234 ABC', full: true },
                { label: 'Merek', key: 'brand', placeholder: 'Toyota' },
                { label: 'Model', key: 'model', placeholder: 'Avanza' },
                { label: 'Tahun', key: 'year', placeholder: '2022', type: 'number' },
                { label: 'Kilometer', key: 'mileage', placeholder: '32000' },
                { label: 'Pemilik', key: 'owner', placeholder: 'Andi Wijaya', full: true },
              ].map(({ label, key, placeholder, type = 'text', full }) => (
                <div key={key} className={full ? 'col-span-2' : ''}>
                  <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
                  <input
                    type={type}
                    required={key !== 'mileage'}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className={inputCls}
                    style={inputStyle}
                  />
                </div>
              ))}
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
                  <option value="Menunggu">Menunggu</option>
                  <option value="Servis">Servis</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs text-gray-400 mb-1.5">Penanggung Jawab (Mekanik)</label>
              <select value={form.mechanicId} onChange={e => setForm(f => ({ ...f, mechanicId: e.target.value }))}
                className={inputCls} style={inputStyle}>
                <option value="">— Pilih Mekanik —</option>
                {mechanics.map(m => (
                  <option key={m.id} value={m.id}>{m.name} · {m.specialization}</option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-xs text-gray-400 mb-1.5">Tanggal Servis Terakhir</label>
              <input type="date" value={form.lastService}
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
            <MdAdd size={16}/> Simpan
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Halaman Utama dengan Pagination ─────────────────────────────────
export default function Vehicles() {
  // State data kendaraan & mekanik
  const [vehicles, setVehicles] = useState(() => {
    try {
      const s = localStorage.getItem('garage_vehicles')
      return s ? JSON.parse(s) : vehiclesData
    } catch {
      return vehiclesData
    }
  })
  const [mechanics] = useState(() => {
    try {
      const s = localStorage.getItem('garage_mechanics')
      return s ? JSON.parse(s) : defaultMechanics
    } catch {
      return defaultMechanics
    }
  })

  // State filter & search
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('Semua')
  const [filterStatus, setFilterStatus] = useState('Semua')

  // State modal, form, edit, hapus, detail
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [editId, setEditId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [detailVehicle, setDetailVehicle] = useState(null)

  // State pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  // Simpan ke localStorage setiap vehicles berubah
  useEffect(() => {
    try {
      localStorage.setItem('garage_vehicles', JSON.stringify(vehicles))
    } catch {}
  }, [vehicles])

  // Reset halaman ke 1 ketika filter atau pencarian berubah
  useEffect(() => {
    setCurrentPage(1)
  }, [search, filterType, filterStatus])

  // Helper: ambil nama mekanik berdasarkan id
  const getMechName = (id) => mechanics.find(m => m.id === id)?.name || null

  // Filter data berdasarkan search, tipe, dan status
  const filtered = vehicles.filter(v => {
    const q = search.toLowerCase()
    const matchSearch = !q || [v.plate, v.owner, v.brand, v.model].some(s => s.toLowerCase().includes(q))
    const matchType = filterType === 'Semua' || v.type === filterType
    const matchStatus = filterStatus === 'Semua' || v.status === filterStatus
    return matchSearch && matchType && matchStatus
  })

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const paginatedVehicles = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // CRUD handlers
  const handleAdd = () => {
    setForm(initialForm)
    setEditId(null)
    setShowModal(true)
  }

  const handleEdit = (v) => {
    setDetailVehicle(null)
    setForm({
      plate: v.plate,
      brand: v.brand,
      model: v.model,
      year: v.year,
      owner: v.owner,
      type: v.type,
      mechanicId: v.mechanicId || '',
      lastService: v.lastService,
      mileage: v.mileage || '',
      status: v.status || 'Menunggu',
      photo: v.photo || null,
    })
    setEditId(v.id)
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editId) {
      setVehicles(prev => prev.map(v => (v.id === editId ? { ...v, ...form } : v)))
    } else {
      const newId = `V-${String(vehicles.length + 1).padStart(3, '0')}`
      setVehicles(prev => [{ ...form, id: newId }, ...prev])
    }
    setShowModal(false)
    setForm(initialForm)
    setEditId(null)
  }

  const handleDelete = () => {
    setVehicles(prev => prev.filter(v => v.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  // Statistik
  const counts = {
    all: vehicles.length,
    selesai: vehicles.filter(v => v.status === 'Selesai').length,
    servis: vehicles.filter(v => v.status === 'Servis').length,
    menunggu: vehicles.filter(v => v.status === 'Menunggu').length,
  }

  return (
    <div className="page-animate" style={{ background: 'radial-gradient(circle at 10% 20%, #072e1f, #03120c)', minHeight: '100vh' }}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-green-300 to-emerald-500 bg-clip-text text-transparent tracking-tight">Garasi Kendaraan</h1>
            <p className="text-sm text-gray-500 mt-0.5">{counts.all} kendaraan terdaftar</p>
          </div>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-black transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-98"
            style={{ background: 'linear-gradient(135deg, #22C55E, #0f7b3a)', boxShadow: '0 8px 20px rgba(34,197,94,0.3)' }}
          >
            <MdAdd size={18} /> Tambah Kendaraan
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: counts.all, icon: '🚗', color: '#94A3B8', bg: 'rgba(148,163,184,0.1)' },
            { label: 'Selesai', value: counts.selesai, icon: '✅', color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
            { label: 'Servis', value: counts.servis, icon: '🔧', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)' },
            { label: 'Menunggu', value: counts.menunggu, icon: '⏳', color: '#60A5FA', bg: 'rgba(96,165,250,0.1)' },
          ].map(s => (
            <div
              key={s.label}
              className="rounded-2xl backdrop-blur-md px-4 py-3 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              style={{ background: s.bg, border: `1px solid ${s.color}30`, backdropFilter: 'blur(12px)' }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">{s.label}</p>
                <span className="text-lg">{s.icon}</span>
              </div>
              <p className="text-3xl font-black mt-1" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filter & Search */}
        <div
          className="rounded-2xl backdrop-blur-md p-4 mb-8 flex flex-col sm:flex-row gap-3"
          style={{ background: 'rgba(6,40,31,0.5)', border: '1px solid rgba(34,197,94,0.2)', backdropFilter: 'blur(12px)' }}
        >
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" size={16} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari plat, merek, model, pemilik..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-gray-200 outline-none transition-all focus:ring-2 focus:ring-green-500/30 bg-white/5 border border-green-900/30"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['Semua', 'Mobil', 'Motor'].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className="px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                style={
                  filterType === t
                    ? { background: 'rgba(34,197,94,0.25)', color: '#86efac', border: '1px solid rgba(34,197,94,0.5)', boxShadow: '0 0 8px rgba(34,197,94,0.2)' }
                    : { background: 'rgba(255,255,255,0.03)', color: '#9ca3af', border: '1px solid rgba(34,197,94,0.1)' }
                }
              >
                {t}
              </button>
            ))}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-xl text-xs text-gray-300 outline-none bg-white/5 border border-green-900/30 cursor-pointer"
            >
              {['Semua', 'Selesai', 'Servis', 'Menunggu'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid Kendaraan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {paginatedVehicles.map(v => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              mechanic={getMechName(v.mechanicId)}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
              onDetail={setDetailVehicle}
            />
          ))}
        </div>

        {/* Empty state */}
        {paginatedVehicles.length === 0 && (
          <div className="text-center py-20 text-gray-500 flex flex-col items-center gap-4 backdrop-blur-sm rounded-2xl">
            <MdDirectionsCar size={64} className="opacity-20" />
            <p className="text-sm">Tidak ada kendaraan ditemukan</p>
          </div>
        )}

        {/* Info jumlah tayang */}
        <p className="text-xs text-gray-600 mt-6 text-center">
          Menampilkan {paginatedVehicles.length} dari {filtered.length} kendaraan
        </p>

        {/* Pagination Component */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {detailVehicle && (
        <DetailDrawer
          vehicle={detailVehicle}
          mechanic={getMechName(detailVehicle.mechanicId)}
          onClose={() => setDetailVehicle(null)}
          onEdit={handleEdit}
        />
      )}

      {/* Modal Tambah/Edit */}
      <VehicleModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setForm(initialForm)
          setEditId(null)
        }}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        editId={editId}
        mechanics={mechanics}
      />

      {/* Konfirmasi Hapus */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-xs rounded-2xl p-6 text-center animate-fadeInUp"
            style={{ background: '#0a2a1f', border: '1px solid rgba(239,68,68,0.4)', boxShadow: '0 25px 50px -12px black' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-4">
              <MdDelete size={28} className="text-red-400" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Hapus Kendaraan?</h3>
            <p className="text-gray-400 text-sm mb-6">
              <span className="text-green-400 font-bold">{deleteTarget.plate}</span> akan dihapus permanen.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl text-sm text-gray-300 transition-all hover:bg-white/10"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-500 to-red-700 hover:shadow-lg transition-all"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}