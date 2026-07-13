// ============================================================
// CrmAnalytics.jsx — CRM Analytics Charts (Recharts)
// ============================================================
import { useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from 'recharts'
import { SectionCard } from './CrmKpiCards'

const COLORS = {
  platinum:     '#A855F7',
  gold:         '#FBBF24',
  silver:       '#94A3B8',
  bronze:       '#F97316',
  'vip mahkota': '#EC4899',
}

function ChartTooltip({ active, payload, label, format }) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-xl px-4 py-3"
      style={{
        background: 'rgba(4,18,14,0.97)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(34,197,94,0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      }}
    >
      <p className="text-xs text-gray-400 mb-1.5 font-medium">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold" style={{ color: p.color || p.fill }}>
          {p.name}: {format ? format(p.value) : Number(p.value).toLocaleString('id-ID')}
        </p>
      ))}
    </div>
  )
}

// ─── 1. Member Growth Chart ──────────────────────────────────
export function MemberGrowthChart({ data }) {
  if (!data || data.length === 0) return null
  const latest = data[data.length - 1]
  return (
    <SectionCard title="📈 Pertumbuhan Member" className="h-full" icon="">
      <div className="mb-3">
        <p className="text-white text-2xl font-black">{latest?.total || 0}</p>
        <p className="text-gray-500 text-xs">{latest?.new || 0} member baru bulan ini</p>
      </div>
      <div style={{ width: '100%', height: 200, minHeight: 200 }}>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="growthGradCrm" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="total" stroke="#22C55E" strokeWidth={2} fill="url(#growthGradCrm)"
              dot={false} activeDot={{ r: 5, fill: '#22C55E', stroke: '#04120e', strokeWidth: 2 }}
              isAnimationActive animationDuration={1500} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  )
}

// ─── 2. Revenue by Tier Chart ────────────────────────────────
export function RevenueByTierChart({ data }) {
  if (!data || data.length === 0) return null
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <SectionCard title="💰 Pendapatan per Tier" className="h-full" icon="">
      <div className="flex flex-col items-center">
        <PieChart width={180} height={180}>
          <Pie data={data} cx={90} cy={90}
            innerRadius={58} outerRadius={82}
            paddingAngle={3} dataKey="value" strokeWidth={0}
            isAnimationActive animationDuration={1500}>
            {data.map((entry, idx) => (
              <Cell key={idx} fill={COLORS[entry.name?.toLowerCase()] || '#6B7280'}
                style={{ filter: `drop-shadow(0 0 6px ${(COLORS[entry.name?.toLowerCase()] || '#6B7280')}30)` }} />
            ))}
          </Pie>
        </PieChart>
        <p className="text-white text-sm font-black mt-1">Total: Rp {(total / 1000000).toFixed(1)}jt</p>
        <div className="w-full space-y-1.5 mt-3">
          {data.map((d) => {
            const color = COLORS[d.name?.toLowerCase()] || '#6B7280'
            const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : 0
            return (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-sm" style={{ background: color }} />
                  <span className="text-gray-300 text-[11px]">{d.name}</span>
                </div>
                <span className="text-gray-400 text-[11px]">{pct}% · Rp {(d.value / 1000000).toFixed(1)}jt</span>
              </div>
            )
          })}
        </div>
      </div>
    </SectionCard>
  )
}

// ─── 3. Repeat Customer Rate ─────────────────────────────────
export function RepeatCustomerChart({ data }) {
  if (!data || data.length === 0) return null
  return (
    <SectionCard title="🔄 Repeat Customer" className="h-full" icon="">
      <div style={{ width: '100%', height: 200, minHeight: 200 }}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#4b5563', fontSize: 9 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="new" name="New" radius={[4, 4, 0, 0]} maxBarSize={24}
              fill="#3B82F6" isAnimationActive animationDuration={1200} />
            <Bar dataKey="repeat" name="Repeat" radius={[4, 4, 0, 0]} maxBarSize={24}
              fill="#22C55E" isAnimationActive animationDuration={1200} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex gap-4 mt-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
          <span className="text-gray-400">Customer Baru</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-green-500" />
          <span className="text-gray-400">Repeat Customer</span>
        </div>
      </div>
    </SectionCard>
  )
}

// ─── 4. Voucher Usage Chart ──────────────────────────────────
export function VoucherUsageChart({ data }) {
  if (!data || data.length === 0) return null
  return (
    <SectionCard title="🎟️ Penggunaan Voucher" className="h-full" icon="">
      <div style={{ width: '100%', height: 180, minHeight: 180 }}>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#4b5563', fontSize: 8 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#4b5563', fontSize: 8 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="used" stroke="#A855F7" strokeWidth={2}
              dot={false} isAnimationActive animationDuration={1200} />
            <Line type="monotone" dataKey="sent" stroke="#22C55E" strokeWidth={2}
              dot={false} isAnimationActive animationDuration={1200} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  )
}

// ─── 5. Point Redemption ─────────────────────────────────────
export function PointRedemptionChart({ data }) {
  if (!data || data.length === 0) return null
  return (
    <SectionCard title="⭐ Redemption Poin" className="h-full" icon="">
      <div style={{ width: '100%', height: 180, minHeight: 180 }}>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="pointGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#FBBF24" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#4b5563', fontSize: 8 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#4b5563', fontSize: 8 }} axisLine={false} tickLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="redeemed" stroke="#FBBF24" strokeWidth={2} fill="url(#pointGrad)"
              dot={false} isAnimationActive animationDuration={1200} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  )
}
