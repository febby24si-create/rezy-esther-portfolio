import { useMemo } from 'react'
import { getAllCustomers, calcTier, TIER_CONFIG } from '../../lib/loyaltyConstants'
import { MdEmojiEvents, MdLeaderboard } from 'react-icons/md'
import { getCustomerAvatar } from '../../utils/randomAvatar'

function getInitials(name) {
  if (!name) return '?'
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

/** Avatar with photo + initials fallback */
function AvatarImg({ name, size = 'w-12 h-12', rounded = 'rounded-2xl', borderColor = null, style = {} }) {
  const initials = getInitials(name)
  const seed = (name || '').toLowerCase().replace(/\s+/g, '')
  return (
    <div className={`${size} ${rounded} relative flex-shrink-0 overflow-hidden`} style={style}>
      <img
        src={getCustomerAvatar(name || '', 150)}
        alt={name}
        className={`${size} ${rounded} object-cover w-full h-full`}
        onError={e => {
          e.target.onerror = null
          e.target.style.display = 'none'
          e.target.nextSibling.style.display = 'flex'
        }}
      />
      <div
        className={`${size} ${rounded} absolute inset-0 items-center justify-center text-white font-extrabold`}
        style={{ display: 'none', background: borderColor || 'rgba(99,179,237,0.4)', fontSize: '0.7em' }}
      >
        {initials}
      </div>
    </div>
  )
}

const RANK_ICONS = ['🥇', '🥈', '🥉']

export default function Leaderboard() {
  const customers = useMemo(() => {
    const all = getAllCustomers()
    return all
      .filter(c => (c.points || 0) > 0 || (c.totalOrders || 0) > 0)
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .slice(0, 20)
  }, [])

  const top3 = customers.slice(0, 3)
  const rest = customers.slice(3)

  return (
    <div className="pt-16 min-h-screen px-4 sm:px-6" style={{ background: '#020f09' }}>
      <div className="max-w-3xl mx-auto py-10">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl"
            style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)' }}>
            🏆
          </div>
          <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-2">Hall of Fame</p>
          <h1 className="text-3xl font-extrabold text-white">Customer Leaderboard</h1>
          <p className="text-gray-400 text-sm mt-2">Top pelanggan setia Esther Garage berdasarkan loyalty point</p>
        </div>

        {customers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🏆</p>
            <p className="text-white font-semibold text-lg">Belum ada data leaderboard</p>
            <p className="text-gray-500 text-sm mt-2">Daftar dan lakukan servis untuk masuk leaderboard!</p>
          </div>
        ) : (
          <>
            {/* ── Top 3 Podium ───────────────────────────────── */}
            {top3.length >= 1 && (
              <div className="flex items-end justify-center gap-3 mb-8">
                {/* Posisi 2 */}
                {top3[1] && (
                  <div className="flex flex-col items-center gap-2 mb-0">
                    <div className="text-2xl">🥈</div>
                    <AvatarImg
                      name={top3[1].name}
                      size="w-12 h-12"
                      rounded="rounded-2xl"
                      style={{ border: `2px solid ${TIER_CONFIG[calcTier(top3[1].points || 0)].color}` }}
                    />
                    <p className="text-white font-bold text-xs text-center max-w-[80px] truncate">{top3[1].name.split(' ')[0]}</p>
                    <p className="text-gray-400 text-xs">{(top3[1].points || 0).toLocaleString('id-ID')} pt</p>
                    <div className="w-20 rounded-t-xl text-center py-3" style={{ background: 'rgba(148,163,184,0.15)', height: '60px', border: '1px solid rgba(148,163,184,0.2)' }} />
                  </div>
                )}
                {/* Posisi 1 */}
                <div className="flex flex-col items-center gap-2">
                  <div className="text-3xl">🥇</div>
                  <AvatarImg
                    name={top3[0].name}
                    size="w-16 h-16"
                    rounded="rounded-2xl"
                    style={{ border: `3px solid ${TIER_CONFIG[calcTier(top3[0].points || 0)].color}`, boxShadow: `0 4px 20px ${TIER_CONFIG[calcTier(top3[0].points || 0)].color}66` }}
                  />
                  <p className="text-white font-extrabold text-sm text-center max-w-[100px] truncate">{top3[0].name.split(' ')[0]}</p>
                  <p className="text-yellow-400 text-sm font-bold">{(top3[0].points || 0).toLocaleString('id-ID')} pt</p>
                  <div className="w-24 rounded-t-xl text-center py-3" style={{ background: 'rgba(251,191,36,0.15)', height: '80px', border: '1px solid rgba(251,191,36,0.25)' }} />
                </div>
                {/* Posisi 3 */}
                {top3[2] && (
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-2xl">🥉</div>
                    <AvatarImg
                      name={top3[2].name}
                      size="w-12 h-12"
                      rounded="rounded-2xl"
                      style={{ border: `2px solid ${TIER_CONFIG[calcTier(top3[2].points || 0)].color}` }}
                    />
                    <p className="text-white font-bold text-xs text-center max-w-[80px] truncate">{top3[2].name.split(' ')[0]}</p>
                    <p className="text-gray-400 text-xs">{(top3[2].points || 0).toLocaleString('id-ID')} pt</p>
                    <div className="w-20 rounded-t-xl" style={{ background: 'rgba(249,115,22,0.15)', height: '45px', border: '1px solid rgba(249,115,22,0.2)' }} />
                  </div>
                )}
              </div>
            )}

            {/* ── Full Table ────────────────────────────────── */}
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(34,197,94,0.1)' }}>
              {/* Table header */}
              <div className="grid grid-cols-12 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                style={{ background: 'rgba(34,197,94,0.04)', borderBottom: '1px solid rgba(34,197,94,0.08)' }}>
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-5">Customer</div>
                <div className="col-span-2 text-center">Tier</div>
                <div className="col-span-2 text-right">Point</div>
                <div className="col-span-2 text-right">Servis</div>
              </div>

              {/* Top 3 in table */}
              {top3.map((c, i) => {
                const tier    = calcTier(c.points || 0)
                const tierCfg = TIER_CONFIG[tier]
                return (
                  <div key={c.id} className="grid grid-cols-12 px-4 py-3.5 items-center border-b transition-all hover:bg-white/3"
                    style={{ borderColor: 'rgba(255,255,255,0.04)', background: i === 0 ? 'rgba(251,191,36,0.04)' : 'transparent' }}>
                    <div className="col-span-1 text-center text-lg">{RANK_ICONS[i]}</div>
                    <div className="col-span-5 flex items-center gap-2.5">
                      <AvatarImg
                        name={c.name}
                        size="w-8 h-8"
                        rounded="rounded-lg"
                        style={{ border: `1.5px solid ${tierCfg.color}55`, flexShrink: 0 }}
                      />
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{c.name}</p>
                        <p className="text-gray-500 text-xs">Bergabung {new Date(c.joinDate).getFullYear()}</p>
                      </div>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: tierCfg.bg, color: tierCfg.color, border: `1px solid ${tierCfg.border}` }}>
                        {tierCfg.icon} {tier}
                      </span>
                    </div>
                    <div className="col-span-2 text-right text-yellow-400 font-bold text-sm">{(c.points || 0).toLocaleString('id-ID')}</div>
                    <div className="col-span-2 text-right text-gray-400 text-sm">{c.totalOrders || 0}×</div>
                  </div>
                )
              })}

              {/* Rest */}
              {rest.map((c, i) => {
                const tier    = calcTier(c.points || 0)
                const tierCfg = TIER_CONFIG[tier]
                const rank    = i + 4
                return (
                  <div key={c.id} className="grid grid-cols-12 px-4 py-3 items-center border-b hover:bg-white/3 transition-all"
                    style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    <div className="col-span-1 text-center text-gray-500 font-bold text-sm">{rank}</div>
                    <div className="col-span-5 flex items-center gap-2.5">
                      <AvatarImg
                        name={c.name}
                        size="w-8 h-8"
                        rounded="rounded-lg"
                        style={{ border: `1.5px solid ${tierCfg.color}44`, flexShrink: 0 }}
                      />
                      <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{c.name}</p>
                      </div>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: tierCfg.bg, color: tierCfg.color }}>
                        {tierCfg.icon}
                      </span>
                    </div>
                    <div className="col-span-2 text-right text-gray-300 font-semibold text-sm">{(c.points || 0).toLocaleString('id-ID')}</div>
                    <div className="col-span-2 text-right text-gray-500 text-sm">{c.totalOrders || 0}×</div>
                  </div>
                )
              })}
            </div>

            <p className="text-center text-gray-600 text-xs mt-4">
              Leaderboard diperbarui secara real-time berdasarkan loyalty point
            </p>
          </>
        )}
      </div>
    </div>
  )
}