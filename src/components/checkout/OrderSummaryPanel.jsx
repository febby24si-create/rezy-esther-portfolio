// ============================================================
// OrderSummaryPanel.jsx
// Sticky order summary panel — produk, biaya, total, CTA
// ============================================================
import { motion, AnimatePresence } from 'framer-motion'
import { MdCheckCircle, MdShoppingCart, MdLocalShipping, MdBuild } from 'react-icons/md'
import { formatRupiah } from '../../lib/formatRupiah'
import { fmtRp } from '../../lib/deliveryEngine'

export default function OrderSummaryPanel({
  items = [],
  subtotal = 0,
  deliveryFee = 0,
  deliveryMethod,
  selectedAddress,
  step,
  maxStep,
  onNext,
  onSubmit,
  submitting,
}) {
  const total = subtotal + deliveryFee
  const canProceed = step < maxStep

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(8,24,16,0.6)', border: '1px solid rgba(34,197,94,0.15)', backdropFilter: 'blur(12px)' }}>

      {/* Header */}
      <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <MdShoppingCart className="text-green-400" size={18} />
          <h3 className="text-white font-bold text-sm">Ringkasan Pesanan</h3>
        </div>
        <p className="text-gray-500 text-xs mt-0.5">{items.length} item</p>
      </div>

      {/* Items */}
      <div className="px-5 py-3 max-h-48 overflow-y-auto space-y-2.5">
        {items.map((it) => (
          <div key={it.product_id} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                style={{ background: 'rgba(34,197,94,0.2)' }}>{it.qty}</span>
              <span className="text-gray-300 text-xs truncate">{it.name}</span>
            </div>
            <span className="text-white text-xs font-semibold flex-shrink-0">{formatRupiah(it.qty * it.price)}</span>
          </div>
        ))}
      </div>

      {/* Cost breakdown */}
      <div className="px-5 py-3 space-y-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Subtotal</span>
          <span className="text-gray-200">{formatRupiah(subtotal)}</span>
        </div>

        <AnimatePresence>
          {deliveryMethod && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex justify-between text-xs text-gray-400"
            >
              <span className="flex items-center gap-1">
                {deliveryMethod.id === 'home_service' ? <MdBuild size={11} /> : <MdLocalShipping size={11} />}
                {deliveryMethod.label}
              </span>
              <span className={deliveryFee === 0 ? 'text-green-400 font-semibold' : 'text-gray-200'}>
                {deliveryFee === 0 ? 'Gratis' : formatRupiah(deliveryFee)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between items-center text-white font-bold pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <span className="text-sm">Total</span>
          <motion.span
            key={total}
            initial={{ scale: 1.15, color: '#22C55E' }}
            animate={{ scale: 1, color: '#ffffff' }}
            transition={{ duration: 0.3 }}
            className="text-lg font-extrabold"
          >
            {formatRupiah(total)}
          </motion.span>
        </div>
      </div>

      {/* Selected address preview */}
      <AnimatePresence>
        {selectedAddress && step >= 2 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-5 pb-3"
          >
            <div className="p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }}>
              <p className="text-green-400 text-[10px] font-bold uppercase tracking-wide mb-1">📍 Dikirim ke</p>
              <p className="text-gray-300 text-xs font-semibold">{selectedAddress.recipient_name}</p>
              <p className="text-gray-500 text-[11px] leading-relaxed mt-0.5 line-clamp-2">{selectedAddress.full_address}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      <div className="px-5 pb-5">
        {canProceed ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onNext}
            className="w-full py-3.5 rounded-2xl font-bold text-white text-sm transition-all"
            style={{ background: 'linear-gradient(135deg,#22C55E,#16A34A)', boxShadow: '0 4px 20px rgba(34,197,94,0.25)' }}
          >
            Lanjut →
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onSubmit}
            disabled={submitting}
            className="w-full py-3.5 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
            style={{ background: 'linear-gradient(135deg,#22C55E,#16A34A)', boxShadow: '0 4px 20px rgba(34,197,94,0.25)' }}
          >
            {submitting ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                className="w-4 h-4 rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <><MdCheckCircle size={16} /> Konfirmasi &amp; Bayar</>
            )}
          </motion.button>
        )}

        <p className="text-gray-600 text-[10px] text-center mt-2.5">
          🔒 Pesanan aman &amp; terenkripsi
        </p>
      </div>
    </div>
  )
}
