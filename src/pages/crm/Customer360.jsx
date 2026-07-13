// ============================================================
// Customer360.jsx — Customer 360° Profile (CRM Dashboard)
// ============================================================
import { useState, useMemo, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCustomerStore } from '../../hooks/useCustomerStore'
import CustomerTimeline from '../../components/crm/CustomerTimeline'
import LoyaltySection from '../../components/crm/LoyaltySection'
import CustomerInsights from '../../components/crm/CustomerInsights'
import { SectionCard, StatCard, MiniStat, KpiCard } from '../../components/crm/CrmKpiCards'
import { calcLoyaltyProgress, TIER_CONFIG } from '../../lib/loyaltyConstants'

const fmt = (n) => 'Rp ' + Number(n || 0).toLocaleString('id-ID')
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'

const TABS = [
  { key: 'overview',  icon: '📊', label: 'Overview' },
  { key: 'timeline',  icon: '📋', label: 'Timeline' },
  { key: 'loyalty',   icon: '🏆', label: 'Loyalty' },
  { key: 'insights',  icon: '🎯', label: 'Insights' },
]

function useCustomerOrders(customerName) {
  const [orders, setOrders] = useState([])
  useEffect(() => {
    if (!customerName) return
    const stored = sessionStorage.getItem('garage_orders')
    const allOrders = stored ? JSON.parse(stored) : []
    setOrders(allOrders.filter((o) => o.customer === customerName).sort((a, b) => new Date(b.date) - new Date(a.date)))
  }, [customerName])
  return orders
}

function useCustomerReviews(customerId, customerName) {
  const [reviews, setReviews] = useState([])
  useEffect(() => {
    const load = async () => {
      try {
        const { crmAPI } = await import('../../services/crmAPI')
        const data = await crmAPI.fetchReviews()
        setReviews(data.filter((r) => r.customerId === customerId || r.customerName === customerName))
      } catch { /* ignore */ }
    }
    if (customerId || customerName) load()
  }, [customerId, customerName])
  return reviews
}

function OverviewTab({ customer, orders, tierCfg, loyalty }) {
  const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0)
  const initials = customer.name?.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?'

  return (
    <div className="space-y-4">
      {/* Hero Profile */}
      <div
        className="rounded-2xl border p-5 flex flex-wrap items-start gap-5"
        style={{ background: 'rgba(4,28,21,0.7)', borderColor: `${tierCfg.color}25` }}
      >
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white flex-shrink-0"
          style={{ background: `${tierCfg.color}25`, border: `2px solid ${tierCfg.border}` }}
        >
          {customer.photo ? (
            <img src={customer.photo} alt={customer.name} className="w-full h-full object-cover rounded-2xl" />
          ) : initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="text-xl font-bold text-white">{customer.name}</h1>
            <span
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: tierCfg.bg, color: tierCfg.color, border: `1px solid ${tierCfg.border}` }}
            >
              {tierCfg.icon} {loyalty.tier}
            </span>
            <span className={`flex items-center gap-1 text-xs ${customer.is_active !== false ? 'text-green-400' : 'text-gray-500'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${customer.is_active !== false ? 'bg-green-400' : 'bg-gray-500'}`} />
              {customer.is_active !== false ? 'Aktif' : 'Tidak Aktif'}
            </span>
          </div>
          <p className="text-gray-500 text-xs mb-3">Bergabung {fmtDate(customer.joinDate || customer.created_at)}</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Transaksi" value={`${orders.length}×`} icon="🛒" color="#3B82F6" />
        <StatCard label="Total Pengeluaran" value={fmt(totalSpent)} icon="💰" color="#FBBF24" />
        <StatCard label="Total Poin" value={`${(customer.points || 0).toLocaleString('id-ID')}`} icon="⭐" color={tierCfg.color} />
        <StatCard label="Rata-rata/Order" value={orders.length > 0 ? fmt(Math.round(totalSpent / orders.length)) : '-'} icon="📊" color="#A855F7" />
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="📋 Data Identitas">
          <MiniStat label="Email" value={customer.email || '-'} color="#3B82F6" />
          <MiniStat label="No. HP" value={customer.phone || '-'} color="#22C55E" />
          <MiniStat label="Alamat" value={customer.address || '-'} />
          <MiniStat label="Customer ID" value={customer.id} color="#6B7280" />
          {customer.memberSince && <MiniStat label="Member Sejak" value={fmtDate(customer.memberSince)} />}
        </SectionCard>

        <SectionCard title="🚗 Kendaraan & Servis">
          <MiniStat label="Total Booking" value={`${(customer.totalBookings || 0) + orders.length}×`} color="#3B82F6" />
          <MiniStat label="Total Servis" value={`${orders.length}×`} color="#22C55E" />
          <MiniStat label="Voucher Aktif" value={`${customer.activeVouchers || 0}`} color="#A855F7" />
          <MiniStat label="Terakhir Servis" value={
            orders.length > 0
              ? new Date(orders[0].date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
              : '-'
          } />
        </SectionCard>
      </div>

      {/* Recent Orders */}
      {orders.length > 0 && (
        <SectionCard title="📦 Transaksi Terakhir" icon="">
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {orders.slice(0, 5).map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-white text-sm font-semibold truncate">{o.service}</p>
                  <p className="text-gray-500 text-xs">{o.vehicle} · {o.mechanic}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="text-white text-sm font-bold">{fmt(o.total)}</p>
                  <p className="text-gray-600 text-[10px]">{new Date(o.date).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  )
}

export default function Customer360() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { customers } = useCustomerStore()
  const [activeTab, setActiveTab] = useState('overview')

  const customer = useMemo(() => customers.find((c) => c.id === id), [customers, id])
  const orders = useCustomerOrders(customer?.name)
  const reviews = useCustomerReviews(customer?.id, customer?.name)

  const loyalty = useMemo(() => calcLoyaltyProgress(customer?.points || 0), [customer?.points])
  const tierCfg = TIER_CONFIG[loyalty.tier]

  const totalSpent = useMemo(() => orders.reduce((s, o) => s + (o.total || 0), 0), [orders])

  if (!customer) {
    return (
      <div className="p-6">
        <button onClick={() => navigate('/customers')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm">
          ← Kembali ke Customers
        </button>
        <div className="text-center py-16">
          <span className="text-4xl">🔍</span>
          <p className="text-gray-400 text-sm mt-3">Customer tidak ditemukan.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl">
      {/* Back + Header */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => navigate('/customers')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          ← Kembali
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">Customer 360°</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap mb-5">
        {TABS.map(({ key, icon, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === key
                ? 'bg-green-500/20 text-green-400 border border-green-500/25'
                : 'text-gray-400 hover:text-white border border-white/8 hover:bg-white/5'
            }`}
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <OverviewTab customer={customer} orders={orders} tierCfg={tierCfg} loyalty={loyalty} />
      )}

      {activeTab === 'timeline' && (
        <SectionCard title="📋 Timeline Aktivitas" icon="">
          <CustomerTimeline customer={customer} orders={orders} reviews={reviews} />
        </SectionCard>
      )}

      {activeTab === 'loyalty' && (
        <LoyaltySection customer={customer} pointHistory={customer.pointHistory || []} />
      )}

      {activeTab === 'insights' && (
        <SectionCard title="🎯 Customer Insights" icon="">
          <CustomerInsights customer={customer} orders={orders} />
        </SectionCard>
      )}
    </div>
  )
}
