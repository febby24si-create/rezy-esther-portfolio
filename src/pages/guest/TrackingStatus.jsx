import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MdSearch, MdDirectionsCar, MdBuild, MdPerson, MdAccessTime, MdCheckCircle, MdHourglassEmpty } from 'react-icons/md'
import { Link } from 'react-router-dom'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { AnimatedPage, ScrollReveal, GlowDot } from '../../components/AnimatedPage'

const STATUS_STEPS = {
  'Menunggu Konfirmasi': [
    { id:1, label:'Booking Diterima',      desc:'Booking masuk ke sistem.',                    done:true  },
    { id:2, label:'Menunggu Konfirmasi',   desc:'Admin memverifikasi jadwal.',                  done:true  },
    { id:3, label:'Dikonfirmasi',          desc:'Menunggu konfirmasi bengkel.',                 done:false },
    { id:4, label:'Kendaraan Masuk',       desc:'Kendaraan belum masuk.',                       done:false },
    { id:5, label:'Sedang Dikerjakan',     desc:'Proses servis belum dimulai.',                 done:false },
    { id:6, label:'Selesai',              desc:'Servis belum selesai.',                        done:false },
  ],
  'Dikonfirmasi': [
    { id:1, label:'Booking Diterima',      desc:'Booking masuk ke sistem.',                    done:true  },
    { id:2, label:'Konfirmasi Diterima',   desc:'Jadwal sudah dikonfirmasi.',                   done:true  },
    { id:3, label:'Kendaraan Masuk',       desc:'Silakan bawa kendaraan sesuai jadwal.',        done:true  },
    { id:4, label:'Sedang Dikerjakan',     desc:'Menunggu proses servis.',                      done:false },
    { id:5, label:'Quality Check',        desc:'QC belum dilakukan.',                          done:false },
    { id:6, label:'Selesai',              desc:'Servis belum selesai.',                        done:false },
  ],
  'Sedang Dikerjakan': [
    { id:1, label:'Booking Diterima',      desc:'Booking masuk ke sistem.',                    done:true  },
    { id:2, label:'Kendaraan Masuk',       desc:'Kendaraan sudah diterima.',                    done:true  },
    { id:3, label:'Diagnosa',             desc:'Mekanik melakukan pemeriksaan.',                done:true  },
    { id:4, label:'Servis Berlangsung',    desc:'Kendaraan Anda sedang dikerjakan.',             done:true  },
    { id:5, label:'Quality Check',        desc:'Pengecekan akhir belum dilakukan.',             done:false },
    { id:6, label:'Siap Diambil',         desc:'Kendaraan belum selesai.',                     done:false },
  ],
  'Selesai': [
    { id:1, label:'Booking Diterima',      desc:'Booking masuk ke sistem.',                    done:true  },
    { id:2, label:'Kendaraan Masuk',       desc:'Kendaraan telah diterima.',                    done:true  },
    { id:3, label:'Servis Selesai',        desc:'Semua pekerjaan telah selesai.',               done:true  },
    { id:4, label:'Quality Check',        desc:'Kendaraan telah melewati QC.',                 done:true  },
    { id:5, label:'Siap Diambil',         desc:'Kendaraan siap diambil di bengkel.',            done:true  },
    { id:6, label:'Selesai & Diserahkan', desc:'Proses sepenuhnya selesai.',                   done:true  },
  ],
}

const STATUS_BADGE = {
  'Menunggu Konfirmasi': { bg:'rgba(96,165,250,0.12)',  text:'#93C5FD', border:'rgba(96,165,250,0.25)',  dot:'#60A5FA', pulse:true  },
  'Dikonfirmasi':        { bg:'rgba(168,85,247,0.12)',  text:'#C084FC', border:'rgba(168,85,247,0.25)', dot:'#A855F7', pulse:true  },
  'Sedang Dikerjakan':   { bg:'rgba(251,191,36,0.12)',  text:'#FCD34D', border:'rgba(251,191,36,0.25)', dot:'#FBBF24', pulse:true  },
  'Selesai':             { bg:'rgba(34,197,94,0.12)',   text:'#4ADE80', border:'rgba(34,197,94,0.25)',  dot:'#22C55E', pulse:false },
}
const fmt = (n) => 'Rp ' + Number(n||0).toLocaleString('id-ID')

function TimelineStep({ step, isLast, index }) {
  return (
    <motion.div
      initial={{ opacity:0, x:-16 }}
      animate={{ opacity:1, x:0 }}
      transition={{ delay: index * 0.06 }}
      className="flex gap-4">
      <div className="flex flex-col items-center">
        <motion.div
          initial={step.done ? { scale:0 } : {}}
          animate={step.done ? { scale:1 } : {}}
          transition={{ delay: index * 0.06 + 0.1, type:'spring', stiffness:200 }}
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
            step.done ? 'border-green-500/60' : 'border-white/12'
          }`}
          style={{ background: step.done ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)' }}>
          {step.done
            ? <MdCheckCircle className="text-green-400 text-base" />
            : <span className="w-2 h-2 rounded-full bg-gray-600 block" />}
        </motion.div>
        {!isLast && (
          <div className="w-0.5 my-1 flex-1 min-h-6" style={{ background: step.done ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.06)' }} />
        )}
      </div>
      <div className={`pb-5 flex-1 ${isLast ? 'pb-0' : ''}`}>
        <p className={`font-semibold text-sm ${step.done ? 'text-white' : 'text-gray-500'}`}>{step.label}</p>
        <p className={`text-xs mt-0.5 leading-relaxed ${step.done ? 'text-gray-400' : 'text-gray-600'}`}>{step.desc}</p>
      </div>
    </motion.div>
  )
}

function OrderCard({ order }) {
  const steps   = STATUS_STEPS[order.status] || STATUS_STEPS['Menunggu Konfirmasi']
  const badge   = STATUS_BADGE[order.status]  || STATUS_BADGE['Menunggu Konfirmasi']
  const progress = Math.round((steps.filter(s => s.done).length / steps.length) * 100)

  return (
    <motion.div
      initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
      transition={{ duration:0.4 }}
      className="mb-6">
      <div className="rounded-2xl p-5 mb-4 border"
        style={{ background: 'rgba(34,197,94,0.04)', borderColor: 'rgba(34,197,94,0.12)' }}>
        <div className="flex items-start justify-between mb-4 gap-3">
          <div>
            <p className="text-green-400 font-bold text-sm font-mono">{order.id}</p>
            <p className="text-gray-400 text-xs mt-0.5">
              {order.date ? new Date(order.date).toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long' }) : '—'}
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 flex-shrink-0"
            style={{ background: badge.bg, color: badge.text, borderColor: badge.border }}>
            {badge.pulse ? <GlowDot color={badge.dot} size={6} /> : <span className="w-1.5 h-1.5 rounded-full" style={{ background: badge.dot }} />}
            {order.status}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { icon: MdDirectionsCar, label: 'Kendaraan', value: order.vehicle?.split(' - ')[0] || order.vehicle || '—' },
            { icon: MdBuild,         label: 'Layanan',   value: order.service || '—' },
            { icon: MdPerson,        label: 'Mekanik',   value: order.mechanic || 'Belum ditugaskan' },
            { icon: MdAccessTime,    label: 'Jam',       value: order.time || order.date?.slice(0,10) || '—' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <Icon className="text-green-400 text-base mb-1" />
              <p className="text-gray-500 text-xs">{label}</p>
              <p className="text-white text-xs font-semibold truncate mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Progress Servis</span>
            <motion.span
              key={progress}
              initial={{ scale:1.2 }} animate={{ scale:1 }}
              className="text-green-400 font-bold">
              {progress}%
            </motion.span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16,1,0.3,1] }}
              style={{ background: 'linear-gradient(90deg, #22C55E, #10B981)' }}
            />
          </div>
        </div>
        {order.total > 0 && (
          <div className="flex items-center justify-between text-sm mt-3">
            <span className="text-gray-500">Estimasi Biaya</span>
            <span className="text-white font-bold">{fmt(order.total)}</span>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="rounded-2xl p-5 border"
        style={{ background: 'rgba(34,197,94,0.02)', borderColor: 'rgba(34,197,94,0.08)' }}>
        <p className="text-white font-bold text-sm mb-5">Timeline Status</p>
        {steps.map((step, i) => (
          <TimelineStep key={step.id} step={step} isLast={i === steps.length - 1} index={i} />
        ))}
      </div>

      {order.status !== 'Selesai' && (
        <div className="mt-4 p-4 rounded-xl border text-sm text-blue-300"
          style={{ background: 'rgba(59,130,246,0.06)', borderColor: 'rgba(59,130,246,0.15)' }}>
          ℹ️ Status diperbarui real-time. Notifikasi WhatsApp dikirim saat ada perubahan.
        </div>
      )}
      {order.status === 'Selesai' && (
        <div className="mt-4 p-4 rounded-xl border text-sm text-green-300 flex items-center gap-2"
          style={{ background: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.15)' }}>
          <MdCheckCircle /> Kendaraan selesai! Silakan ambil atau{' '}
          <Link to="/member/riwayat" className="underline font-semibold">beri rating</Link>.
        </div>
      )}
    </motion.div>
  )
}

export default function TrackingStatus() {
  const { customer } = useCustomerAuth()
  const [searchId, setSearchId]       = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [notFound, setNotFound]         = useState(false)

  const myOrders = useMemo(() => {
    const all = JSON.parse(sessionStorage.getItem('garage_orders') || '[]')
    return all.filter(o => o.customer === customer?.name)
      .sort((a, b) => new Date(b.createdAt||b.date) - new Date(a.createdAt||a.date))
  }, [customer?.name])

  const activeOrders = myOrders.filter(o => o.status !== 'Selesai')
  const doneOrders   = myOrders.filter(o => o.status === 'Selesai')

  const handleSearch = () => {
    setNotFound(false); setSearchResult(null)
    if (!searchId.trim()) return
    const all  = JSON.parse(sessionStorage.getItem('garage_orders') || '[]')
    const found = all.find(o => o.id.toLowerCase() === searchId.trim().toLowerCase())
    found ? setSearchResult(found) : setNotFound(true)
  }

  return (
    <AnimatedPage>
      <div className="pt-16 min-h-screen px-4 sm:px-6" style={{ background: '#020f09' }}>
        <div className="max-w-2xl mx-auto py-10">
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="mb-8">
            <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-1">Pantau Kendaraan</p>
            <h1 className="text-2xl font-extrabold text-white">Tracking Status Servis</h1>
          </motion.div>

          {/* Search */}
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
            transition={{ delay: 0.15 }} className="flex gap-2 mb-8">
            <div className="relative flex-1">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
              <input value={searchId}
                onChange={e => { setSearchId(e.target.value); setNotFound(false); setSearchResult(null) }}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Cari nomor order, contoh: #ORD-ABC12345"
                className="w-full border border-white/10 focus:border-green-500/40 rounded-xl pl-9 pr-4 py-3 text-white text-sm placeholder-gray-600 outline-none transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)' }} />
            </div>
            <motion.button onClick={handleSearch}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="px-4 py-3 rounded-xl text-sm font-semibold text-green-400 transition-all"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
              Cari
            </motion.button>
          </motion.div>

          <AnimatePresence>
            {notFound && (
              <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                className="mb-6 p-4 rounded-xl text-sm text-red-400 border border-red-500/20"
                style={{ background: 'rgba(239,68,68,0.08)' }}>
                ❌ Nomor order tidak ditemukan.
              </motion.div>
            )}
          </AnimatePresence>

          {searchResult && <OrderCard order={searchResult} />}

          {!searchResult && activeOrders.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <GlowDot color="#FBBF24" size={8} />
                <h2 className="text-white font-bold text-sm">Service Aktif ({activeOrders.length})</h2>
              </div>
              {activeOrders.map(o => <OrderCard key={o.id} order={o} />)}
            </div>
          )}

          {!searchResult && activeOrders.length === 0 && (
            <motion.div initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }}
              className="text-center py-12 rounded-2xl border border-white/8 mb-8"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <MdHourglassEmpty className="text-gray-600 text-5xl mx-auto mb-3" />
              <p className="text-white font-semibold text-lg mb-1">Tidak ada service aktif</p>
              <p className="text-gray-500 text-sm mb-4">Semua kendaraan selesai diservis.</p>
              <Link to="/member/booking"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)' }}>
                🚗 Booking Service Baru
              </Link>
            </motion.div>
          )}

          {!searchResult && doneOrders.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold text-sm flex items-center gap-2">
                  <MdCheckCircle className="text-green-400" /> Selesai Sebelumnya
                </h2>
                <Link to="/member/riwayat" className="text-xs text-green-400 hover:text-green-300">Lihat riwayat →</Link>
              </div>
              <div className="space-y-3">
                {doneOrders.slice(0,2).map(o => (
                  <motion.div key={o.id}
                    initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 p-4 rounded-xl border border-white/8 hover:border-white/15 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <MdCheckCircle className="text-green-400 text-xl flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold">{o.service}</p>
                      <p className="text-gray-500 text-xs font-mono">{o.id}</p>
                    </div>
                    <span className="text-green-400 text-xs font-bold">Selesai</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  )
}