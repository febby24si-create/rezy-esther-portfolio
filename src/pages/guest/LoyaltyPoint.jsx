import { useState } from 'react'
import { loyaltyData } from '../../data/guestData'
import { MdStar, MdArrowUpward, MdArrowDownward, MdCardGiftcard } from 'react-icons/md'

const tierColors = {
  Silver:   'from-gray-400  to-slate-500',
  Gold:     'from-yellow-400 to-amber-500',
  Platinum: 'from-cyan-400   to-blue-500',
}

export default function LoyaltyPoint() {
  const [tab, setTab] = useState('riwayat') // riwayat | reward
  const d = loyaltyData

  return (
    <div className="pt-16 min-h-screen px-4 sm:px-6" style={{ background: '#020f09' }}>
      <div className="max-w-3xl mx-auto py-10">
        <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-2">Program Loyalitas</p>
        <h1 className="text-2xl font-extrabold text-white mb-8">Loyalty Point Anda</h1>

        {/* Main point card */}
        <div className={`rounded-2xl p-7 mb-6 relative overflow-hidden bg-gradient-to-br ${tierColors[d.tier]}`}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-white/70 text-sm font-medium">Total Poin Anda</p>
                <p className="text-5xl font-extrabold text-white mt-1">{d.currentPoints.toLocaleString('id-ID')}</p>
                <p className="text-white/70 text-sm mt-1">≈ Rp {(d.currentPoints * 100).toLocaleString('id-ID')} nilai tukar</p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-sm font-bold px-3 py-1.5 rounded-full">
                  <MdStar /> {d.tier} Member
                </span>
              </div>
            </div>

            {/* Progress ke tier berikutnya */}
            <div>
              <div className="flex justify-between text-white/70 text-xs mb-1.5">
                <span>{d.tier}</span>
                <span>{d.pointsToNextTier} poin lagi menuju {d.nextTier}</span>
              </div>
              <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all" style={{ width: `${d.tierProgress}%` }} />
              </div>
              <p className="text-white/50 text-xs mt-1.5">{d.tierProgress}% menuju {d.nextTier}</p>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Poin Masuk',  value: d.history.filter(h => h.type==='in').reduce((a,b)=>a+b.points,0), color: 'text-green-400',  icon: '↑' },
            { label: 'Poin Keluar', value: Math.abs(d.history.filter(h => h.type==='out').reduce((a,b)=>a+b.points,0)), color: 'text-red-400', icon: '↓' },
            { label: 'Reward Tersedia', value: d.rewards.filter(r=>r.available).length, color: 'text-yellow-400', suffix: ' reward', icon: '🎁' },
          ].map(({ label, value, color, suffix = '', icon }) => (
            <div key={label} className="rounded-xl p-4 text-center border border-white/8" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className={`text-xl font-extrabold ${color}`}>{icon} {value.toLocaleString('id-ID')}{suffix}</div>
              <div className="text-gray-500 text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border border-white/8 rounded-xl p-1 mb-6">
          {[['riwayat', 'Riwayat Poin'], ['reward', 'Reward Tersedia']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                tab === key ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:text-white'
              }`}>{label}</button>
          ))}
        </div>

        {/* Riwayat */}
        {tab === 'riwayat' && (
          <div className="space-y-3">
            {d.history.map((h) => (
              <div key={h.id} className="flex items-center gap-4 p-4 rounded-xl border border-white/8 hover:border-white/15 transition-all" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${h.type === 'in' ? 'bg-green-500/15' : 'bg-red-500/15'}`}>
                  {h.type === 'in'
                    ? <MdArrowUpward className="text-green-400 text-lg" />
                    : <MdArrowDownward className="text-red-400 text-lg" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{h.desc}</p>
                  <p className="text-gray-500 text-xs">{new Date(h.date).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}</p>
                </div>
                <span className={`text-sm font-bold ${h.type === 'in' ? 'text-green-400' : 'text-red-400'}`}>
                  {h.type === 'in' ? '+' : ''}{h.points.toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Reward */}
        {tab === 'reward' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {d.rewards.map((r) => {
              const canRedeem = d.currentPoints >= r.points && r.available
              return (
                <div key={r.id} className={`p-5 rounded-2xl border transition-all ${r.available ? 'border-white/10 hover:border-green-500/30' : 'border-white/5 opacity-50'}`}
                  style={{ background: 'rgba(34,197,94,0.04)' }}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center flex-shrink-0">
                      <MdCardGiftcard className="text-yellow-400 text-lg" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{r.name}</p>
                      <p className="text-gray-500 text-xs">{r.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
                      <MdStar className="text-base" /> {r.points.toLocaleString('id-ID')} poin
                    </div>
                    <button disabled={!canRedeem}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                        canRedeem
                          ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30'
                          : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/5'
                      }`}>
                      {canRedeem ? 'Tukar' : `Kurang ${(r.points - d.currentPoints).toLocaleString('id-ID')}`}
                    </button>
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