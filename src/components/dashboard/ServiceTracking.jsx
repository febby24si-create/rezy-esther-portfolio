import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MdCheckCircle, MdGpsFixed, MdArrowForward } from 'react-icons/md'

const steps = ['Booking', 'Check In', 'Inspection', 'Repair', 'Done']

export default function ServiceTracking({ customer }) {
  // Simulasi data tracking (ambil dari localStorage atau context)
  const orders = JSON.parse(localStorage.getItem('garage_orders') || '[]')
  const activeOrder = orders.find(o => o.customer === customer.name && o.status === 'Sedang Dikerjakan')

  if (!activeOrder) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4"
        >
          <MdCheckCircle className="text-emerald-400 text-3xl" />
        </motion.div>
        <p className="text-white font-medium">Tidak ada service aktif</p>
        <p className="text-gray-500 text-sm mt-1">Booking sekarang untuk perawatan kendaraan Anda.</p>
        <Link to="/guest/booking" className="inline-block mt-4 text-emerald-400 hover:text-emerald-300 text-sm font-medium">
          Booking Sekarang →
        </Link>
      </div>
    )
  }

  // Tentukan step aktif (contoh: 2 = Inspection)
  const currentStepIndex = 2

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-white font-bold flex items-center gap-2">
          <MdGpsFixed className="text-emerald-400" /> Service Aktif
        </h3>
        <span className="text-xs px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
          {activeOrder.id}
        </span>
      </div>

      <div className="relative flex items-center justify-between">
        {steps.map((label, idx) => {
          const isActive = idx === currentStepIndex
          const isDone = idx < currentStepIndex
          return (
            <div key={label} className="flex flex-col items-center flex-1 relative">
              <div className="relative z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone ? 'bg-emerald-500 text-white' :
                    isActive ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 animate-pulse' :
                    'bg-white/10 border border-white/20 text-gray-500'
                  }`}
                >
                  {isDone ? '✓' : idx + 1}
                </div>
              </div>
              <span className={`text-[10px] font-medium mt-2 ${isActive ? 'text-emerald-400' : isDone ? 'text-white/60' : 'text-gray-600'}`}>
                {label}
              </span>
              {idx < steps.length - 1 && (
                <div className={`absolute top-4 left-[60%] w-[80%] h-0.5 ${idx < currentStepIndex ? 'bg-emerald-500' : 'bg-white/10'}`} />
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-sm">
        <div>
          <p className="text-gray-400">Mekanik: <span className="text-white">{activeOrder.mechanic}</span></p>
          <p className="text-gray-400">{activeOrder.service}</p>
        </div>
        <Link to="/guest/tracking" className="text-emerald-400 hover:text-emerald-300 text-xs flex items-center gap-1">
          Detail <MdArrowForward size={12} />
        </Link>
      </div>
    </div>
  )
}