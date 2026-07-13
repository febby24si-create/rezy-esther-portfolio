// ============================================================
// CampaignCard.jsx — Reusable campaign card component
// ============================================================
import { motion } from 'framer-motion'

const STATUS_STYLE = {
  active:    { bg: 'rgba(34,197,94,0.12)', color: '#22C55E', label: 'Aktif' },
  draft:     { bg: 'rgba(148,163,184,0.12)', color: '#94A3B8', label: 'Draft' },
  scheduled: { bg: 'rgba(59,130,246,0.12)', color: '#3B82F6', label: 'Terjadwal' },
  completed: { bg: 'rgba(107,114,128,0.12)', color: '#6B7280', label: 'Selesai' },
  cancelled: { bg: 'rgba(239,68,68,0.12)', color: '#EF4444', label: 'Dibatalkan' },
}

const TYPE_ICON = {
  birthday:       '🎂',
  vip:            '👑',
  'old-vehicle':  '🚗',
  'inactive':     '😴',
  'oil-change':   '🛢️',
  general:        '🎯',
}

export default function CampaignCard({ campaign, onActivate, onDelete, index = 0 }) {
  const statusStyle = STATUS_STYLE[campaign.status] || STATUS_STYLE.draft
  const icon = TYPE_ICON[campaign.type] || TYPE_ICON.general
  const pct = campaign.voucher_quota > 0
    ? Math.round(((campaign.voucher_used || 0) / campaign.voucher_quota) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-2xl border p-5 hover:border-green-500/20 transition-all group"
      style={{
        background: 'rgba(255,255,255,0.025)',
        borderColor: campaign.status === 'active' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <h4 className="text-white font-semibold text-sm">{campaign.name}</h4>
            <p className="text-gray-500 text-[10px] capitalize">{campaign.type?.replace('-', ' ')}</p>
          </div>
        </div>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.color}40` }}
        >
          {statusStyle.label}
        </span>
      </div>

      <p className="text-gray-400 text-xs leading-relaxed mb-3 line-clamp-2">{campaign.description}</p>

      {campaign.discount_pct && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-black text-green-400">{campaign.discount_pct}%</span>
          <span className="text-gray-500 text-xs">Diskon</span>
        </div>
      )}

      {/* Voucher quota progress */}
      {campaign.voucher_quota > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-gray-500 mb-1">
            <span>Voucher: {campaign.voucher_used || 0}/{campaign.voucher_quota}</span>
            <span>{pct}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden bg-white/5">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: `linear-gradient(90deg, #22C55E, ${pct > 80 ? '#EF4444' : '#FBBF24'})`,
              }}
            />
          </div>
        </div>
      )}

      {/* Date range */}
      <div className="flex items-center justify-between text-[10px] text-gray-500">
        <span>
          {campaign.starts_at
            ? new Date(campaign.starts_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
            : '-'}
          {campaign.ends_at && ` — ${new Date(campaign.ends_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`}
        </span>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
          {campaign.status === 'draft' && (
            <button
              onClick={() => onActivate?.(campaign.id)}
              className="text-green-400 hover:text-green-300 text-[10px] font-semibold"
            >
              Aktifkan
            </button>
          )}
          <button
            onClick={() => onDelete?.(campaign.id)}
            className="text-red-400 hover:text-red-300 text-[10px] font-semibold"
          >
            Hapus
          </button>
        </div>
      </div>
    </motion.div>
  )
}
