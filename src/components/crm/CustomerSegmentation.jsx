// ============================================================
// CustomerSegmentation.jsx — Filter segmen CRM
// ============================================================
import { useMemo } from 'react'

const SEGMENTS = [
  { key: 'all',           label: 'Semua',         icon: '👥', color: '#22C55E' },
  { key: 'bronze',        label: 'Bronze',        icon: '🥉', color: '#F97316' },
  { key: 'silver',        label: 'Silver',        icon: '🥈', color: '#94A3B8' },
  { key: 'gold',          label: 'Gold',          icon: '🥇', color: '#FBBF24' },
  { key: 'platinum',      label: 'Platinum',      icon: '💎', color: '#A855F7' },
  { key: 'vip_mahkota',   label: 'VIP Mahkota',   icon: '👑', color: '#EC4899' },
  { key: 'new',           label: 'Member Baru',   icon: '🆕', color: '#3B82F6' },
  { key: 'inactive',      label: 'Tidak Aktif',   icon: '😴', color: '#F97316' },
  { key: 'top_spender',   label: 'Top Spender',   icon: '💰', color: '#FBBF24' },
]

export default function CustomerSegmentation({ customers = [], selected, onSelect }) {
  const counts = useMemo(() => {
    const calc = (c) => {
      const p = c.points || 0
      if (p >= 5000) return 'vip_mahkota'
      if (p >= 3000) return 'platinum'
      if (p >= 1500) return 'gold'
      if (p >= 500) return 'silver'
      return 'bronze'
    }

    const counts = { all: customers.length }
    SEGMENTS.slice(1).forEach((s) => { counts[s.key] = 0 })

    customers.forEach((c) => {
      const tier = calc(c)
      counts[tier] = (counts[tier] || 0) + 1

      counts.vip_mahkota = customers.filter(
        (cx) => (cx.points || 0) >= 5000
      ).length

      const daysSinceJoin = c.joinDate
        ? Math.floor((new Date() - new Date(c.joinDate)) / 86400000)
        : 9999
      if (daysSinceJoin < 30) counts.new = (counts.new || 0) + 1

      const daysSinceLast = c.lastOrderDate
        ? Math.floor((new Date() - new Date(c.lastOrderDate)) / 86400000)
        : 9999
      if (daysSinceLast > 90) counts.inactive = (counts.inactive || 0) + 1
      if ((c.totalSpent || 0) >= 5000000) counts.top_spender = (counts.top_spender || 0) + 1
    })

    return counts
  }, [customers])

  return (
    <div className="flex flex-wrap gap-2">
      {SEGMENTS.map((seg) => {
        const count = counts[seg.key] || 0
        const isActive = selected === seg.key
        return (
          <button
            key={seg.key}
            onClick={() => onSelect(seg.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
              isActive
                ? 'bg-green-500/20 text-green-400 border-green-500/30 shadow-lg shadow-green-500/10'
                : 'text-gray-400 border-white/8 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{seg.icon}</span>
            <span>{seg.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                isActive ? 'bg-green-500/20 text-green-300' : 'bg-white/8 text-gray-500'
              }`}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
