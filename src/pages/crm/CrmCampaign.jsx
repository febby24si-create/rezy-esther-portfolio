// ============================================================
// CrmCampaign.jsx — CRM Campaign Management
// ============================================================
import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CampaignCard from '../../components/crm/CampaignCard'
import { KpiCard } from '../../components/crm/CrmKpiCards'

const CAMPAIGN_TYPES = [
  { key: 'birthday',     label: 'Promo Ulang Tahun',          icon: '🎂', desc: 'Voucher diskon untuk member yang berulang tahun' },
  { key: 'vip',          label: 'Promo Member VIP',           icon: '👑', desc: 'Promo eksklusif untuk member Platinum & Gold' },
  { key: 'old-vehicle',  label: 'Promo Kendaraan Lama',       icon: '🚗', desc: 'Diskon servis untuk kendaraan >5 tahun' },
  { key: 'inactive',     label: 'Promo Customer Tidak Aktif', icon: '😴', desc: 'Win-back campaign untuk customer yang lama tidak servis' },
  { key: 'oil-change',   label: 'Promo Ganti Oli',            icon: '🛢️', desc: 'Paket spesial ganti oli dengan harga promo' },
  { key: 'general',      label: 'Promo Umum',                 icon: '🎯', desc: 'Promo reguler untuk semua customer' },
]

export default function CrmCampaign() {
  const [campaigns, setCampaigns] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [form, setForm] = useState({
    name: '',
    type: 'general',
    description: '',
    discountPct: 10,
    targetSegment: 'all',
    voucherQuota: 100,
    endsAt: '',
    status: 'draft',
  })

  const loadCampaigns = useCallback(async () => {
    try {
      const { crmAPI } = await import('../../services/crmAPI')
      const data = await crmAPI.fetchCampaigns()
      setCampaigns(data || [])
    } catch (err) {
      console.error('Gagal load campaigns:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadCampaigns() }, [loadCampaigns])

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleCreate = async (form) => {
    try {
      const { crmAPI } = await import('../../services/crmAPI')
      await crmAPI.createCampaign({
        ...form,
        startsAt: new Date().toISOString(),
        endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
      })
      showMsg('✅ Campaign berhasil dibuat!')
      setShowForm(false)
      loadCampaigns()
    } catch (err) {
      showMsg('❌ Gagal membuat campaign', 'error')
    }
  }

  const handleActivate = async (id) => {
    try {
      const { crmAPI } = await import('../../services/crmAPI')
      await crmAPI.updateCampaign(id, { status: 'active' })
      showMsg('✅ Campaign diaktifkan!')
      loadCampaigns()
    } catch (err) {
      showMsg('❌ Gagal mengaktifkan campaign', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus campaign ini?')) return
    try {
      const { crmAPI } = await import('../../services/crmAPI')
      await crmAPI.deleteCampaign(id)
      showMsg('🗑️ Campaign dihapus')
      loadCampaigns()
    } catch (err) {
      showMsg('❌ Gagal menghapus campaign', 'error')
    }
  }

  const filtered = filter === 'all' ? campaigns : campaigns.filter((c) => c.status === filter)

  const kpiSummary = useMemo(() => ({
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === 'active').length,
    draft: campaigns.filter((c) => c.status === 'draft').length,
    totalVouchers: campaigns.reduce((s, c) => s + (c.voucher_quota || 0), 0),
    usedVouchers: campaigns.reduce((s, c) => s + (c.voucher_used || 0), 0),
  }), [campaigns])

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
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">📢 CRM Campaign</h1>
          <p className="text-gray-400 text-sm mt-1">Buat dan kelola campaign promosi untuk customer</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-all">
          + Buat Campaign
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Total Campaign" value={kpiSummary.total} icon="📢" color="#22C55E" index={0} />
        <KpiCard label="Aktif" value={kpiSummary.active} icon="✅" color="#3B82F6" index={1} />
        <KpiCard label="Draft" value={kpiSummary.draft} icon="📝" color="#FBBF24" index={2} />
        <KpiCard label="Voucher Terpakai" value={`${kpiSummary.usedVouchers}/${kpiSummary.totalVouchers}`} icon="🎟️" color="#A855F7" index={3} />
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: `Semua (${campaigns.length})` },
          { key: 'active', label: `Aktif (${kpiSummary.active})` },
          { key: 'draft', label: `Draft (${kpiSummary.draft})` },
          { key: 'completed', label: 'Selesai' },
        ].map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              filter === f.key ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'text-gray-400 border-white/10 hover:text-white'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Campaign List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-4xl">📭</span>
          <p className="text-gray-500 text-sm mt-3">Belum ada campaign. Buat campaign pertama Anda!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c, i) => (
            <CampaignCard key={c.id} campaign={c} onActivate={handleActivate} onDelete={handleDelete} index={i} />
          ))}
        </div>
      )}

      {/* Campaign Templates */}
      <div>
        <h3 className="text-white font-semibold text-sm mb-3">📋 Template Campaign</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CAMPAIGN_TYPES.map((t) => (
            <button key={t.key} onClick={() => {
              setForm({
                name: '',
                type: t.key,
                description: t.desc,
                discountPct: 10,
                targetSegment: 'all',
                voucherQuota: 100,
                endsAt: '',
                status: 'draft',
              })
              setShowForm(true)
            }}
              className="flex items-start gap-3 p-4 rounded-xl border border-white/8 hover:border-green-500/20 transition-all text-left hover:bg-white/5"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <span className="text-2xl">{t.icon}</span>
              <div>
                <p className="text-white text-sm font-semibold">{t.label}</p>
                <p className="text-gray-500 text-xs mt-0.5">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-lg rounded-2xl border overflow-hidden"
              style={{ background: '#061a14', borderColor: 'rgba(34,197,94,0.2)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-green-500/10">
                <h2 className="text-white font-bold text-lg">Buat Campaign Baru</h2>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault()
                if (!form.name.trim()) return
                handleCreate(form)
                setForm({ name: '', type: 'general', description: '', discountPct: 10, targetSegment: 'all', voucherQuota: 100, endsAt: '', status: 'draft' })
                setShowForm(false)
              }} className="p-5 space-y-4">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Nama Campaign *</label>
                  <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Contoh: Promo Ulang Tahun Juni 2026"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-green-500/40" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Tipe Campaign</label>
                    <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                      className="w-full bg-[#04120e] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-green-500/40">
                      {CAMPAIGN_TYPES.map((t) => <option key={t.key} value={t.key}>{t.icon} {t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Diskon (%)</label>
                    <input type="number" value={form.discountPct} onChange={(e) => setForm((f) => ({ ...f, discountPct: Number(e.target.value) }))}
                      min={0} max={100}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-green-500/40" />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Target Segmen</label>
                  <select value={form.targetSegment} onChange={(e) => setForm((f) => ({ ...f, targetSegment: e.target.value }))}
                    className="w-full bg-[#04120e] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-green-500/40">
                    <option value="all">Semua Customer</option>
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                    <option value="new">Member Baru</option>
                    <option value="inactive">Tidak Aktif</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Kuota Voucher</label>
                  <input type="number" value={form.voucherQuota} onChange={(e) => setForm((f) => ({ ...f, voucherQuota: Number(e.target.value) }))}
                    min={0}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-green-500/40" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Berakhir Pada</label>
                  <input type="date" value={form.endsAt} onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-green-500/40" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Deskripsi</label>
                  <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3} placeholder="Jelaskan campaign ini..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-green-500/40 resize-none" />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white border border-white/10 transition-all">
                    Batal
                  </button>
                  <button type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-all"
                    disabled={!form.name.trim()}>
                    Buat Campaign
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
