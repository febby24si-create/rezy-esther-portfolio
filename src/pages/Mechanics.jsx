import { useState, useRef, useEffect } from 'react'
import {
  MdAdd, MdClose, MdEdit, MdDelete, MdStar,
  MdPhone, MdSchedule, MdArrowBack, MdCamera,
  MdCloudUpload, MdBuild, MdVerified, MdInfo,
  MdCheckCircle, MdPending
} from 'react-icons/md'
import mechanicsData from '../data/mechanicsData.json'

// ============================================================
// PHASE 1 FIX — garage_mechanics phantom key
// Sebelumnya halaman ini hanya pakai useState(mechanicsData) tanpa
// pernah membaca/menulis localStorage('garage_mechanics'), padahal
// Orders, Vehicles, Reports, dan Dashboard membaca key ini.
// Akibatnya: CRUD mekanik di sini tidak persisten, dan 4 modul lain
// selalu fallback ke data statis mechanicsData.json.
//
// Fix: load = merge(localStorage, mechanicsData by id), save = persist
// setiap perubahan ke localStorage('garage_mechanics').
// Pola ini sengaja dibuat sama dengan useCustomerStore agar konsisten
// dan mudah diangkat jadi useMechanicStore di Phase 2/3.
// ============================================================
const LS_KEY_MECHANICS = 'garage_mechanics'

function loadMechanics() {
  try {
    const raw = localStorage.getItem(LS_KEY_MECHANICS)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Merge: data tersimpan menang (preserve edit admin), tapi field baru
      // dari mechanicsData.json (jika ada penambahan field di masa depan)
      // tetap ter-enrich.
      const enriched = parsed.map(stored => {
        const fresh = mechanicsData.find(m => m.id === stored.id)
        return fresh ? { ...fresh, ...stored } : stored
      })
      const storedIds = new Set(parsed.map(m => m.id))
      const newOnes = mechanicsData.filter(m => !storedIds.has(m.id))
      return [...enriched, ...newOnes]
    }
  } catch { /* ignore */ }
  return mechanicsData
}

function saveMechanics(list) {
  try {
    localStorage.setItem(LS_KEY_MECHANICS, JSON.stringify(list))
  } catch { /* ignore */ }
}

const initialForm = { name: '', specialty: '', experience: '', status: 'Tersedia', rating: '5.0', phone: '', photo: null, jobsDone: 0 }

const inputCls = `w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all focus:ring-2 focus:ring-green-500/25`
const inputStyle = { background: 'rgba(11,59,46,0.5)', border: '1px solid rgba(34,197,94,0.15)' }

// Avatar dengan inisial + foto
function Avatar({ name, photo, size = 56 }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const colors = [
    ['#0B3B2E', '#16A34A'], ['#1e3a5f', '#3B82F6'], ['#3b1f5e', '#8B5CF6'],
    ['#5e1f1f', '#EF4444'], ['#3b3b1f', '#EAB308'],
  ]
  const [bg, accent] = colors[name.charCodeAt(0) % colors.length]

  return (
    <div className="relative flex-shrink-0 rounded-2xl overflow-hidden"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${bg}, ${accent})` }}>
      {photo
        ? <img src={photo} alt={name} className="w-full h-full object-cover" />
        : <span className="absolute inset-0 flex items-center justify-center font-black text-white"
            style={{ fontSize: size * 0.35 }}>{initials}</span>}
    </div>
  )
}

// Bintang rating
function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <MdStar key={i} size={13}
          style={{ color: i <= Math.round(rating) ? '#FBBF24' : 'rgba(255,255,255,0.1)' }} />
      ))}
    </div>
  )
}

// ─── Kartu Mekanik ────────────────────────────────────────────────────
function MechanicCard({ m, onEdit, onDelete, onDetail }) {
  const isAvail = m.status === 'Tersedia'
  return (
    <div
      onClick={() => onDetail(m)}
      className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.015] hover:-translate-y-0.5"
      style={{
        background: 'linear-gradient(145deg, rgba(6,40,31,0.95) 0%, rgba(11,59,46,0.8) 100%)',
        border: '1px solid rgba(34,197,94,0.15)',
        backdropFilter: 'blur(6px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
      }}
    >
      {/* Strip warna atas */}
      <div className="h-1 w-full" style={{
        background: isAvail
          ? 'linear-gradient(90deg, #22C55E, #16a34a)'
          : 'linear-gradient(90deg, #FBBF24, #d97706)'
      }} />

      <div className="p-5">
        {/* Action buttons */}
        <div className="absolute top-5 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={e => e.stopPropagation()}>
          <button onClick={() => onEdit(m)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-yellow-400 transition-all hover:bg-yellow-500/15 hover:scale-110"
            style={{ background: 'rgba(0,0,0,0.3)' }}>
            <MdEdit size={14} />
          </button>
          <button onClick={() => onDelete(m)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-red-400 transition-all hover:bg-red-500/15 hover:scale-110"
            style={{ background: 'rgba(0,0,0,0.3)' }}>
            <MdDelete size={14} />
          </button>
        </div>

        {/* Header */}
        <div className="flex items-start gap-4 mb-4 pr-14">
          <Avatar name={m.name} photo={m.photo} size={52} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="text-white font-bold text-base truncate">{m.name}</h3>
              {m.rating >= 4.8 && <MdVerified size={14} className="text-green-400 flex-shrink-0" />}
            </div>
            <p className="text-green-400 text-xs font-medium mb-1.5">{m.specialty}</p>
            <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold ${isAvail ? '' : ''}`}
              style={isAvail
                ? { background: 'rgba(34,197,94,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }
                : { background: 'rgba(251,191,36,0.12)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: isAvail ? '#22C55E' : '#FBBF24' }} />
              {m.status}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Pengalaman', value: m.experience },
            { label: 'Pekerjaan', value: m.jobsDone || '—' },
            { label: 'Rating', value: m.rating },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-2.5 text-center"
              style={{ background: 'rgba(11,59,46,0.5)', border: '1px solid rgba(34,197,94,0.08)' }}>
              <p className="text-white font-bold text-sm">{s.value}</p>
              <p className="text-gray-600 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3"
          style={{ borderTop: '1px solid rgba(34,197,94,0.08)' }}>
          <div className="flex items-center gap-1.5">
            <MdPhone size={13} className="text-gray-600" />
            <span className="text-xs text-gray-500">{m.phone || '—'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Stars rating={m.rating} />
            <span className="text-xs text-yellow-400 font-bold ml-0.5">{m.rating}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Detail Drawer ────────────────────────────────────────────────────
function DetailDrawer({ mechanic, onClose, onEdit }) {
  if (!mechanic) return null
  const isAvail = mechanic.status === 'Tersedia'

  return (
    <div className="fixed inset-0 z-50 flex justify-end"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="relative w-full max-w-sm h-full overflow-y-auto"
        style={{
          background: 'linear-gradient(160deg, #061a14 0%, #082b1e 100%)',
          borderLeft: '1px solid rgba(34,197,94,0.2)',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.5)'
        }}
        onClick={e => e.stopPropagation()}>

        {/* Header strip */}
        <div className="h-1" style={{
          background: isAvail
            ? 'linear-gradient(90deg,#22C55E,#16a34a)'
            : 'linear-gradient(90deg,#FBBF24,#d97706)'
        }} />

        {/* Nav */}
        <div className="flex items-center justify-between px-5 py-4">
          <button onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:scale-110 transition-all"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            <MdArrowBack size={18} />
          </button>
          <button onClick={() => { onClose(); onEdit(mechanic) }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-yellow-400 hover:scale-110 transition-all"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            <MdEdit size={16} />
          </button>
        </div>

        {/* Profile */}
        <div className="flex flex-col items-center px-5 pb-6">
          <div className="mb-4">
            <Avatar name={mechanic.name} photo={mechanic.photo} size={88} />
          </div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-black text-white">{mechanic.name}</h2>
            {mechanic.rating >= 4.8 && <MdVerified size={18} className="text-green-400" />}
          </div>
          <p className="text-green-400 text-sm mb-2">{mechanic.specialty}</p>
          <span className="text-xs px-3 py-1 rounded-full font-semibold"
            style={isAvail
              ? { background: 'rgba(34,197,94,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.25)' }
              : { background: 'rgba(251,191,36,0.12)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.25)' }}>
            {isAvail ? '✓' : '⏳'} {mechanic.status}
          </span>
        </div>

        {/* Rating besar */}
        <div className="mx-5 mb-5 rounded-2xl p-4 text-center"
          style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
          <p className="text-4xl font-black text-yellow-400 mb-1">{mechanic.rating}</p>
          <Stars rating={mechanic.rating} />
          <p className="text-xs text-gray-500 mt-1">Rating keseluruhan</p>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-2 gap-3 mx-5 mb-5">
          {[
            { label: 'Pengalaman', value: mechanic.experience, icon: <MdSchedule size={16}/> },
            { label: 'Pekerjaan Selesai', value: mechanic.jobsDone || '—', icon: <MdCheckCircle size={16}/> },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3"
              style={{ background: 'rgba(11,59,46,0.4)', border: '1px solid rgba(34,197,94,0.1)' }}>
              <div className="text-green-700 mb-1.5">{s.icon}</div>
              <p className="text-lg font-black text-white">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Detail list */}
        <div className="mx-5 rounded-2xl overflow-hidden mb-6"
          style={{ border: '1px solid rgba(34,197,94,0.1)', background: 'rgba(11,59,46,0.2)' }}>
          {[
            { label: 'ID Mekanik', value: mechanic.id },
            { label: 'No. Telepon',  value: mechanic.phone || '—' },
            { label: 'Spesialisasi', value: mechanic.specialty },
          ].map((row, i, arr) => (
            <div key={i} className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(34,197,94,0.08)' : 'none' }}>
              <span className="text-xs text-gray-500">{row.label}</span>
              <span className="text-sm text-gray-200 font-medium">{row.value}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-5 pb-8">
          <button onClick={() => { onClose(); onEdit(mechanic) }}
            className="w-full py-3 rounded-xl text-sm font-bold text-black transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(90deg,#22C55E,#16a34a)' }}>
            Edit Profil Mekanik
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Form Modal ───────────────────────────────────────────────────────
function MechanicModal({ isOpen, onClose, onSubmit, form, setForm, editId }) {
  const fileRef = useRef()
  const handlePhoto = (e) => {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setForm(f => ({ ...f, photo: ev.target.result }))
    reader.readAsDataURL(file)
  }
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #061a14 0%, #0a2e1e 100%)',
          border: '1px solid rgba(34,197,94,0.2)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
        }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(34,197,94,0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(34,197,94,0.15)' }}>
              <MdBuild size={15} className="text-green-400" />
            </div>
            <h2 className="text-base font-bold text-white">{editId ? 'Edit Mekanik' : 'Tambah Mekanik'}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-all">
            <MdClose size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          <form id="form-mechanic" onSubmit={onSubmit} className="space-y-4">
            {/* Upload foto */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">Foto Profil</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(11,59,46,0.4)', border: '1px solid rgba(34,197,94,0.15)' }}>
                  {form.photo
                    ? <img src={form.photo} alt="preview" className="w-full h-full object-cover" />
                    : <MdCamera size={24} className="text-green-800" />}
                </div>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs text-green-400 transition-all hover:bg-green-500/10"
                  style={{ border: '1px dashed rgba(34,197,94,0.3)' }}>
                  <MdCloudUpload size={15} /> Upload Foto
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              </div>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Nama Lengkap',  key: 'name',       placeholder: 'Budi Pekerti',   full: true },
                { label: 'Spesialisasi',  key: 'specialty',  placeholder: 'Mesin & Transmisi', full: true },
                { label: 'Pengalaman',    key: 'experience', placeholder: '5 tahun' },
                { label: 'No. Telepon',   key: 'phone',      placeholder: '0812-xxxx-xxxx' },
                { label: 'Rating (1–5)',  key: 'rating',     placeholder: '4.8', type: 'number', step: '0.1', min: '1', max: '5' },
                { label: 'Pekerjaan Selesai', key: 'jobsDone', placeholder: '0', type: 'number' },
              ].map(({ label, key, placeholder, type = 'text', full, ...rest }) => (
                <div key={key} className={full ? 'col-span-2' : ''}>
                  <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
                  <input type={type} required={key !== 'phone' && key !== 'jobsDone'}
                    value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder} {...rest}
                    className={inputCls} style={inputStyle} />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className={inputCls} style={inputStyle}>
                <option>Tersedia</option>
                <option>Sibuk</option>
              </select>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4"
          style={{ borderTop: '1px solid rgba(34,197,94,0.1)' }}>
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-all"
            style={{ border: '1px solid rgba(34,197,94,0.15)' }}>Batal</button>
          <button type="submit" form="form-mechanic"
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-black transition-all hover:opacity-90 flex items-center gap-2"
            style={{ background: 'linear-gradient(90deg,#22C55E,#16a34a)' }}>
            <MdAdd size={16} /> Simpan
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Halaman Utama ────────────────────────────────────────────────────
export default function Mechanics() {
  const [mechanics, setMechanics] = useState(loadMechanics)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [editId, setEditId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [detailMechanic, setDetailMechanic] = useState(null)

  // PHASE 1 FIX — persist setiap perubahan ke garage_mechanics
  // sehingga Orders, Vehicles, Reports, Dashboard membaca data terbaru.
  useEffect(() => {
    saveMechanics(mechanics)
  }, [mechanics])

  const openAdd = () => { setForm(initialForm); setEditId(null); setShowModal(true) }
  const openEdit = (m) => {
    setDetailMechanic(null)
    setForm({ name: m.name, specialty: m.specialty, experience: m.experience, status: m.status, rating: String(m.rating), phone: m.phone, photo: m.photo || null, jobsDone: m.jobsDone || 0 })
    setEditId(m.id)
    setShowModal(true)
  }
  const handleSubmit = (ev) => {
    ev.preventDefault()
    if (editId) {
      setMechanics(prev => prev.map(m => m.id === editId ? { ...m, ...form, rating: parseFloat(form.rating), jobsDone: parseInt(form.jobsDone) || 0 } : m))
    } else {
      // PHASE 1 FIX — generator ID lama (`M-${mechanics.length + 1}`) berisiko
      // duplikat begitu ada penghapusan (mis. 20 mekanik -> hapus 1 -> tambah 1
      // baru -> ID = M-020 yang sudah dipakai). Pakai timestamp-based suffix.
      const newId = 'M-' + String(Date.now()).slice(-6)
      setMechanics(prev => [{ ...form, rating: parseFloat(form.rating), jobsDone: parseInt(form.jobsDone) || 0, id: newId }, ...prev])
    }
    setShowModal(false)
  }
  const handleDelete = () => { setMechanics(prev => prev.filter(m => m.id !== deleteTarget.id)); setDeleteTarget(null) }

  const avail = mechanics.filter(m => m.status === 'Tersedia').length
  const avgRating = (mechanics.reduce((a, m) => a + m.rating, 0) / mechanics.length).toFixed(1)
  const totalJobs = mechanics.reduce((a, m) => a + (m.jobsDone || 0), 0)

  return (
    <div className="page-animate">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Data Mekanik</h1>
          <p className="text-sm text-gray-500 mt-0.5">{mechanics.length} mekanik terdaftar</p>
        </div>
        <button onClick={openAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-black transition-all hover:opacity-90 hover:scale-105"
          style={{ background: 'linear-gradient(90deg,#22C55E,#16a34a)', boxShadow: '0 4px 18px rgba(34,197,94,0.35)' }}>
          <MdAdd size={18} /> Tambah Mekanik
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Mekanik',   value: mechanics.length, color: '#94A3B8', bg: 'rgba(148,163,184,0.08)' },
          { label: 'Tersedia',        value: avail,            color: '#22C55E', bg: 'rgba(34,197,94,0.08)'  },
          { label: 'Sedang Sibuk',    value: mechanics.length - avail, color: '#FBBF24', bg: 'rgba(251,191,36,0.08)' },
          { label: 'Rata-rata Rating',value: avgRating,        color: '#FBBF24', bg: 'rgba(251,191,36,0.08)' },
        ].map(s => (
          <div key={s.label} className="rounded-xl px-4 py-3 transition-all hover:scale-[1.02]"
            style={{ background: s.bg, border: `1px solid ${s.color}20` }}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {mechanics.map(m => (
          <MechanicCard key={m.id} m={m} onEdit={openEdit} onDelete={setDeleteTarget} onDetail={setDetailMechanic} />
        ))}
      </div>

      {/* Detail Drawer */}
      {detailMechanic && (
        <DetailDrawer
          mechanic={detailMechanic}
          onClose={() => setDetailMechanic(null)}
          onEdit={openEdit}
        />
      )}

      {/* Form Modal */}
      <MechanicModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setForm(initialForm); setEditId(null) }}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        editId={editId}
      />

      {/* Konfirmasi Hapus */}
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
            <h3 className="text-white font-bold text-lg mb-2">Hapus Mekanik?</h3>
            <p className="text-gray-400 text-sm mb-6">
              Data <span className="text-green-400 font-bold">{deleteTarget.name}</span> akan dihapus permanen.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 transition-all hover:bg-white/5"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}>Batal</button>
              <button onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(90deg,#ef4444,#dc2626)' }}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}