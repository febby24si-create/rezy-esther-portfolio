import { Link } from 'react-router-dom'
import { MdAccessTime, MdAttachMoney, MdArrowForward } from 'react-icons/md'

function formatRupiah(n) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

export default function ServiceCard({ service, compact = false }) {
  const { id, name, icon, category, desc, hargaMulai, hargaMaks, durasi, populer, highlights } = service

  return (
    <div className={`relative group rounded-2xl border transition-all duration-300 hover:border-green-500/40 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-500/10 ${
      compact ? 'p-4' : 'p-6'
    }`}
      style={{ background: 'linear-gradient(135deg, #041C15 0%, #06281F 100%)', borderColor: 'rgba(34,197,94,0.12)' }}
    >
      {/* Popular badge */}
      {populer && (
        <span className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
          Populer
        </span>
      )}

      {/* Icon + category */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
          {icon}
        </div>
        <div>
          <span className="text-xs text-green-500/70 font-semibold uppercase tracking-wider">{category}</span>
          <h3 className="text-white font-bold text-base leading-tight">{name}</h3>
        </div>
      </div>

      {!compact && <p className="text-gray-400 text-sm leading-relaxed mb-4">{desc}</p>}

      {/* Highlights */}
      {!compact && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {highlights.map((h) => (
            <span key={h} className="text-xs px-2 py-1 rounded-lg bg-white/5 text-gray-300 border border-white/8">
              ✓ {h}
            </span>
          ))}
        </div>
      )}

      {/* Price + duration */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-1 text-green-400 font-bold text-sm">
            <MdAttachMoney className="text-base" />
            <span>{formatRupiah(hargaMulai)}</span>
            <span className="text-gray-500 font-normal">– {formatRupiah(hargaMaks)}</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
            <MdAccessTime className="text-sm" />
            <span>{durasi}</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <Link
        to={`/guest/booking?service=${id}`}
        className="w-full flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 hover:border-green-500/40 text-green-400 font-semibold text-sm py-2.5 rounded-xl transition-all group"
      >
        Booking Sekarang
        <MdArrowForward className="text-base group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  )
}