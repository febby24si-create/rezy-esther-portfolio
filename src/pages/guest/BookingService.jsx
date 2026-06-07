import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { layanan, availableTimeSlots } from '../../data/guestData'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import {
  MdArrowBack, MdArrowForward, MdCheckCircle,
  MdDirectionsCar, MdBuild, MdCalendarMonth, MdSend, MdAdd
} from 'react-icons/md'
import { AnimatedPage, AnimatedProgress } from '../../components/AnimatedPage'

const STEPS = ['Kendaraan', 'Layanan', 'Jadwal', 'Konfirmasi']
const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID')

function getNextDates(n = 14) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1); return d
  })
}
function genOrderId() { return '#ORD-' + Math.random().toString(36).slice(2, 10).toUpperCase() }

export default function BookingService() {
  const navigate = useNavigate()
  const { customer, addPoints } = useCustomerAuth()
  const [step, setStep]       = useState(0)
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const [orderId, setOrderId] = useState('')
  const [addVehicleMode, setAddVehicleMode] = useState(false)
  const [newVehicle, setNewVehicle] = useState({ brand:'', model:'', year:'', plate:'', color:'', type:'mobil', km:'' })
  const [form, setForm] = useState({ vehicle: null, service: null, date: null, time: null, keluhan: '' })

  const dates         = getNextDates(14)
  const totalEstimate = form.service ? (form.service.hargaMulai + form.service.hargaMaks) / 2 : 0
  const vehicles      = customer?.vehicles || []
  const isStepValid   = () => {
    if (step === 0) return !!form.vehicle
    if (step === 1) return !!form.service
    if (step === 2) return !!form.date && !!form.time
    return true
  }

  const handleSubmit = () => {
    setLoading(true)
    const id = genOrderId(); setOrderId(id)
    setTimeout(() => {
      const orders = JSON.parse(localStorage.getItem('garage_orders') || '[]')
      localStorage.setItem('garage_orders', JSON.stringify([{
        id, customer: customer.name, customerId: customer.id,
        vehicle: `${form.vehicle.brand} ${form.vehicle.model} - ${form.vehicle.plate}`,
        service: form.service.name, status: 'Menunggu Konfirmasi',
        total: Math.round(totalEstimate), date: form.date.toISOString().slice(0, 10),
        time: form.time, mechanic: '—', keluhan: form.keluhan, createdAt: new Date().toISOString(),
      }, ...orders]))
      addPoints(id, totalEstimate, form.service.name)
      setLoading(false); setDone(true)
    }, 1800)
  }

  // ── Success ──────────────────────────────────────────────────
  if (done) {
    return (
      <AnimatedPage>
        <div className="pt-16 min-h-screen flex items-center justify-center px-4" style={{ background: '#020f09' }}>
          <div className="max-w-md w-full text-center">
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.4)' }}>
              <MdCheckCircle className="text-green-400 text-5xl" />
            </motion.div>
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
              <h2 className="text-2xl font-extrabold text-white mb-2">Booking Berhasil!</h2>
              <p className="text-gray-400 text-sm mb-1">No. booking: <span className="text-green-400 font-bold font-mono">{orderId}</span></p>
              <p className="text-gray-500 text-xs mb-5">Konfirmasi dikirim via WhatsApp ke nomor terdaftar.</p>
              <motion.div
                initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
                transition={{ delay:0.4 }}
                className="my-4 p-3 rounded-xl inline-flex items-center gap-2 text-sm text-yellow-400"
                style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
                ⭐ +{Math.floor(totalEstimate / 1000)} poin loyalty ditambahkan!
              </motion.div>
              <div className="rounded-xl p-4 mb-6 text-left space-y-2.5"
                style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }}>
                {[
                  { label:'Kendaraan', value:`${form.vehicle?.brand} ${form.vehicle?.model} ${form.vehicle?.year}` },
                  { label:'Layanan',   value: form.service?.name },
                  { label:'Tanggal',   value: form.date?.toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long' }) },
                  { label:'Jam',       value: form.time },
                  { label:'Estimasi',  value: fmt(totalEstimate) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-400">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => navigate('/guest/tracking')}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-green-400 transition-all hover:bg-green-500/15"
                  style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  Pantau Status
                </button>
                <button onClick={() => navigate('/guest/dashboard')}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:bg-white/10"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </AnimatedPage>
    )
  }

  return (
    <AnimatedPage>
      <div className="pt-16 min-h-screen px-4 sm:px-6" style={{ background: '#020f09' }}>
        <div className="max-w-3xl mx-auto py-10">
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="mb-8">
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
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      i < step  ? 'bg-green-500 text-white shadow-lg shadow-green-500/40'
                      : i === step ? 'text-green-400 border-2 border-green-500 shadow-lg shadow-green-500/30'
                      : 'text-gray-500 border border-white/10'
                    }`}
                    style={i === step ? { background: 'rgba(34,197,94,0.1)' } : i < step ? {} : { background: 'rgba(255,255,255,0.04)' }}>
                    {i < step ? <MdCheckCircle className="text-lg" /> : i + 1}
                  </motion.div>
                  <span className={`text-xs mt-1 font-medium hidden sm:block ${i === step ? 'text-green-400' : i < step ? 'text-gray-300' : 'text-gray-600'}`}>{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <motion.div className="h-full bg-green-500 rounded-full"
                      animate={{ width: i < step ? '100%' : '0%' }}
                      transition={{ duration: 0.4, ease: 'easeOut' }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Animated step content */}
          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={{ opacity:0, x: 24 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-24 }}
              transition={{ duration: 0.28, ease: [0.16,1,0.3,1] }}>

              {/* ── Step 0: Kendaraan ──────────────────────── */}
              {step === 0 && (
                <div>
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <MdDirectionsCar className="text-green-400" /> Pilih Kendaraan
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                    {vehicles.map((v) => (
                      <motion.button key={v.id} onClick={() => setForm(f => ({ ...f, vehicle: v }))}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className={`p-5 rounded-2xl border text-left transition-all ${
                          form.vehicle?.id === v.id
                            ? 'border-green-500/60 shadow-lg shadow-green-500/15' : 'border-white/8 hover:border-green-500/30'
                        }`}
                        style={{ background: form.vehicle?.id === v.id ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)' }}>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{v.type === 'motor' ? '🏍️' : '🚗'}</span>
                          <div className="flex-1">
                            <p className="text-white font-bold text-sm">{v.brand} {v.model} {v.year}</p>
                            <p className="text-gray-400 text-xs">{v.plate} · {v.color}</p>
                          </div>
                          {form.vehicle?.id === v.id && (
                            <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring' }}>
                              <MdCheckCircle className="text-green-400 text-xl" />
                            </motion.div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 pl-9">KM: {Number(v.km||0).toLocaleString('id-ID')}</p>
                      </motion.button>
                    ))}

                    {!addVehicleMode ? (
                      <motion.button onClick={() => setAddVehicleMode(true)}
                        whileHover={{ scale: 1.02, borderColor: 'rgba(34,197,94,0.4)' }}
                        className="p-5 rounded-2xl border-2 border-dashed border-white/12 text-gray-400 hover:text-green-400 transition-all text-sm flex flex-col items-center justify-center gap-2 min-h-[100px]">
                        <MdAdd className="text-2xl" />
                        <span>Tambah Kendaraan Baru</span>
                      </motion.button>
                    ) : (
                      <motion.div initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }}
                        className="p-4 rounded-2xl border border-green-500/25 col-span-full"
                        style={{ background: 'rgba(34,197,94,0.05)' }}>
                        <p className="text-green-400 font-semibold text-sm mb-3">Kendaraan Baru</p>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { key:'brand', placeholder:'Merk (Toyota...)' },
                            { key:'model', placeholder:'Model (Avanza...)' },
                            { key:'year',  placeholder:'Tahun (2020)' },
                            { key:'plate', placeholder:'Plat Nomor' },
                          ].map(({ key, placeholder }) => (
                            <input key={key} value={newVehicle[key]} onChange={e => setNewVehicle(nv => ({...nv, [key]: e.target.value}))}
                              placeholder={placeholder}
                              className="px-3 py-2 rounded-lg text-sm text-white outline-none"
                              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                          ))}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => {
                            if (!newVehicle.brand || !newVehicle.plate) return
                            const v = { id: 'V-' + Date.now(), ...newVehicle, lastService: null, nextService: null }
                            setForm(f => ({...f, vehicle: v})); setAddVehicleMode(false)
                          }} className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
                            style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.3)' }}>
                            Gunakan
                          </button>
                          <button onClick={() => setAddVehicleMode(false)} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white">Batal</button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Step 1: Layanan ────────────────────────── */}
              {step === 1 && (
                <div>
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <MdBuild className="text-green-400" /> Pilih Layanan
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                    {layanan.map((l) => (
                      <motion.button key={l.id} onClick={() => setForm(f => ({...f, service: l}))}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          form.service?.id === l.id ? 'border-green-500/60' : 'border-white/8 hover:border-green-500/30'
                        }`}
                        style={{ background: form.service?.id === l.id ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.03)' }}>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xl">{l.icon}</span>
                          <div className="flex-1">
                            <p className="text-white font-semibold text-sm">{l.name}</p>
                            <p className="text-gray-500 text-xs">{fmt(l.hargaMulai)} – {fmt(l.hargaMaks)}</p>
                          </div>
                          {form.service?.id === l.id && (
                            <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring' }}>
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
                    <textarea value={form.keluhan} onChange={e => setForm(f => ({...f, keluhan: e.target.value}))}
                      placeholder="Ceritakan keluhan kendaraan Anda..." rows={3}
                      className="w-full border border-white/10 focus:border-green-500/40 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none resize-none"
                      style={{ background: 'rgba(255,255,255,0.05)' }} />
                  </div>
                </div>
              )}

              {/* ── Step 2: Jadwal ─────────────────────────── */}
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
                        <motion.button key={d.toDateString()} disabled={isSunday}
                          onClick={() => setForm(f => ({...f, date: d}))}
                          whileHover={!isSunday ? { scale: 1.05 } : {}}
                          whileTap={!isSunday ? { scale: 0.95 } : {}}
                          className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-xl border text-center w-16 transition-all ${
                            isSunday   ? 'opacity-30 cursor-not-allowed border-white/5'
                            : isSelected ? 'border-green-500/60 shadow-lg shadow-green-500/20'
                            : 'border-white/8 hover:border-green-500/30'
                          }`}
                          style={{
                            background: isSunday ? 'rgba(255,255,255,0.02)' : isSelected ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.03)',
                          }}>
                          <span className={`text-xs font-medium ${isSelected ? 'text-green-400' : 'text-gray-300'}`}>
                            {d.toLocaleDateString('id-ID', { weekday: 'short' })}
                          </span>
                          <span className={`text-lg font-extrabold leading-tight ${isSelected ? 'text-green-400' : 'text-white'}`}>
                            {d.getDate()}
                          </span>
                          <span className={`text-xs ${isSelected ? 'text-green-400/70' : 'text-gray-500'}`}>
                            {d.toLocaleDateString('id-ID', { month: 'short' })}
                          </span>
                        </motion.button>
                      )
                    })}
                  </div>
                  <p className="text-gray-400 text-sm mb-3">Jam Servis</p>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {availableTimeSlots.map((t) => (
                      <motion.button key={t} onClick={() => setForm(f => ({...f, time: t}))}
                        whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                        className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                          form.time === t
                            ? 'border-green-500/60 text-green-400 shadow-lg shadow-green-500/20'
                            : 'border-white/8 text-gray-300 hover:border-green-500/30'
                        }`}
                        style={{ background: form.time === t ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.03)' }}>
                        {t}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Step 3: Konfirmasi ─────────────────────── */}
              {step === 3 && (
                <div>
                  <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                    <MdCheckCircle className="text-green-400" /> Ringkasan Booking
                  </h2>
                  <div className="rounded-2xl p-6 mb-5 space-y-3.5"
                    style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.12)' }}>
                    {[
                      { label:'Atas Nama',   value: customer?.name },
                      { label:'Kendaraan',   value: `${form.vehicle?.brand} ${form.vehicle?.model} ${form.vehicle?.year}` },
                      { label:'Plat Nomor',  value: form.vehicle?.plate },
                      { label:'Layanan',     value: form.service?.name },
                      { label:'Tanggal',     value: form.date?.toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' }) },
                      { label:'Jam',         value: form.time },
                      { label:'Est. Durasi', value: form.service?.durasi },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">{label}</span>
                        <span className="text-white text-sm font-medium">{value}</span>
                      </div>
                    ))}
                    <div className="border-t border-white/5 pt-3 flex items-center justify-between">
                      <span className="text-gray-300 font-semibold">Estimasi Biaya</span>
                      <span className="text-green-400 font-extrabold text-lg">{fmt(totalEstimate)}</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl mb-4 flex items-center gap-3 text-sm"
                    style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}>
                    <span className="text-2xl">⭐</span>
                    <div>
                      <p className="text-yellow-400 font-semibold">+{Math.floor(totalEstimate/1000)} poin loyalty estimasi</p>
                      <p className="text-gray-400 text-xs">1 poin per Rp 1.000</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <motion.button
              onClick={() => step > 0 && setStep(s => s - 1)} disabled={step === 0}
              whileHover={step > 0 ? { x: -3 } : {}} whileTap={step > 0 ? { scale: 0.97 } : {}}
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm font-medium">
              <MdArrowBack /> Kembali
            </motion.button>
            {step < 3 ? (
              <motion.button onClick={() => setStep(s => s + 1)} disabled={!isStepValid()}
                whileHover={isStepValid() ? { scale: 1.04 } : {}} whileTap={isStepValid() ? { scale: 0.96 } : {}}
                className="flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all disabled:opacity-40"
                style={{ background: isStepValid() ? 'linear-gradient(135deg,#16A34A,#22C55E)' : 'rgba(34,197,94,0.2)', boxShadow: isStepValid() ? '0 4px 20px rgba(34,197,94,0.25)' : 'none' }}>
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
    </AnimatedPage>
  )
}