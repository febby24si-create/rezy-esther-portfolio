import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { layanan, myVehicles, availableTimeSlots } from '../../data/guestData'
import { MdArrowBack, MdArrowForward, MdCheckCircle, MdDirectionsCar, MdBuild, MdCalendarMonth, MdAccessTime, MdSend } from 'react-icons/md'

const STEPS = ['Kendaraan', 'Layanan', 'Jadwal', 'Konfirmasi']

function formatRupiah(n) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

// ── Helper: generate 14 hari ke depan ──────────────────────
function getNextDates(n = 14) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1)
    return d
  })
}

export default function BookingService() {
  const navigate  = useNavigate()
  const [step, setStep]       = useState(0)
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)

  const [form, setForm] = useState({
    vehicle: null,
    service: null,
    date: null,
    time: null,
    keluhan: '',
    photo: null,
  })

  const dates = getNextDates(14)

  const totalEstimate = form.service
    ? (form.service.hargaMulai + form.service.hargaMaks) / 2
    : 0

  const isStepValid = () => {
    if (step === 0) return !!form.vehicle
    if (step === 1) return !!form.service
    if (step === 2) return !!form.date && !!form.time
    return true
  }

  const handleSubmit = () => {
    setLoading(true)
    setTimeout(() => { setLoading(false); setDone(true) }, 1800)
  }

  if (done) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center px-4" style={{ background: '#020f09' }}>
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center mx-auto mb-6">
            <MdCheckCircle className="text-green-400 text-4xl" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-3">Booking Berhasil!</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-2">
            Booking <span className="text-green-400 font-bold">#ORD-{Math.random().toString(36).substr(2,8).toUpperCase()}</span> telah kami terima.
          </p>
          <p className="text-gray-500 text-xs mb-8">Konfirmasi akan dikirim via WhatsApp ke nomor terdaftar Anda.</p>
          <div className="rounded-xl p-4 mb-6 text-left space-y-2.5"
            style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }}>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Kendaraan</span>
              <span className="text-white font-medium">{form.vehicle?.brand} {form.vehicle?.model}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Layanan</span>
              <span className="text-white font-medium">{form.service?.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Tanggal</span>
              <span className="text-white font-medium">{form.date?.toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long' })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Jam</span>
              <span className="text-white font-medium">{form.time}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-white/5 pt-2.5">
              <span className="text-gray-400">Estimasi Biaya</span>
              <span className="text-green-400 font-bold">{formatRupiah(totalEstimate)}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/guest/tracking')}
              className="flex-1 bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 text-green-400 font-semibold py-3 rounded-xl text-sm transition-all">
              Pantau Status
            </button>
            <button onClick={() => navigate('/guest')}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-3 rounded-xl text-sm transition-all">
              Kembali
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
                  i < step ? 'bg-green-500 text-white' : i === step ? 'bg-green-500/30 text-green-400 border-2 border-green-500' : 'bg-white/5 text-gray-500 border border-white/10'
                }`}>
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

        {/* Step 0: Pilih Kendaraan */}
        {step === 0 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><MdDirectionsCar className="text-green-400" /> Pilih Kendaraan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {myVehicles.map((v) => (
                <button key={v.id} onClick={() => setForm((f) => ({ ...f, vehicle: v }))}
                  className={`p-5 rounded-2xl border text-left transition-all ${
                    form.vehicle?.id === v.id
                      ? 'border-green-500/60 bg-green-500/10'
                      : 'border-white/8 bg-white/3 hover:border-green-500/30 hover:bg-white/5'
                  }`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{v.type === 'motor' ? '🏍️' : '🚗'}</span>
                    <div>
                      <p className="text-white font-bold text-sm">{v.brand} {v.model} {v.year}</p>
                      <p className="text-gray-400 text-xs">{v.plate} · {v.color}</p>
                    </div>
                    {form.vehicle?.id === v.id && <MdCheckCircle className="text-green-400 text-xl ml-auto" />}
                  </div>
                  <p className="text-xs text-gray-500">KM: {v.km.toLocaleString('id-ID')} · Servis terakhir: {new Date(v.lastService).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' })}</p>
                </button>
              ))}
              <button className="p-5 rounded-2xl border border-dashed border-white/15 hover:border-green-500/30 text-gray-400 hover:text-green-400 transition-all text-sm flex items-center justify-center gap-2">
                + Tambah Kendaraan Baru
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Pilih Layanan */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><MdBuild className="text-green-400" /> Pilih Layanan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {layanan.map((l) => (
                <button key={l.id} onClick={() => setForm((f) => ({ ...f, service: l }))}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    form.service?.id === l.id
                      ? 'border-green-500/60 bg-green-500/10'
                      : 'border-white/8 bg-white/3 hover:border-green-500/30'
                  }`}>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xl">{l.icon}</span>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">{l.name}</p>
                      <p className="text-gray-500 text-xs">{formatRupiah(l.hargaMulai)} – {formatRupiah(l.hargaMaks)}</p>
                    </div>
                    {form.service?.id === l.id && <MdCheckCircle className="text-green-400 text-lg" />}
                  </div>
                  <p className="text-gray-400 text-xs pl-8">⏱ {l.durasi}</p>
                </button>
              ))}
            </div>
            {/* Keluhan */}
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">Keluhan Kendaraan (opsional)</label>
              <textarea
                value={form.keluhan} onChange={(e) => setForm((f) => ({ ...f, keluhan: e.target.value }))}
                placeholder="Ceritakan keluhan kendaraan Anda secara detail..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 focus:border-green-500/40 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none resize-none transition-colors"
              />
            </div>
          </div>
        )}

        {/* Step 2: Pilih Jadwal */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><MdCalendarMonth className="text-green-400" /> Pilih Tanggal & Jam</h2>
            {/* Dates */}
            <p className="text-gray-400 text-sm mb-3">Tanggal Servis</p>
            <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
              {dates.map((d) => {
                const isSelected = form.date?.toDateString() === d.toDateString()
                const isSunday   = d.getDay() === 0
                return (
                  <button key={d.toDateString()} disabled={isSunday}
                    onClick={() => setForm((f) => ({ ...f, date: d }))}
                    className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-xl border text-center w-16 transition-all ${
                      isSunday    ? 'opacity-30 cursor-not-allowed border-white/5 bg-transparent' :
                      isSelected  ? 'border-green-500/60 bg-green-500/15 text-green-400' :
                                    'border-white/8 bg-white/3 hover:border-green-500/30 text-gray-300'
                    }`}>
                    <span className="text-xs font-medium">{d.toLocaleDateString('id-ID', { weekday:'short' })}</span>
                    <span className="text-lg font-extrabold leading-tight">{d.getDate()}</span>
                    <span className="text-xs">{d.toLocaleDateString('id-ID', { month:'short' })}</span>
                  </button>
                )
              })}
            </div>
            {/* Times */}
            <p className="text-gray-400 text-sm mb-3">Jam Servis</p>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {availableTimeSlots.map((t) => (
                <button key={t} onClick={() => setForm((f) => ({ ...f, time: t }))}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    form.time === t
                      ? 'border-green-500/60 bg-green-500/15 text-green-400'
                      : 'border-white/8 bg-white/3 hover:border-green-500/30 text-gray-300'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Konfirmasi */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2"><MdCheckCircle className="text-green-400" /> Ringkasan Booking</h2>
            <div className="rounded-2xl p-6 mb-5 space-y-3.5" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.12)' }}>
              {[
                { label: 'Kendaraan',     value: `${form.vehicle?.brand} ${form.vehicle?.model} ${form.vehicle?.year}` },
                { label: 'Plat Nomor',   value: form.vehicle?.plate },
                { label: 'Layanan',      value: form.service?.name },
                { label: 'Kategori',     value: form.service?.category },
                { label: 'Tanggal',      value: form.date?.toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' }) },
                { label: 'Jam',          value: form.time },
                { label: 'Est. Durasi',  value: form.service?.durasi },
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
                  <p className="text-green-400 font-extrabold text-lg">{formatRupiah(totalEstimate)}</p>
                  <p className="text-gray-600 text-xs">{formatRupiah(form.service?.hargaMulai)} – {formatRupiah(form.service?.hargaMaks)}</p>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-blue-500/8 border border-blue-500/20 text-sm text-blue-300">
              ℹ️ Estimasi biaya dapat berubah tergantung kondisi aktual kendaraan. Konfirmasi harga final akan diberikan mekanik sebelum pengerjaan.
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => step === 0 ? null : setStep((s) => s - 1)}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium">
            <MdArrowBack /> Kembali
          </button>
          {step < 3 ? (
            <button onClick={() => setStep((s) => s + 1)} disabled={!isStepValid()}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-all text-sm shadow-lg shadow-green-500/20">
              Lanjut <MdArrowForward />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 disabled:opacity-60 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm shadow-lg shadow-green-500/25">
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