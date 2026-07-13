// ============================================================
// CrmDashboard.jsx — CRM Overview Dashboard
// ============================================================
import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { KpiCard, SectionCard } from '../../components/crm/CrmKpiCards'
import {
  MemberGrowthChart,
  RevenueByTierChart,
  RepeatCustomerChart,
  VoucherUsageChart,
  PointRedemptionChart,
} from '../../components/crm/CrmAnalytics'
import CustomerSegmentation from '../../components/crm/CustomerSegmentation'
import { calcTier, TIER_CONFIG } from '../../lib/loyaltyConstants'

const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID')

function useCRMData() {
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [customerAPI, orderAPI, crmAPI] = await Promise.all([
          import('../../services/customerAPI').then((m) => m.customerAPI),
          import('../../services/orderAPI').then((m) => m.orderAPI),
          import('../../services/crmAPI').then((m) => m.crmAPI),
        ])
        const [c, o, r] = await Promise.all([
          customerAPI.fetchAll().catch(() => []),
          orderAPI.fetchAll().catch(() => []),
          crmAPI.fetchReviews().catch(() => []),
        ])
        setCustomers(c || [])
        setOrders(o || [])
        setReviews(r || [])
      } catch (err) {
        console.error('CRM: Gagal load data:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { customers, orders, reviews, loading }
}

// ─── Helper untuk generate mock chart data dari real data ──
function useChartData(customers, orders) {
  return useMemo(() => {
    // Member Growth — group by month
    const growthMap = {}
    customers.forEach((c) => {
      const m = (c.joinDate || c.created_at || '').slice(0, 7)
      if (!m) return
      if (!growthMap[m]) growthMap[m] = { month: m, new: 0, total: 0 }
      growthMap[m].new += 1
    })
    let cumulative = 0
    const growthData = Object.entries(growthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_, v]) => {
        cumulative += v.new
        return { month: v.month, new: v.new, total: cumulative }
      })

    // Revenue by Tier
    const tierRevenue = { Bronze: 0, Silver: 0, Gold: 0, Platinum: 0, 'VIP Mahkota': 0 }
    orders.forEach((o) => {
      const cust = customers.find((c) => c.id === o.customer_id || c.name === o.customer)
      const tier = cust ? calcTier(cust.points || 0) : 'Bronze'
      tierRevenue[tier] = (tierRevenue[tier] || 0) + (o.total || 0)
    })
    const revenueByTier = Object.entries(tierRevenue).map(([name, value]) => ({ name, value }))

    // Repeat Customer Rate — group by month
    const repeatMap = {}
    orders.forEach((o) => {
      const m = (o.date || o.created_at || '').slice(0, 7)
      if (!m) return
      if (!repeatMap[m]) repeatMap[m] = { month: m, new: 0, repeat: 0, seen: new Set() }
      const custKey = o.customer || o.customer_id
      if (custKey) {
        if (repeatMap[m].seen.has(custKey)) {
          repeatMap[m].repeat += 1
        } else {
          repeatMap[m].new += 1
          repeatMap[m].seen.add(custKey)
        }
      }
    })
    const repeatData = Object.entries(repeatMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_, v]) => ({ month: v.month, new: v.new, repeat: v.repeat }))

    // Voucher Usage — mock dari order count per month
    const voucherMap = {}
    orders.forEach((o) => {
      const m = (o.date || o.created_at || '').slice(0, 7)
      if (!m) return
      if (!voucherMap[m]) voucherMap[m] = { month: m, sent: 0, used: 0 }
      voucherMap[m].sent += 1
      if (o.status === 'Selesai') voucherMap[m].used += 1
    })
    const voucherData = Object.entries(voucherMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_, v]) => ({ month: v.month, sent: v.sent, used: Math.round(v.used * 0.3) }))

    // Point Redemption — mock dari customer points
    const pointMonthMap = {}
    customers.forEach((c) => {
      const m = (c.joinDate || c.created_at || '').slice(0, 7)
      if (!m) return
      if (!pointMonthMap[m]) pointMonthMap[m] = { month: m, redeemed: 0 }
      pointMonthMap[m].redeemed += Math.round((c.points || 0) * 0.1)
    })
    const pointData = Object.entries(pointMonthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_, v]) => ({ month: v.month, redeemed: v.redeemed }))

    return { growthData, revenueByTier, repeatData, voucherData, pointData }
  }, [customers, orders])
}

export default function CrmDashboard() {
  const { customers, orders, reviews, loading } = useCRMData()
  const chartData = useChartData(customers, orders)
  const [segment, setSegment] = useState('all')
  const [topN, setTopN] = useState(5)

  // Filter by segment
  const filteredCustomers = useMemo(() => {
    if (segment === 'all') return customers
    if (segment === 'new') return customers.filter((c) => {
      const d = c.joinDate ? Math.floor((new Date() - new Date(c.joinDate)) / 86400000) : 9999
      return d < 30
    })
    if (segment === 'inactive') return customers.filter((c) => {
      const d = c.lastOrderDate ? Math.floor((new Date() - new Date(c.lastOrderDate)) / 86400000) : 9999
      return d > 90
    })
    if (segment === 'top_spender') return customers.filter((c) => (c.totalSpent || 0) >= 5000000)
    if (segment === 'vip_mahkota') return customers.filter((c) => (c.points || 0) >= 5000)
    const tier = segment.charAt(0).toUpperCase() + segment.slice(1)
    return customers.filter((c) => calcTier(c.points || 0) === tier)
  }, [customers, segment])

  // KPI calculations
  const kpis = useMemo(() => {
    const activeMembers = customers.filter((c) => c.is_active !== false).length
    const newMembers = customers.filter((c) => {
      const d = c.joinDate ? Math.floor((new Date() - new Date(c.joinDate)) / 86400000) : 9999
      return d < 30
    }).length
    const repeatCust = customers.filter((c) => (c.totalOrders || 0) > 1).length
    const totalSpent = orders.reduce((s, o) => s + (o.total || 0), 0)
    const avgRating = reviews.length > 0
      ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : 'N/A'
    const voucherUsed = orders.filter((o) => o.voucher_code).length

    return [
      { id: 'total_members', label: 'Total Member', value: customers.length, icon: '👥', color: '#22C55E' },
      { id: 'new_members', label: 'Member Baru (30d)', value: newMembers, icon: '🆕', color: '#3B82F6' },
      { id: 'active_members', label: 'Active Member', value: activeMembers, icon: '✅', color: '#10B981' },
      { id: 'repeat_rate', label: 'Repeat Customer', value: `${customers.length > 0 ? Math.round((repeatCust / customers.length) * 100) : 0}%`, icon: '🔄', color: '#FBBF24' },
      { id: 'retention', label: 'Retention Rate', value: customers.length > 0 ? `${Math.round((activeMembers / customers.length) * 100)}%` : '0%', icon: '📈', color: '#A855F7' },
      { id: 'avg_spending', label: 'Rata-rata Spending', value: customers.length > 0 ? fmt(Math.round(totalSpent / customers.length)) : 'Rp 0', icon: '💰', color: '#F97316' },
      { id: 'voucher_used', label: 'Voucher Digunakan', value: voucherUsed, icon: '🎟️', color: '#EC4899' },
      { id: 'satisfaction', label: 'Kepuasan', value: avgRating, suffix: ' /5 ⭐', icon: '😊', color: '#14B8A6' },
    ]
  }, [customers, orders, reviews])

  // Top customers by spending
  const topCustomers = useMemo(() => {
    return [...customers]
      .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
      .slice(0, topN)
  }, [customers, topN])

  // Near-churn customers
  const churnRisks = useMemo(() => {
    return customers
      .filter((c) => {
        const d = c.lastOrderDate ? Math.floor((new Date() - new Date(c.lastOrderDate)) / 86400000) : 9999
        return d > 60 && d < 365
      })
      .sort((a, b) => {
        const da = a.lastOrderDate ? Math.floor((new Date() - new Date(a.lastOrderDate)) / 86400000) : 9999
        const db = b.lastOrderDate ? Math.floor((new Date() - new Date(b.lastOrderDate)) / 86400000) : 9999
        return db - da
      })
      .slice(0, 5)
  }, [customers])

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 w-64 rounded-lg bg-white/5" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-white/5" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 rounded-2xl bg-white/5" />
          <div className="h-72 rounded-2xl bg-white/5" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            🤖 CRM Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Analytics & insights untuk {customers.length} customer · {orders.length} orders
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/crm"
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-white/15 text-gray-300 hover:text-white hover:bg-white/5 transition-all"
          >
            Automation
          </Link>
        </div>
      </motion.div>

      {/* 8 KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {kpis.map((kpi, i) => (
          <KpiCard key={kpi.id} {...kpi} index={i} />
        ))}
      </div>

      {/* Segmentation Filter */}
      <div>
        <p className="text-gray-400 text-xs font-semibold mb-2">Filter Segmen</p>
        <CustomerSegmentation customers={customers} selected={segment} onSelect={setSegment} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MemberGrowthChart data={chartData.growthData} />
        <RevenueByTierChart data={chartData.revenueByTier} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <RepeatCustomerChart data={chartData.repeatData} />
        <VoucherUsageChart data={chartData.voucherData} />
        <PointRedemptionChart data={chartData.pointData} />
      </div>

      {/* Top Customers + Churn Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="👑 Top Spending Customer" icon="" action={
          <div className="flex gap-1">
            {[3, 5, 10].map((n) => (
              <button key={n} onClick={() => setTopN(n)}
                className={`text-[10px] px-2 py-0.5 rounded font-semibold ${topN === n ? 'bg-green-500/20 text-green-400' : 'text-gray-500 hover:text-white'}`}>
                Top {n}
              </button>
            ))}
          </div>
        }>
          <div className="space-y-2">
            {topCustomers.map((c, i) => {
              const tier = calcTier(c.points || 0)
              const cfg = TIER_CONFIG[tier]
              const maxSpent = topCustomers[0]?.totalSpent || 1
              return (
                <Link key={c.id} to={`/crm/customer/${c.id}`}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all group">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${
                    i === 0 ? 'bg-amber-500/20 text-amber-400' : i === 1 ? 'bg-gray-400/20 text-gray-400' : i === 2 ? 'bg-orange-400/20 text-orange-400' : 'bg-white/10 text-gray-500'
                  }`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-white text-xs font-semibold truncate">{c.name}</p>
                      <span className="text-[9px] font-bold" style={{ color: cfg.color }}>{cfg.icon} {tier}</span>
                    </div>
                    <div className="w-full h-1 rounded-full mt-1 overflow-hidden bg-white/5">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${((c.totalSpent || 0) / maxSpent) * 100}%` }}
                        transition={{ duration: 0.8, delay: i * 0.05 }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, #22C55E, #16A34A)` }} />
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-green-400 text-xs font-bold">{fmt(c.totalSpent || 0)}</p>
                    <p className="text-gray-500 text-[9px]">{c.totalOrders || 0}×</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </SectionCard>

        <SectionCard title="🚨 Customer Berpotensi Churn" icon="">
          {churnRisks.length === 0 ? (
            <p className="text-gray-500 text-sm italic">Tidak ada customer berisiko churn.</p>
          ) : (
            <div className="space-y-2">
              {churnRisks.map((c) => {
                const days = c.lastOrderDate
                  ? Math.floor((new Date() - new Date(c.lastOrderDate)) / 86400000)
                  : 9999
                const severity = days > 180 ? 'danger' : days > 90 ? 'warning' : 'info'
                return (
                  <Link key={c.id} to={`/crm/customer/${c.id}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all">
                    <span className={`text-lg ${
                      severity === 'danger' ? 'text-red-400' : severity === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                    }`}>
                      {severity === 'danger' ? '🚨' : severity === 'warning' ? '⚠️' : '📌'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold truncate">{c.name}</p>
                      <p className="text-gray-500 text-[10px]">{days} hari tidak servis</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      severity === 'danger' ? 'bg-red-500/15 text-red-400' : severity === 'warning' ? 'bg-yellow-500/15 text-yellow-400' : 'bg-blue-500/15 text-blue-400'
                    }`}>
                      {days > 180 ? 'Churn' : days > 90 ? 'At Risk' : 'Warning'}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Segment Customer List */}
      <SectionCard title={`👥 ${segment === 'all' ? 'Semua Customer' : `Customer: ${segment}`} (${filteredCustomers.length})`} icon="">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-1">
          {filteredCustomers.slice(0, 30).map((c) => {
            const tier = calcTier(c.points || 0)
            const cfg = TIER_CONFIG[tier]
            return (
              <Link key={c.id} to={`/crm/customer/${c.id}`}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: cfg.color }}>
                  {c.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{c.name}</p>
                  <p className="text-gray-500 text-[10px]">{c.email || c.phone || '-'}</p>
                </div>
                <span className="text-[10px]" style={{ color: cfg.color }}>{cfg.icon}</span>
              </Link>
            )
          })}
        </div>
      </SectionCard>
    </div>
  )
}
