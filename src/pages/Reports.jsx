// ============================================================
// Reports.jsx — Esther Garage Analytics & Reports
// Blue accent · Glassmorphism · Recharts · Supabase data
// ============================================================
import { useState, useMemo } from "react"
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from "recharts"
import {
  TrendingUp, TrendingDown, Download,
} from "lucide-react"
import useDashboardData from "../hooks/useDashboardData"

const fmt = (n) => "Rp " + Number(n).toLocaleString("id-ID")
const fmtShort = (n) =>
  n >= 1000000 ? `Rp ${(n / 1000000).toFixed(1)}jt` : fmt(n)
const fmtCompact = (n) => {
  if (n >= 1000000000) return `Rp ${(n / 1000000).toFixed(0)}jt`
  if (n >= 1000000) return `Rp ${(n / 1000000).toFixed(1)}jt`
  return fmt(n)
}

const SERVICE_KEYS = [
  { key: "oil", label: "Oil Change", color: "#3B82F6" },
  { key: "tuneup", label: "Tune Up", color: "#10B981" },
  { key: "ac", label: "AC Service", color: "#F59E0B" },
  { key: "brake", label: "Brake", color: "#EF4444" },
  { key: "tire", label: "Tire", color: "#8B5CF6" },
  { key: "body", label: "Body", color: "#EC4899" },
  { key: "other", label: "Others", color: "#6B7280" },
]

// ─── Tooltip ────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const isCount = payload[0]?.name === "bookings" || payload[0]?.name === "total" || payload[0]?.name === "new"
  return (
    <div
      className="rounded-xl px-4 py-3"
      style={{
        background: "rgba(10, 18, 34, 0.97)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(96, 165, 250, 0.2)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      }}
    >
      <p className="text-xs text-gray-400 mb-1.5 font-medium">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-bold" style={{ color: p.color || p.fill }}>
          {p.name}: {typeof p.value === "number" ? (isCount ? Math.round(p.value).toLocaleString("id-ID") : fmtShort(p.value)) : p.value}
        </p>
      ))}
    </div>
  )
}

// ─── Stat Card ──────────────────────────────────────────────
function StatCard({ label, value, sub, icon, trend, positive, color = "#3B82F6" }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col relative overflow-hidden group"
      style={{
        background: "linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(10, 18, 34, 0.95))",
        border: "1px solid rgba(96, 165, 250, 0.1)",
      }}
    >
      <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <div className="flex items-start justify-between mb-2 relative z-10">
        <div className="flex-1">
          <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-widest mb-1">{label}</p>
          <p className="text-white text-xl font-black tracking-tight">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18` }}>
          <span className="text-lg">{icon}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 relative z-10">
        {trend !== undefined && (
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
            positive ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"
          }`}>
            {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(trend)}%
          </span>
        )}
        <span className="text-gray-600 text-[10px]">{sub}</span>
      </div>
    </div>
  )
}

// ─── Section Header ─────────────────────────────────────────
function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center">
        <span className="text-sm">{icon}</span>
      </div>
      <div>
        <h3 className="text-white text-sm font-bold">{title}</h3>
        {subtitle && <p className="text-gray-500 text-[10px]">{subtitle}</p>}
      </div>
    </div>
  )
}

// ─── Loading Skeleton ────────────────────────────────────
function ReportsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-16 rounded-2xl bg-white/5" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-white/5" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 rounded-2xl bg-white/5" />
        <div className="h-80 rounded-2xl bg-white/5" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => <div key={i} className="h-72 rounded-2xl bg-white/5" />)}
      </div>
    </div>
  )
}

// ─── 1. Revenue Area Chart ──────────────────────────────────
function RevenueChart({ data }) {
  const last = data[data.length - 1]
  const prev = data[data.length - 2]
  const growth = prev ? Math.round(((last.revenue - prev.revenue) / prev.revenue) * 100) : 0
  const total = data.reduce((s, m) => s + m.revenue, 0)
  const avg = Math.round(total / data.length)

  return (
    <div
      className="rounded-2xl p-6 h-full"
      style={{
        background: "linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(10, 18, 34, 0.95))",
        border: "1px solid rgba(96, 165, 250, 0.1)",
      }}
    >
      <SectionHeader icon="💰" title="Revenue Overview" subtitle="Monthly revenue trend" />
      <div className="flex items-center gap-4 mb-4">
        <div>
          <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-widest">Total</p>
          <p className="text-white text-3xl font-black">{fmtCompact(total)}</p>
        </div>
        <div className="w-px h-10 bg-white/10" />
        <div>
          <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-widest">Monthly Avg</p>
          <p className="text-white text-xl font-black">{fmtShort(avg)}</p>
        </div>
        <div className="w-px h-10 bg-white/10" />
        <div>
          <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-widest">vs Prev Month</p>
          <span className={`inline-flex items-center gap-1 text-sm font-bold ${
            growth >= 0 ? "text-emerald-400" : "text-red-400"
          }`}>
            {growth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {growth > 0 ? "+" : ""}{growth}%
          </span>
        </div>
      </div>
      <div style={{ width: "100%", height: 280, minHeight: 280 }}>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "#4b5563", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#4b5563", fontSize: 10 }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fill="url(#revGrad)"
              dot={false} activeDot={{ r: 6, fill: "#3B82F6", stroke: "#0a1222", strokeWidth: 3 }}
              isAnimationActive animationDuration={1800} animationEasing="ease-out" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── 2. Service Distribution Donut ──────────────────────────
function ServiceDonutChart({ data }) {
  if (!data || data.length === 0) return null
  const total = data.reduce((s, c) => s + c.value, 0)

  return (
    <div
      className="rounded-2xl p-6 h-full"
      style={{
        background: "linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(10, 18, 34, 0.95))",
        border: "1px solid rgba(96, 165, 250, 0.1)",
      }}
    >
      <SectionHeader icon="📊" title="Service Distribution" subtitle="By volume" />
      <div className="flex flex-col items-center">
        <div className="relative">
          <PieChart width={200} height={200}>
            <Pie data={data} cx={100} cy={100}
              innerRadius={60} outerRadius={88}
              paddingAngle={3} dataKey="value" strokeWidth={0}
              isAnimationActive animationDuration={1500} animationEasing="ease-out">
              {data.map((entry, idx) => (
                <Cell key={idx} fill={entry.color}
                  style={{ filter: `drop-shadow(0 0 6px ${entry.color}30)` }} />
              ))}
            </Pie>
          </PieChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-white text-xl font-black">{total}</p>
            <p className="text-gray-500 text-[9px] uppercase tracking-wider">total</p>
          </div>
        </div>
        <div className="w-full space-y-1.5 mt-4">
          {data.map((s) => (
            <div key={s.name} className="flex items-center justify-between py-0.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
                <span className="text-gray-300 text-[11px]">{s.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 rounded-full overflow-hidden bg-white/5">
                  <div className="h-full rounded-full" style={{ width: `${(s.value / total) * 100}%`, background: s.color }} />
                </div>
                <span className="text-gray-400 text-[10px] font-bold w-8 text-right">{Math.round((s.value / total) * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── 3. Order Trend Line Chart ──────────────────────────────
function OrderTrendChart({ data }) {
  if (!data || data.length === 0) return null
  const total = data.reduce((s, m) => s + m.bookings, 0)
  return (
    <div
      className="rounded-2xl p-6 h-full"
      style={{
        background: "linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(10, 18, 34, 0.95))",
        border: "1px solid rgba(96, 165, 250, 0.1)",
      }}
    >
      <SectionHeader icon="📈" title="Booking Trend" subtitle="Monthly bookings" />
      <div className="flex items-center gap-4 mb-4">
        <div>
          <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-widest">Total Bookings</p>
          <p className="text-white text-2xl font-black">{total}</p>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div>
          <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-widest">Avg / Month</p>
          <p className="text-white font-black">{Math.round(total / data.length)}</p>
        </div>
      </div>
      <div style={{ width: "100%", height: 200, minHeight: 200 }}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "#4b5563", fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#4b5563", fontSize: 9 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="bookings" stroke="#3B82F6" strokeWidth={3}
              dot={false} activeDot={{ r: 5, fill: "#3B82F6", stroke: "#0a1222", strokeWidth: 2 }}
              isAnimationActive animationDuration={1500} animationEasing="ease-out" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 rounded" style={{ background: "#3B82F6" }} />
          <span className="text-gray-500 text-[10px]">Bookings</span>
        </div>
      </div>
    </div>
  )
}

// ─── 4. Revenue by Service Stacked Bar ──────────────────────
function RevenueByServiceChart({ data, revenueByServiceData }) {
  const [hoveredKey, setHoveredKey] = useState(null)
  const monthsCount = data.length
  const chartData = monthsCount < 12 && revenueByServiceData
    ? revenueByServiceData.slice(-monthsCount)
    : revenueByServiceData || data

  return (
    <div
      className="rounded-2xl p-6 h-full"
      style={{
        background: "linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(10, 18, 34, 0.95))",
        border: "1px solid rgba(96, 165, 250, 0.1)",
      }}
    >
      <SectionHeader icon="📊" title="Revenue by Service Category" subtitle="Monthly breakdown" />
      <div style={{ width: "100%", height: 220, minHeight: 220 }}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "#4b5563", fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#4b5563", fontSize: 9 }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                const total = payload.reduce((s, p) => s + p.value, 0)
                return (
                  <div className="rounded-xl px-4 py-3" style={{
                    background: "rgba(10, 18, 34, 0.97)", backdropFilter: "blur(12px)",
                    border: "1px solid rgba(96, 165, 250, 0.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                  }}>
                    <p className="text-xs text-gray-400 font-medium mb-1.5">{label}</p>
                    {payload.map((p) => (
                      <p key={p.name} className="text-[11px]" style={{ color: p.color }}>
                        {p.name}: {p.value} services
                      </p>
                    ))}
                    <p className="text-xs text-white font-bold mt-1 pt-1 border-t border-white/10">Total: {total}</p>
                  </div>
                )
              }}
            />
            {SERVICE_KEYS.map((s) => (
              <Bar key={s.key} dataKey={s.key} stackId="a" fill={s.color} radius={0} maxBarSize={28}
                isAnimationActive animationDuration={1200} animationEasing="ease-out"
                onMouseEnter={() => setHoveredKey(s.key)}
                onMouseLeave={() => setHoveredKey(null)}
                style={{ opacity: hoveredKey && hoveredKey !== s.key ? 0.4 : 1, transition: "opacity 0.2s" }} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 pt-3 border-t border-white/5">
        {SERVICE_KEYS.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 text-[9px] text-gray-400 cursor-default"
            onMouseEnter={() => setHoveredKey(s.key)} onMouseLeave={() => setHoveredKey(null)}
            style={{ opacity: hoveredKey && hoveredKey !== s.key ? 0.4 : 1 }}>
            <span className="w-2 h-2 rounded-sm" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── 5. Top Services Table ──────────────────────────────────
function TopServicesTable({ data }) {
  if (!data || data.length === 0) return null
  return (
    <div
      className="rounded-2xl p-6 h-full"
      style={{
        background: "linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(10, 18, 34, 0.95))",
        border: "1px solid rgba(96, 165, 250, 0.1)",
      }}
    >
      <SectionHeader icon="🏆" title="Top Services" subtitle="By volume & revenue" />
      <div className="space-y-3">
        {data.map((s, i) => {
          const maxCount = data[0].count
          return (
            <div key={s.name} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[8px] font-bold ${
                    i === 0 ? "bg-amber-500/20 text-amber-400" :
                    i === 1 ? "bg-gray-400/20 text-gray-400" :
                    i === 2 ? "bg-orange-400/20 text-orange-400" :
                    "bg-white/10 text-gray-500"
                  }`}>{i + 1}</span>
                  <span className="text-gray-200 text-xs font-semibold">{s.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-[10px]">{s.count}x</span>
                  <span className="text-blue-400 text-[11px] font-bold">{fmtShort(s.revenue)}</span>
                  <span className={`text-[10px] font-bold flex items-center gap-0.5 ${
                    s.growth >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}>
                    {s.growth >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {Math.abs(s.growth)}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden bg-white/5">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(s.count / maxCount) * 100}%`,
                    background: i === 0 ? "linear-gradient(90deg, #F59E0B, #FBBF24)" :
                                i === 1 ? "linear-gradient(90deg, #94A3B8, #CBD5E1)" :
                                i === 2 ? "linear-gradient(90deg, #F97316, #FB923C)" :
                                "linear-gradient(90deg, #3B82F6, #60A5FA)",
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── 6. Mechanic Performance Horizontal Bar ────────────────
function MechanicPerformanceChart({ data }) {
  if (!data || data.length === 0) return null
  return (
    <div
      className="rounded-2xl p-6 h-full"
      style={{
        background: "linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(10, 18, 34, 0.95))",
        border: "1px solid rgba(96, 165, 250, 0.1)",
      }}
    >
      <SectionHeader icon="🔧" title="Mechanic Performance" subtitle="Jobs completed" />
      <div style={{ width: "100%", height: 240, minHeight: 240 }}>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 5, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
            <XAxis type="number" tick={{ fill: "#4b5563", fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} width={55} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0].payload
                return (
                  <div className="rounded-xl px-4 py-3" style={{
                    background: "rgba(10, 18, 34, 0.97)", backdropFilter: "blur(12px)",
                    border: "1px solid rgba(96, 165, 250, 0.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                  }}>
                    <p className="text-xs text-gray-400 font-medium mb-1.5">{d.name}</p>
                    <p className="text-sm font-bold text-blue-400">{d.jobs} jobs</p>
                    <p className="text-[11px] text-gray-400">{fmtShort(d.revenue)} revenue</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-yellow-400 text-[11px]">⭐ {d.rating}</span>
                      <span className={`text-[11px] font-bold flex items-center gap-0.5 ${
                        d.jobsChange >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}>
                        {d.jobsChange >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {d.jobsChange > 0 ? "+" : ""}{d.jobsChange}
                      </span>
                    </div>
                  </div>
                )
              }}
            />
            <Bar dataKey="jobs" radius={[0, 6, 6, 0]} maxBarSize={22}
              isAnimationActive animationDuration={1200} animationEasing="ease-out">
              {data.map((_, idx) => (
                <Cell key={idx} fill={["#3B82F6","#60A5FA","#93C5FD","#BFDBFE","#1D4ED8","#2563EB"][idx % 6]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── 7. Business Performance Summary ────────────────────────
function PerformanceSummary({ data }) {
  if (!data) return null
  const items = [
    { label: "Avg Service Cost", value: fmtShort(data.avgServiceCost), icon: "🔧", color: "#3B82F6" },
    { label: "Conversion Rate", value: `${data.conversionRate}%`, icon: "🔄", color: "#10B981" },
    { label: "Repeat Rate", value: `${data.repeatCustomerRate}%`, icon: "❤️", color: "#8B5CF6" },
    { label: "Satisfaction", value: `${data.customerSatisfaction}%`, icon: "😊", color: "#14B8A6" },
    { label: "Cancellation", value: `${data.cancellationRate}%`, icon: "⚠️", color: "#EF4444" },
    { label: "Avg Booking", value: fmtShort(data.avgBookingValue), icon: "📋", color: "#F59E0B" },
  ]

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(10, 18, 34, 0.95))",
        border: "1px solid rgba(96, 165, 250, 0.1)",
      }}
    >
      <SectionHeader icon="📋" title="Performance Metrics" subtitle="Business KPIs" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-xl p-3 text-center"
            style={{ background: `${item.color}08`, border: `1px solid ${item.color}12` }}>
            <p className="text-gray-500 text-[9px] uppercase tracking-wider mb-1 font-semibold">{item.label}</p>
            <p className="text-sm font-black" style={{ color: item.color }}>{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── 8. Customer Growth Chart ───────────────────────────────
function CustomerGrowthChart({ data }) {
  if (!data || data.length === 0) return null
  return (
    <div
      className="rounded-2xl p-6 h-full"
      style={{
        background: "linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(10, 18, 34, 0.95))",
        border: "1px solid rgba(96, 165, 250, 0.1)",
      }}
    >
      <SectionHeader icon="👥" title="Customer Growth" subtitle="Total vs new members" />
      <div style={{ width: "100%", height: 180, minHeight: 180 }}>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "#4b5563", fontSize: 8 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#4b5563", fontSize: 8 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="total" stroke="#8B5CF6" strokeWidth={3}
              dot={false} activeDot={{ r: 5, fill: "#8B5CF6", stroke: "#0a1222", strokeWidth: 2 }}
              isAnimationActive animationDuration={1500} animationEasing="ease-out" />
            <Line type="monotone" dataKey="new" stroke="#22D3EE" strokeWidth={2}
              dot={false} isAnimationActive animationDuration={1500} animationEasing="ease-out" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 rounded" style={{ background: "#8B5CF6" }} />
          <span className="text-gray-500 text-[10px]">Total Members</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 rounded" style={{ background: "#22D3EE" }} />
          <span className="text-gray-500 text-[10px]">New Members</span>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN ───────────────────────────────────────────────────
export default function Reports() {
  const {
    loading, error, monthlyRevenue, serviceCategories,
    revenueByService, topServices, mechanicPerformance,
    customerGrowth, businessPerformance,
  } = useDashboardData()

  const [period, setPeriod] = useState("12months")

  const filteredData = useMemo(() => {
    if (!monthlyRevenue || monthlyRevenue.length === 0) return []
    const count = period === "3months" ? 3 : period === "6months" ? 6 : 12
    return monthlyRevenue.slice(-count)
  }, [period, monthlyRevenue])

  const totalRevenueYTD = filteredData.reduce((s, m) => s + m.revenue, 0)
  const totalBookings = filteredData.reduce((s, m) => s + m.bookings, 0)
  const avgRevenue = filteredData.length > 0 ? Math.round(totalRevenueYTD / filteredData.length) : 0
  const totalServiceCalls = (serviceCategories || []).reduce((s, c) => s + c.value, 0)

  const handleExportCSV = () => {
    const headers = ["Month", "Revenue", "Bookings", "Target"]
    const rows = filteredData.map(m => [m.month, m.revenue, m.bookings, m.target])
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `esther-garage-report-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return (
    <div className="min-h-screen" style={{ background: "#070b14" }}>
      <div className="max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8">
        <ReportsSkeleton />
      </div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#070b14" }}>
      <p className="text-red-400 text-sm">Error loading report data: {error}</p>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: "#070b14" }}>
      <div className="max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Analytics & Reports</h1>
            <p className="text-sm text-gray-500 mt-0.5">Comprehensive business performance overview</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-xl overflow-hidden"
              style={{ border: "1px solid rgba(96,165,250,0.15)" }}>
              {["3months", "6months", "12months"].map((p) => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`px-3.5 py-2 text-[11px] font-bold transition-all ${
                    period === p ? "bg-blue-500/20 text-blue-400" : "text-gray-500 hover:text-gray-300"
                  }`}
                  style={period === p ? { borderBottom: "2px solid #3B82F6" } : {}}>
                  {p === "3months" ? "3 Months" : p === "6months" ? "6 Months" : "Year to Date"}
                </button>
              ))}
            </div>
            <button onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold transition-all hover:bg-blue-500/10"
              style={{ border: "1px solid rgba(96,165,250,0.15)", color: "#60A5FA" }}>
              <Download size={14} /> CSV
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Revenue" value={fmtCompact(totalRevenueYTD)} sub="Year to date" icon="💰" color="#3B82F6"
            trend={9.2} positive />
          <StatCard label="Total Bookings" value={totalBookings} sub="Year to date" icon="📅" color="#F59E0B"
            trend={-3.1} positive={false} />
          <StatCard label="Services Done" value={totalServiceCalls} sub="All categories" icon="🔧" color="#10B981"
            trend={6.8} positive />
          <StatCard label="Avg Revenue" value={fmtShort(avgRevenue)} sub="Per month" icon="📈" color="#8B5CF6" />
        </div>

        {/* Charts Row 1: Revenue + Service Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><RevenueChart data={filteredData} /></div>
          <div className="lg:col-span-1"><ServiceDonutChart data={serviceCategories} /></div>
        </div>

        {/* Charts Row 2: Revenue by Service + Top Services */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueByServiceChart data={filteredData} revenueByServiceData={revenueByService} />
          <TopServicesTable data={topServices} />
        </div>

        {/* Charts Row 3: Order Trend + Mechanic Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OrderTrendChart data={filteredData} />
          <MechanicPerformanceChart data={mechanicPerformance} />
        </div>

        {/* Charts Row 4: Performance Summary + Customer Growth */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerformanceSummary data={businessPerformance} />
          <CustomerGrowthChart data={customerGrowth} />
        </div>
      </div>
    </div>
  )
}
