// ============================================================
// DriverCard.jsx
// Kartu driver/mekanik yang bertugas — foto, info, aksi
// ============================================================
import { motion } from 'framer-motion'
import { MdPhone, MdChat, MdStar, MdDirectionsCar, MdBuild } from 'react-icons/md'

// Rating stars
function StarRating({ rating = 5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <MdStar key={i} size={13}
          className={i <= Math.round(rating) ? 'text-amber-400' : 'text-gray-700'} />
      ))}
      <span className="text-xs text-gray-400 ml-1">{rating.toFixed(1)}</span>
    </div>
  )
}

// Avatar initials
function Avatar({ name, size = 56, color = '#22C55E' }) {
  const initials = name ? name.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase() : '?'
  return (
    <div className="rounded-2xl flex items-center justify-center font-extrabold text-white flex-shrink-0"
      style={{ width: size, height: size, background: `${color}22`, border: `2px solid ${color}40`, fontSize: size * 0.35 }}>
      {initials}
    </div>
  )
}

export default function DriverCard({ driver, onCall, onChat }) {
  if (!driver) {
    return (
      <div className="rounded-2xl p-5 flex items-center gap-4"
        style={{ background: 'rgba(8,24,16,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="w-14 h-14 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="flex-1 space-y-2">
          <div className="h-3 rounded-full animate-pulse w-32" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="h-2.5 rounded-full animate-pulse w-24" style={{ background: 'rgba(255,255,255,0.04)' }} />
        </div>
      </div>
    )
  }

  const phone = driver.phone || driver.contact
  const whatsappUrl = phone
    ? `https://wa.me/62${phone.replace(/^0/, '').replace(/\D/g, '')}`
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5"
      style={{ background: 'rgba(8,24,16,0.7)', border: '1px solid rgba(34,197,94,0.15)', backdropFilter: 'blur(12px)' }}
    >
      <p className="text-green-400 text-[10px] font-bold uppercase tracking-widest mb-3">Driver / Mekanik</p>

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative">
          <Avatar name={driver.name} size={56} />
          {/* Online dot */}
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-400"
            style={{ border: '2px solid #040E09' }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-extrabold text-base">{driver.name || 'Driver'}</p>
          <StarRating rating={driver.rating || 4.8} />

          <div className="flex flex-wrap gap-3 mt-2.5">
            {/* Kendaraan */}
            {driver.vehicle && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <MdDirectionsCar size={13} className="text-gray-400" />
                <span className="text-xs text-gray-300">{driver.vehicle}</span>
              </div>
            )}
            {/* Nomor Polisi */}
            {driver.plate && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-xs font-mono font-bold text-white">{driver.plate}</span>
              </div>
            )}
            {/* Spesialisasi */}
            {driver.specialization && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
                <MdBuild size={12} className="text-green-400" />
                <span className="text-xs text-green-300">{driver.specialization}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-4">
        {phone && (
          <motion.a
            href={`tel:${phone}`}
            whileTap={{ scale: 0.95 }}
            className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-white transition-all"
            style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}
          >
            <MdPhone size={16} className="text-green-400" />
            Telepon
          </motion.a>
        )}
        {whatsappUrl && (
          <motion.a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            whileTap={{ scale: 0.95 }}
            className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-white transition-all"
            style={{ background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.3)' }}
          >
            <MdChat size={16} style={{ color: '#25D366' }} />
            Chat WA
          </motion.a>
        )}
      </div>
    </motion.div>
  )
}
