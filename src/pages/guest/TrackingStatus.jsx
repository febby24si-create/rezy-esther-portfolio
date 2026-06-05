import { useState } from 'react'
import { activeTracking } from '../../data/guestData'
import TimelineStep from '../../components/guest/TimelineStep'
import { MdSearch, MdDirectionsCar, MdBuild, MdPerson, MdAccessTime } from 'react-icons/md'

export default function TrackingStatus() {
  const [orderId, setOrderId] = useState(activeTracking.orderId)
  const [searched, setSearched] = useState(true)
  const data = activeTracking // mock — in real app: fetch by orderId

  const progress = Math.round(
    (data.steps.filter((s) => s.done).length / data.steps.length) * 100
  )

  return (
    <div className="pt-16 min-h-screen px-4 sm:px-6" style={{ background: '#020f09' }}>
      <div className="max-w-2xl mx-auto py-10">
        {/* Header */}
        <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-2">Pantau Kendaraan Anda</p>
        <h1 className="text-2xl font-extrabold text-white mb-6">Tracking Status Servis</h1>

        {/* Search order */}
        <div className="flex gap-2 mb-8">
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
            <input value={orderId} onChange={(e) => setOrderId(e.target.value)}
              placeholder="Masukkan nomor order (contoh: #ORD-LIVE001)"
              className="w-full bg-white/5 border border-white/10 focus:border-green-500/40 rounded-xl pl-9 pr-4 py-3 text-white text-sm placeholder-gray-600 outline-none transition-colors" />
          </div>
          <button onClick={() => setSearched(true)}
            className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 font-semibold px-4 py-3 rounded-xl text-sm transition-all">
            Cari
          </button>
        </div>

        {searched && (
          <>
            {/* Info card */}
            <div className="rounded-2xl p-5 mb-6 border" style={{ background: 'rgba(34,197,94,0.05)', borderColor: 'rgba(34,197,94,0.15)' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-green-400 font-bold text-sm">{data.orderId}</p>
                  <p className="text-gray-400 text-xs mt-0.5">Diperbarui real-time</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
                  Sedang Dikerjakan
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                {[
                  { icon: MdDirectionsCar, label: 'Kendaraan', value: data.vehicle },
                  { icon: MdBuild,         label: 'Layanan',   value: data.service },
                  { icon: MdPerson,        label: 'Mekanik',   value: data.mechanic },
                  { icon: MdAccessTime,    label: 'Est. Selesai', value: data.estimatedFinish },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <Icon className="text-green-400 text-base mb-1" />
                    <p className="text-gray-500 text-xs">{label}</p>
                    <p className="text-white text-xs font-semibold leading-tight mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="mt-5">
                <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                  <span>Progress</span>
                  <span className="text-green-400 font-bold">{progress}%</span>
                </div>
                <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000"
                    style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-2xl p-5 border" style={{ background: 'rgba(34,197,94,0.02)', borderColor: 'rgba(34,197,94,0.10)' }}>
              <h3 className="text-white font-bold mb-5">Riwayat Status</h3>
              {data.steps.map((step, i) => (
                <TimelineStep key={step.id} step={step} isLast={i === data.steps.length - 1} />
              ))}
            </div>

            {/* Estimated finish */}
            <div className="mt-5 p-4 rounded-xl border border-blue-500/20 bg-blue-500/8 text-blue-300 text-sm">
              ℹ️ Estimasi kendaraan selesai pukul <strong>{data.estimatedFinish} WIB</strong>. Kami akan mengirim notifikasi WhatsApp saat kendaraan siap diambil.
            </div>
          </>
        )}
      </div>
    </div>
  )
}