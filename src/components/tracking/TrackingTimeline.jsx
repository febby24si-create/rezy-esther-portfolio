// ============================================================
// TrackingTimeline.jsx
// 10-step animated timeline untuk delivery/service tracking
// ============================================================
import { motion } from 'framer-motion'
import { MdCheckCircle, MdRadioButtonUnchecked } from 'react-icons/md'

export const TRACKING_STEPS = [
  { id: 1,  key: 'created',        label: 'Pesanan Dibuat',           icon: '📋', desc: 'Pesanan berhasil dibuat dan menunggu konfirmasi' },
  { id: 2,  key: 'confirmed',      label: 'Admin Memproses',          icon: '✅', desc: 'Admin sedang memproses pesanan Anda' },
  { id: 3,  key: 'driver_assigned',label: 'Driver Ditugaskan',        icon: '👷', desc: 'Driver/mekanik telah ditugaskan untuk pesanan ini' },
  { id: 4,  key: 'driver_to_shop', label: 'Driver Menuju Bengkel',    icon: '🏎️', desc: 'Driver sedang dalam perjalanan ke bengkel' },
  { id: 5,  key: 'pickup',         label: 'Pengambilan Kendaraan',    icon: '🔑', desc: 'Driver mengambil kendaraan/sparepart dari bengkel' },
  { id: 6,  key: 'driver_to_cust', label: 'Menuju Lokasi Anda',      icon: '🚗', desc: 'Driver sedang dalam perjalanan ke lokasi Anda' },
  { id: 7,  key: 'almost',         label: 'Driver Hampir Tiba',       icon: '📍', desc: 'Driver hampir tiba di lokasi Anda' },
  { id: 8,  key: 'arrived',        label: 'Driver Tiba',              icon: '🎯', desc: 'Driver telah tiba di lokasi Anda' },
  { id: 9,  key: 'in_progress',    label: 'Service Dimulai',          icon: '🔧', desc: 'Proses service/pengerjaan sedang berlangsung' },
  { id: 10, key: 'done',           label: 'Service Selesai',          icon: '⭐', desc: 'Semua pekerjaan telah selesai dengan sempurna' },
]

// Map status order ke step id
export const STATUS_TO_STEP = {
  'Menunggu Konfirmasi': 1,
  'Dikonfirmasi':        2,
  'Driver Ditugaskan':   3,
  'Driver ke Bengkel':   4,
  'Pengambilan':         5,
  'Dalam Perjalanan':    6,
  'Hampir Tiba':         7,
  'Driver Tiba':         8,
  'Sedang Dikerjakan':   9,
  'Selesai':            10,
}

function TimelineStep({ step, currentStepId, isLast, index }) {
  const done = step.id < currentStepId
  const active = step.id === currentStepId
  const pending = step.id > currentStepId

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="flex gap-3"
    >
      {/* Connector */}
      <div className="flex flex-col items-center flex-shrink-0">
        <motion.div
          animate={{
            scale: active ? [1, 1.15, 1] : 1,
            boxShadow: active ? ['0 0 0 0 rgba(34,197,94,0)', '0 0 0 8px rgba(34,197,94,0.15)', '0 0 0 0 rgba(34,197,94,0)'] : 'none',
          }}
          transition={active ? { repeat: Infinity, duration: 2 } : {}}
          className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
          style={{
            background: done
              ? 'rgba(34,197,94,0.15)'
              : active
              ? 'linear-gradient(135deg,rgba(34,197,94,0.25),rgba(16,163,74,0.15))'
              : 'rgba(255,255,255,0.03)',
            border: done
              ? '2px solid rgba(34,197,94,0.5)'
              : active
              ? '2px solid rgba(34,197,94,0.8)'
              : '2px solid rgba(255,255,255,0.08)',
          }}
        >
          {done ? (
            <MdCheckCircle className="text-green-400" size={18} />
          ) : active ? (
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-sm"
            >
              {step.icon}
            </motion.span>
          ) : (
            <span className="text-gray-600 text-sm">{step.icon}</span>
          )}
        </motion.div>

        {!isLast && (
          <div className="w-0.5 my-1 flex-1 min-h-6 rounded-full"
            style={{ background: done ? 'linear-gradient(180deg,rgba(34,197,94,0.4),rgba(34,197,94,0.1))' : 'rgba(255,255,255,0.06)' }} />
        )}
      </div>

      {/* Content */}
      <div className={`pb-5 flex-1 ${isLast ? 'pb-0' : ''}`}>
        <div className="flex items-center justify-between gap-2 min-h-9">
          <div>
            <p className={`font-semibold text-sm transition-colors ${done ? 'text-gray-300' : active ? 'text-white' : 'text-gray-600'}`}>
              {step.label}
            </p>
            {(done || active) && (
              <p className={`text-xs mt-0.5 leading-relaxed ${done ? 'text-gray-500' : 'text-gray-400'}`}>
                {step.desc}
              </p>
            )}
          </div>
          {active && (
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"
            />
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function TrackingTimeline({ status, currentStep }) {
  const stepId = currentStep || STATUS_TO_STEP[status] || 1

  return (
    <div className="rounded-2xl p-5" style={{ background: 'rgba(4,12,8,0.6)', border: '1px solid rgba(34,197,94,0.1)' }}>
      <div className="flex items-center justify-between mb-5">
        <p className="text-white font-bold text-sm">Timeline Pengiriman</p>
        <div className="text-xs text-gray-500">Step {stepId}/{TRACKING_STEPS.length}</div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full mb-6 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((stepId - 1) / (TRACKING_STEPS.length - 1)) * 100}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{ background: 'linear-gradient(90deg,#22C55E,#10B981)' }}
        />
      </div>

      {TRACKING_STEPS.map((step, i) => (
        <TimelineStep
          key={step.id}
          step={step}
          currentStepId={stepId}
          isLast={i === TRACKING_STEPS.length - 1}
          index={i}
        />
      ))}
    </div>
  )
}
