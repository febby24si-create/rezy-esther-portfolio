import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { MdTrendingUp, MdTrendingDown, MdBuild, MdCheckCircle, MdSchedule, MdAttachMoney, MdAdd, MdPeople, MdDirectionsCar, MdInventory, MdBarChart, MdReceipt, MdChevronRight } from 'react-icons/md'
import PageHeader from '../components/PageHeader'
import { revenueData, ordersData, scheduleData } from '../data/dummy'

const fmt = (n) => 'Rp ' + n.toLocaleString('id-ID')

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3">
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p className="text-green-400 font-bold text-sm">{fmt(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

const StatCard = ({ icon: Icon, label, value, change, positive, color }) => (
  <div className="stat-card">
    <div className="flex items-start justify-between mb-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{background:`rgba(${color},0.15)`, border:`1px solid rgba(${color},0.25)`}}>
        <Icon size={22} style={{color:`rgb(${color})`}} />
      </div>
      <span className={`flex items-center gap-1 text-xs font-semibold ${positive ? 'text-green-400' : 'text-red-400'}`}>
        {positive ? <MdTrendingUp size={14} /> : <MdTrendingDown size={14} />}
        {change}
      </span>
    </div>
    <p className="text-gray-400 text-xs mb-1">{label}</p>
    <p className="text-white text-2xl font-display font-bold">{value}</p>
  </div>
)

const StatusBadge = ({ status }) => {
  const map = { 'Selesai':'status-selesai', 'Sedang Dikerjakan':'status-proses', 'Menunggu':'status-menunggu' }
  return <span className={`status-badge ${map[status]||'status-menunggu'}`}>{status}</span>
}

const ServiceBadge = ({ service }) => (
  <span className="text-xs px-2 py-0.5 rounded-full text-green-400 font-medium" style={{background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.2)'}}>{service}</span>
)

export default function Dashboard() {
  const recentOrders = ordersData.slice(0, 4)
  const todaySchedule = scheduleData

  return (
    <div className="page-animate space-y-6">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden" style={{background:'linear-gradient(135deg, #0B3B2E 0%, #06281F 60%, #041C15 100%)', border:'1px solid rgba(34,197,94,0.15)', minHeight:'140px'}}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20" style={{background:'radial-gradient(ellipse at right, #22C55E, transparent)'}}></div>
          <div className="absolute inset-0" style={{backgroundImage:'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(34,197,94,0.02) 40px, rgba(34,197,94,0.02) 41px)'}}></div>
        </div>
        <div className="relative z-10 p-6 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">Selamat datang kembali,</p>
            <h2 className="text-3xl font-display font-bold text-white mb-2">Esther Admin 👋</h2>
            <p className="text-gray-400 text-sm">Pantau semua aktivitas bengkel esthergarage dari sini.</p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.25)'}}>
              <MdBuild size={32} className="text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={MdBuild} label="Total Order" value="24" change="12% dari kemarin" positive color="34,197,94" />
        <StatCard icon={MdCheckCircle} label="Order Selesai" value="16" change="14% dari kemarin" positive color="34,197,94" />
        <StatCard icon={MdSchedule} label="Sedang Dikerjakan" value="6" change="2% dari kemarin" positive={false} color="234,179,8" />
        <StatCard icon={MdAttachMoney} label="Pendapatan Hari Ini" value="Rp 5.280.000" change="18% dari kemarin" positive color="34,197,94" />
      </div>

      {/* Chart + Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-display font-bold text-lg">Pendapatan 7 Hari Terakhir</h3>
            <span className="text-xs text-gray-400 px-3 py-1.5 rounded-xl" style={{background:'rgba(11,59,46,0.5)', border:'1px solid rgba(34,197,94,0.1)'}}>7 Hari Terakhir ▾</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData} margin={{top:5, right:10, left:10, bottom:5}}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,197,94,0.08)" />
              <XAxis dataKey="date" tick={{fill:'#6b7280', fontSize:11}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill:'#6b7280', fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`Rp ${(v/1000000).toFixed(1)}jt`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#22C55E" strokeWidth={2.5} fill="url(#revenueGrad)" dot={{ fill:'#22C55E', strokeWidth:2, r:4 }} activeDot={{ r:6, fill:'#22C55E', stroke:'#041C15', strokeWidth:2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Schedule */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-display font-bold text-lg">Jadwal Hari Ini</h3>
          </div>
          <div className="space-y-3">
            {todaySchedule.map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-green-500/5" style={{background:'rgba(11,59,46,0.3)', border:'1px solid rgba(34,197,94,0.08)'}}>
                <div className="text-center">
                  <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-lg whitespace-nowrap">{s.time}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{s.plate}</p>
                  <p className="text-gray-500 text-xs truncate">{s.vehicle}</p>
                </div>
                <ServiceBadge service={s.service} />
              </div>
            ))}
          </div>
          <Link to="/orders" className="flex items-center justify-center gap-1 mt-4 text-xs text-green-400 hover:text-green-300 transition-colors">
            Lihat semua jadwal <MdChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* Orders + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-display font-bold text-lg">Order Terbaru</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{borderColor:'rgba(34,197,94,0.1)'}}>
                  {['No. Order','Pelanggan','Kendaraan','Layanan','Status'].map(h => (
                    <th key={h} className="text-left py-2 pr-4 text-xs text-gray-500 font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o, i) => (
                  <tr key={i} className="border-b transition-colors hover:bg-green-500/5" style={{borderColor:'rgba(34,197,94,0.05)'}}>
                    <td className="py-3 pr-4 text-xs text-green-400 font-mono font-semibold">{o.id}</td>
                    <td className="py-3 pr-4 text-sm text-white font-medium whitespace-nowrap">{o.customer}</td>
                    <td className="py-3 pr-4">
                      <p className="text-sm text-white">{o.vehicle.split(' - ')[0]}</p>
                      <p className="text-xs text-gray-500">{o.vehicle.split(' - ')[1]}</p>
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-400">{o.service}</td>
                    <td className="py-3"><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link to="/orders" className="flex items-center justify-center gap-1 mt-4 text-xs text-green-400 hover:text-green-300 transition-colors">
            Lihat semua order <MdChevronRight size={14} />
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-5">
          <h3 className="text-white font-display font-bold text-lg mb-4">Aksi Cepat</h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { icon: MdAdd, label: 'Buat Order Baru', to: '/orders' },
              { icon: MdPeople, label: 'Tambah Pelanggan', to: '/customers' },
              { icon: MdDirectionsCar, label: 'Tambah Kendaraan', to: '/vehicles' },
              { icon: MdInventory, label: 'Cek Stok Barang', to: '/settings' },
              { icon: MdBarChart, label: 'Laporan Penjualan', to: '/reports' },
              { icon: MdReceipt, label: 'Transaksi Baru', to: '/orders' },
            ].map(({ icon: Icon, label, to }) => (
              <Link key={label} to={to} className="flex flex-col items-center gap-2 p-3 rounded-xl text-center transition-all hover:scale-105 glass-card-hover" style={{background:'rgba(11,59,46,0.4)', border:'1px solid rgba(34,197,94,0.1)'}}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:'rgba(34,197,94,0.12)'}}>
                  <Icon className="text-green-400" size={18} />
                </div>
                <span className="text-xs text-gray-400 leading-tight">{label}</span>
              </Link>
            ))}
          </div>
          <div className="p-4 rounded-xl" style={{background:'linear-gradient(135deg, rgba(11,59,46,0.5), rgba(6,40,31,0.8))', border:'1px solid rgba(34,197,94,0.12)'}}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:'rgba(34,197,94,0.15)'}}>
                <MdBuild className="text-green-400" size={18} />
              </div>
              <div>
                <p className="text-white text-sm font-bold">esthergarage</p>
                <p className="text-gray-500 text-xs">Bengkel Terpercaya</p>
              </div>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">Bengkel terpercaya untuk semua jenis kendaraan. Kualitas terbaik, pelayanan terbaik.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
