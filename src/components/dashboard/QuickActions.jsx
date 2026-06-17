import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MdDirectionsCar, MdCardGiftcard, MdHistory, MdStars } from 'react-icons/md'

const actions = [
  { icon: MdDirectionsCar, label: 'Booking', path: '/guest/booking', color: '#10B981' },
  { icon: MdCardGiftcard, label: 'Voucher', path: '/guest/voucher', color: '#A855F7' },
  { icon: MdHistory, label: 'Riwayat', path: '/guest/riwayat', color: '#F59E0B' },
  { icon: MdStars, label: 'Loyalty', path: '/guest/loyalty', color: '#60A5FA' },
]

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
      {actions.map(({ icon: Icon, label, path, color }, idx) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.08 + 0.2 }}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <Link
            to={path}
            className="block rounded-2xl p-5 text-center transition-all duration-300 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/8"
          >
            <div
              className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center"
              style={{ background: `${color}18`, border: `1px solid ${color}30` }}
            >
              <Icon className="text-2xl" style={{ color }} />
            </div>
            <p className="text-white font-medium text-sm">{label}</p>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}