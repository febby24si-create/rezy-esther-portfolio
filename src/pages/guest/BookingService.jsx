import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { layanan, availableTimeSlots } from '../../data/guestData'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import {
  MdArrowBack, MdArrowForward, MdCheckCircle,
  MdDirectionsCar, MdBuild, MdCalendarMonth, MdSend, MdAdd
} from 'react-icons/md'

const STEPS = ['Kendaraan', 'Layanan', 'Jadwal', 'Konfirmasi']

const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID')

function getNextDates(n = 14) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i + 1)
    return d
  })
}

function genOrderId() {
  return '#ORD-' + Math.random().toString(36).slice(2, 10).toUpperCase()
}

export default function BookingService() {
  const navigate = useNavigate()
  const { customer, addPoints } = useCustomerAuth()

  const [step, setStep]     = useState(0)
  const [loading, setLoading] = useState(false)
  const [done, setDone]     = useState(false)
  const [orderId, setOrderId] = useState('')
  const [addVehicleMode, setAddVehicleMode] = useState(false)
  const [newVehicle, setNewVehicle] = useState({ brand: '', model: '', year: '', plate: '', color: '', type: 'mobil', km: '' })

  const [form, setForm] = useState({
    vehicle: null,
    service: null,
    date:    null,
    time:    null,
    keluhan: '',
  })

  const dates         = getNextDates(14)
  const totalEstimate = form.service ? (form.service.hargaMulai + form.service.hargaMaks) / 2 : 0
  const vehicles      = customer?.vehicles || []

  const isStepValid = () => {
    if (step === 0) return !!form.vehicle
    if (step === 1) return !!form.service
    if (step === 2) return !!form.date && !!form.time
    return true
  }

  // ── Simpan booking ke localStorage ─────────────────────────
  const handleSubmit = () => {
    setLoading(true)
    const id = genOrderId()
    setOrderId(id)

    setTimeout(() => {
      // Simpan order ke garage_orders (dibaca admin & riwayat customer)
      const orders = JSON.parse(localStorage.getItem('garage_orders') || '[]')
      const newOrder = {
        id,
        customer:  customer.name,
        customerId: customer.id,
        vehicle:   `${form.vehicle.brand} ${form.vehicle.model} - ${form.vehicle.plate}`,
        service:   form.service.name,
        status:    'Menunggu Konfirmasi',
        total:     Math.round(totalEstimate),
        date:      form.date.toISOString().slice(0, 10),
        time:      form.time,
        mechanic:  '—',
        keluhan:   form.keluhan,
        createdAt: new Date().toISOString(),
      }
      localStorage.setItem('garage_orders', JSON.stringify([newOrder, ...orders]))

      // Tambah point ke customer (hanya setelah Selesai di realnya,
      // untuk demo kita tambah langsung saat booking)
      addPoints(id, totalEstimate, form.service.name)

      setLoading(false)
      setDone(true)
    }, 1800)
  }

  // ── Success Screen ──────────────────────────────────────────
  if (done) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center px-4" style={{ background: '#020f09' }}>
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.4)' }}>
            <MdCheckCircle className="text-green-400 text-4xl" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-2">Booking Berhasil!</h2>
          <p className="text-gray-400 text-sm mb-1">Nomor booking: <span className="text-green-400 font-bold">{orderId}</span></p>
          <p className="text-gray-500 text-xs mb-2">Konfirmasi akan dikirim via WhatsApp ke nomor terdaftar.</p>

          {/* Point earned info */}
          <div className="my-4 p-3 rounded-xl text-sm inline-flex items-center gap-2 text-yellow-400"
            style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
            ⭐ +{Math.floor(totalEstimate / 1000)} poin loyalty telah ditambahkan!
          </div>

          <div className="rounded-xl p-4 mb-6 text-left space-y-2.5"
            style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }}>
            {[
              { label: 'Kendaraan', value: `${form.vehicle?.brand} ${form.vehicle?.model} ${form.vehicle?.year}` },
              { label: 'Plat',      value: form.vehicle?.plate },
              { label: 'Layanan',   value: form.service?.name },
              { label: 'Tanggal',   value: form.date?.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }) },
              { label: 'Jam',       value: form.time },
              { label: 'Est. Biaya',value: fmt(totalEstimate) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-400">{label}</span>
                <span className="text-white font-medium">{value}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => navigate('/guest/tracking')}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-green-400 transition-all"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
              Pantau Status
            </button>
            <button onClick={() => navigate('/guest/dashboard')}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 min-h-screen px-4 sm:px-6" style={{ background: '#020f09' }}>
      <div className="max-w-3xl mx-auto py-10">
        <h1 className="text-2xl font-extrabold text-white mb-2">Booking Service Online</h1>
        <p className="text-gray-400 text-sm mb-8">Isi form berikut untuk menjadwalkan servis kendaraan Anda.</p>

        {/* Step indicator */}
        <div className="flex items-center mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  i < step  ? 'bg-green-500 text-white'
                  : i === step ? 'text-green-400 border-2 border-green-500'
                  : 'text-gray-500 border border-white/10'
                }`} style={i < step || i === step ? {} : { background: 'rgba(255,255,255,0.05)' }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs mt-1 font-medium hidden sm:block ${i === step ? 'text-green-400' : i < step ? 'text-gray-300' : 'text-gray-600'}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-green-500/50' : 'bg-white/8'}`} />
              )}
            </div>
          ))}
        </div>

        {/* ── Step 0: Pilih Kendaraan ─────────────────────── */}
        {step === 0 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <MdDirectionsCar className="text-green-400" /> Pilih Kendaraan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {vehicles.map((v) => (
                <button key={v.id} onClick={() => setForm(f => ({ ...f, vehicle: v }))}
                  className={`p-5 rounded-2xl border text-left transition-all ${
                    form.vehicle?.id === v.id
                      ? 'border-green-500/60 bg-green-500/10'
                      : 'border-white/8 bg-white/3 hover:border-green-500/30 hover:bg-white/5'
                  }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{v.type === 'motor' ? '🏍️' : '🚗'}</span>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">{v.brand} {v.model} {v.year}</p>
                      <p className="text-gray-400 text-xs">{v.plate} · {v.color}</p>
                    </div>
                    {form.vehicle?.id === v.id && <MdCheckCircle className="text-green-400 text-xl ml-auto" />}
                  </div>
                  <p className="text-xs text-gray-500">KM: {Number(v.km || 0).toLocaleString('id-ID')} · Servis terakhir: {v.lastService ? new Date(v.lastService).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '—'}</p>
                </button>
              ))}

              {/* Tambah kendaraan baru */}
              {!addVehicleMode ? (
                <button onClick={() => setAddVehicleMode(true)}
                  className="p-5 rounded-2xl border border-dashed border-white/15 hover:border-green-500/30 text-gray-400 hover:text-green-400 transition-all text-sm flex flex-col items-center justify-center gap-2">
                  <MdAdd className="text-2xl" />
                  <span>Tambah Kendaraan Baru</span>
                </button>
              ) : (
                <div className="p-4 rounded-2xl border border-green-500/25 bg-green-500/5 col-span-full">
                  <p className="text-green-400 font-semibold text-sm mb-3">Kendaraan Baru</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'brand', placeholder: 'Merk (Toyota, Honda...)' },
                      { key: 'model', placeholder: 'Model (Avanza, Beat...)' },
                      { key: 'year',  placeholder: 'Tahun (2020)'            },
                      { key: 'plate', placeholder: 'Plat Nomor (B 1234 AB)'  },
                    ].map(({ key, placeholder }) => (
                      <input key={key} value={newVehicle[key]} onChange={e => setNewVehicle(nv => ({ ...nv, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="px-3 py-2 rounded-lg text-sm text-white outline-none"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                    ))}
                    <select value={newVehicle.type} onChange={e => setNewVehicle(nv => ({ ...nv, type: e.target.value }))}
                      className="px-3 py-2 rounded-lg text-sm text-white outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }}>
                      <option value="mobil">Mobil</option>
                      <option value="motor">Motor</option>
                    </select>
                    <input value={newVehicle.km} onChange={e => setNewVehicle(nv => ({ ...nv, km: e.target.value }))}
                      placeholder="KM saat ini"
                      className="px-3 py-2 rounded-lg text-sm text-white outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => {
                      if (!newVehicle.brand || !newVehicle.plate) return
                      const v = { id: 'V-' + Date.now(), ...newVehicle, lastService: null, nextService: null }
                      setForm(f => ({ ...f, vehicle: v }))
                      setAddVehicleMode(false)
                    }} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.3)' }}>
                      Gunakan
                    </button>
                    <button onClick={() => setAddVehicleMode(false)} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white">Batal</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Step 1: Pilih Layanan ──────────────────────── */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <MdBuild className="text-green-400" /> Pilih Layanan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {layanan.map((l) => (
                <button key={l.id} onClick={() => setForm(f => ({ ...f, service: l }))}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    form.service?.id === l.id
                      ? 'border-green-500/60 bg-green-500/10'
                      : 'border-white/8 bg-white/3 hover:border-green-500/30'
                  }`}>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xl">{l.icon}</span>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">{l.name}</p>
                      <p className="text-gray-500 text-xs">{fmt(l.hargaMulai)} – {fmt(l.hargaMaks)}</p>
                    </div>
                    {form.service?.id === l.id && <MdCheckCircle className="text-green-400 text-lg" />}
                  </div>
                  <p className="text-gray-400 text-xs pl-8">⏱ {l.durasi}</p>
                </button>
              ))}
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Keluhan Kendaraan (opsional)</label>
              <textarea value={form.keluhan} onChange={e => setForm(f => ({ ...f, keluhan: e.target.value }))}
                placeholder="Ceritakan keluhan kendaraan Anda..." rows={3}
                className="w-full border border-white/10 focus:border-green-500/40 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none resize-none transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)' }} />
            </div>
          </div>
        )}

        {/* ── Step 2: Pilih Jadwal ───────────────────────── */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <MdCalendarMonth className="text-green-400" /> Pilih Tanggal & Jam
            </h2>
            <p className="text-gray-400 text-sm mb-3">Tanggal Servis</p>
            <div className="flex gap-2 overflow-x-auto pb-3 mb-6" style={{ scrollbarWidth: 'none' }}>
              {dates.map((d) => {
                const isSelected = form.date?.toDateString() === d.toDateString()
                const isSunday   = d.getDay() === 0
                return (
                  <button key={d.toDateString()} disabled={isSunday}
                    onClick={() => setForm(f => ({ ...f, date: d }))}
                    className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-xl border text-center w-16 transition-all ${
                      isSunday   ? 'opacity-30 cursor-not-allowed border-white/5'
                      : isSelected ? 'border-green-500/60 bg-green-500/15 text-green-400'
                      : 'border-white/8 bg-white/3 hover:border-green-500/30 text-gray-300'
                    }`}>
                    <span className="text-xs font-medium">{d.toLocaleDateString('id-ID', { weekday: 'short' })}</span>
                    <span className="text-lg font-extrabold leading-tight">{d.getDate()}</span>
                    <span className="text-xs">{d.toLocaleDateString('id-ID', { month: 'short' })}</span>
                  </button>
                )
              })}
            </div>
            <p className="text-gray-400 text-sm mb-3">Jam Servis</p>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {availableTimeSlots.map((t) => (
                <button key={t} onClick={() => setForm(f => ({ ...f, time: t }))}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    form.time === t
                      ? 'border-green-500/60 bg-green-500/15 text-green-400'
                      : 'border-white/8 bg-white/3 hover:border-green-500/30 text-gray-300'
                  }`}>{t}</button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 3: Konfirmasi ────────────────────────── */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <MdCheckCircle className="text-green-400" /> Ringkasan Booking
            </h2>
            <div className="rounded-2xl p-6 mb-5 space-y-3.5"
              style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.12)' }}>
              {[
                { label: 'Atas Nama',   value: customer?.name },
                { label: 'Kendaraan',   value: `${form.vehicle?.brand} ${form.vehicle?.model} ${form.vehicle?.year}` },
                { label: 'Plat Nomor',  value: form.vehicle?.plate },
                { label: 'Layanan',     value: form.service?.name },
                { label: 'Tanggal',     value: form.date?.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
                { label: 'Jam',         value: form.time },
                { label: 'Est. Durasi', value: form.service?.durasi },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">{label}</span>
                  <span className="text-white text-sm font-medium">{value}</span>
                </div>
              ))}
              {form.keluhan && (
                <div className="border-t border-white/5 pt-3">
                  <p className="text-gray-400 text-sm mb-1">Keluhan:</p>
                  <p className="text-gray-300 text-sm">{form.keluhan}</p>
                </div>
              )}
              <div className="border-t border-white/5 pt-3 flex items-center justify-between">
                <span className="text-gray-300 font-semibold">Estimasi Biaya</span>
                <div className="text-right">
                  <p className="text-green-400 font-extrabold text-lg">{fmt(totalEstimate)}</p>
                  <p className="text-gray-600 text-xs">{fmt(form.service?.hargaMulai)} – {fmt(form.service?.hargaMaks)}</p>
                </div>
              </div>
            </div>

            {/* Point preview */}
            <div className="p-4 rounded-xl mb-4 flex items-center gap-3 text-sm"
              style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}>
              <span className="text-2xl">⭐</span>
              <div>
                <p className="text-yellow-400 font-semibold">Estimasi +{Math.floor(totalEstimate / 1000)} poin loyalty</p>
                <p className="text-gray-400 text-xs">1 poin per Rp 1.000 transaksi</p>
              </div>
            </div>

            <div className="p-4 rounded-xl text-sm text-blue-300"
              style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
              ℹ️ Estimasi biaya dapat berubah tergantung kondisi aktual kendaraan. Konfirmasi harga final diberikan mekanik sebelum pengerjaan.
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button onClick={() => step > 0 && setStep(s => s - 1)} disabled={step === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium">
            <MdArrowBack /> Kembali
          </button>
          {step < 3 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!isStepValid()}
              className="flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm shadow-lg shadow-green-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)' }}>
              Lanjut <MdArrowForward />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading}
              className="flex items-center gap-2 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm shadow-lg shadow-green-500/25 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)' }}>
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Memproses...</>
              ) : (
                <><MdSend /> Konfirmasi Booking</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}