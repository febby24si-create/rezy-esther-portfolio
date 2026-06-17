import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MdCardGiftcard, MdArrowForward } from 'react-icons/md'

export default function VoucherSection({ customer }) {
  const vouchers = (customer.vouchers || []).filter(v => v.status === 'active')

  if (vouchers.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
        <p className="text-gray-500 text-sm">Belum ada voucher aktif.</p>
        <Link to="/guest/voucher" className="text-emerald-400 text-sm hover:text-emerald-300 inline-block mt-2">
          Lihat semua voucher →
        </Link>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold flex items-center gap-2">
          <MdCardGiftcard className="text-purple-400" /> Voucher Aktif
        </h3>
        <Link to="/guest/voucher" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
          Lihat semua <MdArrowForward size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {vouchers.slice(0, 3).map((v, idx) => (
          <motion.div
            key={v.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 + 0.2 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎫</span>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{v.title}</p>
                <p className="text-purple-400 font-bold text-sm">Diskon {v.diskon}%</p>
                <p className="text-gray-500 text-xs">s/d {v.validUntil}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}