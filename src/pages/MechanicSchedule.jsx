import { useState, useMemo } from 'react'
import {
  MdChevronLeft, MdChevronRight, MdAdd, MdClose, MdEdit,
  MdDelete, MdPerson, MdAccessTime, MdEventBusy, MdCheck,
  MdCalendarMonth, MdViewWeek, MdFilterList, MdCircle,
  MdNotes, MdWarning
} from 'react-icons/md'

// ─── Data ─────────────────────────────────────────────────────────────
const mechanicsData = [
  { id: 'M-001', name: 'Ahmad Supriyadi', specialty: 'Mesin & Transmisi', color: '#22C55E' },
  { id: 'M-002', name: 'Budi Santoso',    specialty: 'Kelistrikan & AC',   color: '#60A5FA' },
  { id: 'M-003', name: 'Cindy Permata',   specialty: 'Body & Cat',          color: '#F472B6' },
  { id: 'M-004', name: 'Dedi Kurniawan',  specialty: 'Ban & Spooring',      color: '#FBBF24' },
  { id: 'M-005', name: 'Eka Fitriani',    specialty: 'Servis Rutin',        color: '#A78BFA' },
]

const SHIFT_TYPES = [
  { id: 'pagi',   label: 'Pagi',   time: '07:00 – 14:00', color: '#22C55E', bg: 'rgba(34,197,94,0.12)'  },
  { id: 'siang',  label: 'Siang',  time: '10:00 – 17:00', color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
  { id: 'sore',   label: 'Sore',   time: '14:00 – 21:00', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)' },
  { id: 'libur',  label: 'Libur',  time: '—',             color: '#EF4444', bg: 'rgba(239,68,68,0.1)'   },
  { id: 'cuti',   label: 'Cuti',   time: '—',             color: '#A78BFA', bg: 'rgba(167,139,250,0.12)'},
  { id: 'lembur', label: 'Lembur', time: '07:00 – 21:00', color: '#FB923C', bg: 'rgba(251,146,60,0.12)' },
]

// Seed jadwal default untuk minggu ini
function buildDefaultSchedule(weekDates) {
  const entries = []
  const patterns = [
    ['pagi','pagi','pagi','pagi','pagi','libur','libur'],
    ['siang','siang','siang','siang','siang','pagi','libur'],
    ['pagi','siang','pagi','siang','pagi','libur','cuti'],
    ['pagi','pagi','siang','pagi','pagi','pagi','libur'],
    ['sore','sore','sore','sore','sore','libur','libur'],
  ]
  mechanicsData.forEach((m, mi) => {
    weekDates.forEach((date, di) => {
      entries.push({
        id: `${m.id}-${date}`,
        mechanicId: m.id,
        date,
        shiftId: patterns[mi][di],
        note: '',
      })
    })
  })
  return entries
}

// ─── Utils ────────────────────────────────────────────────────────────
const DAYS_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const MONTHS_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

function getWeekDates(baseDate) {
  const d = new Date(baseDate)
  const day = d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() - ((day + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(monday)
    dd.setDate(monday.getDate() + i)
    return dd.toISOString().slice(0, 10)
  })
}

function fmt(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return { day: DAYS_ID[d.getDay()], date: d.getDate(), month: MONTHS_ID[d.getMonth()], full: d }
}

function isToday(dateStr) {
  return dateStr === new Date().toISOString().slice(0, 10)
}

// Avatar inisial
function Avatar({ name, color, size = 32 }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className="rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0"
      style={{ width: size, height: size, background: color + '33', border: `1px solid ${color}55`, fontSize: size * 0.35, color }}>
      {initials}
    </div>
  )
}

// ─── Shift Cell ───────────────────────────────────────────────────────
function ShiftCell({ entry, mechanic, onEdit }) {
  const shift = SHIFT_TYPES.find(s => s.id === entry?.shiftId)
  if (!shift) return (
    <div onClick={() => onEdit(entry)}
      className="h-14 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:bg-white/5 border border-dashed"
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <MdAdd size={14} className="text-gray-700" />
    </div>
  )
  return (
    <div onClick={() => onEdit(entry)}
      className="h-14 rounded-xl px-2.5 flex flex-col justify-center cursor-pointer transition-all hover:brightness-110 hover:scale-[1.02] group relative overflow-hidden"
      style={{ background: shift.bg, border: `1px solid ${shift.color}30` }}>
      <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full" style={{ background: shift.color }} />
      <span className="text-xs font-bold" style={{ color: shift.color }}>{shift.label}</span>
      {shift.time !== '—' && <span className="text-xs text-gray-500 mt-0.5">{shift.time}</span>}
      {entry?.note && <MdNotes size={10} className="absolute top-1.5 right-1.5 text-gray-600" />}
    </div>
  )
}

// ─── Modal Edit Shift ─────────────────────────────────────────────────
function ShiftModal({ entry, mechanic, date, onClose, onSave, onDelete }) {
  const [shiftId, setShiftId] = useState(entry?.shiftId || 'pagi')
  const [note, setNote] = useState(entry?.note || '')
  const d = fmt(date)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#061a14,#0a2e1e)', border: '1px solid rgba(34,197,94,0.2)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(34,197,94,0.1)' }}>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Atur Jadwal</p>
            <div className="flex items-center gap-2">
              <Avatar name={mechanic.name} color={mechanic.color} size={24} />
              <span className="text-sm font-bold text-white">{mechanic.name}</span>
              <span className="text-xs text-gray-500">·</span>
              <span className="text-xs text-gray-400">{d.day}, {d.date} {d.month}</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5">
            <MdClose size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Pilih shift */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">Tipe Shift</label>
            <div className="grid grid-cols-3 gap-2">
              {SHIFT_TYPES.map(s => (
                <button key={s.id} onClick={() => setShiftId(s.id)}
                  className="rounded-xl py-2.5 px-2 text-center transition-all hover:scale-[1.02]"
                  style={{
                    background: shiftId === s.id ? s.bg : 'rgba(11,59,46,0.3)',
                    border: shiftId === s.id ? `1.5px solid ${s.color}60` : '1px solid rgba(34,197,94,0.08)',
                  }}>
                  <p className="text-xs font-bold" style={{ color: shiftId === s.id ? s.color : '#6B7280' }}>{s.label}</p>
                  {s.time !== '—' && <p className="text-xs mt-0.5" style={{ color: shiftId === s.id ? s.color + 'aa' : '#374151', fontSize: 10 }}>{s.time}</p>}
                </button>
              ))}
            </div>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Catatan (opsional)</label>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="misal: gantikan shift Budi, lembur proyek X..."
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl text-xs text-gray-300 outline-none resize-none transition-all focus:ring-2 focus:ring-green-500/20"
              style={{ background: 'rgba(11,59,46,0.5)', border: '1px solid rgba(34,197,94,0.15)' }} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-5 py-4" style={{ borderTop: '1px solid rgba(34,197,94,0.1)' }}>
          {entry?.shiftId && (
            <button onClick={() => onDelete(entry)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-500/15 transition-all flex-shrink-0">
              <MdDelete size={16} />
            </button>
          )}
          <button onClick={onClose}
            className="flex-1 py-2 rounded-xl text-sm text-gray-400 transition-all hover:bg-white/5"
            style={{ border: '1px solid rgba(34,197,94,0.12)' }}>Batal</button>
          <button onClick={() => onSave({ shiftId, note })}
            className="flex-1 py-2 rounded-xl text-sm font-bold text-black transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(90deg,#22C55E,#16a34a)' }}>
            <MdCheck size={14} className="inline mr-1" />Simpan
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Legenda shift ────────────────────────────────────────────────────
function Legend() {
  return (
    <div className="flex flex-wrap gap-2">
      {SHIFT_TYPES.map(s => (
        <div key={s.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs"
          style={{ background: s.bg, border: `1px solid ${s.color}25` }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
          <span style={{ color: s.color }}>{s.label}</span>
          {s.time !== '—' && <span className="text-gray-600">{s.time}</span>}
        </div>
      ))}
    </div>
  )
}

// ─── Ringkasan mingguan per mekanik ──────────────────────────────────
function WeeklySummary({ mechanicId, entries }) {
  const myEntries = entries.filter(e => e.mechanicId === mechanicId)
  const counts = SHIFT_TYPES.reduce((acc, s) => {
    acc[s.id] = myEntries.filter(e => e.shiftId === s.id).length
    return acc
  }, {})
  const workDays = (counts.pagi || 0) + (counts.siang || 0) + (counts.sore || 0) + (counts.lembur || 0)
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-600">{workDays} hari kerja</span>
      {counts.lembur > 0 && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,146,60,0.12)', color: '#FB923C' }}>+{counts.lembur} lembur</span>}
      {counts.libur > 0 && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>{counts.libur} libur</span>}
      {counts.cuti > 0 && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(167,139,250,0.12)', color: '#A78BFA' }}>{counts.cuti} cuti</span>}
    </div>
  )
}

// ─── Halaman Utama ────────────────────────────────────────────────────
export default function MechanicSchedule() {
  const today = new Date().toISOString().slice(0, 10)
  const [currentWeekBase, setCurrentWeekBase] = useState(today)
  const [filterMechanic, setFilterMechanic] = useState('Semua')
  const [editTarget, setEditTarget] = useState(null) // { entry, mechanic, date }
  const [view, setView] = useState('week') // 'week' | 'list'

  const weekDates = useMemo(() => getWeekDates(currentWeekBase), [currentWeekBase])

  const [schedules, setSchedules] = useState(() => buildDefaultSchedule(weekDates))

  // Navigasi minggu
  const prevWeek = () => {
    const d = new Date(weekDates[0]); d.setDate(d.getDate() - 7)
    const newDates = getWeekDates(d.toISOString().slice(0, 10))
    setCurrentWeekBase(newDates[0])
    // Seed jadwal untuk minggu baru jika belum ada
    setSchedules(prev => {
      const existing = new Set(prev.map(e => e.id))
      const newEntries = []
      mechanicsData.forEach(m => {
        newDates.forEach(date => {
          const id = `${m.id}-${date}`
          if (!existing.has(id)) newEntries.push({ id, mechanicId: m.id, date, shiftId: null, note: '' })
        })
      })
      return [...prev, ...newEntries]
    })
  }

  const nextWeek = () => {
    const d = new Date(weekDates[0]); d.setDate(d.getDate() + 7)
    const newDates = getWeekDates(d.toISOString().slice(0, 10))
    setCurrentWeekBase(newDates[0])
    setSchedules(prev => {
      const existing = new Set(prev.map(e => e.id))
      const newEntries = []
      mechanicsData.forEach(m => {
        newDates.forEach(date => {
          const id = `${m.id}-${date}`
          if (!existing.has(id)) newEntries.push({ id, mechanicId: m.id, date, shiftId: null, note: '' })
        })
      })
      return [...prev, ...newEntries]
    })
  }

  const goToday = () => setCurrentWeekBase(today)

  const getEntry = (mechanicId, date) =>
    schedules.find(e => e.mechanicId === mechanicId && e.date === date) || { id: `${mechanicId}-${date}`, mechanicId, date, shiftId: null, note: '' }

  const handleEdit = (entry, mechanic, date) => {
    setEditTarget({ entry: entry || { id: `${mechanic.id}-${date}`, mechanicId: mechanic.id, date, shiftId: null, note: '' }, mechanic, date })
  }

  const handleSave = ({ shiftId, note }) => {
    setSchedules(prev => {
      const idx = prev.findIndex(e => e.id === editTarget.entry.id)
      const updated = { ...editTarget.entry, shiftId, note }
      if (idx >= 0) return prev.map((e, i) => i === idx ? updated : e)
      return [...prev, updated]
    })
    setEditTarget(null)
  }

  const handleDelete = (entry) => {
    setSchedules(prev => prev.map(e => e.id === entry.id ? { ...e, shiftId: null, note: '' } : e))
    setEditTarget(null)
  }

  const visibleMechanics = filterMechanic === 'Semua'
    ? mechanicsData
    : mechanicsData.filter(m => m.id === filterMechanic)

  // Range label
  const startFmt = fmt(weekDates[0])
  const endFmt = fmt(weekDates[6])
  const rangeLabel = startFmt.month === endFmt.month
    ? `${startFmt.date} – ${endFmt.date} ${endFmt.month}`
    : `${startFmt.date} ${startFmt.month} – ${endFmt.date} ${endFmt.month}`

  // Hitung stats minggu ini
  const weekEntries = schedules.filter(e => weekDates.includes(e.date))
  const totalWorkSlots = weekEntries.filter(e => e.shiftId && e.shiftId !== 'libur' && e.shiftId !== 'cuti').length
  const totalLibur = weekEntries.filter(e => e.shiftId === 'libur').length
  const totalLembur = weekEntries.filter(e => e.shiftId === 'lembur').length
  const availToday = mechanicsData.filter(m => {
    const e = getEntry(m.id, today)
    return e.shiftId && e.shiftId !== 'libur' && e.shiftId !== 'cuti'
  }).length

  return (
    <div className="page-animate">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Jadwal Mekanik</h1>
          <p className="text-sm text-gray-500 mt-0.5">Atur ketersediaan & shift mingguan</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(34,197,94,0.15)' }}>
            {[
              { id: 'week', icon: <MdViewWeek size={16}/> },
              { id: 'list', icon: <MdCalendarMonth size={16}/> },
            ].map(v => (
              <button key={v.id} onClick={() => setView(v.id)}
                className="w-9 h-9 flex items-center justify-center transition-all"
                style={view === v.id
                  ? { background: 'rgba(34,197,94,0.2)', color: '#22C55E' }
                  : { background: 'rgba(11,59,46,0.4)', color: '#4B5563' }}>
                {v.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Tersedia Hari Ini', value: availToday, color: '#22C55E', bg: 'rgba(34,197,94,0.08)' },
          { label: 'Slot Kerja Minggu Ini', value: totalWorkSlots, color: '#60A5FA', bg: 'rgba(96,165,250,0.08)' },
          { label: 'Libur Minggu Ini', value: totalLibur, color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
          { label: 'Lembur Minggu Ini', value: totalLembur, color: '#FB923C', bg: 'rgba(251,146,60,0.08)' },
        ].map(s => (
          <div key={s.label} className="rounded-xl px-4 py-3 transition-all hover:scale-[1.02]"
            style={{ background: s.bg, border: `1px solid ${s.color}20` }}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Kalender ── */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(6,28,20,0.8)', border: '1px solid rgba(34,197,94,0.12)', backdropFilter: 'blur(6px)' }}>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4"
          style={{ borderBottom: '1px solid rgba(34,197,94,0.1)' }}>
          <div className="flex items-center gap-2">
            <button onClick={prevWeek}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/8 transition-all"
              style={{ border: '1px solid rgba(34,197,94,0.1)' }}>
              <MdChevronLeft size={18} />
            </button>
            <div className="text-center px-2">
              <p className="text-white font-bold text-sm">{rangeLabel}</p>
            </div>
            <button onClick={nextWeek}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/8 transition-all"
              style={{ border: '1px solid rgba(34,197,94,0.1)' }}>
              <MdChevronRight size={18} />
            </button>
            <button onClick={goToday}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
              style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>
              Hari Ini
            </button>
          </div>

          {/* Filter mekanik */}
          <div className="flex items-center gap-2">
            <MdFilterList size={14} className="text-gray-600" />
            <select value={filterMechanic} onChange={e => setFilterMechanic(e.target.value)}
              className="text-xs text-gray-300 px-3 py-1.5 rounded-xl outline-none"
              style={{ background: 'rgba(11,59,46,0.5)', border: '1px solid rgba(34,197,94,0.12)' }}>
              <option value="Semua">Semua Mekanik</option>
              {mechanicsData.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </div>

        {/* ── View: Tabel Mingguan ── */}
        {view === 'week' && (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 700 }}>
              <thead>
                <tr>
                  {/* kolom mekanik */}
                  <th className="text-left px-4 py-3 w-48" style={{ borderBottom: '1px solid rgba(34,197,94,0.08)' }}>
                    <span className="text-xs text-gray-600">Mekanik</span>
                  </th>
                  {weekDates.map(date => {
                    const d = fmt(date)
                    const today_ = isToday(date)
                    return (
                      <th key={date} className="px-2 py-3 text-center" style={{ borderBottom: '1px solid rgba(34,197,94,0.08)', minWidth: 100 }}>
                        <div className={`flex flex-col items-center gap-1`}>
                          <span className="text-xs font-medium" style={{ color: today_ ? '#22C55E' : '#6B7280' }}>{d.day}</span>
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-black transition-all`}
                            style={today_
                              ? { background: '#22C55E', color: '#000' }
                              : { color: '#D1D5DB' }}>
                            {d.date}
                          </span>
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {visibleMechanics.map((mech, mi) => (
                  <tr key={mech.id}
                    className="transition-colors hover:bg-white/[0.02]"
                    style={{ borderBottom: mi < visibleMechanics.length - 1 ? '1px solid rgba(34,197,94,0.05)' : 'none' }}>
                    {/* Info mekanik */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={mech.name} color={mech.color} size={36} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{mech.name}</p>
                          <p className="text-xs text-gray-600 truncate">{mech.specialty}</p>
                        </div>
                      </div>
                    </td>
                    {/* Sel shift per hari */}
                    {weekDates.map(date => {
                      const entry = getEntry(mech.id, date)
                      return (
                        <td key={date} className="px-1.5 py-2">
                          <ShiftCell
                            entry={entry.shiftId ? entry : null}
                            mechanic={mech}
                            onEdit={() => handleEdit(entry, mech, date)}
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── View: List per Mekanik ── */}
        {view === 'list' && (
          <div className="divide-y" style={{ borderColor: 'rgba(34,197,94,0.06)' }}>
            {visibleMechanics.map(mech => (
              <div key={mech.id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={mech.name} color={mech.color} size={40} />
                    <div>
                      <p className="text-sm font-bold text-white">{mech.name}</p>
                      <p className="text-xs text-gray-600">{mech.specialty}</p>
                    </div>
                  </div>
                  <WeeklySummary mechanicId={mech.id} entries={schedules.filter(e => weekDates.includes(e.date))} />
                </div>
                {/* Baris hari */}
                <div className="grid grid-cols-7 gap-1.5">
                  {weekDates.map(date => {
                    const entry = getEntry(mech.id, date)
                    const d = fmt(date)
                    const shift = SHIFT_TYPES.find(s => s.id === entry?.shiftId)
                    const today_ = isToday(date)
                    return (
                      <div key={date}
                        onClick={() => handleEdit(entry, mech, date)}
                        className="rounded-xl p-2 text-center cursor-pointer transition-all hover:scale-[1.04]"
                        style={{
                          background: shift ? shift.bg : 'rgba(11,59,46,0.2)',
                          border: today_ ? `1.5px solid ${shift?.color || '#22C55E'}60` : `1px solid rgba(34,197,94,0.06)`,
                        }}>
                        <p className="text-xs mb-1" style={{ color: today_ ? '#22C55E' : '#6B7280' }}>{d.day}</p>
                        <p className="text-sm font-bold" style={{ color: shift ? shift.color : '#374151' }}>{d.date}</p>
                        <p className="text-xs mt-1 font-medium" style={{ color: shift ? shift.color + 'cc' : '#374151', fontSize: 10 }}>
                          {shift ? shift.label : '—'}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Legenda */}
        <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(34,197,94,0.08)' }}>
          <p className="text-xs text-gray-600 mb-2">Keterangan shift:</p>
          <Legend />
        </div>
      </div>

      {/* ── Modal Edit Shift ── */}
      {editTarget && (
        <ShiftModal
          entry={editTarget.entry}
          mechanic={editTarget.mechanic}
          date={editTarget.date}
          onClose={() => setEditTarget(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}