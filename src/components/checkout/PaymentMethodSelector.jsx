// ============================================================
// PaymentMethodSelector.jsx
// Selector metode pembayaran — Cash (COD/Bengkel) & QRIS
// Extensible untuk future: Transfer Bank, E-Wallet
// ============================================================
import { motion, AnimatePresence } from 'framer-motion'
import { MdCheckCircle, MdExpandMore, MdExpandLess } from 'react-icons/md'
import { useState } from 'react'

export const PAYMENT_METHODS = [
  {
    id: 'cash',
    label: 'Cash',
    icon: '💵',
    desc: 'Bayar tunai — COD atau di bengkel',
    color: '#22C55E',
    gradient: 'linear-gradient(135deg,#22C55E22,#16A34A11)',
    border: 'rgba(34,197,94,0.3)',
    subOptions: [
      { id: 'cod', label: 'Bayar Saat Diterima (COD)', icon: '🚚', desc: 'Bayar tunai saat barang tiba di tangan Anda' },
      { id: 'bengkel', label: 'Bayar di Bengkel', icon: '🏪', desc: 'Datang dan bayar langsung di Esther Garage' },
    ],
  },
  {
    id: 'qris',
    label: 'QRIS',
    icon: '📱',
    desc: 'Scan QR — semua e-wallet & bank',
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg,#3B82F622,#2563EB11)',
    border: 'rgba(59,130,246,0.3)',
    subOptions: [],
  },
]

// Future methods (disabled for now)
export const FUTURE_METHODS = [
  { id: 'transfer', label: 'Transfer Bank', icon: '🏦', desc: 'Segera hadir' },
  { id: 'va', label: 'Virtual Account', icon: '🏧', desc: 'Segera hadir' },
  { id: 'ewallet', label: 'E-Wallet', icon: '💳', desc: 'OVO, Dana, GoPay — Segera hadir' },
]

export default function PaymentMethodSelector({ selected, subSelected, onSelect, onSubSelect }) {
  return (
    <div className="space-y-3">
      {/* Active methods */}
      {PAYMENT_METHODS.map(method => {
        const isSelected = selected?.id === method.id
        return (
          <div key={method.id}>
            <motion.div
              layout
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelect(method)}
              className="rounded-2xl p-4 cursor-pointer transition-all"
              style={{
                background: isSelected ? method.gradient : 'rgba(255,255,255,0.02)',
                border: isSelected ? `1.5px solid ${method.border}` : '1px solid rgba(255,255,255,0.08)',
                boxShadow: isSelected ? `0 4px 20px ${method.color}15` : 'none',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${method.color}15`, border: `1px solid ${method.color}25` }}>
                  {method.icon}
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">{method.label}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{method.desc}</p>
                </div>
                {isSelected && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <MdCheckCircle size={22} style={{ color: method.color }} />
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Sub-options for Cash */}
            <AnimatePresence>
              {isSelected && method.subOptions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 ml-4 space-y-2"
                >
                  {method.subOptions.map(sub => {
                    const isSub = subSelected?.id === sub.id
                    return (
                      <motion.div
                        key={sub.id}
                        onClick={() => onSubSelect(sub)}
                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                        style={{
                          background: isSub ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.02)',
                          border: isSub ? '1.5px solid rgba(34,197,94,0.25)' : '1px solid rgba(255,255,255,0.06)',
                        }}
                        whileHover={{ x: 2 }}
                      >
                        <span className="text-lg">{sub.icon}</span>
                        <div className="flex-1">
                          <p className="text-white text-sm font-semibold">{sub.label}</p>
                          <p className="text-gray-500 text-xs">{sub.desc}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 transition-all ${isSub ? 'bg-green-500 border-green-500' : 'border-gray-600'}`}>
                          {isSub && <div className="w-1.5 h-1.5 bg-white rounded-full m-auto mt-0.5" />}
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}

      {/* Future / disabled methods */}
      <div className="mt-4 space-y-2">
        <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider px-1">Segera Hadir</p>
        {FUTURE_METHODS.map(method => (
          <div key={method.id}
            className="rounded-2xl p-4 opacity-40 cursor-not-allowed flex items-center gap-3"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              {method.icon}
            </div>
            <div>
              <p className="text-gray-400 font-semibold text-sm">{method.label}</p>
              <p className="text-gray-600 text-xs">{method.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
