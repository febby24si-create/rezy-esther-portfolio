// ============================================================
// RewardCard.jsx — Reward/Voucher card component
// ============================================================
import { motion } from 'framer-motion'

export default function RewardCard({ reward, onRedeem, index = 0, compact = false }) {
  const pct = reward.stock > 0
    ? Math.round(((reward.redeemed || 0) / reward.stock) * 100)
    : 0

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        className="flex items-center gap-3 p-3 rounded-xl border border-white/8 hover:border-green-500/20 transition-all"
        style={{ background: 'rgba(255,255,255,0.02)' }}
      >
        <span className="text-2xl">{reward.icon || '🎁'}</span>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate">{reward.name}</p>
          <p className="text-gray-500 text-xs">{reward.points_cost} poin · Stok: {reward.stock - (reward.redeemed || 0)}</p>
        </div>
        <button
          onClick={() => onRedeem?.(reward)}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-500/15 text-green-400 border border-green-500/25 hover:bg-green-500/25 transition-all"
        >
          Tukar
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-2xl border p-5 hover:border-green-500/20 transition-all group flex flex-col"
      style={{
        background: 'rgba(255,255,255,0.025)',
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: 'rgba(34,197,94,0.1)' }}
        >
          {reward.icon || '🎁'}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-bold text-sm">{reward.name}</h4>
          <p className="text-gray-400 text-xs mt-1">{reward.description}</p>
        </div>
      </div>

      {/* Points cost */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-yellow-400 text-xl font-black">{reward.points_cost}</span>
        <span className="text-gray-500 text-xs">poin</span>
      </div>

      {/* Stock */}
      <div className="mt-auto">
        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
          <span>Stok: {reward.stock - (reward.redeemed || 0)}/{reward.stock}</span>
          <span>{pct}% terpakai</span>
        </div>
        <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/5">
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, #22C55E, ${pct > 80 ? '#EF4444' : '#FBBF24'})`,
            }}
          />
        </div>
      </div>

      <button
        onClick={() => onRedeem?.(reward)}
        disabled={reward.stock - (reward.redeemed || 0) <= 0}
        className="w-full mt-4 py-2.5 rounded-xl text-sm font-bold transition-all border disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: 'rgba(34,197,94,0.1)',
          color: '#22C55E',
          borderColor: 'rgba(34,197,94,0.25)',
        }}
        onMouseEnter={(e) => { e.target.style.background = 'rgba(34,197,94,0.2)' }}
        onMouseLeave={(e) => { e.target.style.background = 'rgba(34,197,94,0.1)' }}
      >
        Tukar Poin
      </button>
    </motion.div>
  )
}
