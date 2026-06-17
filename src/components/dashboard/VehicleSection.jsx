import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MdDirectionsCar, MdAdd } from 'react-icons/md'

export default function VehicleSection({ customer }) {
  const vehicles = customer.vehicles || []

  if (vehicles.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <p className="text-gray-500 text-sm">Belum ada kendaraan terdaftar.</p>
        <Link to="/guest/add-vehicle" className="inline-flex items-center gap-1 mt-3 text-emerald-400 hover:text-emerald-300 text-sm">
          <MdAdd /> Tambah kendaraan
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <MdDirectionsCar className="text-emerald-400" /> Kendaraan Saya
        </h3>
        <Link to="/guest/add-vehicle" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
          + Tambah
        </Link>
      </div>
      <div className="space-y-3">
        {vehicles.map((v, idx) => {
          const daysUntil = Math.ceil((new Date(v.nextService) - new Date()) / 86400000)
          const urgent = daysUntil <= 30
          const isOverdue = daysUntil < 0
          return (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 + 0.3 }}
              whileHover={{ x: 6, scale: 1.01 }}
              className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/5 hover:border-white/15 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">
                {v.type === 'motor' ? '🏍️' : '🚗'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">{v.brand} {v.model} {v.year}</p>
                <p className="text-gray-500 text-xs">{v.plate} · {v.km?.toLocaleString() || 0} km</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-xs font-semibold ${isOverdue ? 'text-red-400' : urgent ? 'text-orange-400' : 'text-gray-400'}`}>
                  {isOverdue ? 'Terlambat!' : daysUntil > 0 ? `${daysUntil} hari` : 'Hari ini'}
                </p>
                <p className="text-gray-600 text-[10px]">service berikutnya</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}