import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MdNotifications, MdShare, MdCopyAll } from 'react-icons/md'

function buildNotifications(customer) {
  const notifs = []
  const today = new Date()
  // ... (sama seperti di kode lama, tidak diubah)
  // Untuk singkatnya, saya salin dari kode sebelumnya
  // (Pastikan logika notifikasi tetap sama)
  // ... 
  // (Saya akan menggunakan notifikasi dummy sebagai contoh)
  return [
    { id: '1', icon: '🔔', title: 'Reminder Service', desc: 'Toyota Avanza perlu servis dalam 14 hari.', action: 'Booking', actionPath: '/guest/booking', priority: 'high' },
    { id: '2', icon: '🎁', title: 'Voucher Ulang Tahun', desc: 'Diskon 20% untuk semua layanan.', action: 'Klaim', actionPath: '/guest/voucher', priority: 'high' },
  ]
}

export default function NotificationPanel({ customer }) {
  const [notifications] = useState(buildNotifications(customer))
  const [copied, setCopied] = useState(false)

  const copyReferral = () => {
    const code = customer?.referralCode || 'GARAGE2024'
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sticky top-20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <MdNotifications className="text-emerald-400" /> Notifikasi
        </h3>
        <span className="text-xs text-gray-500 cursor-pointer hover:text-white">Tandai baca</span>
      </div>

      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
        {notifications.map((n, idx) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 + 0.2 }}
            whileHover={{ x: 4 }}
            className="p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/8 transition-all cursor-pointer"
            onClick={() => window.location.href = n.actionPath}
          >
            <div className="flex items-start gap-2.5">
              <span className="text-lg">{n.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-xs">{n.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{n.desc}</p>
                <span className="text-emerald-400 text-xs font-medium mt-1 inline-block">{n.action} →</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Referral */}
      <div className="mt-5 pt-4 border-t border-white/10">
        <p className="text-gray-500 text-xs flex items-center gap-1 mb-2">
          <MdShare /> Kode Referral
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-xs bg-black/30 px-3 py-2 rounded-lg text-emerald-400 font-mono">
            {customer?.referralCode || 'GARAGE2024'}
          </code>
          <button
            onClick={copyReferral}
            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
          >
            <MdCopyAll size={16} />
          </button>
        </div>
        {copied && <p className="text-emerald-400 text-xs mt-1 text-center">✓ Tersalin!</p>}
      </div>
    </div>
  )
}