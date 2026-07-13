// ============================================================
// RewardCenter.jsx — CRM Reward & Voucher Center
// ============================================================
import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import RewardCard from '../../components/crm/RewardCard'
import { KpiCard, SectionCard } from '../../components/crm/CrmKpiCards'
import { calcTier, TIER_CONFIG } from '../../lib/loyaltyConstants'

const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID')

function useRewardsData() {
  const [rewards, setRewards] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const [customerAPI, crmAPI] = await Promise.all([
        import('../../services/customerAPI').then((m) => m.customerAPI),
        import('../../services/crmAPI').then((m) => m.crmAPI),
      ])
      const [c, r] = await Promise.all([
        customerAPI.fetchAll().catch(() => []),
        crmAPI.fetchRewards().catch(() => []),
      ])
      setCustomers(c || [])
      setRewards(r || [])
    } catch (err) {
      console.error('Reward: Gagal load data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { rewards, customers, loading, reload: load }
}

export default function RewardCenter() {
  const { rewards, customers, loading, reload } = useRewardsData()
  const [tab, setTab] = useState('rewards')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', pointsCost: 1000, icon: '🎁', stock: 100 })
  const [message, setMessage] = useState(null)
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [redeemHistory, setRedeemHistory] = useState([])

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  // KPI
  const kpis = useMemo(() => ({
    totalRewards: rewards.length,
    activeRewards: rewards.filter((r) => r.is_active !== false).length,
    totalRedeemed: rewards.reduce((s, r) => s + (r.redeemed || 0), 0),
    totalStock: rewards.reduce((s, r) => s + (r.stock || 0), 0),
    totalCustomers: customers.length,
  }), [rewards, customers])

  // Filter rewards
  const filtered = useMemo(() => {
    if (!search) return rewards
    const q = search.toLowerCase()
    return rewards.filter((r) => r.name?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q))
  }, [rewards, search])

  const handleCreate = async () => {
    if (!form.name.trim()) return
    try {
      const { crmAPI } = await import('../../services/crmAPI')
      await crmAPI.createReward(form)
      showMsg('✅ Reward berhasil ditambahkan!')
      setShowForm(false)
      setForm({ name: '', description: '', pointsCost: 1000, icon: '🎁', stock: 100 })
      reload()
    } catch (err) {
      showMsg('❌ Gagal menambah reward', 'error')
    }
  }

  const handleRedeem = async (reward) => {
    if (!selectedCustomer) {
      showMsg('Pilih customer terlebih dahulu', 'error')
      return
    }
    const customer = customers.find((c) => c.id === selectedCustomer)
    if (!customer) return
    if ((customer.points || 0) < reward.points_cost) {
      showMsg(`❌ ${customer.name} hanya punya ${(customer.points || 0).toLocaleString('id-ID')} poin (butuh ${reward.points_cost})`, 'error')
      return
    }
    if (!confirm(`Tukarkan ${reward.name} (${reward.points_cost} poin) untuk ${customer.name}?`)) return
    try {
      const { crmAPI } = await import('../../services/crmAPI')
      // Kurangi poin customer
      const { customerAPI } = await import('../../services/customerAPI')
      await customerAPI.update(customer.id, { points: (customer.points || 0) - reward.points_cost })
      await crmAPI.logPointChange({
        customerId: customer.id,
        type: 'out',
        points: reward.points_cost,
        description: `Penukaran: ${reward.name}`,
        createdBy: 'Admin',
      })
      showMsg(`✅ ${customer.name} berhasil menukarkan ${reward.name}!`)
      reload()
    } catch (err) {
      showMsg('❌ Gagal menukarkan reward', 'error')
    }
  }

  // Generate mock favorite rewards
  const favoriteRewards = useMemo(() => {
    return [...rewards].sort((a, b) => (b.redeemed || 0) - (a.redeemed || 0)).slice(0, 3)
  }, [rewards])

  if (loading) {
    return (
      <div className="p-6 animate-pulse space-y-4">
        <div className="h-8 w-48 rounded-lg bg-white/5" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-white/5" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">🎁 Reward Center</h1>
          <p className="text-gray-400 text-sm mt-1">Kelola reward, voucher, dan penukaran poin customer</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-all">
          + Tambah Reward
        </button>
      </motion.div>

      {/* Toast */}
      <AnimatePresence>
        {message && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold border ${
              message.type === 'error' ? 'bg-red-500/15 text-red-400 border-red-500/25' : 'bg-green-500/15 text-green-400 border-green-500/25'
            }`}>
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <KpiCard label="Total Reward" value={kpis.totalRewards} icon="🎁" color="#22C55E" index={0} />
        <KpiCard label="Aktif" value={kpis.activeRewards} icon="✅" color="#3B82F6" index={1} />
        <KpiCard label="Total Ditukar" value={kpis.totalRedeemed} icon="🔄" color="#FBBF24" index={2} />
        <KpiCard label="Sisa Stok" value={kpis.totalStock - kpis.totalRedeemed} icon="📦" color="#A855F7" index={3} />
        <KpiCard label="Total Customer" value={kpis.totalCustomers} icon="👥" color="#10B981" index={4} />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'rewards', label: '🎁 Semua Reward' },
          { key: 'favorites', label: '⭐ Favorit' },
          { key: 'history', label: '📋 Riwayat' },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              tab === t.key ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'text-gray-400 border-white/10 hover:text-white'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Customer Selector for Redemption */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-gray-400 text-xs">Tukar reward untuk:</span>
        <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}
          className="bg-[#04120e] border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-green-500/40 min-w-[200px]">
          <option value="">Pilih Customer</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} — {(c.points || 0).toLocaleString('id-ID')} poin
            </option>
          ))}
        </select>
        {selectedCustomer && (() => {
          const c = customers.find((cx) => cx.id === selectedCustomer)
          if (!c) return null
          const tier = calcTier(c.points || 0)
          const cfg = TIER_CONFIG[tier]
          return (
            <span className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-full"
              style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
              {cfg.icon} {tier} · {(c.points || 0).toLocaleString('id-ID')} poin
            </span>
          )
        })()}
      </div>

      {/* Tab Content */}
      {tab === 'rewards' && (
        <>
          {/* Search */}
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari reward..."
            className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-green-500/40"
          />

          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-4xl">🎁</span>
              <p className="text-gray-500 text-sm mt-3">Belum ada reward. Tambahkan reward pertama!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((r, i) => (
                <RewardCard key={r.id} reward={r} onRedeem={handleRedeem} index={i} />
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'favorites' && (
        <div>
          <h3 className="text-white font-semibold text-sm mb-3">⭐ Reward Favorit (Paling Banyak Ditukar)</h3>
          {favoriteRewards.length === 0 ? (
            <p className="text-gray-500 text-sm italic">Belum ada data penukaran.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {favoriteRewards.map((r, i) => (
                <div key={r.id}
                  className="rounded-2xl border p-5 text-center"
                  style={{ background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(255,255,255,0.08)' }}
                >
                  <div className="text-4xl mb-3">{r.icon || '🎁'}</div>
                  <p className="text-white font-bold">{r.name}</p>
                  <p className="text-green-400 font-bold text-lg mt-1">{r.points_cost} poin</p>
                  <p className="text-gray-500 text-xs mt-1">Ditukar {r.redeemed || 0}x</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'history' && (
        <SectionCard title="📋 Riwayat Penukaran" icon="">
          {redeemHistory.length === 0 ? (
            <p className="text-gray-500 text-sm italic">Belum ada riwayat penukaran. Pilih customer dan tukarkan reward untuk mulai mencatat.</p>
          ) : (
            <div className="space-y-2">
              {redeemHistory.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{r.icon || '🎁'}</span>
                    <div>
                      <p className="text-white text-sm font-semibold">{r.customerName}</p>
                      <p className="text-gray-500 text-xs">{r.rewardName} · {r.points} poin</p>
                    </div>
                  </div>
                  <span className="text-gray-500 text-[10px]">{r.date ? new Date(r.date).toLocaleDateString('id-ID') : '-'}</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {/* Create Reward Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-md rounded-2xl border overflow-hidden"
              style={{ background: '#061a14', borderColor: 'rgba(34,197,94,0.2)' }}
              onClick={(e) => e.stopPropagation()}>
              <div className="p-5 border-b border-green-500/10">
                <h2 className="text-white font-bold text-lg">Tambah Reward Baru</h2>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Nama Reward *</label>
                  <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Contoh: Voucher Diskon 20%"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-green-500/40" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Poin Dibutuhkan</label>
                    <input type="number" value={form.pointsCost} onChange={(e) => setForm((f) => ({ ...f, pointsCost: Number(e.target.value) }))}
                      min={100}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-green-500/40" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Stok</label>
                    <input type="number" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
                      min={1}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-green-500/40" />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Ikon</label>
                  <select value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                    className="w-full bg-[#04120e] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-green-500/40">
                    <option value="🎁">🎁 Hadiah</option>
                    <option value="🎟️">🎟️ Voucher</option>
                    <option value="💰">💰 Diskon</option>
                    <option value="🛢️">🛢️ Oli</option>
                    <option value="🧰">🧰 Tools</option>
                    <option value="🏆">🏆 Eksklusif</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Deskripsi</label>
                  <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3} placeholder="Jelaskan reward ini..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-green-500/40 resize-none" />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button onClick={() => setShowForm(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white border border-white/10 transition-all">Batal</button>
                  <button onClick={handleCreate} disabled={!form.name.trim()}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-all disabled:opacity-40">
                    Simpan Reward</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
