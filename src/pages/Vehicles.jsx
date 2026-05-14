import { useState } from 'react'
import { MdAdd, MdSearch, MdClose, MdDirectionsCar, MdTwoWheeler } from 'react-icons/md'
import PageHeader from '../components/PageHeader'
import { vehiclesData } from '../data/dummy'

export default function Vehicles() {
  const [vehicles, setVehicles] = useState(vehiclesData)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ plate:'', brand:'', model:'', year:'', owner:'', type:'Mobil' })

  const filtered = vehicles.filter(v =>
    v.plate.toLowerCase().includes(search.toLowerCase()) ||
    v.owner.toLowerCase().includes(search.toLowerCase()) ||
    v.brand.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    setVehicles([{ ...form, id:`V-${String(vehicles.length+1).padStart(3,'0')}`, lastService: new Date().toISOString().slice(0,10) }, ...vehicles])
    setShowModal(false)
    setForm({ plate:'', brand:'', model:'', year:'', owner:'', type:'Mobil' })
  }

  return (
    <div className="page-animate">
      <PageHeader title="Data Kendaraan" breadcrumb={['Kendaraan']}>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm">
          <MdAdd size={18} /> Tambah Kendaraan
        </button>
      </PageHeader>

      <div className="glass-card p-5">
        <div className="relative mb-5 max-w-md">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari plat, merek, pemilik..." className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-gray-300 outline-none" style={{background:'rgba(11,59,46,0.4)', border:'1px solid rgba(34,197,94,0.12)'}} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((v, i) => (
            <div key={i} className="p-4 rounded-2xl glass-card-hover transition-all" style={{background:'rgba(11,59,46,0.35)', border:'1px solid rgba(34,197,94,0.1)'}}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background:'rgba(34,197,94,0.12)'}}>
                  {v.type === 'Motor' ? <MdTwoWheeler className="text-green-400" size={22} /> : <MdDirectionsCar className="text-green-400" size={22} />}
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{background:'rgba(34,197,94,0.1)', color:'#22C55E', border:'1px solid rgba(34,197,94,0.2)'}}>{v.type}</span>
              </div>
              <p className="text-lg font-display font-bold text-white mb-0.5">{v.plate}</p>
              <p className="text-sm text-gray-300 font-semibold mb-0.5">{v.brand} {v.model} <span className="text-gray-500 font-normal">{v.year}</span></p>
              <p className="text-xs text-gray-500 mb-2">Pemilik: <span className="text-gray-300">{v.owner}</span></p>
              <div className="flex items-center justify-between pt-2" style={{borderTop:'1px solid rgba(34,197,94,0.08)'}}>
                <span className="text-xs text-gray-500">Servis Terakhir</span>
                <span className="text-xs text-green-400 font-semibold">{v.lastService}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-4">Menampilkan {filtered.length} dari {vehicles.length} kendaraan</p>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)'}}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{background:'#06281F', border:'1px solid rgba(34,197,94,0.2)'}}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-display font-bold text-xl">Tambah Kendaraan</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white"><MdClose size={22} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label:'Nomor Plat', key:'plate', placeholder:'B 1234 ABC' },
                { label:'Merek', key:'brand', placeholder:'Toyota' },
                { label:'Model', key:'model', placeholder:'Avanza' },
                { label:'Tahun', key:'year', placeholder:'2022', type:'number' },
                { label:'Pemilik', key:'owner', placeholder:'Andi Wijaya' },
              ].map(({ label, key, placeholder, type='text' }) => (
                <div key={key}>
                  <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
                  <input type={type} required value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={placeholder}
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none" style={{background:'rgba(11,59,46,0.5)', border:'1px solid rgba(34,197,94,0.15)'}} />
                </div>
              ))}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Tipe</label>
                <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none" style={{background:'rgba(11,59,46,0.5)', border:'1px solid rgba(34,197,94,0.15)'}}>
                  <option>Mobil</option><option>Motor</option>
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
