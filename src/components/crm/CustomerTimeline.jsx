// ============================================================
// CustomerTimeline.jsx — Vertical timeline aktivitas customer
// ============================================================
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ICON_MAP = {
  registrasi:    '🎉',
  booking:       '📅',
  'service-selesai': '✅',
  poin:          '⭐',
  redeem:        '🎁',
  'naik-tier':   '🏆',
  review:        '📝',
  promo:         '💫',
  komplain:      '⚠️',
  default:       '📌',
}

const COLOR_MAP = {
  registrasi:    '#22C55E',
  booking:       '#3B82F6',
  'service-selesai': '#10B981',
  poin:          '#FBBF24',
  redeem:        '#A855F7',
  'naik-tier':   '#F59E0B',
  review:        '#06B6D4',
  promo:         '#EC4899',
  komplain:      '#EF4444',
  default:       '#6B7280',
}

function buildTimelineFromCustomer(customer, orders = [], reviews = []) {
  const events = []

  // Registrasi
  if (customer.joinDate || customer.created_at) {
    events.push({
      id: 'reg-' + customer.id,
      date: customer.joinDate || customer.created_at,
      type: 'registrasi',
      title: 'Registrasi Akun',
      desc: 'Bergabung sebagai member Esther Garage',
    })
  }

  // Orders
  orders.forEach((o) => {
    events.push({
      id: 'order-' + o.id,
      date: o.date || o.created_at,
      type: o.status === 'Selesai' ? 'service-selesai' : 'booking',
      title: o.status === 'Selesai' ? 'Servis Selesai' : 'Booking Servis',
      desc: `${o.service} — ${o.vehicle || ''} (${o.mechanic || '-'})`,
      amount: o.total,
    })
  })

  // Reviews
  reviews.forEach((r) => {
    events.push({
      id: 'review-' + r.id,
      date: r.date,
      type: 'review',
      title: 'Memberikan Review',
      desc: `${'★'.repeat(r.rating)} — ${r.reviewText?.slice(0, 80) || 'Tidak ada komentar'}`,
    })
  })

  // Point history dari customer data
  if (customer.pointHistory) {
    customer.pointHistory.forEach((p) => {
      events.push({
        id: 'point-' + (p.id || Date.now()),
        date: p.date,
        type: p.type === 'in' ? 'poin' : 'redeem',
        title: p.type === 'in' ? 'Mendapatkan Poin' : 'Penukaran Poin',
        desc: p.desc || `${p.points > 0 ? '+' : ''}${p.points} poin`,
      })
    })
  }

  // Tier changes
  if (customer.tierChanges) {
    customer.tierChanges.forEach((t) => {
      events.push({
        id: 'tier-' + t.date,
        date: t.date,
        type: 'naik-tier',
        title: `Naik ke ${t.newTier}`,
        desc: `Dari ${t.oldTier} → ${t.newTier}`,
      })
    })
  }

  // Urutkan descending by date
  events.sort((a, b) => new Date(b.date) - new Date(a.date))

  return events
}

function fmtDate(d) {
  if (!d) return '-'
  const date = new Date(d)
  const now = new Date()
  const diff = Math.floor((now - date) / 86400000)
  if (diff === 0) return 'Hari ini'
  if (diff === 1) return 'Kemarin'
  if (diff < 7) return `${diff} hari lalu`
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function CustomerTimeline({ customer, orders = [], reviews = [] }) {
  const [showAll, setShowAll] = useState(false)
  const [filter, setFilter] = useState('all')

  const events = useMemo(() => buildTimelineFromCustomer(customer, orders, reviews), [customer, orders, reviews])

  const filtered = filter === 'all' ? events : events.filter((e) => e.type === filter)
  const displayed = showAll ? filtered : filtered.slice(0, 10)

  const typeCounts = useMemo(() => {
    const counts = {}
    events.forEach((e) => { counts[e.type] = (counts[e.type] || 0) + 1 })
    return counts
  }, [events])

  if (events.length === 0) {
    return (
      <div className="text-center py-10">
        <span className="text-3xl">📭</span>
        <p className="text-gray-500 text-sm mt-2">Belum ada aktivitas untuk customer ini.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
            filter === 'all'
              ? 'bg-green-500/20 text-green-400 border-green-500/30'
              : 'text-gray-400 border-white/10 hover:text-white'
          }`}
        >
          Semua ({events.length})
        </button>
        {Object.entries(typeCounts).map(([type, count]) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border ${
              filter === type
                ? 'bg-white/10 text-white border-white/20'
                : 'text-gray-400 border-white/10 hover:text-white'
            }`}
          >
            {ICON_MAP[type] || ICON_MAP.default} {count}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-white/5 rounded-full" />

        <AnimatePresence>
          {displayed.map((event, i) => {
            const color = COLOR_MAP[event.type] || COLOR_MAP.default
            const icon = ICON_MAP[event.type] || ICON_MAP.default
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-start gap-4 pb-5 last:pb-0 relative"
              >
                {/* Icon circle */}
                <div
                  className="w-[30px] h-[30px] rounded-xl flex items-center justify-center text-sm flex-shrink-0 relative z-10"
                  style={{ background: `${color}20`, border: `1px solid ${color}30` }}
                >
                  {icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-white text-sm font-semibold">{event.title}</p>
                    <span className="text-gray-500 text-[10px] flex-shrink-0">{fmtDate(event.date)}</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{event.desc}</p>
                  {event.amount && (
                    <span className="text-[10px] font-bold text-green-400 mt-1 inline-block">
                      Rp {Number(event.amount).toLocaleString('id-ID')}
                    </span>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {filtered.length > 10 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-3 py-2 text-center text-gray-500 text-[10px] font-bold hover:text-green-400 transition-colors rounded-lg hover:bg-green-500/5 border border-white/5"
        >
          {showAll ? 'Tampilkan lebih sedikit ↑' : `Tampilkan ${filtered.length - 10} aktivitas lagi ↓`}
        </button>
      )}
    </div>
  )
}
