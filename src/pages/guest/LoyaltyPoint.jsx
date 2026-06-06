import { useState } from 'react'
import { MdStar, MdArrowUpward, MdArrowDownward, MdCardGiftcard, MdCheckCircle } from 'react-icons/md'
import { useCustomerAuth, calcLoyaltyProgress, TIER_CONFIG } from '../../context/CustomerAuthContext'

const REWARDS = [
  { id: 'R01', name: 'Diskon 10% Service',      points: 500,  category: 'Voucher',     diskonPct: 10,  icon: '🏷️', available: true  },
  { id: 'R02', name: 'Ganti Oli Gratis',         points: 1000, category: 'Service',     diskonPct: 100, icon: '🛢️', available: true  },
  { id: 'R03', name: 'Service Berkala Gratis',   points: 2500, category: 'Service',     diskonPct: 100, icon: '🔧', available: true  },
  { id: 'R04', name: 'Voucher Rp 100.000',       points: 800,  category: 'Voucher',     diskonPct: 15,  icon: '💳', available: true  },
  { id: 'R05', name: 'Tune Up Gratis',           points: 2000, category: 'Service',     diskonPct: 100, icon: '⚙️', available: true  },
  { id: 'R06', name: 'Cuci Mobil Gratis',        points: 300,  category: 'Service',     diskonPct: 100, icon: '🚿', available: true  },
  { id: 'R07', name: 'Merchandise Esther',       points: 1500, category: 'Merchandise', diskonPct: 0,   icon: '👕', available: false },
]

const TIER_BENEFITS = {
  Bronze:   ['Promo umum bengkel', 'Voucher dasar after-service', 'Booking online'],
  Silver:   ['Semua benefit Bronze', 'Diskon 5% setiap servis', 'Voucher berkala bulanan', 'Promo member eksklusif'],
  Gold:     ['Semua benefit Silver', 'Diskon 10% setiap servis', 'Voucher premium', 'Prioritas booking', 'Notifikasi promo early access'],
  Platinum: ['Semua benefit Gold', 'Diskon 15% setiap servis', 'Voucher eksklusif', 'Prioritas booking tertinggi', 'Reward loyal customer', 'Layanan antar-jemput kendaraan'],
}

export default function LoyaltyPoint() {
  const [tab, setTab]         = useState('riwayat')
  const [redeemMsg, setRedeemMsg] = useState(null)
  const { customer, redeemReward } = useCustomerAuth()

  if (!customer) return null

  const loyalty  = calcLoyaltyProgress(customer.points || 0)
  const tierCfg  = TIER_CONFIG[loyalty.tier]
  const history  = customer.pointHistory || []

  const totalIn  = history.filter(h => h.type === 'in').reduce((a, b) => a + b.points, 0)
  const totalOut = Math.abs(history.filter(h => h.type === 'out').reduce((a, b) => a + b.points, 0))

  const handleRedeem = (reward) => {
    const result = redeemReward(reward)
    setRedeemMsg({ ok: result.success, text: result.success ? `✓ Berhasil! Cek Voucher Saya untuk kode redeem.` : result.message })
    setTimeout(() => setRedeemMsg(null), 3500)
  }

  // Gradient warna berdasarkan tier
  const gradients = {
    Bronze:   'from-orange-600 to-amber-700',
    Silver:   'from-slate-500  to-slate-700',
    Gold:     'from-yellow-500 to-amber-600',
    Platinum: 'from-purple-600 to-indigo-700',
  }

  return (
    <div className="pt-16 min-h-screen px-4 sm:px-6" style={{ background: '#020f09' }}>
      <div className="max-w-3xl mx-auto py-10">
        <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-2">Program Loyalitas</p>
        <h1 className="text-2xl font-extrabold text-white mb-8">Loyalty Point Anda</h1>

        {/* Redeem feedback */}
        {redeemMsg && (
          <div className={`mb-5 p-4 rounded-xl text-sm font-medium ${redeemMsg.ok ? 'bg-green-500/15 text-green-400 border border-green-500/25' : 'bg-red-500/15 text-red-400 border border-red-500/25'}`}>
            {redeemMsg.text}
          </div>
        )}

        {/* ── Main Point Card ────────────────────────────────── */}
        <div className={`rounded-2xl p-7 mb-6 relative overflow-hidden bg-gradient-to-br ${gradients[loyalty.tier]}`}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          <div className="relative">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-white/70 text-sm font-medium">Total Poin — {customer.name}</p>
                <p className="text-5xl font-extrabold text-white mt-1">{(customer.points || 0).toLocaleString('id-ID')}</p>
                <p className="text-white/60 text-sm mt-1">≈ Rp {((customer.points || 0) * 100).toLocaleString('id-ID')} nilai tukar</p>
              </div>
              <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-sm font-bold px-3 py-1.5 rounded-full">
                <MdStar /> {tierCfg.icon} {loyalty.tier} Member
              </span>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-white/70 text-xs mb-1.5">
                <span>{loyalty.tier}</span>
                {loyalty.nextTier
                  ? <span>{loyalty.pointsToNext.toLocaleString('id-ID')} poin lagi menuju {loyalty.nextTier}</span>
                  : <span>🎉 Tier Tertinggi!</span>}
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${loyalty.progress}%` }} />
              </div>
              <p className="text-white/50 text-xs mt-1.5">
                {loyalty.nextTier ? `${loyalty.progress}% menuju ${loyalty.nextTier}` : 'Platinum — Puncak Loyalitas!'}
              </p>
            </div>
          </div>
        </div>

        {/* ── Quick Stats ─────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Poin Masuk',       value: totalIn.toLocaleString('id-ID'),        color: 'text-green-400',  prefix: '↑ ' },
            { label: 'Poin Digunakan',   value: totalOut.toLocaleString('id-ID'),        color: 'text-red-400',   prefix: '↓ ' },
            { label: 'Reward Tersedia',  value: REWARDS.filter(r => r.available).length, color: 'text-yellow-400', prefix: '🎁 ' },
          ].map(({ label, value, color, prefix }) => (
            <div key={label} className="rounded-xl p-4 text-center border border-white/8" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className={`text-xl font-extrabold ${color}`}>{prefix}{value}</div>
              <div className="text-gray-500 text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* ── Tier Benefits ─────────────────────────────────── */}
        <div className="rounded-2xl border p-5 mb-6" style={{ background: 'rgba(34,197,94,0.03)', borderColor: tierCfg.border }}>
          <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
            <span>{tierCfg.icon}</span> Benefit {loyalty.tier} Member
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {(TIER_BENEFITS[loyalty.tier] || []).map((b) => (
              <div key={b} className="flex items-center gap-2 text-xs text-gray-300">
                <MdCheckCircle className="flex-shrink-0" style={{ color: tierCfg.color }} />
                {b}
              </div>
            ))}
          </div>
          {loyalty.nextTier && (
            <p className="text-xs text-gray-500 mt-3 border-t border-white/5 pt-3">
              Naik ke {loyalty.nextTier} untuk membuka lebih banyak benefit.
            </p>
          )}
        </div>

        {/* ── Tabs ─────────────────────────────────────────── */}
        <div className="flex border border-white/8 rounded-xl p-1 mb-6">
          {[['riwayat', 'Riwayat Poin'], ['reward', 'Reward Catalog'], ['tier', 'Semua Tier']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                tab === key ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:text-white'
              }`}>{label}</button>
          ))}
        </div>

        {/* ── Riwayat ─────────────────────────────────────── */}
        {tab === 'riwayat' && (
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="text-center py-12 text-gray-500">Belum ada riwayat poin.</div>
            ) : history.map((h) => (
              <div key={h.id} className="flex items-center gap-4 p-4 rounded-xl border border-white/8 hover:border-white/15 transition-all"
                style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${h.type === 'in' ? 'bg-green-500/15' : 'bg-red-500/15'}`}>
                  {h.type === 'in'
                    ? <MdArrowUpward className="text-green-400 text-lg" />
                    : <MdArrowDownward className="text-red-400 text-lg" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{h.desc}</p>
                  <p className="text-gray-500 text-xs">{new Date(h.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <span className={`text-sm font-bold ${h.type === 'in' ? 'text-green-400' : 'text-red-400'}`}>
                  {h.type === 'in' ? '+' : ''}{h.points.toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── Reward Catalog ───────────────────────────────── */}
        {tab === 'reward' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {REWARDS.map((r) => {
              const canRedeem = (customer.points || 0) >= r.points && r.available
              const short     = (customer.points || 0) < r.points ? r.points - (customer.points || 0) : 0
              return (
                <div key={r.id} className={`p-5 rounded-2xl border transition-all ${r.available ? 'border-white/10 hover:border-green-500/25' : 'border-white/5 opacity-50'}`}
                  style={{ background: 'rgba(34,197,94,0.04)' }}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center text-xl flex-shrink-0">
                      {r.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">{r.name}</p>
                      <p className="text-gray-500 text-xs">{r.category}</p>
                      {!r.available && <p className="text-xs text-red-400 mt-1">Stok habis</p>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
                      <MdStar className="text-base" /> {r.points.toLocaleString('id-ID')} poin
                    </div>
                    <button
                      onClick={() => canRedeem && handleRedeem(r)}
                      disabled={!canRedeem}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                        canRedeem
                          ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 cursor-pointer'
                          : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                      }`}>
                      {!r.available ? 'Habis' : canRedeem ? 'Tukar Sekarang' : `Kurang ${short.toLocaleString('id-ID')}`}
                    </button>
                  </div>
                  {!canRedeem && r.available && (
                    <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full" style={{
                        width: `${Math.min(100, ((customer.points || 0) / r.points) * 100)}%`,
                        background: tierCfg.color,
                      }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ── Semua Tier ────────────────────────────────────── */}
        {tab === 'tier' && (
          <div className="space-y-4">
            {Object.entries(TIER_CONFIG).map(([tierName, cfg]) => {
              const isActive = loyalty.tier === tierName
              return (
                <div key={tierName} className={`rounded-2xl border p-5 transition-all ${isActive ? 'border-opacity-60' : 'border-white/8 opacity-70'}`}
                  style={{ background: isActive ? cfg.bg : 'rgba(255,255,255,0.02)', borderColor: isActive ? cfg.border : undefined }}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{cfg.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white font-bold">{tierName}</p>
                        {isActive && <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>Tier Anda</span>}
                      </div>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {cfg.max === Infinity ? `${cfg.min.toLocaleString('id-ID')}+ poin` : `${cfg.min.toLocaleString('id-ID')} – ${cfg.max.toLocaleString('id-ID')} poin`}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {(TIER_BENEFITS[tierName] || []).map((b) => (
                      <div key={b} className="flex items-center gap-2 text-xs text-gray-400">
                        <MdCheckCircle className="flex-shrink-0 text-xs" style={{ color: cfg.color }} />
                        {b}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}