// ============================================================
// DeliveryMethodCard.jsx
// Card pilih metode layanan dengan estimasi biaya & waktu
// ============================================================
import { motion } from 'framer-motion'
import { MdCheckCircle, MdSchedule } from 'react-icons/md'
import { fmtRp, calcETA } from '../../lib/deliveryEngine'

export default function DeliveryMethodCard({ method, selected, distanceKm, fee, onSelect }) {
  const eta = calcETA(distanceKm || 0, method.id)
  const unavailable = distanceKm > method.maxKm && method.id !== 'ambil_sendiri'

  return (
    <motion.div
      layout
      whileHover={!unavailable ? { y: -2, scale: 1.01 } : {}}
      whileTap={!unavailable ? { scale: 0.98 } : {}}
      onClick={() => !unavailable && onSelect?.(method)}
      className={`relative rounded-2xl p-4 transition-all ${unavailable ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
      style={{
        background: selected ? method.gradient : 'rgba(255,255,255,0.02)',
        border: selected
          ? `1.5px solid ${method.border}`
          : '1px solid rgba(255,255,255,0.08)',
        boxShadow: selected ? `0 4px 24px ${method.color}20` : 'none',
      }}
    >
      {/* Selected indicator */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400 }}
          className="absolute top-3 right-3"
        >
          <MdCheckCircle size={20} style={{ color: method.color }} />
        </motion.div>
      )}

      {/* Unavailable badge */}
      {unavailable && (
        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] text-gray-400"
          style={{ background: 'rgba(255,255,255,0.08)' }}>
          Jarak terlalu jauh
        </span>
      )}

      <div className="flex items-start gap-3 pr-6">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: `${method.color}15`, border: `1px solid ${method.color}25` }}>
          {method.icon}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm">{method.label}</p>
          <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{method.desc}</p>

          <div className="flex items-center gap-3 mt-2.5 flex-wrap">
            {/* Biaya */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-500 uppercase tracking-wide">Biaya</span>
              <span className="text-sm font-bold" style={{ color: method.id === 'ambil_sendiri' ? '#22C55E' : method.color }}>
                {fmtRp(fee)}
              </span>
            </div>

            {/* ETA */}
            {eta && (
              <>
                <span className="w-1 h-1 rounded-full bg-gray-700" />
                <div className="flex items-center gap-1 text-gray-400">
                  <MdSchedule size={12} />
                  <span className="text-xs">{eta}</span>
                </div>
              </>
            )}

            {/* Jarak info */}
            {distanceKm > 0 && method.id !== 'ambil_sendiri' && (
              <>
                <span className="w-1 h-1 rounded-full bg-gray-700" />
                <span className="text-xs text-gray-500">{distanceKm} km</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Detail breakdown */}
      {selected && method.id !== 'ambil_sendiri' && distanceKm > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-3 border-t flex gap-4 flex-wrap"
          style={{ borderColor: `${method.color}20` }}
        >
          <div className="text-center">
            <p className="text-[10px] text-gray-500">Base Fee</p>
            <p className="text-xs font-bold text-gray-300">{fmtRp(method.baseFee)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-500">Per KM</p>
            <p className="text-xs font-bold text-gray-300">{fmtRp(method.perKmFee)}/km</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-500">Jarak</p>
            <p className="text-xs font-bold text-gray-300">{distanceKm} km</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-500">Total</p>
            <p className="text-xs font-bold" style={{ color: method.color }}>{fmtRp(fee)}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
