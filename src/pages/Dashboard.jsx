import { useState, useRef, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  MdTrendingUp, MdTrendingDown, MdBuild, MdCheckCircle, MdSchedule,
  MdAttachMoney, MdAdd, MdPeople, MdDirectionsCar, MdInventory,
  MdBarChart, MdReceipt, MdChevronRight, MdPending, MdWarning,
  MdCalendarToday, MdEngineering
} from 'react-icons/md'
import carHero from '../assets/mobil.png'

const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID')
const fmtShort = (n) => n >= 1000000 ? `Rp ${(n/1000000).toFixed(1)}jt` : fmt(n)

// ─── Ambil & proses data dari localStorage ───────────────────────────
function useStorageData() {
  const [orders, setOrders] = useState([])
  const [inventory, setInventory] = useState([])
  const [mechanics, setMechanics] = useState([])
  const [vehicles, setVehicles] = useState([])

  const load = () => {
    try {
      const o = localStorage.getItem('garage_orders'); if (o) setOrders(JSON.parse(o))
      const i = localStorage.getItem('garage_vehicles'); if (i) setVehicles(JSON.parse(i))
      const m = localStorage.getItem('garage_mechanics'); if (m) setMechanics(JSON.parse(m))
      const inv = localStorage.getItem('garage_inventory'); if (inv) setInventory(JSON.parse(inv))
    } catch {}
  }

  useEffect(() => {
    load()
    const iv = setInterval(load, 3000)
    window.addEventListener('storage', load)
    return () => { clearInterval(iv); window.removeEventListener('storage', load) }
  }, [])

  return { orders, inventory, mechanics, vehicles }
}

// ─── Build chart data 7 hari terakhir dari orders ────────────────────
function buildRevenueChart(orders) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })
  return days.map(date => {
    const dayOrders = orders.filter(o => o.date === date && o.status === 'Selesai')
    const revenue = dayOrders.reduce((s, o) => s + Number(o.total), 0)
    const d = new Date(date + 'T00:00:00')
    const label = `${d.getDate()}/${d.getMonth() + 1}`
    return { date: label, revenue, count: dayOrders.length }
  })
}

// ─── Komponen ─────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2.5" style={{ background: '#06281F', border: '1px solid rgba(34,197,94,0.2)' }}>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-green-400 font-bold text-sm">{fmtShort(payload[0].value)}</p>
      <p className="text-gray-500 text-xs">{payload[0].payload.count} order</p>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, change, positive, color, sub }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `rgba(${color},0.15)`, border: `1px solid rgba(${color},0.2)` }}>
          <Icon size={20} style={{ color: `rgb(${color})` }} />
        </div>
        {change !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-semibold ${positive ? 'text-green-400' : 'text-red-400'}`}>
            {positive ? <MdTrendingUp size={13} /> : <MdTrendingDown size={13} />}
            {change}
          </span>
        )}
      </div>
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className="text-white text-2xl font-black">{value}</p>
      {sub && <p className="text-gray-600 text-xs mt-1">{sub}</p>}
    </div>
  )
}

const STATUS_STYLE = {
  'Selesai':           { bg: 'rgba(34,197,94,0.1)',   color: '#22C55E', border: 'rgba(34,197,94,0.2)'   },
  'Sedang Dikerjakan': { bg: 'rgba(251,191,36,0.1)',  color: '#FBBF24', border: 'rgba(251,191,36,0.2)'  },
  'Menunggu':          { bg: 'rgba(148,163,184,0.1)', color: '#94A3B8', border: 'rgba(148,163,184,0.2)' },
}

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE['Menunggu']
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
      {status}
    </span>
  )
}

function getInitials(name = '') {
  const p = name.trim().split(/\s+/)
  return p.length === 1 ? p[0][0] : p[0][0] + p[p.length-1][0]
}
function stringToHue(str = '') {
  let h = 0; for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h)
  return Math.abs(h) % 360
}

export default function Dashboard() {
  const { orders, inventory, mechanics, vehicles } = useStorageData()

  const revenueChart = useMemo(() => buildRevenueChart(orders), [orders])

  // Stats
  const totalOrders       = orders.length
  const orderSelesai      = orders.filter(o => o.status === 'Selesai').length
  const orderProses       = orders.filter(o => o.status === 'Sedang Dikerjakan').length
  const orderMenunggu     = orders.filter(o => o.status === 'Menunggu').length
  const totalPendapatan   = orders.filter(o => o.status === 'Selesai').reduce((s, o) => s + Number(o.total), 0)
  const mechAvail         = mechanics.filter(m => m.status === 'Tersedia').length
  const lowStock          = inventory.filter(i => i.stock > 0 && i.stock <= i.minStock).length
  const outOfStock        = inventory.filter(i => i.stock === 0).length

  // Jadwal aktif — order yang sedang dikerjakan atau menunggu
  const jadwal = orders
    .filter(o => o.status === 'Menunggu' || o.status === 'Sedang Dikerjakan')
    .slice(0, 5)

  // 5 order terbaru
  const recentOrders = [...orders]
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 5)

  // Revenue total minggu ini vs minggu lalu
  const today = new Date()
  const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 7)
  const twoWeekAgo = new Date(today); twoWeekAgo.setDate(today.getDate() - 14)
  const thisWeekRev = orders.filter(o => o.status === 'Selesai' && o.date >= weekAgo.toISOString().slice(0,10)).reduce((s,o) => s+Number(o.total), 0)
  const lastWeekRev = orders.filter(o => o.status === 'Selesai' && o.date >= twoWeekAgo.toISOString().slice(0,10) && o.date < weekAgo.toISOString().slice(0,10)).reduce((s,o) => s+Number(o.total), 0)
  const revChange = lastWeekRev > 0 ? Math.round(((thisWeekRev - lastWeekRev) / lastWeekRev) * 100) : null

  return (
    <div className="page-animate space-y-5">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl"
        style={{ height: 240, border: '1px solid rgba(34,197,94,0.15)', background: '#041c15' }}>
        <img src={carHero} alt="EstherGarage" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(4,28,21,0.92) 0%, rgba(4,28,21,0.5) 50%, rgba(4,28,21,0.1) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at left center, rgba(34,197,94,0.12), transparent 55%)' }} />
        <div className="absolute left-8 top-1/2 -translate-y-1/2 z-10">
          <p className="text-gray-400 text-sm mb-1.5">Selamat datang kembali,</p>
          <h2 className="text-4xl font-black text-white mb-2.5">Esther Admin 👋</h2>
          <p className="text-gray-400 text-sm max-w-sm mb-4">Pantau semua aktivitas bengkel secara real-time.</p>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3.5 py-1.5 rounded-xl text-sm text-white"
              style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)', backdropFilter: 'blur(10px)' }}>
              🚗 {totalOrders} Total Order
            </div>
            <div className="px-3.5 py-1.5 rounded-xl text-sm text-white"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}>
              💰 {fmtShort(totalPendapatan)}
            </div>
            {(lowStock + outOfStock) > 0 && (
              <div className="px-3.5 py-1.5 rounded-xl text-sm text-yellow-400 flex items-center gap-1.5"
                style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)', backdropFilter: 'blur(10px)' }}>
                <MdWarning size={14} /> {lowStock + outOfStock} stok perlu perhatian
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={MdBuild}       label="Total Order"          value={totalOrders}           color="34,197,94"   positive change={`${orderSelesai} selesai`} />
        <StatCard icon={MdCheckCircle} label="Order Selesai"        value={orderSelesai}          color="34,197,94"   positive sub={`${orderProses} sedang proses`} />
        <StatCard icon={MdSchedule}    label="Sedang Dikerjakan"    value={orderProses}           color="234,179,8"   positive={false} sub={`${orderMenunggu} menunggu`} />
        <StatCard icon={MdAttachMoney} label="Total Pendapatan"     value={fmtShort(totalPendapatan)} color="96,165,250" positive={revChange === null || revChange >= 0} change={revChange !== null ? `${revChange > 0 ? '+' : ''}${revChange}% minggu ini` : undefined} />
      </div>

      {/* Alert inventory */}
      {(lowStock > 0 || outOfStock > 0) && (
        <Link to="/inventory" className="flex items-center justify-between p-3.5 rounded-xl transition-all hover:opacity-90"
          style={{ background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.2)' }}>
          <div className="flex items-center gap-3 text-yellow-400 text-sm">
            <MdWarning size={18} className="flex-shrink-0" />
            <span>
              {outOfStock > 0 && <strong>{outOfStock} barang habis</strong>}
              {outOfStock > 0 && lowStock > 0 && ' · '}
              {lowStock > 0 && <strong>{lowStock} barang menipis</strong>}
              {' — klik untuk restock'}
            </span>
          </div>
          <MdChevronRight size={18} className="text-yellow-400 flex-shrink-0" />
        </Link>
      )}

      {/* Chart + Jadwal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-bold text-base">Pendapatan 7 Hari Terakhir</h3>
              <p className="text-xs text-gray-500 mt-0.5">Hanya order berstatus Selesai</p>
            </div>
            <div className="text-right">
              <p className="text-green-400 font-black text-lg">{fmtShort(thisWeekRev)}</p>
              <p className="text-xs text-gray-600">minggu ini</p>
            </div>
          </div>
          {orders.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-gray-600 text-sm">
              Belum ada data order
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueChart} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,197,94,0.07)" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => v === 0 ? '0' : `${(v/1000000).toFixed(0)}jt`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#22C55E" strokeWidth={2.5}
                  fill="url(#revGrad)"
                  dot={{ fill: '#22C55E', strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, fill: '#22C55E', stroke: '#041C15', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Jadwal aktif */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-base">Antrian Aktif</h3>
            <span className="text-xs px-2 py-1 rounded-full font-bold"
              style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E' }}>
              {jadwal.length} order
            </span>
          </div>
          {jadwal.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-gray-600 text-sm">
              Tidak ada antrian aktif
            </div>
          ) : (
            <div className="space-y-2.5">
              {jadwal.map((o, i) => {
                const hue = stringToHue(o.customer)
                return (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl transition-all hover:bg-green-500/5"
                    style={{ background: 'rgba(11,59,46,0.3)', border: '1px solid rgba(34,197,94,0.07)' }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xs"
                      style={{ background: `hsl(${hue},55%,18%)`, color: `hsl(${hue},75%,60%)` }}>
                      {getInitials(o.customer)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold truncate">{o.customer}</p>
                      <p className="text-gray-500 text-xs truncate">{o.service}</p>
                    </div>
                    <StatusBadge status={o.status} />
                  </div>
                )
              })}
            </div>
          )}
          <Link to="/orders" className="flex items-center justify-center gap-1 mt-4 text-xs text-green-500 hover:text-green-400 transition-colors">
            Lihat semua order <MdChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* Order terbaru + Ringkasan + Aksi Cepat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Order terbaru */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-base">Order Terbaru</h3>
            <Link to="/orders" className="text-xs text-green-500 hover:text-green-400 transition-colors flex items-center gap-0.5">
              Lihat semua <MdChevronRight size={13} />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="py-8 text-center text-gray-600 text-sm">Belum ada order</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(34,197,94,0.08)' }}>
                    {['No. Order', 'Pelanggan', 'Layanan', 'Total', 'Status'].map(h => (
                      <th key={h} className="text-left py-2 pr-3 text-xs text-gray-600 font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o, i) => (
                    <tr key={i} className="transition-colors hover:bg-green-500/5"
                      style={{ borderBottom: '1px solid rgba(34,197,94,0.05)' }}>
                      <td className="py-2.5 pr-3 text-xs text-green-400 font-mono whitespace-nowrap">{o.id}</td>
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: `hsl(${stringToHue(o.customer)},55%,18%)`, color: `hsl(${stringToHue(o.customer)},75%,60%)` }}>
                            {getInitials(o.customer)}
                          </div>
                          <span className="text-sm text-white font-medium whitespace-nowrap">{o.customer}</span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 text-xs text-gray-400 whitespace-nowrap">{o.service}</td>
                      <td className="py-2.5 pr-3 text-sm text-white font-bold whitespace-nowrap">{fmtShort(Number(o.total))}</td>
                      <td className="py-2.5"><StatusBadge status={o.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Ringkasan + Aksi Cepat */}
        <div className="space-y-4">
          {/* Ringkasan bengkel */}
          <div className="glass-card p-4">
            <h3 className="text-white font-bold text-sm mb-3">Ringkasan Bengkel</h3>
            <div className="space-y-2">
              {[
                { icon: MdEngineering,  label: 'Mekanik Tersedia', value: `${mechAvail} / ${mechanics.length}`, color: '#22C55E' },
                { icon: MdDirectionsCar, label: 'Kendaraan Terdaftar', value: vehicles.length, color: '#60A5FA' },
                { icon: MdPending,      label: 'Menunggu Servis', value: orderMenunggu, color: '#FBBF24' },
                { icon: MdInventory,    label: 'Stok Perlu Perhatian', value: lowStock + outOfStock, color: outOfStock > 0 ? '#EF4444' : '#FBBF24' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between py-2 px-3 rounded-xl"
                  style={{ background: 'rgba(11,59,46,0.3)', border: '1px solid rgba(34,197,94,0.06)' }}>
                  <div className="flex items-center gap-2.5">
                    <s.icon size={14} style={{ color: s.color }} />
                    <span className="text-xs text-gray-400">{s.label}</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: s.color }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Aksi cepat */}
          <div className="glass-card p-4">
            <h3 className="text-white font-bold text-sm mb-3">Aksi Cepat</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: MdAdd,          label: 'Order Baru',   to: '/orders'    },
                { icon: MdPeople,       label: 'Pelanggan',    to: '/customers' },
                { icon: MdDirectionsCar,label: 'Kendaraan',    to: '/vehicles'  },
                { icon: MdInventory,    label: 'Stok',         to: '/inventory' },
                { icon: MdBarChart,     label: 'Laporan',      to: '/reports'   },
                { icon: MdEngineering,  label: 'Jadwal',       to: '/schedule'  },
              ].map(({ icon: Icon, label, to }) => (
                <Link key={label} to={to}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl text-center transition-all hover:scale-105"
                  style={{ background: 'rgba(11,59,46,0.4)', border: '1px solid rgba(34,197,94,0.08)' }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(34,197,94,0.1)' }}>
                    <Icon className="text-green-400" size={16} />
                  </div>
                  <span className="text-xs text-gray-500 leading-tight">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}