import { useState } from 'react'
import { MdAdd, MdSearch, MdClose, MdFilterList } from 'react-icons/md'
import PageHeader from '../components/PageHeader'
import { ordersData } from '../data/dummy'

const fmt = (n) => 'Rp ' + n.toLocaleString('id-ID')

const StatusBadge = ({ status }) => {
  const map = { 'Selesai':'status-selesai', 'Sedang Dikerjakan':'status-proses', 'Menunggu':'status-menunggu' }
  return <span className={`status-badge ${map[status]||'status-menunggu'}`}>{status}</span>
}

const initialForm = { id: '', customer: '', vehicle: '', service: '', status: 'Menunggu', total: '', date: '' }

export default function Orders() {
  const [orders, setOrders] = useState(ordersData)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(initialForm)

  const filtered = orders.filter(o =>
    o.customer.toLowerCase().includes(search.toLowerCase()) ||
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.service.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    const newOrder = { ...form, id: `#ORD-NEW-${Date.now()}`, total: parseInt(form.total)||0 }
    setOrders([newOrder, ...orders])
    setShowModal(false)
    setForm(initialForm)
  }

  return (
    <div className="page-animate">
      <PageHeader title="Order Servis" breadcrumb={['Order Servis']}>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
          <MdAdd size={18} /> Tambah Order
        </button>
      </PageHeader>

      <div className="glass-card p-5">
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari order, pelanggan, layanan..." className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-gray-300 outline-none" style={{background:'rgba(11,59,46,0.4)', border:'1px solid rgba(34,197,94,0.12)'}} />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-gray-400 transition-all hover:text-green-400" style={{background:'rgba(11,59,46,0.4)', border:'1px solid rgba(34,197,94,0.12)'}}>
            <MdFilterList size={16} /> Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{borderColor:'rgba(34,197,94,0.1)'}}>
                {['No. Order','Pelanggan','Kendaraan','Layanan','Status','Total','Tanggal'].map(h => (
                  <th key={h} className="text-left py-3 pr-4 text-xs text-gray-500 font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, i) => (
                <tr key={i} className="border-b transition-colors hover:bg-green-500/5 cursor-pointer" style={{borderColor:'rgba(34,197,94,0.05)'}}>
                  <td className="py-3 pr-4 text-xs text-green-400 font-mono font-semibold whitespace-nowrap">{o.id}</td>
                  <td className="py-3 pr-4 text-sm text-white font-medium whitespace-nowrap">{o.customer}</td>
                  <td className="py-3 pr-4 text-sm text-gray-400 whitespace-nowrap">{o.vehicle}</td>
                  <td className="py-3 pr-4 text-sm text-gray-400 whitespace-nowrap">{o.service}</td>
                  <td className="py-3 pr-4"><StatusBadge status={o.status} /></td>
                  <td className="py-3 pr-4 text-sm text-white font-semibold whitespace-nowrap">{fmt(o.total)}</td>
                  <td className="py-3 text-xs text-gray-500 whitespace-nowrap">{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">Tidak ada data ditemukan</div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-4">Menampilkan {filtered.length} dari {orders.length} order</p>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)'}}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{background:'#06281F', border:'1px solid rgba(34,197,94,0.2)'}}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-display font-bold text-xl">Tambah Order Baru</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white"><MdClose size={22} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: 'Nama Pelanggan', key: 'customer', placeholder: 'Andi Wijaya' },
                { label: 'Kendaraan', key: 'vehicle', placeholder: 'Toyota Avanza - B 1234 ABC' },
                { label: 'Layanan', key: 'service', placeholder: 'Servis Berkala' },
                { label: 'Total (Rp)', key: 'total', placeholder: '350000', type: 'number' },
                { label: 'Tanggal', key: 'date', placeholder: '', type: 'date' },
              ].map(({ label, key, placeholder, type='text' }) => (
                <div key={key}>
                  <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
                  <input type={type} required value={form[key]} onChange={e => setForm({...form, [key]:e.target.value})} placeholder={placeholder}
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all"
                    style={{background:'rgba(11,59,46,0.5)', border:'1px solid rgba(34,197,94,0.15)'}} />
                </div>
              ))}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Status</label>
                <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none" style={{background:'rgba(11,59,46,0.5)', border:'1px solid rgba(34,197,94,0.15)'}}>
                  <option>Menunggu</option><option>Sedang Dikerjakan</option><option>Selesai</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={()=>setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 transition-all hover:text-white" style={{border:'1px solid rgba(34,197,94,0.15)'}}>Batal</button>
                <button type="submit" className="btn-primary flex-1 py-2.5 rounded-xl text-sm">Simpan Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
