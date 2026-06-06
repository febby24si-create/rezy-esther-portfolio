import { useState, useMemo } from 'react'
import { MdSearch, MdDirectionsCar, MdBuild, MdPerson, MdAccessTime, MdCheckCircle, MdHourglassEmpty } from 'react-icons/md'
import { Link } from 'react-router-dom'
import { useCustomerAuth } from '../../context/CustomerAuthContext'

// Status flow untuk semua order
const STATUS_STEPS = {
  'Menunggu Konfirmasi': [
    { id: 1, label: 'Booking Diterima',       desc: 'Booking Anda telah masuk ke sistem.',                done: true  },
    { id: 2, label: 'Menunggu Konfirmasi',    desc: 'Admin sedang memverifikasi jadwal dan ketersediaan.', done: true  },
    { id: 3, label: 'Dikonfirmasi',           desc: 'Menunggu konfirmasi dari bengkel.',                   done: false },
    { id: 4, label: 'Kendaraan Masuk',        desc: 'Kendaraan belum masuk bengkel.',                      done: false },
    { id: 5, label: 'Sedang Dikerjakan',      desc: 'Proses servis belum dimulai.',                        done: false },
    { id: 6, label: 'Selesai',               desc: 'Servis belum selesai.',                               done: false },
  ],
  'Dikonfirmasi': [
    { id: 1, label: 'Booking Diterima',       desc: 'Booking Anda telah masuk ke sistem.',                done: true  },
    { id: 2, label: 'Konfirmasi Diterima',    desc: 'Jadwal servis sudah dikonfirmasi oleh bengkel.',      done: true  },
    { id: 3, label: 'Kendaraan Masuk',        desc: 'Silakan bawa kendaraan sesuai jadwal.',               done: true  },
    { id: 4, label: 'Sedang Dikerjakan',      desc: 'Menunggu proses servis dimulai.',                     done: false },
    { id: 5, label: 'Quality Check',         desc: 'Proses QC belum dilakukan.',                          done: false },
    { id: 6, label: 'Selesai',               desc: 'Servis belum selesai.',                               done: false },
  ],
  'Sedang Dikerjakan': [
    { id: 1, label: 'Booking Diterima',       desc: 'Booking telah masuk ke sistem.',                     done: true  },
    { id: 2, label: 'Kendaraan Masuk Bengkel',desc: 'Kendaraan sudah diterima oleh tim bengkel.',          done: true  },
    { id: 3, label: 'Diagnosa Kendaraan',     desc: 'Mekanik sedang melakukan pemeriksaan awal.',          done: true  },
    { id: 4, label: 'Servis Berlangsung',     desc: 'Kendaraan Anda sedang aktif dikerjakan oleh mekanik.',done: true  },
    { id: 5, label: 'Quality Check',         desc: 'Pengecekan akhir belum dilakukan.',                   done: false },
    { id: 6, label: 'Siap Diambil',          desc: 'Kendaraan belum selesai.',                            done: false },
  ],
  'Selesai': [
    { id: 1, label: 'Booking Diterima',       desc: 'Booking telah masuk ke sistem.',                     done: true  },
    { id: 2, label: 'Kendaraan Masuk Bengkel',desc: 'Kendaraan telah diterima.',                           done: true  },
    { id: 3, label: 'Servis Selesai',         desc: 'Semua pekerjaan servis telah selesai.',               done: true  },
    { id: 4, label: 'Quality Check',         desc: 'Kendaraan sudah melalui pengecekan kualitas.',         done: true  },
    { id: 5, label: 'Siap Diambil',          desc: 'Kendaraan sudah bisa diambil di bengkel.',             done: true  },
    { id: 6, label: 'Selesai & Diserahkan',  desc: 'Proses servis sepenuhnya selesai.',                    done: true  },
  ],
}

const STATUS_BADGE = {
  'Menunggu Konfirmasi': { bg: 'bg-blue-500/15',   text: 'text-blue-400',   border: 'border-blue-500/25',   dot: 'bg-blue-400',   pulse: true  },
  'Dikonfirmasi':        { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/25', dot: 'bg-purple-400', pulse: true  },
  'Sedang Dikerjakan':   { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/25', dot: 'bg-yellow-400', pulse: true  },
  'Selesai':             { bg: 'bg-green-500/15',  text: 'text-green-400',  border: 'border-green-500/20',  dot: 'bg-green-400',  pulse: false },
}

const fmt = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID')

// ── Timeline component ────────────────────────────────────────
function TimelineStep({ step, isLast }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
          step.done
            ? 'bg-green-500/20 border-green-500/60'
            : 'bg-white/5 border-white/15'
        }`}>
          {step.done
            ? <MdCheckCircle className="text-green-400 text-base" />
            : <span className="w-2 h-2 rounded-full bg-gray-600 block" />}
        </div>
        {!isLast && (
          <div className={`w-0.5 my-1 flex-1 min-h-6 ${step.done ? 'bg-green-500/30' : 'bg-white/8'}`} />
        )}
      </div>
      <div className={`pb-5 flex-1 ${isLast ? 'pb-0' : ''}`}>
        <p className={`font-semibold text-sm ${step.done ? 'text-white' : 'text-gray-500'}`}>
          {step.label}
        </p>
        <p className={`text-xs mt-0.5 leading-relaxed ${step.done ? 'text-gray-400' : 'text-gray-600'}`}>
          {step.desc}
        </p>
      </div>
    </div>
  )
}

// ── Order Card ────────────────────────────────────────────────
function OrderTrackingCard({ order }) {
  const steps   = STATUS_STEPS[order.status] || STATUS_STEPS['Menunggu Konfirmasi']
  const badge   = STATUS_BADGE[order.status] || STATUS_BADGE['Menunggu Konfirmasi']
  const progress = Math.round((steps.filter(s => s.done).length / steps.length) * 100)

  return (
    <div className="mb-6">
      {/* Info card */}
      <div className="rounded-2xl p-5 mb-4 border" style={{ background: 'rgba(34,197,94,0.05)', borderColor: 'rgba(34,197,94,0.15)' }}>
        <div className="flex items-start justify-between mb-4 gap-3">
          <div>
            <p className="text-green-400 font-bold text-sm">{order.id}</p>
            <p className="text-gray-400 text-xs mt-0.5">
              {order.date ? new Date(order.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
            </p>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 flex-shrink-0 ${badge.bg} ${badge.text} ${badge.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot} ${badge.pulse ? 'animate-pulse' : ''}`} />
            {order.status}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: MdDirectionsCar, label: 'Kendaraan',     value: order.vehicle?.split(' - ')[0] || order.vehicle || '—' },
            { icon: MdBuild,         label: 'Layanan',        value: order.service || '—'  },
            { icon: MdPerson,        label: 'Mekanik',        value: order.mechanic || 'Belum ditugaskan' },
            { icon: MdAccessTime,    label: 'Jam Booking',    value: order.time || order.date?.slice(0,10) || '—' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <Icon className="text-green-400 text-base mb-1" />
              <p className="text-gray-500 text-xs">{label}</p>
              <p className="text-white text-xs font-semibold leading-tight mt-0.5 truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Progress Servis</span>
            <span className="text-green-400 font-bold">{progress}%</span>
          </div>
          <div className="h-2 bg-white/8 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Estimasi biaya */}
        {order.total > 0 && (
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-gray-500">Estimasi Biaya</span>
            <span className="text-white font-bold">{fmt(order.total)}</span>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="rounded-2xl p-5 border" style={{ background: 'rgba(34,197,94,0.02)', borderColor: 'rgba(34,197,94,0.10)' }}>
        <h3 className="text-white font-bold text-sm mb-5">Timeline Status</h3>
        {steps.map((step, i) => (
          <TimelineStep key={step.id} step={step} isLast={i === steps.length - 1} />
        ))}
      </div>

      {/* Info note */}
      {order.status !== 'Selesai' && (
        <div className="mt-4 p-4 rounded-xl border border-blue-500/20 bg-blue-500/8 text-blue-300 text-sm">
          ℹ️ Status diperbarui secara real-time. Notifikasi WhatsApp dikirim saat ada perubahan status.
        </div>
      )}
      {order.status === 'Selesai' && (
        <div className="mt-4 p-4 rounded-xl border border-green-500/20 bg-green-500/8 text-green-300 text-sm flex items-center gap-2">
          <MdCheckCircle /> Kendaraan selesai diservis. Silakan ambil di bengkel atau beri rating di{' '}
          <Link to="/guest/riwayat" className="underline font-semibold">Riwayat Service</Link>.
        </div>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function TrackingStatus() {
  const { customer } = useCustomerAuth()
  const [searchId, setSearchId] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [notFound, setNotFound]         = useState(false)

  // Order aktif milik customer dari garage_orders
  const myOrders = useMemo(() => {
    const all = JSON.parse(localStorage.getItem('garage_orders') || '[]')
    return all
      .filter(o => o.customer === customer?.name)
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
  }, [customer?.name])

  const activeOrders = myOrders.filter(o => o.status !== 'Selesai')
  const doneOrders   = myOrders.filter(o => o.status === 'Selesai')

  const handleSearch = () => {
    setNotFound(false)
    setSearchResult(null)
    if (!searchId.trim()) return
    const all = JSON.parse(localStorage.getItem('garage_orders') || '[]')
    const found = all.find(o => o.id.toLowerCase() === searchId.trim().toLowerCase())
    if (found) {
      setSearchResult(found)
    } else {
      setNotFound(true)
    }
  }

  return (
    <div className="pt-16 min-h-screen px-4 sm:px-6" style={{ background: '#020f09' }}>
      <div className="max-w-2xl mx-auto py-10">
        <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-2">Pantau Kendaraan Anda</p>
        <h1 className="text-2xl font-extrabold text-white mb-6">Tracking Status Servis</h1>

        {/* Search by order ID */}
        <div className="flex gap-2 mb-8">
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
            <input
              value={searchId}
              onChange={e => { setSearchId(e.target.value); setNotFound(false); setSearchResult(null) }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Cari nomor order, contoh: #ORD-ABC12345"
              className="w-full border border-white/10 focus:border-green-500/40 rounded-xl pl-9 pr-4 py-3 text-white text-sm placeholder-gray-600 outline-none transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            />
          </div>
          <button onClick={handleSearch}
            className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 font-semibold px-4 py-3 rounded-xl text-sm transition-all">
            Cari
          </button>
        </div>

        {/* Search result */}
        {notFound && (
          <div className="mb-6 p-4 rounded-xl text-sm text-red-400 border border-red-500/20" style={{ background: 'rgba(239,68,68,0.08)' }}>
            ❌ Nomor order tidak ditemukan. Pastikan format benar, contoh: <span className="font-mono">#ORD-ABC12345</span>
          </div>
        )}
        {searchResult && (
          <div className="mb-8">
            <p className="text-gray-400 text-sm mb-3">Hasil pencarian untuk <span className="text-white font-mono">{searchId}</span>:</p>
            <OrderTrackingCard order={searchResult} />
          </div>
        )}

        {/* Active orders */}
        {!searchResult && activeOrders.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <h2 className="text-white font-bold text-sm">Service Aktif ({activeOrders.length})</h2>
            </div>
            {activeOrders.map(o => <OrderTrackingCard key={o.id} order={o} />)}
          </div>
        )}

        {/* No active orders */}
        {!searchResult && activeOrders.length === 0 && (
          <div className="text-center py-12 rounded-2xl border border-white/8 mb-8" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <MdHourglassEmpty className="text-gray-600 text-5xl mx-auto mb-3" />
            <p className="text-white font-semibold text-lg mb-1">Tidak ada service aktif</p>
            <p className="text-gray-500 text-sm mb-4">Semua kendaraan Anda sudah selesai diservis.</p>
            <Link to="/guest/booking"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)' }}>
              🚗 Booking Service Baru
            </Link>
          </div>
        )}

        {/* Recent done */}
        {!searchResult && doneOrders.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-sm flex items-center gap-2">
                <MdCheckCircle className="text-green-400" /> Selesai Sebelumnya
              </h2>
              <Link to="/guest/riwayat" className="text-xs text-green-400 hover:text-green-300">Lihat riwayat →</Link>
            </div>
            <div className="space-y-3">
              {doneOrders.slice(0, 2).map(o => (
                <div key={o.id} className="flex items-center gap-3 p-4 rounded-xl border border-white/8 hover:border-white/15 transition-all"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <MdCheckCircle className="text-green-400 text-xl flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold">{o.service}</p>
                    <p className="text-gray-500 text-xs">{o.id} · {o.date ? new Date(o.date).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }) : '—'}</p>
                  </div>
                  <span className="text-green-400 text-xs font-bold">Selesai</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}