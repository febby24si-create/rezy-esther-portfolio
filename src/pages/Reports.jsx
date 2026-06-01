import { useState, useMemo, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts'
import { MdDownload, MdCalendarToday, MdTrendingUp, MdTrendingDown, MdRefresh } from 'react-icons/md'

const fmt     = (v) => `Rp ${(v / 1000000).toFixed(1)}jt`
const fmtFull = (v) => 'Rp ' + Number(v).toLocaleString('id-ID')

const MONTHS_ID = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

const SHORTCUTS = [
  { label: '3 Bln',    from: '', to: '', months: 3 },
  { label: '6 Bln',    from: '', to: '', months: 6 },
  { label: 'Tahun Ini',from: '', to: '', months: 12 },
]

// Warna distribusi layanan — lebih kontras
const SERVICE_COLORS = ['#22C55E','#60A5FA','#FBBF24','#F472B6','#A78BFA','#FB923C','#34D399','#94A3B8']

// Tooltip custom
const ChartTooltip = ({ active, payload, label, type = 'currency' }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2.5 text-sm"
      style={{ background: '#06281F', border: '1px solid rgba(34,197,94,0.2)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <p className="text-white font-bold">{type === 'currency' ? fmtFull(payload[0].value) : payload[0].value + ' order'}</p>
    </div>
  )
}

// ─── Build data dari orders localStorage ─────────────────────────────
function buildMonthlyData(orders, monthsBack = 12) {
  const now = new Date()
  const result = []
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year  = d.getFullYear()
    const month = d.getMonth() // 0-indexed
    const key   = `${year}-${String(month + 1).padStart(2, '0')}`
    const label = MONTHS_ID[month]

    const monthOrders = orders.filter(o => {
      if (!o.date) return false
      return o.date.startsWith(key)
    })
    const revenue = monthOrders.filter(o => o.status === 'Selesai').reduce((s, o) => s + Number(o.total), 0)
    result.push({ month: label, year, key, revenue, orders: monthOrders.length, selesai: monthOrders.filter(o => o.status === 'Selesai').length })
  }
  return result
}

function buildServiceDist(orders) {
  const counts = {}
  orders.forEach(o => {
    if (!o.service) return
    counts[o.service] = (counts[o.service] || 0) + 1
  })
  const total = Object.values(counts).reduce((s, v) => s + v, 0)
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, value], i) => ({
      name,
      value,
      pct: total > 0 ? Math.round((value / total) * 100) : 0,
      color: SERVICE_COLORS[i % SERVICE_COLORS.length]
    }))
}

// ─── Komponen ─────────────────────────────────────────────────────────
function StatCard({ label, value, sub, trend }) {
  return (
    <div className="stat-card">
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className="text-white text-xl font-black">{value}</p>
      <div className="flex items-center gap-1 mt-1">
        {trend !== undefined && (trend >= 0
          ? <MdTrendingUp size={12} className="text-green-400" />
          : <MdTrendingDown size={12} className="text-red-400" />
        )}
        <p className="text-gray-600 text-xs">{sub}</p>
      </div>
    </div>
  )
}

export default function Reports() {
  const [orders, setOrders] = useState([])
  const [monthsBack, setMonthsBack] = useState(12)
  const [activeShortcut, setActiveShortcut] = useState('Tahun Ini')

  useEffect(() => {
    const load = () => {
      try {
        const s = localStorage.getItem('garage_orders')
        if (s) setOrders(JSON.parse(s))
      } catch {}
    }
    load()
    window.addEventListener('storage', load)
    return () => window.removeEventListener('storage', load)
  }, [])

  const allMonthly = useMemo(() => buildMonthlyData(orders, 12), [orders])
  const monthly    = useMemo(() => buildMonthlyData(orders, monthsBack), [orders, monthsBack])
  const serviceDist= useMemo(() => buildServiceDist(orders), [orders])

  const totalRevenue = monthly.reduce((s, d) => s + d.revenue, 0)
  const totalOrders  = monthly.reduce((s, d) => s + d.orders, 0)
  const totalSelesai = monthly.reduce((s, d) => s + d.selesai, 0)
  const months       = monthly.length || 1

  // Bandingkan bulan ini vs bulan lalu
  const thisMonth = allMonthly[allMonthly.length - 1]
  const lastMonth = allMonthly[allMonthly.length - 2]
  const revTrend  = lastMonth?.revenue > 0 ? Math.round(((thisMonth?.revenue - lastMonth?.revenue) / lastMonth.revenue) * 100) : null

  // Top mekanik dari orders
  const topMechanics = useMemo(() => {
    const map = {}
    orders.forEach(o => {
      if (!o.mechanic) return
      if (!map[o.mechanic]) map[o.mechanic] = { name: o.mechanic, total: 0, selesai: 0 }
      map[o.mechanic].total++
      if (o.status === 'Selesai') map[o.mechanic].selesai++
    })
    return Object.values(map).sort((a, b) => b.selesai - a.selesai).slice(0, 5)
  }, [orders])

  const handleExport = () => {
    const style = document.createElement('style')
    style.id = 'print-style'
    style.textContent = `@media print { body > * { display: none !important; } #reports-print { display: block !important; position: fixed; top: 0; left: 0; width: 100%; background: white !important; color: black !important; } .no-print { display: none !important; } }`
    document.head.appendChild(style)
    window.print()
    setTimeout(() => document.getElementById('print-style')?.remove(), 1000)
  }

  return (
    <div className="page-animate" id="reports-print">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 no-print">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Laporan & Analitik</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {orders.length > 0 ? `Berdasarkan ${orders.length} order real` : 'Belum ada data order'}
          </p>
        </div>
        <button onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-green-400 transition-all hover:bg-green-500/10"
          style={{ border: '1px solid rgba(34,197,94,0.2)' }}>
          <MdDownload size={16} /> Export PDF
        </button>
      </div>

      {/* Shortcut filter */}
      <div className="glass-card p-4 mb-5 no-print flex flex-wrap items-center gap-3">
        <MdCalendarToday size={15} className="text-green-400 flex-shrink-0" />
        <span className="text-xs text-gray-500">Tampilkan:</span>
        <div className="flex gap-2 flex-wrap">
          {SHORTCUTS.map(s => (
            <button key={s.label} onClick={() => { setMonthsBack(s.months); setActiveShortcut(s.label) }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={activeShortcut === s.label
                ? { background: 'rgba(34,197,94,0.2)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.35)' }
                : { background: 'rgba(11,59,46,0.3)', color: '#6B7280', border: '1px solid rgba(34,197,94,0.1)' }}>
              {s.label}
            </button>
          ))}
        </div>
        {orders.length === 0 && (
          <span className="ml-auto text-xs text-yellow-500 flex items-center gap-1.5">
            <MdRefresh size={13} /> Data dari localStorage kosong — tambahkan order dulu
          </span>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard label="Total Pendapatan"  value={fmt(totalRevenue)}                         sub={`${months} bulan`} trend={revTrend} />
        <StatCard label="Total Order"       value={totalOrders}                               sub={`${months} bulan`} />
        <StatCard label="Order Selesai"     value={totalSelesai}                              sub={`${totalOrders > 0 ? Math.round(totalSelesai/totalOrders*100) : 0}% dari total`} />
        <StatCard label="Rata-rata/Bulan"   value={fmt(totalRevenue / months)}                sub="pendapatan per bulan" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Bar chart pendapatan */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">Pendapatan Bulanan</h3>
            {revTrend !== null && (
              <span className={`text-xs font-bold flex items-center gap-1 ${revTrend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {revTrend >= 0 ? <MdTrendingUp size={14}/> : <MdTrendingDown size={14}/>}
                {revTrend > 0 ? '+' : ''}{revTrend}% bulan ini
              </span>
            )}
          </div>
          {monthly.every(d => d.revenue === 0) ? (
            <div className="h-52 flex items-center justify-center text-gray-600 text-sm">Belum ada data pendapatan</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthly} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity={1} />
                    <stop offset="100%" stopColor="#0B3B2E" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,197,94,0.07)" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => v === 0 ? '0' : fmt(v)} />
                <Tooltip content={<ChartTooltip type="currency" />} />
                <Bar dataKey="revenue" fill="url(#barGrad)" radius={[6,6,0,0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart distribusi layanan */}
        <div className="glass-card p-5">
          <h3 className="text-white font-bold mb-4">Distribusi Layanan</h3>
          {serviceDist.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-gray-600 text-sm">Belum ada data layanan</div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={serviceDist} cx="50%" cy="50%" innerRadius={42} outerRadius={72}
                      paddingAngle={2} dataKey="value" strokeWidth={0}>
                      {serviceDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(v, n, p) => [`${p.payload.pct}%`, p.payload.name]} contentStyle={{ background: '#06281F', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2 min-w-0">
                {serviceDist.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    <span className="text-xs text-gray-400 truncate flex-1">{s.name}</span>
                    <span className="text-xs font-bold text-white flex-shrink-0">{s.pct}%</span>
                    <div className="w-12 h-1.5 rounded-full overflow-hidden flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Line chart order */}
      <div className="glass-card p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold">Jumlah Order per Bulan</h3>
          <span className="text-xs text-gray-600">{monthsBack} bulan terakhir</span>
        </div>
        {monthly.every(d => d.orders === 0) ? (
          <div className="h-36 flex items-center justify-center text-gray-600 text-sm">Belum ada data order</div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={monthly} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,197,94,0.07)" />
              <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip type="count" />} />
              <Line type="monotone" dataKey="orders"  stroke="#22C55E" strokeWidth={2.5} dot={{ fill: '#22C55E', r: 3 }} activeDot={{ r: 5 }} name="Total" />
              <Line type="monotone" dataKey="selesai" stroke="#60A5FA" strokeWidth={2}   dot={{ fill: '#60A5FA', r: 2 }} strokeDasharray="4 2" name="Selesai" />
            </LineChart>
          </ResponsiveContainer>
        )}
        <div className="flex items-center gap-4 mt-2">
          {[{ color: '#22C55E', label: 'Total Order' }, { color: '#60A5FA', label: 'Selesai', dash: true }].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="h-0.5 w-5 rounded-full" style={{ background: l.color, borderStyle: l.dash ? 'dashed' : 'solid' }} />
              <span className="text-xs text-gray-500">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top mekanik */}
      {topMechanics.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-white font-bold mb-4">Performa Mekanik</h3>
          <div className="space-y-3">
            {topMechanics.map((m, i) => {
              const pct = m.total > 0 ? Math.round((m.selesai / m.total) * 100) : 0
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-4 flex-shrink-0">{i + 1}</span>
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E' }}>
                    {m.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-white font-medium truncate">{m.name}</span>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{m.selesai}/{m.total} order</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: pct >= 80 ? '#22C55E' : pct >= 50 ? '#FBBF24' : '#EF4444' }} />
                    </div>
                  </div>
                  <span className="text-xs font-bold flex-shrink-0" style={{ color: pct >= 80 ? '#22C55E' : pct >= 50 ? '#FBBF24' : '#EF4444' }}>{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}