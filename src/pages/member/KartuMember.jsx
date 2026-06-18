// ============================================================
// KartuMember.jsx — /member/kartu
// Halaman Kartu Member Digital dengan desain premium per tier.
// Komponen kartu di-reuse dari MemberCardComponents.jsx
// ============================================================
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCustomerAuth, calcTier, calcLoyaltyProgress, TIER_CONFIG } from '../../context/CustomerAuthContext'
import {
  MdVerified, MdCreditCard, MdFlip, MdCheck, MdSecurity, MdShare,
} from 'react-icons/md'
import {
  CARD_THEME,
  TIER_ORDER,
  CardFront,
  CardPattern,
} from '../../components/member/MemberCardComponents'

// ─── Flip Card Wrapper ───────────────────────────────────────
function CardBack({ customer, theme, membershipId, memberSince }) {
  return (
    <div
      className="relative w-full h-full rounded-2xl overflow-hidden select-none"
      style={{
        background: theme.backBg,
        border: theme.border,
        boxShadow: `0 20px 60px ${theme.accentGlow}, 0 4px 20px rgba(0,0,0,0.8)`,
      }}
    >
      <CardPattern pattern={theme.pattern} accent={theme.accent} />
      <div className="relative z-10 h-full flex flex-col">
        {/* Magnetic stripe */}
        <div
          className="h-12 w-full mt-6"
          style={{ background: `linear-gradient(90deg, #111 0%, #1a1a1a 40%, ${theme.stripColor}30 100%)` }}
        />
        <div className="flex gap-4 px-6 mt-4">
          <div className="flex-1">
            <p className="text-[9px] uppercase tracking-widest mb-1" style={{ color: `${theme.accentLight}60` }}>
              Tanda Tangan / Authorized Signature
            </p>
            <div
              className="h-9 rounded border px-2 flex items-center"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: `${theme.accent}25` }}
            >
              <p className="font-bold text-sm italic" style={{ color: `${theme.textColor}70`, fontFamily: 'cursive' }}>
                {customer?.name?.split(' ')[0] || 'Member'}
              </p>
            </div>
          </div>
        </div>
        <div className="px-6 mt-4 grid grid-cols-2 gap-x-6 gap-y-2">
          {[
            { label: 'NAMA MEMBER',    value: customer?.name || '—' },
            { label: 'BERLAKU HINGGA', value: '12/2026'             },
            { label: 'NO. MEMBER',     value: membershipId || '—'   },
            { label: 'LEVEL',          value: `${theme.label} Member` },
            { label: 'STATUS',         value: 'Aktif ✓'             },
            { label: 'BERGABUNG',      value: memberSince || '—'    },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[8px] uppercase tracking-wider" style={{ color: `${theme.accentLight}55` }}>{label}</p>
              <p className="text-white font-semibold text-[11px] truncate">{value}</p>
            </div>
          ))}
        </div>
        <div className="px-6 mt-auto mb-4 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-[8px]" style={{ color: `${theme.accentLight}45` }}>
              • Kartu ini milik pribadi dan tidak dapat dipindahtangankan.
            </p>
            <p className="text-[8px]" style={{ color: `${theme.accentLight}45` }}>
              • Hanya tunjukkan kartu ini saat menikmati layanan/benefit.
            </p>
          </div>
          <div className="flex-shrink-0 ml-3">
            <div
              className="px-2 py-1 rounded-lg text-center"
              style={{ background: `${theme.accent}20`, border: `1px solid ${theme.accent}35` }}
            >
              <p className="font-extrabold text-sm" style={{ color: theme.accent }}>{theme.label}</p>
              <p className="text-[8px]" style={{ color: `${theme.accentLight}70` }}>Member Card</p>
            </div>
          </div>
        </div>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)` }}
      />
    </div>
  )
}

function FlipCard({ front, back, flipped }) {
  return (
    <div className="relative w-full" style={{ perspective: '1200px' }}>
      <motion.div
        className="relative w-full"
        style={{ transformStyle: 'preserve-3d', aspectRatio: '1.586/1' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
          {front}
        </div>
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {back}
        </div>
      </motion.div>
    </div>
  )
}

function TierPreviewCard({ tier, current }) {
  const theme = CARD_THEME[tier]
  const isActive = tier === current
  return (
    <div
      className={`rounded-xl p-3 text-center transition-all border ${isActive ? '' : 'opacity-50'}`}
      style={{
        background: isActive ? `${theme.accent}14` : 'rgba(255,255,255,0.02)',
        borderColor: isActive ? `${theme.accent}50` : 'rgba(255,255,255,0.06)',
        boxShadow: isActive ? `0 0 16px ${theme.accentGlow}` : 'none',
      }}
    >
      <p className="text-lg mb-0.5">{theme.icon}</p>
      <p className="font-bold text-xs" style={{ color: isActive ? theme.textColor : '#6B7280' }}>{theme.label}</p>
      {isActive && <p className="text-[9px] font-semibold mt-0.5" style={{ color: theme.accent }}>● Anda</p>}
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────
export default function KartuMember() {
  const { customer } = useCustomerAuth()
  const [flipped, setFlipped] = useState(false)
  const [showCopied, setShowCopied] = useState(false)

  const tier         = customer ? calcTier(customer.points || 0) : 'Bronze'
  const theme        = CARD_THEME[tier]
  const membershipId = customer?.membershipId || 'MBR-000000'
  const memberSince  = customer?.memberSince  || '—'
  const totalPoints  = customer?.points       || 0
  const loyalty      = customer ? calcLoyaltyProgress(totalPoints) : null

  const handleCopyId = () => {
    navigator.clipboard.writeText(membershipId).catch(() => {})
    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 2000)
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 animate-pulse mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Memuat kartu member...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8" style={{ background: '#040E09' }}>
      <div className="max-w-2xl mx-auto">

        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${theme.accent}18`, border: `1px solid ${theme.accent}35` }}
            >
              <MdCreditCard size={20} style={{ color: theme.accent }} />
            </div>
            <div>
              <h1 className="text-white font-extrabold text-xl">Kartu Member</h1>
              <p className="text-gray-500 text-sm">Digital membership card eksklusif Anda</p>
            </div>
          </div>
        </motion.div>

        {/* Card display */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <FlipCard
            flipped={flipped}
            front={
              <div style={{ aspectRatio: '1.586/1' }}>
                <CardFront
                  customer={customer}
                  theme={theme}
                  membershipId={membershipId}
                  memberSince={memberSince}
                  totalPoints={totalPoints}
                />
              </div>
            }
            back={
              <div style={{ aspectRatio: '1.586/1' }}>
                <CardBack
                  customer={customer}
                  theme={theme}
                  membershipId={membershipId}
                  memberSince={memberSince}
                />
              </div>
            }
          />
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
          className="flex gap-3 mt-5 justify-center"
        >
          <button
            onClick={() => setFlipped(v => !v)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105"
            style={{ background: `${theme.accent}18`, color: theme.textColor, border: `1px solid ${theme.accent}40` }}
          >
            <MdFlip size={18} />
            {flipped ? 'Lihat Depan' : 'Lihat Belakang'}
          </button>
          <button
            onClick={handleCopyId}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all hover:scale-105 bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10"
          >
            {showCopied ? <MdCheck size={18} className="text-green-400" /> : <MdShare size={18} />}
            {showCopied ? 'Disalin!' : 'Salin ID'}
          </button>
        </motion.div>

        {/* Member info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mt-6 rounded-2xl p-5 border"
          style={{ background: `${theme.accent}08`, borderColor: `${theme.accent}25` }}
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Level',      value: `${theme.icon} ${theme.label}` },
              { label: 'Total Poin', value: totalPoints.toLocaleString('id-ID') },
              { label: 'Status',     value: customer.membershipStatus === 'active' ? '✓ Aktif' : 'Pending' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-gray-500 text-[10px] uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-white font-bold text-sm" style={{ color: label === 'Level' ? theme.textColor : undefined }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
          {loyalty?.nextTier && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: `${theme.accent}20` }}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-400">{loyalty.tier}</span>
                <span style={{ color: theme.accentLight }}>{loyalty.pointsToNext} poin → {loyalty.nextTier}</span>
              </div>
              <div className="h-2 rounded-full bg-black/40">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${loyalty.progress}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${theme.accent}80, ${theme.accent})` }}
                />
              </div>
            </div>
          )}
          {!loyalty?.nextTier && (
            <p className="text-center text-xs font-semibold mt-3" style={{ color: theme.accent }}>
              🏆 Anda telah mencapai tier tertinggi!
            </p>
          )}
        </motion.div>

        {/* Tampilan level lain */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-3 text-center">Tampilan Level Lain</p>
          <div className="grid grid-cols-4 gap-3">
            {TIER_ORDER.map(t => (
              <TierPreviewCard key={t} tier={t} current={tier} />
            ))}
          </div>
          <p className="text-gray-600 text-[10px] text-center mt-3">
            Tingkatkan poin loyalty Anda untuk naik ke level berikutnya.
          </p>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="mt-6 rounded-2xl p-5 border"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <MdVerified style={{ color: theme.accent }} size={18} />
            <p className="text-white font-bold text-sm">Benefit {theme.label} Member</p>
          </div>
          <div className="space-y-2">
            {theme.benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-2">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${theme.accent}25` }}
                >
                  <MdCheck size={10} style={{ color: theme.accent }} />
                </div>
                <p className="text-gray-300 text-sm">{b}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Security note */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="mt-4 flex items-center gap-2 justify-center text-gray-600 text-[11px]"
        >
          <MdSecurity size={14} />
          <span>Kartu digital ini aman dan terenkripsi. Jangan bagikan ke pihak yang tidak berwenang.</span>
        </motion.div>

      </div>
    </div>
  )
}

