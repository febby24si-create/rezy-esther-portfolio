// ============================================================
// CrmKpiCards.jsx — Reusable KPI & Stat Cards for CRM
// ============================================================
import { motion } from 'framer-motion'

const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID')

export function KpiCard({ label, value, icon, trend, positive, color = '#22C55E', format, suffix, note, index = 0, prefix }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -3, scale: 1.01 }}
      className="relative rounded-2xl p-5 flex flex-col overflow-hidden group cursor-default"
      style={{
        background: 'linear-gradient(145deg, rgba(6,26,20,0.9), rgba(4,18,14,0.95))',
        border: `1px solid ${color}18`,
      }}
    >
      <div
        className="absolute top-0 left-4 right-4 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />
      <div className="flex items-center justify-between relative z-10">
        <div className="flex-1 min-w-0">
          <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-widest mb-1">{label}</p>
          <p className="text-white text-2xl font-black leading-tight tracking-tight">
            {format
              ? format(value)
              : prefix
                ? `${prefix} ${Number(value).toLocaleString('id-ID')}${suffix || ''}`
                : `${Number(value).toLocaleString('id-ID')}${suffix || ''}`
            }
          </p>
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
          style={{ background: `${color}18` }}
        >
          <span className="text-lg">{icon}</span>
        </div>
      </div>
      {note ? (
        <div className="mt-2 relative z-10">
          <span className="text-gray-500 text-[10px] italic">{note}</span>
        </div>
      ) : trend !== undefined && (
        <div className="flex items-center gap-2 mt-2 relative z-10">
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
            positive ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
          }`}>
            {positive ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className="text-gray-600 text-[10px]">vs last month</span>
        </div>
      )}
    </motion.div>
  )
}

export function StatCard({ label, value, icon, color = '#22C55E', bg }) {
  return (
    <div
      className="rounded-2xl p-4 text-center hover:scale-[1.02] transition-all"
      style={{
        background: bg || `${color}08`,
        border: `1px solid ${color}15`,
      }}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-white text-xl font-black">{value}</p>
      <p className="text-gray-400 text-xs mt-1">{label}</p>
    </div>
  )
}

export function MiniStat({ label, value, color = '#22C55E' }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-gray-400 text-xs">{label}</span>
      <span className="text-sm font-bold" style={{ color }}>{value}</span>
    </div>
  )
}

export function SectionCard({ title, icon, iconColor = '#22C55E', children, className = '', action }) {
  return (
    <div
      className={`rounded-2xl border p-5 ${className}`}
      style={{ background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg flex-shrink-0">{icon}</span>}
          <h3 className="text-white font-semibold text-sm">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

export { fmt }
