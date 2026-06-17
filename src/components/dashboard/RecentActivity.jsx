import { motion } from 'framer-motion'
import { MdHistory } from 'react-icons/md'

export default function RecentActivity({ customer }) {
  // Ambil activity dari history (contoh dummy)
  const activities = [
    { icon: '⭐', desc: '+150 Poin diperoleh', time: '2 jam lalu', type: 'point' },
    { icon: '🎫', desc: 'Voucher digunakan — Diskon 15%', time: '5 jam lalu', type: 'voucher' },
    { icon: '📅', desc: 'Booking dibuat — Servis Berkala', time: '1 hari lalu', type: 'booking' },
    { icon: '✅', desc: 'Servis selesai — Toyota Avanza', time: '2 hari lalu', type: 'service' },
  ]

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-white font-bold flex items-center gap-2 mb-4">
        <MdHistory className="text-emerald-400" /> Aktivitas Terbaru
      </h3>
      <div className="space-y-3">
        {activities.map((act, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.06 + 0.3 }}
            className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/8 transition-all"
          >
            <span className="text-xl">{act.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium">{act.desc}</p>
              <p className="text-gray-500 text-xs">{act.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}