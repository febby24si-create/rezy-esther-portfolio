import { useState } from 'react'
import { MdAdd, MdSearch, MdClose, MdStar } from 'react-icons/md'
import PageHeader from '../components/PageHeader'
import { customersData } from '../data/dummy'

const LoyaltyBadge = ({ loyalty }) => {
  const map = { Platinum: 'text-purple-400 bg-purple-500/10 border-purple-500/25', Gold: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/25', Silver: 'text-gray-400 bg-gray-500/10 border-gray-500/25', Bronze: 'text-orange-400 bg-orange-500/10 border-orange-500/25' }
  return <span className={`status-badge ${map[loyalty]||'status-menunggu'}`}>{loyalty}</span>
}

const initialForm = { name:'', email:'', phone:'', loyalty:'Bronze' }

export default function Customers() {
  const [customers, setCustomers] = useState(customersData)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(initialForm)

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    const newC = { ...form, id: `C-${String(customers.length+1).padStart(3,'0')}`, totalOrders:0, joinDate: new Date().toISOString().slice(0,10) }
    setCustomers([newC, ...customers])
    setShowModal(false)
    setForm(initialForm)
  }

  return (
    <div className="page-animate">
      <PageHeader title="Data Pelanggan" breadcrumb={['Pelanggan']}>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
          <MdAdd size={18} /> Tambah Pelanggan
        </button>
      </PageHeader>

      <div className="glass-card p-5">
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari nama, email, telepon..." className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-gray-300 outline-none" style={{background:'rgba(11,59,46,0.4)', border:'1px solid rgba(34,197,94,0.12)'}} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{borderColor:'rgba(34,197,94,0.1)'}}>
                {['ID','Nama','Email','Telepon','Loyalty','Total Order','Bergabung'].map(h=>(
                  <th key={h} className="text-left py-3 pr-4 text-xs text-gray-500 font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={i} className="border-b transition-colors hover:bg-green-500/5 cursor-pointer" style={{borderColor:'rgba(34,197,94,0.05)'}}>
                  <td className="py-3 pr-4 text-xs text-gray-500 font-mono">{c.id}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{background:'linear-gradient(135deg,#16A34A,#22C55E)'}}>{c.name[0]}</div>
                      <span className="text-sm text-white font-medium whitespace-nowrap">{c.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-sm text-gray-400">{c.email}</td>
                  <td className="py-3 pr-4 text-sm text-gray-400 whitespace-nowrap">{c.phone}</td>
                  <td className="py-3 pr-4"><LoyaltyBadge loyalty={c.loyalty} /></td>
                  <td className="py-3 pr-4 text-sm text-white font-semibold">{c.totalOrders}</td>
                  <td className="py-3 text-xs text-gray-500 whitespace-nowrap">{c.joinDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-4">Menampilkan {filtered.length} dari {customers.length} pelanggan</p>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)'}}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{background:'#06281F', border:'1px solid rgba(34,197,94,0.2)'}}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-display font-bold text-xl">Tambah Pelanggan</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white"><MdClose size={22} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: 'Nama Lengkap', key: 'name', placeholder: 'Andi Wijaya' },
                { label: 'Email', key: 'email', placeholder: 'andi@email.com', type: 'email' },
                { label: 'Telepon', key: 'phone', placeholder: '0812-3456-7890' },
              ].map(({ label, key, placeholder, type='text' }) => (
                <div key={key}>
                  <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
                  <input type={type} required value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={placeholder}
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none" style={{background:'rgba(11,59,46,0.5)', border:'1px solid rgba(34,197,94,0.15)'}} />
                </div>
              ))}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Loyalty</label>
                <select value={form.loyalty} onChange={e=>setForm({...form,loyalty:e.target.value})} className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none" style={{background:'rgba(11,59,46,0.5)', border:'1px solid rgba(34,197,94,0.15)'}}>
                  {['Bronze','Silver','Gold','Platinum'].map(l=><option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={()=>setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400" style={{border:'1px solid rgba(34,197,94,0.15)'}}>Batal</button>
                <button type="submit" className="btn-primary flex-1 py-2.5 rounded-xl text-sm">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
