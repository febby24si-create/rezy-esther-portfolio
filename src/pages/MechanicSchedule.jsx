import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  MdChevronLeft, MdChevronRight, MdAdd, MdClose, MdEdit,
  MdDelete, MdPerson, MdAccessTime, MdEventBusy, MdCheck,
  MdCalendarMonth, MdViewWeek, MdFilterList, MdCircle,
  MdNotes, MdWarning, MdSearch, MdContentCopy, MdAutoAwesome,
  MdFileDownload, MdPrint, MdSave, MdPeople
} from 'react-icons/md'
import Pagination from '../components/Pagination'
import mechanicsDataRaw from '../data/mechanicsData.json'

// ─── Helper: generate warna unik berdasarkan nama ─────────────────────
function stringToColor(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash % 360)
  return `hsl(${hue}, 70%, 55%)`
}

// ─── Siapkan data mekanik dengan properti color ──────────────────────
const mechanicsData = mechanicsDataRaw.map(m => ({
  ...m,
  color: stringToColor(m.name)
}))

const SHIFT_TYPES = [
  { id: 'pagi',   label: 'Pagi',   time: '07:00 – 14:00', color: '#22C55E', bg: 'rgba(34,197,94,0.12)', workHours: 7 },
  { id: 'siang',  label: 'Siang',  time: '10:00 – 17:00', color: '#60A5FA', bg: 'rgba(96,165,250,0.12)', workHours: 7 },
  { id: 'sore',   label: 'Sore',   time: '14:00 – 21:00', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)', workHours: 7 },
  { id: 'libur',  label: 'Libur',  time: '—',             color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   workHours: 0 },
  { id: 'cuti',   label: 'Cuti',   time: '—',             color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', workHours: 0 },
  { id: 'lembur', label: 'Lembur', time: '07:00 – 21:00', color: '#FB923C', bg: 'rgba(251,146,60,0.12)', workHours: 14 },
]

// Konfigurasi kebutuhan mekanik per hari
const DAILY_REQUIREMENT = 4

// ─── Build jadwal default (semua null) ───────────────────────────────
function buildDefaultSchedule(weekDates, mechanics) {
  const entries = []
  mechanics.forEach(m => {
    weekDates.forEach(date => {
      entries.push({
        id: `${m.id}-${date}`,
        mechanicId: m.id,
        date,
        shiftId: null,
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

function Avatar({ name, color, size = 32 }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className="rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0"
      style={{ width: size, height: size, background: color + '33', border: `1px solid ${color}55`, fontSize: size * 0.35, color }}>
      {initials}
    </div>
  )
}

// ─── Hitung coverage harian ──────────────────────────────────────────
function getDailyCoverage(entries, date) {
  const dayEntries = entries.filter(e => e.date === date && e.shiftId && e.shiftId !== 'libur' && e.shiftId !== 'cuti')
  const available = dayEntries.length
  const isSufficient = available >= DAILY_REQUIREMENT
  return { available, required: DAILY_REQUIREMENT, isSufficient, shortage: Math.max(0, DAILY_REQUIREMENT - available) }
}

// ─── Shift Cell ───────────────────────────────────────────────────────
function ShiftCell({ entry, mechanic, onEdit }) {
  const shift = SHIFT_TYPES.find(s => s.id === entry?.shiftId)
  if (!shift) return (
    <div onClick={onEdit}
      className="h-14 rounded-xl flex items-center justify-center cursor-pointer transition-all hover:bg-white/10 group border border-dashed hover:border-solid"
      style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
      <MdAdd size={16} className="text-gray-600 group-hover:text-green-500 transition-colors" />
    </div>
  )
  return (
    <div onClick={onEdit}
      className="h-14 rounded-xl px-2.5 flex flex-col justify-center cursor-pointer transition-all hover:brightness-110 hover:scale-[1.02] group relative overflow-hidden"
      style={{ background: shift.bg, border: `1px solid ${shift.color}40` }}>
      <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full" style={{ background: shift.color }} />
      <span className="text-xs font-bold" style={{ color: shift.color }}>{shift.label}</span>
      {shift.time !== '—' && <span className="text-xs text-gray-500 mt-0.5">{shift.time}</span>}
      {entry?.note && <MdNotes size={10} className="absolute top-1.5 right-1.5 text-gray-500" />}
    </div>
  )
}

// ─── Modal Edit Shift ─────────────────────────────────────────────────
function ShiftModal({ entry, mechanic, date, onClose, onSave, onDelete }) {
  const [shiftId, setShiftId] = useState(entry?.shiftId || 'pagi')
  const [note, setNote] = useState(entry?.note || '')
  const [showConfirm, setShowConfirm] = useState(false)
  const d = fmt(date)

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const handleDeleteClick = () => {
    setShowConfirm(true)
  }

  const confirmDelete = () => {
    onDelete(entry)
    setShowConfirm(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#061a14,#0a2e1e)', border: '1px solid rgba(34,197,94,0.2)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(34,197,94,0.1)' }}>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Atur Jadwal</p>
            <div className="flex items-center gap-2">
              <Avatar name={mechanic.name} color={mechanic.color} size={24} />
              <span className="text-sm font-bold text-white">{mechanic.name}</span>
              <span className="text-xs text-gray-500">·</span>
              <span className="text-xs text-gray-400">{d.day}, {d.date} {d.month}</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5"><MdClose size={18} /></button>
        </div>

        <div className="px-5 py-4 space-y-4">
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
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Catatan (opsional)</label>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="misal: gantikan shift Budi, lembur proyek X..."
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl text-xs text-gray-300 outline-none resize-none transition-all focus:ring-2 focus:ring-green-500/20"
              style={{ background: 'rgba(11,59,46,0.5)', border: '1px solid rgba(34,197,94,0.15)' }} />
          </div>
        </div>

        <div className="flex items-center gap-2 px-5 py-4" style={{ borderTop: '1px solid rgba(34,197,94,0.1)' }}>
          {entry?.shiftId && (
            <>
              {showConfirm ? (
                <div className="flex gap-2">
                  <button onClick={confirmDelete} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500 text-white">Hapus</button>
                  <button onClick={() => setShowConfirm(false)} className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:bg-white/5">Batal</button>
                </div>
              ) : (
                <button onClick={handleDeleteClick} className="w-9 h-9 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-500/15 transition-all flex-shrink-0">
                  <MdDelete size={16} />
                </button>
              )}
            </>
          )}
          <button onClick={onClose} className="flex-1 py-2 rounded-xl text-sm text-gray-400 transition-all hover:bg-white/5" style={{ border: '1px solid rgba(34,197,94,0.12)' }}>Batal</button>
          <button onClick={() => onSave({ shiftId, note })} className="flex-1 py-2 rounded-xl text-sm font-bold text-black transition-all hover:opacity-90" style={{ background: 'linear-gradient(90deg,#22C55E,#16a34a)' }}>
            <MdCheck size={14} className="inline mr-1" />Simpan
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal Bulk Assign (Pengaturan Shift Massal) ─────────────────────
function BulkAssignModal({ weekDates, mechanics, onClose, onAssign }) {
  const [selectedMechanics, setSelectedMechanics] = useState([])
  const [shiftId, setShiftId] = useState('pagi')
  const [dateRange, setDateRange] = useState({ start: weekDates[0], end: weekDates[6] })
  const [note, setNote] = useState('')
  const [selectAll, setSelectAll] = useState(false)

  const availableDates = weekDates.filter(date => date >= dateRange.start && date <= dateRange.end)
  const totalAssignments = selectedMechanics.length * availableDates.length

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedMechanics([])
    } else {
      setSelectedMechanics(mechanics.map(m => m.id))
    }
    setSelectAll(!selectAll)
  }

  const handleAssign = () => {
    if (selectedMechanics.length === 0) {
      alert('Pilih minimal 1 mekanik')
      return
    }
    if (availableDates.length === 0) {
      alert('Pilih rentang tanggal')
      return
    }
    onAssign({
      mechanicIds: selectedMechanics,
      shiftId,
      dates: availableDates,
      note
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#061a14,#0a2e1e)', border: '1px solid rgba(34,197,94,0.2)', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(34,197,94,0.1)' }}>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Bulk Assign Shift</p>
            <h3 className="text-sm font-bold text-white">Atur Shift Massal</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5">
            <MdClose size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Pilih Shift */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">Tipe Shift</label>
            <div className="grid grid-cols-3 gap-2">
              {SHIFT_TYPES.map(s => (
                <button key={s.id} onClick={() => setShiftId(s.id)}
                  className="rounded-xl py-2 px-2 text-center transition-all"
                  style={{
                    background: shiftId === s.id ? s.bg : 'rgba(11,59,46,0.3)',
                    border: shiftId === s.id ? `1.5px solid ${s.color}60` : '1px solid rgba(34,197,94,0.08)',
                  }}>
                  <p className="text-xs font-bold" style={{ color: shiftId === s.id ? s.color : '#6B7280' }}>{s.label}</p>
                  {s.time !== '—' && <p className="text-[10px] mt-0.5" style={{ color: shiftId === s.id ? s.color + 'aa' : '#374151' }}>{s.time}</p>}
                </button>
              ))}
            </div>
          </div>

          {/* Pilih Rentang Tanggal */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">Rentang Tanggal</label>
            <div className="flex gap-2">
              <select 
                value={dateRange.start} 
                onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                className="flex-1 text-xs text-gray-300 px-3 py-2 rounded-xl outline-none"
                style={{ background: 'rgba(11,59,46,0.5)', border: '1px solid rgba(34,197,94,0.12)' }}>
                {weekDates.map(date => {
                  const d = fmt(date)
                  return <option key={date} value={date}>{d.day}, {d.date} {d.month}</option>
                })}
              </select>
              <span className="text-gray-500 text-xs self-center">s/d</span>
              <select 
                value={dateRange.end} 
                onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                className="flex-1 text-xs text-gray-300 px-3 py-2 rounded-xl outline-none"
                style={{ background: 'rgba(11,59,46,0.5)', border: '1px solid rgba(34,197,94,0.12)' }}>
                {weekDates.filter(date => date >= dateRange.start).map(date => {
                  const d = fmt(date)
                  return <option key={date} value={date}>{d.day}, {d.date} {d.month}</option>
                })}
              </select>
            </div>
            <p className="text-[10px] text-gray-500 mt-1.5">📅 {availableDates.length} hari terpilih</p>
          </div>

          {/* Pilih Mekanik */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs text-gray-500">Pilih Mekanik</label>
              <button onClick={handleSelectAll} className="text-[10px] text-green-500 hover:text-green-400">
                {selectAll ? 'Batal Pilih Semua' : 'Pilih Semua'}
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-xl p-2" 
              style={{ background: 'rgba(11,59,46,0.3)', border: '1px solid rgba(34,197,94,0.08)' }}>
              {mechanics.map(mech => (
                <label key={mech.id} className="flex items-center gap-2 p-1.5 rounded-lg cursor-pointer hover:bg-white/5">
                  <input 
                    type="checkbox" 
                    checked={selectedMechanics.includes(mech.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMechanics([...selectedMechanics, mech.id])
                      } else {
                        setSelectedMechanics(selectedMechanics.filter(id => id !== mech.id))
                      }
                      setSelectAll(false)
                    }}
                    className="w-3.5 h-3.5 rounded accent-green-500"
                  />
                  <Avatar name={mech.name} color={mech.color} size={24} />
                  <span className="text-xs text-gray-300">{mech.name}</span>
                </label>
              ))}
            </div>
            <p className="text-[10px] text-gray-500 mt-1.5">👥 {selectedMechanics.length} mekanik terpilih</p>
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Catatan (opsional)</label>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="misal: shift khusus proyek A..."
              rows={2}
              className="w-full px-3 py-2 rounded-xl text-xs text-gray-300 outline-none resize-none"
              style={{ background: 'rgba(11,59,46,0.5)', border: '1px solid rgba(34,197,94,0.15)' }} />
          </div>

          {/* Ringkasan */}
          <div className="rounded-xl p-3" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Total assignment:</span>
              <span className="text-white font-bold">{totalAssignments} slot</span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-gray-400">Shift:</span>
              <span className="text-green-400">{SHIFT_TYPES.find(s => s.id === shiftId)?.label}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 px-5 py-4" style={{ borderTop: '1px solid rgba(34,197,94,0.1)' }}>
          <button onClick={onClose} className="flex-1 py-2 rounded-xl text-sm text-gray-400 transition-all hover:bg-white/5" style={{ border: '1px solid rgba(34,197,94,0.12)' }}>Batal</button>
          <button onClick={handleAssign} className="flex-1 py-2 rounded-xl text-sm font-bold text-black transition-all hover:opacity-90" style={{ background: 'linear-gradient(90deg,#22C55E,#16a34a)' }}>
            <MdCheck size={14} className="inline mr-1" />Assign ke {selectedMechanics.length} Mekanik
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
function WeeklySummary({ mechanicId, entries, weekDates }) {
  const myEntries = entries.filter(e => e.mechanicId === mechanicId && weekDates.includes(e.date))
  const counts = SHIFT_TYPES.reduce((acc, s) => {
    acc[s.id] = myEntries.filter(e => e.shiftId === s.id).length
    return acc
  }, {})
  const workDays = (counts.pagi || 0) + (counts.siang || 0) + (counts.sore || 0) + (counts.lembur || 0)
  const warnings = []
  if (counts.lembur > 2) warnings.push('lembur >2x')
  if (workDays === 7 && counts.libur === 0 && counts.cuti === 0) warnings.push('no day off')
  
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-600">{workDays} hari kerja</span>
      {counts.lembur > 0 && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(251,146,60,0.12)', color: '#FB923C' }}>+{counts.lembur} lembur</span>}
      {counts.libur > 0 && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>{counts.libur} libur</span>}
      {counts.cuti > 0 && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(167,139,250,0.12)', color: '#A78BFA' }}>{counts.cuti} cuti</span>}
      {warnings.length > 0 && <MdWarning size={14} className="text-orange-500" title={warnings.join(', ')} />}
    </div>
  )
}

// ─── Komponen Ringkasan Cuti ─────────────────────────────────────────
function LeaveSummary({ mechanics, weekDates, getEntry }) {
  const cutiList = mechanics.filter(mech => 
    weekDates.some(date => getEntry(mech.id, date)?.shiftId === 'cuti')
  )
  const liburList = mechanics.filter(mech => 
    weekDates.some(date => getEntry(mech.id, date)?.shiftId === 'libur')
  )
  const lemburList = mechanics.filter(mech => 
    weekDates.some(date => getEntry(mech.id, date)?.shiftId === 'lembur')
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 px-5 py-3" style={{ borderBottom: '1px solid rgba(34,197,94,0.08)' }}>
      <div className="rounded-xl p-3" style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.15)' }}>
        <div className="flex items-center gap-2 mb-2">
          <MdEventBusy size={16} className="text-purple-400" />
          <span className="text-xs font-semibold text-purple-300">Mekanik Cuti</span>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300">{cutiList.length}</span>
        </div>
        {cutiList.length === 0 ? (
          <p className="text-xs text-gray-500">Tidak ada mekanik cuti</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {cutiList.map(mech => {
              const cutiDates = weekDates.filter(date => getEntry(mech.id, date)?.shiftId === 'cuti')
              return (
                <span key={mech.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(167,139,250,0.15)', color: '#A78BFA' }}>
                  {mech.name}
                  <span className="text-gray-500 text-[10px]">({cutiDates.length} hr)</span>
                </span>
              )
            })}
          </div>
        )}
      </div>

      <div className="rounded-xl p-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
        <div className="flex items-center gap-2 mb-2">
          <MdEventBusy size={16} className="text-red-400" />
          <span className="text-xs font-semibold text-red-300">Mekanik Libur</span>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-300">{liburList.length}</span>
        </div>
        {liburList.length === 0 ? (
          <p className="text-xs text-gray-500">Tidak ada mekanik libur</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {liburList.map(mech => {
              const liburDates = weekDates.filter(date => getEntry(mech.id, date)?.shiftId === 'libur')
              return (
                <span key={mech.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444' }}>
                  {mech.name}
                  <span className="text-gray-500 text-[10px]">({liburDates.length} hr)</span>
                </span>
              )
            })}
          </div>
        )}
      </div>

      <div className="rounded-xl p-3" style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.15)' }}>
        <div className="flex items-center gap-2 mb-2">
          <MdAccessTime size={16} className="text-orange-400" />
          <span className="text-xs font-semibold text-orange-300">Mekanik Lembur</span>
          <span className="text-xs px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300">{lemburList.length}</span>
        </div>
        {lemburList.length === 0 ? (
          <p className="text-xs text-gray-500">Tidak ada mekanik lembur</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {lemburList.map(mech => {
              const lemburDates = weekDates.filter(date => getEntry(mech.id, date)?.shiftId === 'lembur')
              return (
                <span key={mech.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" style={{ background: 'rgba(251,146,60,0.15)', color: '#FB923C' }}>
                  {mech.name}
                  <span className="text-gray-500 text-[10px]">({lemburDates.length} hr)</span>
                </span>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Halaman Utama ────────────────────────────────────────────────────
const STORAGE_KEY = 'mechanic_schedules'

export default function MechanicSchedule() {
  const today = new Date().toISOString().slice(0, 10)
  const [currentWeekBase, setCurrentWeekBase] = useState(today)
  const [filterMechanic, setFilterMechanic] = useState('Semua')
  const [filterStatus, setFilterStatus] = useState('semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [editTarget, setEditTarget] = useState(null)
  const [view, setView] = useState('week')
  const [currentPage, setCurrentPage] = useState(1)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const itemsPerPage = 10

  const weekDates = useMemo(() => getWeekDates(currentWeekBase), [currentWeekBase])

  const [schedules, setSchedules] = useState(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.weekKey === currentWeekBase && Array.isArray(parsed.data)) {
          return parsed.data
        }
      } catch (e) {}
    }
    return buildDefaultSchedule(weekDates, mechanicsData)
  })

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
      weekKey: currentWeekBase,
      data: schedules
    }))
  }, [schedules, currentWeekBase])

  useEffect(() => {
    setSchedules(prev => {
      const existingIds = new Set(prev.map(e => e.id))
      const newEntries = []
      mechanicsData.forEach(m => {
        weekDates.forEach(date => {
          const id = `${m.id}-${date}`
          if (!existingIds.has(id)) {
            newEntries.push({ id, mechanicId: m.id, date, shiftId: null, note: '' })
          }
        })
      })
      if (newEntries.length === 0) return prev
      return [...prev, ...newEntries]
    })
  }, [weekDates])

  const prevWeek = () => {
    const d = new Date(weekDates[0]); d.setDate(d.getDate() - 7)
    setCurrentWeekBase(d.toISOString().slice(0, 10))
  }
  const nextWeek = () => {
    const d = new Date(weekDates[0]); d.setDate(d.getDate() + 7)
    setCurrentWeekBase(d.toISOString().slice(0, 10))
  }
  const goToday = () => setCurrentWeekBase(today)

  const getEntry = useCallback((mechanicId, date) => {
    return schedules.find(e => e.mechanicId === mechanicId && e.date === date) || { id: `${mechanicId}-${date}`, mechanicId, date, shiftId: null, note: '' }
  }, [schedules])

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

  const handleBulkAssign = ({ mechanicIds, shiftId, dates, note }) => {
    setSchedules(prev => {
      const newSchedules = [...prev]
      mechanicIds.forEach(mechId => {
        dates.forEach(date => {
          const idx = newSchedules.findIndex(e => e.mechanicId === mechId && e.date === date)
          if (idx >= 0) {
            newSchedules[idx] = { ...newSchedules[idx], shiftId, note }
          }
        })
      })
      return newSchedules
    })
  }

  const copyPreviousWeek = useCallback(() => {
    const prevWeekBase = new Date(weekDates[0])
    prevWeekBase.setDate(prevWeekBase.getDate() - 7)
    const prevWeekDates = getWeekDates(prevWeekBase.toISOString().slice(0, 10))
    
    setSchedules(prev => {
      const newSchedules = [...prev]
      mechanicsData.forEach(mech => {
        weekDates.forEach((date, idx) => {
          const prevDate = prevWeekDates[idx]
          const prevEntry = prev.find(e => e.mechanicId === mech.id && e.date === prevDate)
          if (prevEntry && prevEntry.shiftId) {
            const targetIdx = newSchedules.findIndex(e => e.mechanicId === mech.id && e.date === date)
            if (targetIdx >= 0) {
              newSchedules[targetIdx] = { ...newSchedules[targetIdx], shiftId: prevEntry.shiftId, note: prevEntry.note }
            }
          }
        })
      })
      return newSchedules
    })
  }, [weekDates])

  const autoGenerateSchedule = useCallback(() => {
    const shifts = ['pagi', 'siang', 'sore']
    setSchedules(prev => {
      const newSchedules = [...prev]
      weekDates.forEach(date => {
        const availableMechanics = [...mechanicsData]
        for (let i = availableMechanics.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [availableMechanics[i], availableMechanics[j]] = [availableMechanics[j], availableMechanics[i]]
        }
        let assigned = 0
        for (const mech of availableMechanics) {
          if (assigned >= DAILY_REQUIREMENT + 2) break
          const shiftId = shifts[assigned % shifts.length]
          const idx = newSchedules.findIndex(e => e.mechanicId === mech.id && e.date === date)
          if (idx >= 0 && !newSchedules[idx].shiftId) {
            newSchedules[idx] = { ...newSchedules[idx], shiftId, note: 'Auto-generated' }
            assigned++
          }
        }
      })
      return newSchedules
    })
  }, [weekDates])

  const exportToCSV = useCallback(() => {
    const headers = ['Mekanik', ...weekDates.map(d => fmt(d).day + ' ' + d.slice(5))]
    const rows = mechanicsData.map(mech => {
      const row = [mech.name]
      weekDates.forEach(date => {
        const entry = getEntry(mech.id, date)
        const shift = SHIFT_TYPES.find(s => s.id === entry?.shiftId)
        row.push(shift ? `${shift.label}${entry?.note ? ' (' + entry.note + ')' : ''}` : '-')
      })
      return row
    })
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `jadwal_mekanik_${weekDates[0]}_to_${weekDates[6]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [weekDates, getEntry])

  const printSchedule = useCallback(() => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Mohon izinkan popup untuk mencetak')
      return
    }
    
    const weekRange = `${fmt(weekDates[0]).date} ${fmt(weekDates[0]).month} - ${fmt(weekDates[6]).date} ${fmt(weekDates[6]).month}`
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head><title>Jadwal Mekanik - ${weekRange}</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 20px; background: white; }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 2px solid #22C55E; }
        .header h1 { margin: 0; color: #1a1a1a; }
        .header p { margin: 5px 0 0; color: #666; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px 8px; text-align: center; vertical-align: top; }
        th { background-color: #f5f5f5; font-weight: bold; }
        .mechanic-name { text-align: left; font-weight: bold; background-color: #fafafa; }
        .shift-pagi { background-color: rgba(34,197,94,0.1); }
        .shift-siang { background-color: rgba(96,165,250,0.1); }
        .shift-sore { background-color: rgba(251,191,36,0.1); }
        .shift-libur { background-color: rgba(239,68,68,0.1); }
        .shift-cuti { background-color: rgba(167,139,250,0.1); }
        .shift-lembur { background-color: rgba(251,146,60,0.1); }
        .note { font-size: 10px; color: #666; margin-top: 4px; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #999; }
        @media print { body { margin: 0; padding: 15px; } button { display: none; } .no-print { display: none; } }
      </style>
      </head>
      <body>
        <div class="header"><h1>Jadwal Mekanik</h1><p>Minggu: ${weekRange}</p></div>
        <table>
          <thead><tr><th>Mekanik</th><th>Senin</th><th>Selasa</th><th>Rabu</th><th>Kamis</th><th>Jumat</th><th>Sabtu</th><th>Minggu</th></tr></thead>
          <tbody>`
    
    mechanicsData.forEach(mech => {
      html += `<tr><td class="mechanic-name">${mech.name}<br><small>${mech.specialty || ''}</small></td>`
      weekDates.forEach(date => {
        const entry = getEntry(mech.id, date)
        const shift = SHIFT_TYPES.find(s => s.id === entry?.shiftId)
        const shiftClass = shift ? `shift-${shift.id}` : ''
        html += `<td class="${shiftClass}"><strong>${shift ? shift.label : '—'}</strong><br>${shift?.time !== '—' ? `<small>${shift?.time || ''}</small><br>` : ''}${entry?.note ? `<div class="note">📝 ${entry.note}</div>` : ''}</td>`
      })
      html += `</tr>`
    })
    
    html += `</tbody></table><div class="footer">Dicetak pada: ${new Date().toLocaleString('id-ID')}</div>
        <div class="no-print" style="text-align:center; margin-top:20px;">
          <button onclick="window.print()" style="padding:8px 16px;">🖨️ Cetak</button>
          <button onclick="window.close()" style="padding:8px 16px; margin-left:10px;">Tutup</button>
        </div>
        <script>window.onload = function() { setTimeout(() => { window.print(); }, 500); }</script>
      </body>
      </html>
    `
    printWindow.document.write(html)
    printWindow.document.close()
  }, [weekDates, getEntry])

  const filteredMechanics = useMemo(() => {
    let filtered = filterMechanic === 'Semua'
      ? mechanicsData
      : mechanicsData.filter(m => m.id === filterMechanic)
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(m => m.name.toLowerCase().includes(query))
    }
    
    if (filterStatus !== 'semua') {
      filtered = filtered.filter(mech => {
        return weekDates.some(date => {
          const entry = getEntry(mech.id, date)
          return entry?.shiftId === filterStatus
        })
      })
    }
    
    return filtered
  }, [filterMechanic, searchQuery, filterStatus, weekDates, getEntry])

  const totalPages = Math.ceil(filteredMechanics.length / itemsPerPage)
  const paginatedMechanics = filteredMechanics.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => setCurrentPage(1), [filterMechanic, searchQuery, filterStatus])

  const startFmt = fmt(weekDates[0])
  const endFmt = fmt(weekDates[6])
  const rangeLabel = startFmt.month === endFmt.month
    ? `${startFmt.date} – ${endFmt.date} ${endFmt.month}`
    : `${startFmt.date} ${startFmt.month} – ${endFmt.date} ${endFmt.month}`

  const weekEntries = schedules.filter(e => weekDates.includes(e.date))
  const totalWorkSlots = weekEntries.filter(e => e.shiftId && e.shiftId !== 'libur' && e.shiftId !== 'cuti').length
  const totalLibur = weekEntries.filter(e => e.shiftId === 'libur').length
  const totalLembur = weekEntries.filter(e => e.shiftId === 'lembur').length
  const availToday = mechanicsData.filter(m => {
    const e = getEntry(m.id, today)
    return e.shiftId && e.shiftId !== 'libur' && e.shiftId !== 'cuti'
  }).length

  const dailyCoverages = useMemo(() => {
    return weekDates.map(date => getDailyCoverage(weekEntries, date))
  }, [weekEntries, weekDates])

  return (
    <div className="page-animate">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Jadwal Mekanik</h1>
          <p className="text-sm text-gray-500 mt-0.5">Atur ketersediaan & shift mingguan ({mechanicsData.length} mekanik)</p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Stat Cards */}
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

      {/* Main Card */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(6,28,20,0.8)', border: '1px solid rgba(34,197,94,0.12)', backdropFilter: 'blur(6px)' }}>

        {/* Navigation & Filters */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 px-5 py-4"
          style={{ borderBottom: '1px solid rgba(34,197,94,0.1)' }}>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={prevWeek} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/8 transition-all" style={{ border: '1px solid rgba(34,197,94,0.1)' }}><MdChevronLeft size={18} /></button>
            <div className="text-center px-2"><p className="text-white font-bold text-sm">{rangeLabel}</p></div>
            <button onClick={nextWeek} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/8 transition-all" style={{ border: '1px solid rgba(34,197,94,0.1)' }}><MdChevronRight size={18} /></button>
            <button onClick={goToday} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80" style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>Hari Ini</button>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl" style={{ background: 'rgba(11,59,46,0.5)', border: '1px solid rgba(34,197,94,0.12)' }}>
              <MdSearch size={14} className="text-gray-500" />
              <input type="text" placeholder="Cari mekanik..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent text-xs text-gray-300 outline-none w-32" />
            </div>
            
            <div className="flex items-center gap-1">
              <MdFilterList size={14} className="text-gray-500" />
              <select value={filterMechanic} onChange={e => setFilterMechanic(e.target.value)} className="text-xs text-gray-300 px-3 py-1.5 rounded-xl outline-none" style={{ background: 'rgba(11,59,46,0.5)', border: '1px solid rgba(34,197,94,0.12)' }}>
                <option value="Semua">Semua Mekanik ({mechanicsData.length})</option>
                {mechanicsData.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-xs text-gray-300 px-3 py-1.5 rounded-xl outline-none" style={{ background: 'rgba(11,59,46,0.5)', border: '1px solid rgba(34,197,94,0.12)' }}>
                <option value="semua">Semua Shift</option>
                <option value="cuti">✈️ Cuti</option>
                <option value="libur">📆 Libur</option>
                <option value="lembur">⚡ Lembur</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 px-5 py-3" style={{ borderBottom: '1px solid rgba(34,197,94,0.08)' }}>
          <button onClick={copyPreviousWeek} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02]" style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>
            <MdContentCopy size={12} /> Salin Minggu Lalu
          </button>
          <button onClick={autoGenerateSchedule} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02]" style={{ background: 'rgba(96,165,250,0.1)', color: '#60A5FA', border: '1px solid rgba(96,165,250,0.2)' }}>
            <MdAutoAwesome size={12} /> Generate Otomatis
          </button>
          <button onClick={() => setShowBulkModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02]" style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }}>
            <MdPeople size={12} /> Bulk Assign Shift
          </button>
          <button onClick={exportToCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02]" style={{ background: 'rgba(139,92,246,0.1)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.2)' }}>
            <MdFileDownload size={12} /> Export Excel
          </button>
          <button onClick={printSchedule} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02]" style={{ background: 'rgba(251,191,36,0.1)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.2)' }}>
            <MdPrint size={12} /> Cetak
          </button>
        </div>

        {/* Leave Summary */}
        <LeaveSummary mechanics={mechanicsData} weekDates={weekDates} getEntry={getEntry} />

        {/* Week View */}
        {view === 'week' && (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 800 }}>
              <thead>
                <tr>
                  <th className="text-left px-4 py-3 w-48" style={{ borderBottom: '1px solid rgba(34,197,94,0.08)' }}><span className="text-xs text-gray-600">Mekanik</span></th>
                  {weekDates.map((date, idx) => {
                    const d = fmt(date)
                    const today_ = isToday(date)
                    const coverage = dailyCoverages[idx]
                    return (
                      <th key={date} className="px-2 py-3 text-center" style={{ borderBottom: '1px solid rgba(34,197,94,0.08)', minWidth: 100 }}>
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs font-medium" style={{ color: today_ ? '#22C55E' : '#6B7280' }}>{d.day}</span>
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-black transition-all`}
                            style={today_ ? { background: '#22C55E', color: '#000' } : { color: '#D1D5DB' }}>{d.date}</span>
                          <div className="flex items-center gap-1 text-[10px]">
                            {coverage.isSufficient ? (
                              <span className="text-green-500">✓ {coverage.available}/{coverage.required}</span>
                            ) : (
                              <span className="text-orange-500">⚠ {coverage.available}/{coverage.required}</span>
                            )}
                          </div>
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {paginatedMechanics.map((mech, mi) => {
                  const mechEntries = schedules.filter(e => e.mechanicId === mech.id && weekDates.includes(e.date))
                  const lemburCount = mechEntries.filter(e => e.shiftId === 'lembur').length
                  const workDays = mechEntries.filter(e => e.shiftId && e.shiftId !== 'libur' && e.shiftId !== 'cuti').length
                  const hasWarning = lemburCount > 2 || workDays === 7
                  const isOnLeaveToday = weekDates.some(date => getEntry(mech.id, date)?.shiftId === 'cuti' && isToday(date))
                  
                  return (
                    <tr key={mech.id} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: mi < paginatedMechanics.length - 1 ? '1px solid rgba(34,197,94,0.05)' : 'none' }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={mech.name} color={mech.color} size={36} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-semibold text-white truncate">{mech.name}</p>
                              {isOnLeaveToday && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300">cuti</span>}
                              {hasWarning && <MdWarning size={12} className="text-orange-500" title={lemburCount > 2 ? 'Lembur >2x minggu ini' : 'Tidak ada hari libur'} />}
                            </div>
                            <p className="text-xs text-gray-600 truncate">{mech.specialty}</p>
                          </div>
                        </div>
                       </td>
                      {weekDates.map(date => {
                        const entry = getEntry(mech.id, date)
                        return (
                          <td key={date} className="px-1.5 py-2">
                            <ShiftCell entry={entry.shiftId ? entry : null} mechanic={mech} onEdit={() => handleEdit(entry, mech, date)} />
                            </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-green-500/10">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            )}
          </div>
        )}

        {/* List View */}
        {view === 'list' && (
          <div className="divide-y" style={{ borderColor: 'rgba(34,197,94,0.06)' }}>
            {paginatedMechanics.map(mech => (
              <div key={mech.id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar name={mech.name} color={mech.color} size={40} />
                    <div>
                      <p className="text-sm font-bold text-white">{mech.name}</p>
                      <p className="text-xs text-gray-600">{mech.specialty}</p>
                    </div>
                  </div>
                  <WeeklySummary mechanicId={mech.id} entries={schedules} weekDates={weekDates} />
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {weekDates.map(date => {
                    const entry = getEntry(mech.id, date)
                    const d = fmt(date)
                    const shift = SHIFT_TYPES.find(s => s.id === entry?.shiftId)
                    const today_ = isToday(date)
                    return (
                      <div key={date} onClick={() => handleEdit(entry, mech, date)}
                        className="rounded-xl p-2 text-center cursor-pointer transition-all hover:scale-[1.04]"
                        style={{
                          background: shift ? shift.bg : 'rgba(11,59,46,0.2)',
                          border: today_ ? `1.5px solid ${shift?.color || '#22C55E'}60` : `1px solid rgba(34,197,94,0.06)`,
                        }}>
                        <p className="text-xs mb-1" style={{ color: today_ ? '#22C55E' : '#6B7280' }}>{d.day}</p>
                        <p className="text-sm font-bold" style={{ color: shift ? shift.color : '#374151' }}>{d.date}</p>
                        <p className="text-xs mt-1 font-medium" style={{ color: shift ? shift.color + 'cc' : '#374151', fontSize: 10 }}>{shift ? shift.label : '—'}</p>
                        {entry?.note && <MdNotes size={8} className="mx-auto mt-0.5 text-gray-500" />}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
            {totalPages > 1 && (
              <div className="px-5 py-4 border-t border-green-500/10">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(34,197,94,0.08)' }}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs text-gray-600 mb-2">Keterangan shift:</p>
              <Legend />
            </div>
            <div className="text-xs text-gray-600">
              Kebutuhan per hari: minimal {DAILY_REQUIREMENT} mekanik
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
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

      {showBulkModal && (
        <BulkAssignModal
          weekDates={weekDates}
          mechanics={mechanicsData}
          onClose={() => setShowBulkModal(false)}
          onAssign={handleBulkAssign}
        />
      )}
    </div>
  )
}