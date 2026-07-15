// ============================================================
// ETAWidget.jsx
// Live ETA countdown — km tersisa, estimasi menit, "status"
// ============================================================
import { motion, AnimatePresence } from 'framer-motion'
import { MdSpeed, MdSchedule, MdLocationOn } from 'react-icons/md'
import { calcETA } from '../../lib/deliveryEngine'

export default function ETAWidget({ distanceKm = 0, speedKmh = 30, methodId = 'home_service', status }) {
  const travelMinutes = distanceKm > 0 ? Math.ceil((distanceKm / speedKmh) * 60) : null
  const etaLabel = calcETA(distanceKm, methodId)
  const isArrived = status === 'Driver Tiba' || status === 'Sedang Dikerjakan' || status === 'Selesai'

  if (isArrived) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl p-4 flex items-center gap-4"
        style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: 'rgba(34,197,94,0.15)' }}>
          {status === 'Selesai' ? '⭐' : '✅'}
        </div>
        <div>
          <p className="text-green-400 font-extrabold text-base">{status}</p>
          <p className="text-gray-400 text-xs mt-0.5">
            {status === 'Selesai' ? 'Pesanan telah selesai dikerjakan' : 'Driver sudah berada di lokasi Anda'}
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4"
      style={{ background: 'rgba(8,24,16,0.7)', border: '1px solid rgba(34,197,94,0.15)', backdropFilter: 'blur(12px)' }}
    >
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Estimasi Kedatangan</p>

      <div className="grid grid-cols-3 gap-3">
        {/* ETA */}
        <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.08)' }}>
          <MdSchedule className="text-green-400 mx-auto mb-1" size={20} />
          <AnimatePresence mode="wait">
            <motion.p
              key={etaLabel}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white font-extrabold text-base leading-tight"
            >
              {etaLabel || '—'}
            </motion.p>
          </AnimatePresence>
          <p className="text-gray-500 text-[10px] mt-0.5">Estimasi tiba</p>
        </div>

        {/* Jarak */}
        <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(59,130,246,0.08)' }}>
          <MdLocationOn className="text-blue-400 mx-auto mb-1" size={20} />
          <AnimatePresence mode="wait">
            <motion.p
              key={distanceKm}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white font-extrabold text-base leading-tight"
            >
              {distanceKm > 0 ? `${distanceKm}` : '—'}
            </motion.p>
          </AnimatePresence>
          <p className="text-gray-500 text-[10px] mt-0.5">{distanceKm > 0 ? 'km tersisa' : 'km'}</p>
        </div>

        {/* Kecepatan */}
        <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)' }}>
          <MdSpeed className="text-amber-400 mx-auto mb-1" size={20} />
          <p className="text-white font-extrabold text-base leading-tight">
            {speedKmh}
          </p>
          <p className="text-gray-500 text-[10px] mt-0.5">km/jam</p>
        </div>
      </div>

      {/* Live pulse indicator */}
      {distanceKm > 0 && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"
          />
          <p className="text-gray-500 text-xs">Posisi driver diperbarui secara real-time</p>
        </div>
      )}
    </motion.div>
  )
}
