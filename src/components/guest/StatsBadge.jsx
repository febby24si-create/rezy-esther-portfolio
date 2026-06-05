export default function StatsBadge({ value, label, icon, color = 'green', suffix = '' }) {
  const colorMap = {
    green:  'from-green-500/15 to-emerald-500/10 border-green-500/20 text-green-400',
    blue:   'from-blue-500/15  to-blue-600/10   border-blue-500/20  text-blue-400',
    yellow: 'from-yellow-500/15 to-amber-500/10  border-yellow-500/20 text-yellow-400',
    purple: 'from-purple-500/15 to-violet-500/10 border-purple-500/20 text-purple-400',
  }

  return (
    <div className={`rounded-2xl border bg-gradient-to-br p-5 text-center ${colorMap[color]}`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-3xl font-extrabold text-white mb-1">
        {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
        {suffix && <span className="text-lg ml-0.5">{suffix}</span>}
      </div>
      <div className="text-xs text-gray-400 font-medium">{label}</div>
    </div>
  )
}