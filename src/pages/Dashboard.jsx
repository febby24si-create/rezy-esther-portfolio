// ============================================================
// Dashboard.jsx — Esther Garage CRM Analytics Dashboard
// Chart-focused design. Prioritizes data visualization over KPI cards.
// Dark theme · Blue accent · Glassmorphism · Framer Motion · Recharts
// ============================================================
import { useState, useRef, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from "recharts"
import {
  TrendingUp, TrendingDown, Clock, ChevronRight,
  X, MessageCircle, Bot, MessageSquare, Send,
} from "lucide-react"
import useDashboardData from "../hooks/useDashboardData"

const fmt = (n) => "Rp " + Number(n).toLocaleString("id-ID")
const fmtShort = (n) =>
  n >= 1000000 ? `Rp ${(n / 1000000).toFixed(1)}jt` : fmt(n)

// ─── Animated Number ────────────────────────────────────────
function AnimatedNumber({ value, duration = 800, format = (v) => v, delay = 0 }) {
  const [display, setDisplay] = useState(0)
  const startTime = useRef(null)
  const startValue = useRef(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      startValue.current = display
      startTime.current = null
      const step = (timestamp) => {
        if (!startTime.current) startTime.current = timestamp
        const progress = Math.min((timestamp - startTime.current) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setDisplay(startValue.current + (value - startValue.current) * eased)
        if (progress < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, delay)
    return () => clearTimeout(timer)
  }, [value, duration, delay])
  return <>{format(display)}</>
}

// ─── Section Header ─────────────────────────────────────────
function SectionHeader({ icon, title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center">
          <span className="text-sm">{icon}</span>
        </div>
        <div>
          <h3 className="text-white text-sm font-bold">{title}</h3>
          {subtitle && <p className="text-gray-500 text-[10px]">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

// ─── Chart Tooltip ─────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
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
          {p.name}: {typeof p.value === "number" ? fmtShort(p.value) : p.value}
        </p>
      ))}
    </div>
  )
}

// ─── KPI Card ───────────────────────────────────────────────
function KpiCard({ data, index }) {
  const { label, value, icon, trend, positive, color, format, suffix, note } = data

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -3, scale: 1.01 }}
      className="relative rounded-2xl p-5 flex flex-col overflow-hidden group cursor-default"
      style={{
        background: "linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(10, 18, 34, 0.95))",
        border: "1px solid rgba(96, 165, 250, 0.1)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />
      <div className="flex items-center justify-between relative z-10">
        <div className="flex-1 min-w-0">
          <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-widest mb-1">{label}</p>
          <p className="text-white text-2xl font-black leading-tight tracking-tight">
            <AnimatedNumber value={value} format={format || ((v) => {
              const n = Math.round(v).toLocaleString("id-ID")
              return suffix ? `${n}${suffix}` : n
            })} duration={1200} delay={index * 50} />
          </p>
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
          style={{ background: `${color}18` }}
        >
          <span className="text-lg">{icon}</span>
        </div>
      </div>
      {/* Kalau ada `note` (data belum cukup untuk dibandingkan — mis. bulan
          baru mulai / belum ada review), tampilkan itu saja alih-alih badge
          trend yang bisa menyesatkan (mis. "-100%" untuk bulan yang baru
          berjalan beberapa hari). */}
      {note ? (
        <div className="mt-2 relative z-10">
          <span className="text-gray-500 text-[10px] italic">{note}</span>
        </div>
      ) : trend !== undefined && (
        <div className="flex items-center gap-2 mt-2 relative z-10">
          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
            positive ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"
          }`}>
            {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(trend)}%
          </span>
          <span className="text-gray-600 text-[10px]">vs last month</span>
        </div>
      )}
    </motion.div>
  )
}

// ─── 1. Monthly Revenue (Large Area Chart) ──────────────────
function RevenueChart({ data }) {
  if (!data || data.length === 0) return null
  const total = data.reduce((s, m) => s + m.revenue, 0)
  const avg = Math.round(total / data.length)
  const last = data[data.length - 1]
  const prev = data[data.length - 2]
  const growth = prev ? Math.round(((last.revenue - prev.revenue) / prev.revenue) * 100) : 0

  return (
    <div
      className="rounded-2xl p-6 h-full"
      style={{
        background: "linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(10, 18, 34, 0.95))",
        border: "1px solid rgba(96, 165, 250, 0.1)",
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-widest">Monthly Revenue</p>
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
              growth >= 0 ? "text-emerald-400" : "text-red-400"
            }`}>
              {growth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {growth > 0 ? "+" : ""}{growth}%
            </span>
          </div>
          <p className="text-white text-3xl font-black mt-1 tracking-tight">
            <AnimatedNumber value={total} format={fmtShort} duration={1500} />
          </p>
          <p className="text-gray-500 text-[10px] mt-0.5">vs previous month · Avg {fmtShort(avg)}/month</p>
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

// ─── 2. Booking Trend (Bar Chart) ──────────────────────────
function BookingTrendChart({ data }) {
  if (!data || data.length === 0) return null
  const total = data.reduce((s, m) => s + m.bookings, 0)
  const peak = [...data].sort((a, b) => b.bookings - a.bookings)[0]

  return (
    <div
      className="rounded-2xl p-6 h-full"
      style={{
        background: "linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(10, 18, 34, 0.95))",
        border: "1px solid rgba(96, 165, 250, 0.1)",
      }}
    >
      <div className="mb-4">
        <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-widest">Booking Trend</p>
        <p className="text-white text-3xl font-black mt-1 tracking-tight">
          <AnimatedNumber value={total} format={(v) => Math.round(v)} duration={1200} />
        </p>
        <p className="text-gray-500 text-[10px] mt-0.5">Peak: {peak.month} ({peak.bookings})</p>
      </div>
      <div style={{ width: "100%", height: 280, minHeight: 280 }}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="bookGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#2563EB" stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "#4b5563", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#4b5563", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip cursor={{ fill: "rgba(255,255,255,0.03)" }} content={<ChartTooltip />} />
            <Bar dataKey="bookings" radius={[6, 6, 0, 0]} maxBarSize={36}
              fill="url(#bookGrad)"
              isAnimationActive animationDuration={1800} animationEasing="ease-out" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── 3. Service Category Distribution (Donut Chart) ─────────
function ServiceDonutChart({ data }) {
  if (!data || data.length === 0) return null
  const totalServices = data.reduce((s, c) => s + c.value, 0)

  return (
    <div
      className="rounded-2xl p-6 h-full"
      style={{
        background: "linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(10, 18, 34, 0.95))",
        border: "1px solid rgba(96, 165, 250, 0.1)",
      }}
    >
      <div className="mb-4">
        <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-widest">Service Distribution</p>
        <p className="text-white text-2xl font-black mt-1">
          <AnimatedNumber value={totalServices} format={(v) => Math.round(v)} duration={1200} />
        </p>
        <p className="text-gray-500 text-[10px] mt-0.5">Total services</p>
      </div>
      <div className="flex flex-col items-center">
        <div className="relative">
          <PieChart width={180} height={180}>
            <Pie data={data} cx={90} cy={90}
              innerRadius={58} outerRadius={82}
              paddingAngle={3} dataKey="value" strokeWidth={0}
              isAnimationActive animationDuration={1500} animationEasing="ease-out">
              {data.map((entry, idx) => (
                <Cell key={idx} fill={entry.color}
                  style={{ filter: `drop-shadow(0 0 6px ${entry.color}30)` }} />
              ))}
            </Pie>
          </PieChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-white text-lg font-black">{totalServices}</p>
          </div>
        </div>
        <div className="w-full space-y-1.5 mt-3">
          {data.slice(0, 5).map((s) => (
            <div key={s.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-sm" style={{ background: s.color }} />
                <span className="text-gray-300 text-[10px]">{s.name}</span>
              </div>
              <span className="text-gray-400 text-[10px]">{Math.round((s.value / totalServices) * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── 4. Member Growth (Line Chart) ──────────────────────────
function MemberGrowthChart({ data }) {
  if (!data || data.length === 0) return null
  const latest = data[data.length - 1]
  return (
    <div
      className="rounded-2xl p-6 h-full"
      style={{
        background: "linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(10, 18, 34, 0.95))",
        border: "1px solid rgba(96, 165, 250, 0.1)",
      }}
    >
      <div className="mb-4">
        <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-widest">Member Growth</p>
        <p className="text-white text-2xl font-black mt-1">
          <AnimatedNumber value={latest.total} format={(v) => Math.round(v)} duration={1200} />
        </p>
        <p className="text-gray-500 text-[10px] mt-0.5">{latest.new} new this month</p>
      </div>
      <div style={{ width: "100%", height: 180, minHeight: 180 }}>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="growthLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "#4b5563", fontSize: 8 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#4b5563", fontSize: 8 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="total" stroke="url(#growthLine)" strokeWidth={3}
              dot={false} activeDot={{ r: 5, fill: "#8B5CF6", stroke: "#0a1222", strokeWidth: 2 }}
              isAnimationActive animationDuration={1500} animationEasing="ease-out" />
            <Line type="monotone" dataKey="new" stroke="#22D3EE" strokeWidth={2}
              dot={false} isAnimationActive animationDuration={1500} animationEasing="ease-out" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── 5. Revenue by Service Category (Stacked Bar) ──────────
const SERVICE_KEYS_DASH = [
  { key: 'oil', label: 'Oil Change', color: '#3B82F6' },
  { key: 'tuneup', label: 'Tune Up', color: '#10B981' },
  { key: 'ac', label: 'AC Service', color: '#F59E0B' },
  { key: 'brake', label: 'Brake', color: '#EF4444' },
  { key: 'tire', label: 'Tire', color: '#8B5CF6' },
  { key: 'body', label: 'Body', color: '#EC4899' },
  { key: 'other', label: 'Others', color: '#6B7280' },
]

// ─── Loading Skeleton ────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-20 rounded-2xl bg-white/5" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-2xl bg-white/5" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 rounded-2xl bg-white/5" />
        <div className="h-80 rounded-2xl bg-white/5" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => <div key={i} className="h-64 rounded-2xl bg-white/5" />)}
      </div>
    </div>
  )
}

function RevenueByServiceChart({ data }) {
  if (!data || data.length === 0) return null
  const [hoveredKey, setHoveredKey] = useState(null)

  return (
    <div
      className="rounded-2xl p-6 h-full"
      style={{
        background: "linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(10, 18, 34, 0.95))",
        border: "1px solid rgba(96, 165, 250, 0.1)",
      }}
    >
      <SectionHeader icon="📊" title="Revenue by Service" subtitle="Monthly breakdown" />
      <div style={{ width: "100%", height: 200, minHeight: 200 }}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "#4b5563", fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#4b5563", fontSize: 8 }} axisLine={false} tickLine={false} />
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
                    <p className="text-xs text-gray-400 mb-1.5 font-medium">{label}</p>
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
            {SERVICE_KEYS_DASH.map((s) => (
              <Bar key={s.key} dataKey={s.key} stackId="a" fill={s.color} radius={0}
                maxBarSize={24}
                isAnimationActive animationDuration={1200} animationEasing="ease-out"
                onMouseEnter={() => setHoveredKey(s.key)}
                onMouseLeave={() => setHoveredKey(null)}
                style={{ opacity: hoveredKey && hoveredKey !== s.key ? 0.4 : 1, transition: "opacity 0.2s" }}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/5">
        {SERVICE_KEYS_DASH.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5 text-[9px] text-gray-400"
            onMouseEnter={() => setHoveredKey(s.key)}
            onMouseLeave={() => setHoveredKey(null)}
            style={{ opacity: hoveredKey && hoveredKey !== s.key ? 0.4 : 1, cursor: "default" }}>
            <span className="w-2 h-2 rounded-sm" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── 6. Recent Bookings (Modern Table) ─────────────────────
function RecentBookingsTable({ data }) {
  if (!data || data.length === 0) return null
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(10, 18, 34, 0.95))",
        border: "1px solid rgba(96, 165, 250, 0.1)",
      }}
    >
      <SectionHeader icon="📅" title="Recent Bookings" subtitle="Latest service bookings"
        action={
          <Link to="/bookings" className="text-blue-400 text-[10px] font-bold hover:text-blue-300 transition-colors flex items-center gap-1">
            View All <ChevronRight size={12} />
          </Link>
        }
      />
      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 uppercase tracking-wider text-[9px] border-b border-white/5">
              <th className="text-left pb-3 pl-2 font-semibold">Customer</th>
              <th className="text-left pb-3 font-semibold">Service</th>
              <th className="text-left pb-3 font-semibold hidden sm:table-cell">Vehicle</th>
              <th className="text-left pb-3 font-semibold hidden md:table-cell">Mechanic</th>
              <th className="text-right pb-3 pr-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.map((b, i) => (
              <motion.tr key={b.time + b.customer}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="hover:bg-white/5 transition-colors group cursor-pointer">
                <td className="py-2.5 pl-2 pr-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center text-[9px] font-bold text-blue-400 flex-shrink-0">
                      {b.customer.charAt(0)}
                    </div>
                    <span className="text-white font-semibold text-[11px]">{b.customer}</span>
                  </div>
                </td>
                <td className="py-2.5 pr-3 text-gray-300 text-[11px]">{b.service}</td>
                <td className="py-2.5 pr-3 text-gray-500 text-[10px] hidden sm:table-cell">{b.vehicle}</td>
                <td className="py-2.5 pr-3 text-gray-500 text-[10px] hidden md:table-cell">{b.mechanic}</td>
                <td className="py-2.5 pr-2 text-right">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    b.status === "completed" ? "bg-emerald-500/15 text-emerald-400" :
                    b.status === "in-progress" ? "bg-yellow-500/15 text-yellow-400" :
                    "bg-blue-500/15 text-blue-400"
                  }`}>
                    {b.status === "completed" ? "Done" : b.status === "in-progress" ? "In Progress" : "Scheduled"}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── 7. Customer Activity Timeline ─────────────────────────
function ActivityTimeline({ data }) {
  if (!data || data.length === 0) return null
  const [visibleCount, setVisibleCount] = useState(Math.min(5, data.length))
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(10, 18, 34, 0.95))",
        border: "1px solid rgba(96, 165, 250, 0.1)",
      }}
    >
      <SectionHeader icon="⚡" title="Activity Timeline" subtitle="Real-time feed" />
      <div className="space-y-1">
        {data.slice(0, visibleCount).map((a, i) => (
          <motion.div key={a.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all duration-200">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs bg-blue-500/10">{a.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-200 text-xs">
                {a.text} <span className="text-blue-400 font-semibold">{a.name}</span>
              </p>
              <p className="text-gray-600 text-[9px] mt-0.5">{a.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
      {visibleCount < data.length && (
        <button onClick={() => setVisibleCount(data.length)}
          className="w-full mt-2 py-2 text-center text-gray-500 text-[10px] font-bold hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-500/5">
          + {data.length - visibleCount} more
        </button>
      )}
    </div>
  )
}

// ─── 8. Top Customers ──────────────────────────────────────
function TopCustomersWidget({ data }) {
  if (!data || data.length === 0) return null
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(10, 18, 34, 0.95))",
        border: "1px solid rgba(96, 165, 250, 0.1)",
      }}
    >
      <SectionHeader icon="👑" title="Top Customers" subtitle="By lifetime value" />
      <div className="space-y-1">
        {data.map((c, i) => {
          const maxSpent = data[0].spent
          return (
            <motion.div key={c.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0 hover:bg-white/5 -mx-2 px-2 rounded-lg transition-colors">
              <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[8px] font-bold flex-shrink-0 ${
                i === 0 ? "bg-amber-500/20 text-amber-400" : i === 1 ? "bg-gray-400/20 text-gray-400" : i === 2 ? "bg-orange-400/20 text-orange-400" : "bg-white/10 text-gray-500"
              }`}>{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-white text-xs font-semibold truncate">{c.name}</p>
                  <span className={`text-[8px] font-bold px-1 py-0.5 rounded ${
                    c.tier === "Platinum" ? "bg-purple-500/15 text-purple-400" : "bg-amber-500/15 text-amber-400"
                  }`}>{c.tier}</span>
                </div>
                <div className="w-full h-1 rounded-full mt-1 overflow-hidden bg-white/5">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(c.spent / maxSpent) * 100}%` }}
                    transition={{ duration: 0.8, delay: i * 0.06, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ background: i === 0 ? "linear-gradient(90deg, #F59E0B, #FBBF24)" : i === 1 ? "linear-gradient(90deg, #94A3B8, #CBD5E1)" : "linear-gradient(90deg, #3B82F6, #60A5FA)" }} />
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-blue-400 text-xs font-bold">{fmtShort(c.spent)}</p>
                <p className="text-gray-500 text-[8px]">{c.orders}x</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ─── 9. Mechanic Performance ───────────────────────────────
function MechanicPerformanceWidget({ data }) {
  if (!data || data.length === 0) return null
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(10, 18, 34, 0.95))",
        border: "1px solid rgba(96, 165, 250, 0.1)",
      }}
    >
      <SectionHeader icon="🔧" title="Mechanic Performance" subtitle="Monthly job completion"
        action={
          <Link to="/mechanics" className="text-blue-400 text-[10px] font-bold hover:text-blue-300 transition-colors flex items-center gap-1">
            View All <ChevronRight size={12} />
          </Link>
        }
      />
      <div style={{ width: "100%", height: 200, minHeight: 200 }}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
            <XAxis type="number" tick={{ fill: "#4b5563", fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: "#94A3B8", fontSize: 10 }} axisLine={false} tickLine={false} width={50} />
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
                    <p className="text-[11px] text-gray-400">{fmtShort(d.revenue)}</p>
                    <p className="text-[11px] text-gray-500">Rating: {d.rating} ⭐</p>
                  </div>
                )
              }}
            />
            <Bar dataKey="jobs" radius={[0, 6, 6, 0]} maxBarSize={20}
              isAnimationActive animationDuration={1200} animationEasing="ease-out">
              {data.map((entry, idx) => (
                <Cell key={idx} fill={["#3B82F6","#60A5FA","#93C5FD","#BFDBFE","#1D4ED8","#2563EB"][idx]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── CHATBOT ────────────────────────────────────────────────
function ChatbotModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Halo! Saya AI asisten Esther Garage. Ada yang bisa saya bantu? 😊" },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const getBotReply = (userMessage) => {
    const lowerMsg = userMessage.toLowerCase()
    if (lowerMsg.includes("harga") || lowerMsg.includes("biaya"))
      return "Untuk informasi harga servis, silakan cek menu Layanan atau hubungi admin via WhatsApp. Biaya servis standar mulai Rp 150.000."
    if (lowerMsg.includes("jadwal") || lowerMsg.includes("booking"))
      return "Anda bisa booking servis melalui menu Order Baru. Pastikan memilih tanggal dan layanan yang diinginkan."
    if (lowerMsg.includes("stok") || lowerMsg.includes("spare part"))
      return "Stok part bisa dilihat di menu Inventaris. Jika part habis, admin akan menginfokan penggantiannya."
    if (lowerMsg.includes("terima kasih") || lowerMsg.includes("thanks"))
      return "Sama-sama! Senang bisa membantu. 😊"
    return "Terima kasih atas pertanyaannya. Tim kami akan segera merespon melalui WhatsApp. Apakah ada hal lain yang bisa saya bantu?"
  }

  const handleSend = () => {
    if (!input.trim()) return
    const userText = input.trim()
    setMessages((prev) => [...prev, { role: "user", text: userText }])
    setInput("")
    setIsTyping(true)
    setTimeout(() => {
      const reply = getBotReply(userText)
      setMessages((prev) => [...prev, { role: "bot", text: reply }])
      setIsTyping(false)
    }, 800)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl flex flex-col"
        style={{ height: 520, background: "linear-gradient(145deg, #0f172a, #0a1222)", border: "1px solid rgba(96,165,250,0.2)", boxShadow: "0 24px 80px rgba(0,0,0,0.8)" }}>
        <div className="flex items-center justify-between p-5 border-b border-blue-500/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center"><Bot size={18} className="text-blue-400" /></div>
            <div><h3 className="text-white font-bold text-sm">AI Assistant</h3><p className="text-blue-400 text-[10px] uppercase tracking-wider">Online</p></div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-all duration-300 hover:rotate-90"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === "user" ? "bg-blue-600/30 text-white rounded-br-none border border-blue-500/20" : "bg-white/5 text-gray-200 rounded-bl-none border border-white/5"
              }`}>{msg.text}</div>
            </div>
          ))}
          {isTyping && <div className="flex justify-start"><div className="bg-white/5 rounded-2xl px-4 py-2.5 text-sm text-gray-400 border border-white/5"><span className="animate-pulse">···</span></div></div>}
          <div ref={chatEndRef} />
        </div>
        <div className="p-4 border-t border-blue-500/10 flex gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Tanyakan sesuatu..."
            className="flex-1 bg-white/5 border border-blue-500/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-400/40 transition-all duration-300" />
          <button onClick={handleSend}
            className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg shadow-blue-500/20">
            <Send size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Floating Menu ─────────────────────────────────────────
function FloatingMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [showChatbot, setShowChatbot] = useState(false)
  const handleWhatsApp = () => { window.open("https://wa.me/6281234567890?text=Halo%20Esther%20Garage%2C%20saya%20ingin%20menanyakan...", "_blank"); setIsOpen(false) }
  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-16 right-0 mb-2 space-y-2">
              <button onClick={() => { setShowChatbot(true); setIsOpen(false) }}
                className="flex items-center gap-3 rounded-full px-5 py-2.5 shadow-xl transition-all w-44 border"
                style={{ background: "rgba(15, 23, 42, 0.95)", backdropFilter: "blur(12px)", color: "#60A5FA", borderColor: "rgba(96,165,250,0.3)" }}>
                <Bot size={18} /><span className="text-sm font-medium">AI Chatbot</span>
              </button>
              <button onClick={handleWhatsApp}
                className="flex items-center gap-3 rounded-full px-5 py-2.5 shadow-xl transition-all w-44 border"
                style={{ background: "rgba(15, 23, 42, 0.95)", backdropFilter: "blur(12px)", color: "#60A5FA", borderColor: "rgba(96,165,250,0.3)" }}>
                <MessageCircle size={18} /><span className="text-sm font-medium">WhatsApp</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 shadow-2xl"
          style={{ background: "linear-gradient(135deg, #3B82F6, #2563EB)", boxShadow: "0 0 40px rgba(59,130,246,0.3)" }}>
          {isOpen ? <X size={24} className="rotate-90 transition-transform duration-300" /> : <MessageSquare size={24} />}
        </button>
      </div>
      <ChatbotModal isOpen={showChatbot} onClose={() => setShowChatbot(false)} />
    </>
  )
}

// ─── MAIN ───────────────────────────────────────────────────
export default function Dashboard() {
  const {
    loading, error, kpiData, monthlyRevenue, serviceCategories,
    customerGrowth, revenueByService, todaySchedule, activityFeed,
    topCustomers, mechanicPerformance, productSalesStats,
  } = useDashboardData()

  const loggedInUser = useMemo(() => {
    try { const raw = sessionStorage.getItem("eg_user"); return raw ? JSON.parse(raw) : null } catch { return null }
  }, [])
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 11) return "Selamat Pagi"
    if (hour < 15) return "Selamat Siang"
    if (hour < 18) return "Selamat Sore"
    return "Selamat Malam"
  }, [])

  const kpiIds = ["monthly_revenue", "total_bookings", "active_members", "satisfaction"]
  const kpiIcons = { monthly_revenue: "💰", total_bookings: "📅", active_members: "✅", satisfaction: "😊" }
  const kpiColors = { monthly_revenue: "#3B82F6", total_bookings: "#F59E0B", active_members: "#10B981", satisfaction: "#14B8A6" }
  const fourKpis = useMemo(() =>
    kpiIds.map((id) => {
      const src = (kpiData || []).find((k) => k.id === id)
      return { ...src, id, icon: kpiIcons[id], color: kpiColors[id] }
    }),
  [kpiData])

  if (loading) return <DashboardSkeleton />
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-400 text-sm">Error loading dashboard data: {error}</div>

  return (
    <div className="min-h-screen" style={{ background: "#070b14" }}>
      <div className="max-w-[1440px] mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl px-7 py-5 flex items-center justify-between relative overflow-hidden group"
          style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(15,23,42,0.7) 50%, rgba(7,11,20,0.9) 100%)", border: "1px solid rgba(96,165,250,0.12)", backdropFilter: "blur(4px)" }}>
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-20 group-hover:opacity-30 transition-all duration-700"
            style={{ background: "radial-gradient(circle, rgba(96,165,250,0.2) 0%, transparent 70%)" }} />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)" }} />
          <div className="flex items-center gap-5 relative z-10">
            <motion.div whileHover={{ scale: 1.05, rotate: 3 }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shadow-lg shrink-0"
              style={{ background: "linear-gradient(135deg, #3B82F6, #60A5FA)", boxShadow: "0 8px 24px rgba(59,130,246,0.25)" }}>
              {loggedInUser?.name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "AD"}
            </motion.div>
            <div>
              <p className="text-gray-400 text-sm font-medium">{greeting}, <span className="text-white font-semibold">{loggedInUser?.name?.split(" ")[0] || "Admin"}</span></p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-gray-500 text-xs">{loggedInUser?.email || "admin@esthergarage.com"}</span>
                <span className="w-1 h-1 rounded-full bg-gray-600" />
                <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <span className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{ background: "rgba(59,130,246,0.12)", color: "#60A5FA", border: "1px solid rgba(59,130,246,0.2)" }}>
              {loggedInUser?.role || "Admin"}
            </span>
            <div className="flex items-center gap-1 text-gray-500 text-[10px]"><Clock size={12} /> {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
          </div>
        </motion.div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {fourKpis.map((kpi, i) => <KpiCard key={kpi.id} data={kpi} index={i} />)}
        </div>

        {/* Statistik Penjualan Produk (fitur toko sparepart) */}
        <div>
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">Statistik Penjualan Produk</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <KpiCard index={0} data={{
              label: "Pendapatan Produk", value: productSalesStats.totalRevenue, icon: "💵",
              color: "#22C55E", format: fmt,
              note: productSalesStats.totalRevenue === 0 ? "Belum ada pesanan selesai" : null,
            }} />
            <KpiCard index={1} data={{
              label: "Jumlah Pesanan", value: productSalesStats.totalOrdersCount, icon: "🧾",
              color: "#3B82F6",
            }} />
            <KpiCard index={2} data={{
              label: "Total Penjualan", value: productSalesStats.totalUnitsSold, icon: "📦",
              color: "#F59E0B", suffix: " unit",
            }} />
            <KpiCard index={3} data={{
              label: "Produk Terlaris", value: productSalesStats.bestSellerQty, icon: "🏆",
              color: "#A855F7",
              format: productSalesStats.bestSellerName ? () => productSalesStats.bestSellerName : () => "—",
              note: productSalesStats.bestSellerName ? `${productSalesStats.bestSellerQty} unit terjual` : "Belum ada data",
            }} />
          </div>
        </div>

        {/* Charts Row 1: Revenue + Booking */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><RevenueChart data={monthlyRevenue} /></div>
          <div className="lg:col-span-1"><BookingTrendChart data={monthlyRevenue} /></div>
        </div>

        {/* Charts Row 2: Service Donut + Member Growth + Revenue by Service */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ServiceDonutChart data={serviceCategories} />
          <MemberGrowthChart data={customerGrowth} />
          <RevenueByServiceChart data={revenueByService} />
        </div>

        {/* Recent Bookings + Activity Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentBookingsTable data={todaySchedule} />
          <ActivityTimeline data={activityFeed} />
        </div>

        {/* Top Customers + Mechanic Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopCustomersWidget data={topCustomers} />
          <MechanicPerformanceWidget data={mechanicPerformance} />
        </div>
      </div>

      <FloatingMenu />
    </div>
  )
}