// ============================================================
// LoyaltySection.jsx — Loyalty dashboard with tier progression
// ============================================================
import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { calcLoyaltyProgress, TIER_CONFIG, TIER_BENEFITS, calcAchievements } from '../../lib/loyaltyConstants'

const fmtPts = (n) => Number(n).toLocaleString('id-ID')

function AnimatedProgress({ value, color = '#22C55E', height = 6, bg = 'rgba(255,255,255,0.1)', delay = 0 }) {
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height, background: bg }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(value, 100)}%` }}
        transition={{ duration: 0.8, delay, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}88, ${color})` }}
      />
    </div>
  )
}

function TierBadge({ tier, size = 'md' }) {
  const cfg = TIER_CONFIG[tier]
  if (!cfg) return null
  const sizeClasses = size === 'lg' ? 'text-lg px-4 py-2' : 'text-xs px-3 py-1'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold ${sizeClasses}`}
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
    >
      {cfg.icon} {tier}
    </span>
  )
}

function TierCard({ tier, current = false }) {
  const cfg = TIER_CONFIG[tier]
  if (!cfg) return null
  const benefits = TIER_BENEFITS[tier] || []
  return (
    <div
      className={`rounded-2xl p-4 transition-all ${current ? 'ring-2 scale-105' : ''}`}
      style={{
        background: current ? `${cfg.color}10` : 'rgba(255,255,255,0.02)',
        border: `1px solid ${current ? cfg.border : 'rgba(255,255,255,0.06)'}`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{cfg.icon}</span>
        <span className="text-white font-bold text-sm">{tier}</span>
        {current && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>
            Saat Ini
          </span>
        )}
      </div>
      <ul className="space-y-1">
        {benefits.map((b, i) => (
          <li key={i} className="flex items-start gap-1.5 text-gray-400 text-[11px]">
            <span className="text-green-400 mt-0.5">✓</span> {b}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function LoyaltySection({ customer, pointHistory = [] }) {
  const points = customer?.points || 0
  const loyalty = useMemo(() => calcLoyaltyProgress(points), [points])
  const tierCfg = TIER_CONFIG[loyalty.tier]
  const achievements = useMemo(() => calcAchievements(customer || {}), [customer])
  const [showPoints, setShowPoints] = useState(false)

  const inHistory = pointHistory.filter((p) => p.type === 'in')
  const outHistory = pointHistory.filter((p) => p.type === 'out')

  return (
    <div className="space-y-5">
      {/* Current Tier Hero */}
      <div
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${tierCfg.color}15 0%, rgba(4,18,14,0.9) 100%)`,
          border: `1px solid ${tierCfg.border}`,
        }}
      >
        <div
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20"
          style={{ background: `radial-gradient(circle, ${tierCfg.color} 0%, transparent 70%)` }}
        />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{tierCfg.icon}</span>
                <h3 className="text-white font-bold text-lg">{loyalty.tier} Member</h3>
              </div>
              <p className="text-gray-400 text-xs">
                {fmtPts(points)} poin terkumpul
              </p>
            </div>
            {loyalty.nextTier && (
              <div className="text-right">
                <p className="text-gray-500 text-[10px]">Menuju {loyalty.nextTier}</p>
                <p className="text-white font-bold text-sm">{loyalty.pointsToNext} poin lagi</p>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="mb-2">
            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
              <span>{loyalty.tier}</span>
              <span>{loyalty.progress}%</span>
              <span>{loyalty.nextTier || '🏆 MAX'}</span>
            </div>
            <AnimatedProgress value={loyalty.progress} color={tierCfg.color} height={8} delay={0.2} />
          </div>
        </div>
      </div>

      {/* All Tiers */}
      <div>
        <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          🏆 Semua Tier & Benefit
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">            {['VIP Mahkota', 'Platinum', 'Gold', 'Silver', 'Bronze'].map((t) => (
            <TierCard key={t} tier={t} current={loyalty.tier === t} />
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
          🎯 Prestasi
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={`rounded-xl p-3 text-center transition-all ${
                a.unlocked ? 'border' : 'opacity-40'
              }`}
              style={{
                background: a.unlocked ? `${tierCfg.color}08` : 'rgba(255,255,255,0.02)',
                borderColor: a.unlocked ? `${tierCfg.color}20` : 'rgba(255,255,255,0.05)',
              }}
            >
              <div className={`text-2xl mb-1 ${a.unlocked ? '' : 'grayscale'}`}>{a.icon}</div>
              <p className={`text-xs font-semibold ${a.unlocked ? 'text-white' : 'text-gray-600'}`}>
                {a.label}
              </p>
              <p className="text-[9px] text-gray-500 mt-0.5">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Point History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white font-semibold text-sm flex items-center gap-2">📊 Riwayat Poin</h4>
          <button
            onClick={() => setShowPoints(!showPoints)}
            className="text-xs text-green-400 hover:text-green-300 transition-colors"
          >
            {showPoints ? 'Sembunyikan' : `Lihat Semua (${pointHistory.length})`}
          </button>
        </div>

        {pointHistory.length === 0 ? (
          <p className="text-gray-600 text-xs italic">Belum ada riwayat poin.</p>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {(showPoints ? pointHistory : pointHistory.slice(0, 5)).map((p, i) => (
              <div
                key={p.id || i}
                className="flex items-center justify-between p-2.5 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={p.type === 'in' ? 'text-emerald-400' : 'text-red-400'}>
                    {p.type === 'in' ? '➕' : '➖'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-white text-xs truncate">{p.desc || 'Transaksi poin'}</p>
                    <p className="text-gray-600 text-[10px]">{p.date ? new Date(p.date).toLocaleDateString('id-ID') : '-'}</p>
                  </div>
                </div>
                <span
                  className={`text-sm font-bold flex-shrink-0 ${p.type === 'in' ? 'text-emerald-400' : 'text-red-400'}`}
                >
                  {p.type === 'in' ? '+' : '-'}{Math.abs(p.points || 0)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export { TierBadge, AnimatedProgress }
