import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import PageHeader from '../components/PageHeader'
import { revenueData } from '../data/dummy'

const monthlyData = [
  { month: 'Jan', revenue: 42000000, orders: 88 },
  { month: 'Feb', revenue: 38000000, orders: 76 },
  { month: 'Mar', revenue: 55000000, orders: 110 },
  { month: 'Apr', revenue: 48000000, orders: 95 },
  { month: 'Mei', revenue: 62000000, orders: 124 },
]
const serviceData = [
  { name: 'Servis Berkala', value: 35, color: '#22C55E' },
  { name: 'Ganti Oli', value: 28, color: '#16A34A' },
  { name: 'Tune Up', value: 18, color: '#0f4f3d' },
  { name: 'Servis Rem', value: 12, color: '#0B3B2E' },
  { name: 'Lainnya', value: 7, color: '#06281F' },
]
const fmt = v => `Rp ${(v/1000000).toFixed(0)}jt`

export default function Reports() {
  const totalRevenue = monthlyData.reduce((s, d) => s + d.revenue, 0)
  const totalOrders = monthlyData.reduce((s, d) => s + d.orders, 0)

  return (
    <div className="page-animate">
      <PageHeader title="Laporan & Analitik" breadcrumb={['Laporan']} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label:'Total Pendapatan', value:`Rp ${(totalRevenue/1000000).toFixed(0)}jt`, sub:'5 bulan terakhir' },
          { label:'Total Order', value:totalOrders, sub:'5 bulan terakhir' },
          { label:'Rata-rata/Bulan', value:`Rp ${(totalRevenue/5/1000000).toFixed(1)}jt`, sub:'per bulan' },
          { label:'Order/Hari', value:(totalOrders/150).toFixed(1), sub:'rata-rata harian' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="stat-card">
            <p className="text-gray-400 text-xs mb-1">{label}</p>
            <p className="text-white text-xl font-display font-bold">{value}</p>
            <p className="text-gray-600 text-xs mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="glass-card p-5">
          <h3 className="text-white font-display font-bold mb-4">Pendapatan Bulanan</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,197,94,0.08)" />
              <XAxis dataKey="month" tick={{fill:'#6b7280',fontSize:11}} axisLine={false} tickLine={false} />
              <YAxis tick={{fill:'#6b7280',fontSize:10}} axisLine={false} tickLine={false} tickFormatter={fmt} />
              <Tooltip formatter={v=>[`Rp ${v.toLocaleString('id-ID')}`, 'Pendapatan']} contentStyle={{background:'#06281F', border:'1px solid rgba(34,197,94,0.2)', borderRadius:12, color:'#fff'}} />
              <Bar dataKey="revenue" fill="url(#barGrad)" radius={[6,6,0,0]} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22C55E" /><stop offset="100%" stopColor="#0B3B2E" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-5">
          <h3 className="text-white font-display font-bold mb-4">Distribusi Layanan</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={serviceData} cx="50%" cy="50%" innerRadius={40} outerRadius={72} paddingAngle={3} dataKey="value">
                  {serviceData.map((entry, i) => <Cell key={i} fill={entry.color} stroke="transparent" />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {serviceData.map(s => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:s.color==='#22C55E'?'#22C55E':s.color==='#16A34A'?'#16A34A':'#4ade80'}}></div>
                    <span className="text-xs text-gray-400">{s.name}</span>
                  </div>
                  <span className="text-xs text-white font-semibold">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
