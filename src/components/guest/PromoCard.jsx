import { useState, useEffect } from 'react'
import { MdContentCopy, MdCheck, MdLocalOffer } from 'react-icons/md'

const badgeStyles = {
  red:    'bg-red-500/15 text-red-400 border-red-500/25',
  blue:   'bg-blue-500/15 text-blue-400 border-blue-500/25',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  yellow: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
  green:  'bg-green-500/15 text-green-400 border-green-500/25',
  orange: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
}

function Countdown({ validUntil }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    if (!validUntil || isNaN(Date.parse(validUntil))) return
    const tick = () => {
      const diff = new Date(validUntil) - Date.now()
      if (diff <= 0) { setTimeLeft('Berakhir'); return }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(d > 0 ? `${d}h ${h}j lagi` : `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [validUntil])

  if (!timeLeft) return null
  return (
    <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-lg">
      ⏱ {timeLeft}
    </span>
  )
}

export default function PromoCard({ promo, showCode = false }) {
  const [copied, setCopied] = useState(false)
  const { title, badge, badgeColor, desc, diskon, validUntil, terms, id } = promo

  const handleCopy = () => {
    navigator.clipboard.writeText(id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const validDate = !isNaN(Date.parse(validUntil))
    ? new Date(validUntil).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    : validUntil

  return (
    <div className="group rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-green-500/10 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #041C15 0%, #06281F 100%)', borderColor: 'rgba(34,197,94,0.12)' }}>

      {/* Top stripe */}
      <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-400" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${badgeStyles[badgeColor] || badgeStyles.green}`}>
                {badge}
              </span>
              <Countdown validUntil={validUntil} />
            </div>
            <h3 className="text-white font-bold text-base leading-tight">{title}</h3>
          </div>
          <div className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.12)' }}>
            <MdLocalOffer className="text-green-400 text-2xl" />
          </div>
        </div>

        <p className="text-gray-400 text-sm leading-relaxed mb-4">{desc}</p>

        {/* Diskon badge */}
        <div className="flex items-center gap-3 mb-3">
          <div className="px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20">
            <span className="text-green-400 font-extrabold text-xl">{diskon}%</span>
            <span className="text-green-500/60 text-xs ml-1">DISKON</span>
          </div>
          <div className="text-xs text-gray-500">
            <p>Berlaku s/d:</p>
            <p className="text-gray-300 font-medium">{validDate}</p>
          </div>
        </div>

        {/* Code / copy */}
        {showCode && (
          <div className="flex items-center gap-2 mb-3 p-2.5 rounded-xl bg-white/5 border border-white/8">
            <span className="flex-1 font-mono text-sm text-green-300 tracking-widest">{id}</span>
            <button onClick={handleCopy}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-500/15 hover:bg-green-500/25 text-green-400 transition-all">
              {copied ? <MdCheck className="text-sm" /> : <MdContentCopy className="text-sm" />}
            </button>
          </div>
        )}

        {/* Terms */}
        <p className="text-xs text-gray-600 italic border-t border-white/5 pt-3">{terms}</p>
      </div>
    </div>
  )
}