import { useState, useRef, useEffect } from 'react'
import {
  MdAdd, MdClose, MdEdit, MdDelete, MdStar,
  MdPhone, MdSchedule, MdArrowBack, MdCamera,
  MdCloudUpload, MdBuild, MdVerified, MdInfo,
  MdCheckCircle, MdPending, MdPeople, MdStarHalf,
  MdWork, MdTimer, MdPersonAdd, MdRefresh
} from 'react-icons/md'
import { motion, AnimatePresence } from 'framer-motion'
import mechanicsData from '../data/mechanicsData.json'

// ─── LocalStorage helpers ───────────────────────────────────────────
const LS_KEY_MECHANICS = 'garage_mechanics'

function loadMechanics() {
  try {
    const raw = sessionStorage.getItem(LS_KEY_MECHANICS)
    if (raw) {
      const parsed = JSON.parse(raw)
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
    sessionStorage.setItem(LS_KEY_MECHANICS, JSON.stringify(list))
  } catch { /* ignore */ }
}

// ─── Rating otomatis ──────────────────────────────────────────────────
function computeRating(jobsDone) {
  const j = Number(jobsDone) || 0
  if (j > 20) return 5.0
  if (j > 10) return 4.8
  if (j > 5)  return 4.6
  if (j > 2)  return 4.3
  return 4.0
}

const initialForm = {
  name: '',
  specialty: '',
  experience: '',
  status: 'Tersedia',
  phone: '',
  photo: null,
  jobsDone: 0
}

const inputCls = `w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all focus:ring-2 focus:ring-green-500/30`
const inputStyle = { background: 'rgba(11,59,46,0.4)', border: '1px solid rgba(34,197,94,0.12)' }

// ─── Avatar ──────────────────────────────────────────────────────────
function Avatar({ name, photo, size = 56, className = '' }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const colors = [
    ['#0B3B2E', '#22C55E'], ['#1e3a5f', '#3B82F6'], ['#3b1f5e', '#8B5CF6'],
    ['#5e1f1f', '#EF4444'], ['#3b3b1f', '#EAB308'], ['#1f3b3b', '#14B8A6'],
  ]
  const [bg, accent] = colors[name.charCodeAt(0) % colors.length]

  return (
    <div className={`relative flex-shrink-0 rounded-2xl overflow-hidden shadow-lg ${className}`}
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${bg}, ${accent})` }}>
      {photo
        ? <img src={photo} alt={name} className="w-full h-full object-cover" />
        : <span className="absolute inset-0 flex items-center justify-center font-black text-white"
            style={{ fontSize: size * 0.35 }}>{initials}</span>}
      {photo && (
        <div className="absolute inset-0 bg-black/20" />
      )}
    </div>
  )
}

// ─── Stars ────────────────────────────────────────────────────────────
function Stars({ rating, size = 13 }) {
  const rounded = Math.round(rating)
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <MdStar key={i} size={size}
          style={{ color: i <= rounded ? '#FBBF24' : 'rgba(255,255,255,0.08)' }} />
      ))}
    </div>
  )
}

// ─── Kartu Mekanik ────────────────────────────────────────────────────
function MechanicCard({ m, onEdit, onDelete, onDetail }) {
  const isAvail = m.status === 'Tersedia'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      onClick={() => onDetail(m)}
      className="group relative rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: 'linear-gradient(160deg, rgba(8,44,34,0.95) 0%, rgba(4,26,20,0.9) 100%)',
        border: '1px solid rgba(34,197,94,0.12)',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      {/* Glow accent */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 80% 20%, rgba(34,197,94,0.08), transparent 60%)' }} />

      {/* Top bar */}
      <div className="h-1 w-full" style={{
        background: isAvail
          ? 'linear-gradient(90deg, #22C55E, #16a34a, #22C55E)'
          : 'linear-gradient(90deg, #FBBF24, #d97706, #FBBF24)'
      }} />

      <div className="p-5 relative z-10">
        {/* Actions */}
        <div className="absolute top-4 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200"
          onClick={e => e.stopPropagation()}>
          <button onClick={() => onEdit(m)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-yellow-400/80 hover:text-yellow-400 transition-all hover:scale-110"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
            <MdEdit size={14} />
          </button>
          <button onClick={() => onDelete(m)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-red-400/80 hover:text-red-400 transition-all hover:scale-110"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
            <MdDelete size={14} />
          </button>
        </div>

        {/* Profile */}
        <div className="flex items-start gap-4 mb-4 pr-14">
          <Avatar name={m.name} photo={m.photo} size={56} className="ring-2 ring-green-500/20 group-hover:ring-green-500/40 transition-all" />
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="text-white font-bold text-base truncate">{m.name}</h3>
              {m.rating >= 4.8 && <MdVerified size={14} className="text-green-400 flex-shrink-0" />}
            </div>
            <p className="text-green-400/80 text-xs font-medium mb-1.5 flex items-center gap-1">
              <MdWork size={12} className="text-green-600" />
              {m.specialty}
            </p>
            <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold transition-all ${
              isAvail ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isAvail ? 'bg-green-400' : 'bg-yellow-400'}`} />
              {m.status}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Pengalaman', value: m.experience, icon: <MdTimer size={12} /> },
            { label: 'Pekerjaan', value: m.jobsDone || '—', icon: <MdCheckCircle size={12} /> },
            { label: 'Rating', value: m.rating, icon: <MdStar size={12} /> },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-2.5 text-center transition-all group-hover:bg-green-500/5"
              style={{ background: 'rgba(11,59,46,0.3)', border: '1px solid rgba(34,197,94,0.06)' }}>
              <div className="text-green-700/50 flex justify-center mb-0.5">{s.icon}</div>
              <p className="text-white font-bold text-sm">{s.value}</p>
              <p className="text-gray-500 text-[10px] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3"
          style={{ borderTop: '1px solid rgba(34,197,94,0.06)' }}>
          <div className="flex items-center gap-1.5 text-gray-500">
            <MdPhone size={12} />
            <span className="text-xs">{m.phone || '—'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Stars rating={m.rating} />
            <span className="text-xs text-yellow-400/80 font-bold ml-0.5">{m.rating}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Detail Drawer ────────────────────────────────────────────────────
function DetailDrawer({ mechanic, onClose, onEdit }) {
  if (!mechanic) return null
  const isAvail = mechanic.status === 'Tersedia'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex justify-end"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative w-full max-w-sm h-full overflow-y-auto"
          style={{
            background: 'linear-gradient(170deg, #061a14 0%, #0a2e1e 100%)',
            borderLeft: '1px solid rgba(34,197,94,0.15)',
            boxShadow: '-30px 0 80px rgba(0,0,0,0.6)'
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header strip */}
          <div className="h-1.5" style={{
            background: isAvail
              ? 'linear-gradient(90deg, #22C55E, #16a34a, #22C55E)'
              : 'linear-gradient(90deg, #FBBF24, #d97706, #FBBF24)'
          }} />

          {/* Nav */}
          <div className="flex items-center justify-between px-5 py-4">
            <button onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all">
              <MdArrowBack size={20} />
            </button>
            <button onClick={() => { onClose(); onEdit(mechanic) }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-yellow-400/70 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all">
              <MdEdit size={18} />
            </button>
          </div>

          {/* Profile */}
          <div className="flex flex-col items-center px-5 pb-6">
            <Avatar name={mechanic.name} photo={mechanic.photo} size={100} className="ring-4 ring-green-500/20" />
            <div className="flex items-center gap-2 mt-4 mb-1">
              <h2 className="text-2xl font-black text-white">{mechanic.name}</h2>
              {mechanic.rating >= 4.8 && <MdVerified size={20} className="text-green-400" />}
            </div>
            <p className="text-green-400/80 text-sm mb-2 flex items-center gap-1">
              <MdWork size={14} className="text-green-600" /> {mechanic.specialty}
            </p>
            <span className={`text-xs px-4 py-1.5 rounded-full font-semibold flex items-center gap-1.5 ${
              isAvail ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isAvail ? 'bg-green-400' : 'bg-yellow-400'}`} />
              {mechanic.status}
            </span>
          </div>

          {/* Rating besar */}
          <div className="mx-5 mb-5 rounded-2xl p-5 text-center"
            style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.1)' }}>
            <p className="text-5xl font-black text-yellow-400 mb-1">{mechanic.rating}</p>
            <Stars rating={mechanic.rating} size={16} />
            <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-wider">Rating otomatis berdasarkan pekerjaan</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mx-5 mb-5">
            {[
              { label: 'Pengalaman', value: mechanic.experience, icon: <MdTimer size={18}/> },
              { label: 'Pekerjaan Selesai', value: mechanic.jobsDone || '—', icon: <MdCheckCircle size={18}/> },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-4 text-center"
                style={{ background: 'rgba(11,59,46,0.3)', border: '1px solid rgba(34,197,94,0.08)' }}>
                <div className="text-green-700/60 mb-1">{s.icon}</div>
                <p className="text-xl font-black text-white">{s.value}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Detail list */}
          <div className="mx-5 rounded-2xl overflow-hidden mb-6"
            style={{ border: '1px solid rgba(34,197,94,0.08)', background: 'rgba(11,59,46,0.15)' }}>
            {[
              { label: 'ID Mekanik', value: mechanic.id },
              { label: 'No. Telepon',  value: mechanic.phone || '—' },
              { label: 'Spesialisasi', value: mechanic.specialty },
            ].map((row, i, arr) => (
              <div key={i} className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(34,197,94,0.06)' : 'none' }}>
                <span className="text-xs text-gray-500">{row.label}</span>
                <span className="text-sm text-gray-200 font-medium">{row.value}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="px-5 pb-8">
            <button onClick={() => { onClose(); onEdit(mechanic) }}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-black transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #22C55E, #16a34a)', boxShadow: '0 8px 24px rgba(34,197,94,0.3)' }}>
              Edit Profil Mekanik
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25 }}
          className="w-full max-w-md rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, #061a14 0%, #0a2e1e 100%)',
            border: '1px solid rgba(34,197,94,0.15)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.6)'
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid rgba(34,197,94,0.08)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(34,197,94,0.12)' }}>
                {editId ? <MdEdit size={16} className="text-green-400" /> : <MdPersonAdd size={16} className="text-green-400" />}
              </div>
              <h2 className="text-base font-bold text-white">{editId ? 'Edit Mekanik' : 'Tambah Mekanik'}</h2>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-all">
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
                    style={{ background: 'rgba(11,59,46,0.3)', border: '1px solid rgba(34,197,94,0.1)' }}>
                    {form.photo
                      ? <img src={form.photo} alt="preview" className="w-full h-full object-cover" />
                      : <MdCamera size={24} className="text-green-800/60" />}
                  </div>
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs text-green-400/70 hover:text-green-400 transition-all hover:bg-green-500/10"
                    style={{ border: '1px dashed rgba(34,197,94,0.2)' }}>
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
                  { label: 'Pekerjaan Selesai', key: 'jobsDone', placeholder: '0', type: 'number' },
                ].map(({ label, key, placeholder, type = 'text', full }) => (
                  <div key={key} className={full ? 'col-span-2' : ''}>
                    <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
                    <input type={type} required={key !== 'phone'}
                      value={form[key] || ''}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
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

              <div className="flex items-center gap-2 p-3 rounded-xl"
                style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.1)' }}>
                <MdInfo size={14} className="text-yellow-500/60 flex-shrink-0" />
                <p className="text-xs text-gray-400">Rating akan dihitung otomatis berdasarkan jumlah pekerjaan selesai.</p>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4"
            style={{ borderTop: '1px solid rgba(34,197,94,0.08)' }}>
            <button onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-all"
              style={{ border: '1px solid rgba(34,197,94,0.1)' }}>Batal</button>
            <button type="submit" form="form-mechanic"
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-black transition-all hover:opacity-90 flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg,#22C55E,#16a34a)', boxShadow: '0 4px 16px rgba(34,197,94,0.3)' }}>
              <MdAdd size={16} /> Simpan
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
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

  useEffect(() => {
    saveMechanics(mechanics)
  }, [mechanics])

  const openAdd = () => {
    setForm({ ...initialForm, jobsDone: 0 })
    setEditId(null)
    setShowModal(true)
  }

  const openEdit = (m) => {
    setDetailMechanic(null)
    setForm({
      name: m.name,
      specialty: m.specialty,
      experience: m.experience,
      status: m.status,
      phone: m.phone || '',
      photo: m.photo || null,
      jobsDone: m.jobsDone || 0
    })
    setEditId(m.id)
    setShowModal(true)
  }

  const handleSubmit = (ev) => {
    ev.preventDefault()
    const jobs = parseInt(form.jobsDone) || 0
    const rating = computeRating(jobs)

    if (editId) {
      setMechanics(prev => prev.map(m =>
        m.id === editId
          ? { ...m, ...form, jobsDone: jobs, rating }
          : m
      ))
    } else {
      const newId = 'M-' + String(Date.now()).slice(-6)
      setMechanics(prev => [{
        ...form,
        jobsDone: jobs,
        rating,
        id: newId
      }, ...prev])
    }
    setShowModal(false)
  }

  const handleDelete = () => {
    setMechanics(prev => prev.filter(m => m.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const avail = mechanics.filter(m => m.status === 'Tersedia').length
  const avgRating = (mechanics.reduce((a, m) => a + m.rating, 0) / mechanics.length).toFixed(1)
  const totalJobs = mechanics.reduce((a, m) => a + (m.jobsDone || 0), 0)

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(circle at 10% 20%, #072e1f, #03120c)' }}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <span className="bg-gradient-to-r from-green-300 to-emerald-500 bg-clip-text text-transparent">
                Tim Mekanik
              </span>
              <span className="text-sm font-normal text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                {mechanics.length} terdaftar
              </span>
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <MdPeople size={14} className="text-green-600" />
              {avail} tersedia · {mechanics.length - avail} sibuk · rata-rata rating {avgRating}
            </p>
          </div>
          <button onClick={openAdd}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-black transition-all hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #22C55E, #16a34a)', boxShadow: '0 8px 24px rgba(34,197,94,0.35)' }}>
            <MdPersonAdd size={18} /> Tambah Mekanik
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Mekanik',   value: mechanics.length, icon: <MdPeople size={18}/>, color: '#94A3B8', bg: 'rgba(148,163,184,0.06)' },
            { label: 'Tersedia',        value: avail,            icon: <MdCheckCircle size={18}/>, color: '#22C55E', bg: 'rgba(34,197,94,0.06)'  },
            { label: 'Sedang Sibuk',    value: mechanics.length - avail, icon: <MdPending size={18}/>, color: '#FBBF24', bg: 'rgba(251,191,36,0.06)' },
            { label: 'Rata-rata Rating',value: avgRating,        icon: <MdStarHalf size={18}/>, color: '#FBBF24', bg: 'rgba(251,191,36,0.06)' },
          ].map(s => (
            <motion.div
              key={s.label}
              whileHover={{ scale: 1.02 }}
              className="rounded-2xl px-4 py-3 transition-all"
              style={{ background: s.bg, border: `1px solid ${s.color}15` }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">{s.label}</p>
                <span style={{ color: s.color, opacity: 0.6 }}>{s.icon}</span>
              </div>
              <p className="text-2xl font-black mt-1" style={{ color: s.color }}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Grid */}
        <AnimatePresence>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {mechanics.map(m => (
              <MechanicCard key={m.id} m={m} onEdit={openEdit} onDelete={setDeleteTarget} onDetail={setDetailMechanic} />
            ))}
          </div>
        </AnimatePresence>

        {mechanics.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 opacity-20">🔧</div>
            <p className="text-gray-500 text-sm">Belum ada mekanik terdaftar</p>
          </div>
        )}
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
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm rounded-2xl p-6 text-center"
              style={{ background: 'linear-gradient(160deg, #0a2a1f, #061a14)', border: '1px solid rgba(239,68,68,0.3)', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.2)' }}>
                <MdDelete size={28} className="text-red-500" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Hapus Mekanik?</h3>
              <p className="text-gray-400 text-sm mb-6">
                Data <span className="text-green-400 font-bold">{deleteTarget.name}</span> akan dihapus permanen.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}>Batal</button>
                <button onClick={handleDelete}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}>Ya, Hapus</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}