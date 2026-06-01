import { useState, useEffect } from 'react'
import {
  MdAdd, MdSearch, MdClose, MdEdit, MdDelete, MdStar,
  MdPhotoCamera, MdReceipt, MdCalendarToday, MdPhone, MdEmail,
  MdPerson, MdShoppingBag, MdChevronRight
} from 'react-icons/md'
import PageHeader from '../components/PageHeader'
import { customersData } from '../data/dummy'

// Helper untuk mengambil orders dari localStorage
const getOrdersFromStorage = () => {
  const stored = localStorage.getItem('garage_orders')
  if (stored) return JSON.parse(stored)
  return [] // fallback kosong
}

const LoyaltyBadge = ({ loyalty }) => {
  const map = {
    Platinum: 'text-purple-400 bg-purple-500/10 border-purple-500/25',
    Gold:     'text-yellow-400 bg-yellow-500/10 border-yellow-500/25',
    Silver:   'text-gray-400 bg-gray-500/10 border-gray-500/25',
    Bronze:   'text-orange-400 bg-orange-500/10 border-orange-500/25',
  }
  return <span className={`status-badge ${map[loyalty] || 'status-menunggu'}`}>{loyalty}</span>
}

const initialForm = { name: '', email: '', phone: '', loyalty: 'Bronze', photo: '' }

// Simpan ke localStorage
const saveToLocalStorage = (customers) => {
  localStorage.setItem('garage_customers', JSON.stringify(customers))
}

const loadFromLocalStorage = () => {
  const stored = localStorage.getItem('garage_customers')
  if (stored) return JSON.parse(stored)
  return customersData
}

// Delete Confirm Modal
function DeleteConfirm({ target, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: '#06281F', border: '1px solid rgba(239,68,68,0.3)' }}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(239,68,68,0.12)' }}>
          <MdDelete size={24} style={{ color: '#ef4444' }} />
        </div>
        <h3 className="text-white font-bold text-center text-lg mb-2">Hapus Pelanggan?</h3>
        <p className="text-gray-400 text-sm text-center mb-6">Data <span className="text-green-400 font-semibold">{target?.name}</span> akan dihapus permanen.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 transition-all hover:text-white" style={{ border: '1px solid rgba(34,197,94,0.15)' }}>Batal</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'rgba(239,68,68,0.8)' }}>Ya, Hapus</button>
        </div>
      </div>
    </div>
  )
}

// Detail Modal Component
const DetailModal = ({ customer, onClose }) => {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    // Ambil orders dari localStorage dan filter berdasarkan nama customer
    const allOrders = getOrdersFromStorage()
    const customerOrders = allOrders.filter(order => order.customer === customer.name)
    setOrders(customerOrders)
  }, [customer.name])

  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0)

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl max-h-[85vh] overflow-y-auto" style={{ background: '#06281F', border: '1px solid rgba(34,197,94,0.2)' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-green-500/10 flex justify-between items-center sticky top-0 bg-[#06281F] z-10">
          <h3 className="text-white font-bold text-xl">Detail Pelanggan</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><MdClose size={22} /></button>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Section */}
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            {customer.photo ? (
              <img src={customer.photo} alt={customer.name} className="w-24 h-24 rounded-full object-cover border-2 border-green-500" />
            ) : (
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white" style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)' }}>
                {customer.name[0]}
              </div>
            )}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-white">{customer.name}</h2>
              <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                <LoyaltyBadge loyalty={customer.loyalty} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 text-sm">
                <div className="flex items-center gap-2 text-gray-400"><MdEmail size={16} /> {customer.email}</div>
                <div className="flex items-center gap-2 text-gray-400"><MdPhone size={16} /> {customer.phone}</div>
                <div className="flex items-center gap-2 text-gray-400"><MdCalendarToday size={16} /> Bergabung: {customer.joinDate}</div>
                <div className="flex items-center gap-2 text-gray-400"><MdShoppingBag size={16} /> Total Orders: {customer.totalOrders}</div>
              </div>
            </div>
          </div>

          {/* Statistik */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.15)' }}>
              <p className="text-gray-400 text-xs">Total Pesanan</p>
              <p className="text-white text-2xl font-bold">{orders.length}</p>
            </div>
            <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.15)' }}>
              <p className="text-gray-400 text-xs">Total Belanja</p>
              <p className="text-green-400 text-2xl font-bold">
                Rp {totalSpent.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          {/* Riwayat Pesanan */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-3 flex items-center gap-2"><MdReceipt size={20} /> Riwayat Pesanan</h4>
            {orders.length === 0 ? (
              <p className="text-gray-500 text-sm italic">Belum ada pesanan.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {orders.map((order, idx) => (
                  <div key={idx} className="p-3 rounded-xl" style={{ background: 'rgba(11,59,46,0.4)', border: '1px solid rgba(34,197,94,0.1)' }}>
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div>
                        <p className="text-green-400 font-mono text-xs">{order.id}</p>
                        <p className="text-white text-sm font-medium">{order.service}</p>
                        <p className="text-gray-500 text-xs">{order.vehicle}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{fmt(order.total)}</p>
                        <p className="text-gray-500 text-xs">{order.date}</p>
                        <StatusBadge status={order.status} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-green-500/10 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 rounded-xl text-sm text-gray-400 border border-gray-700 hover:bg-gray-800 transition-all">Tutup</button>
        </div>
      </div>
    </div>
  )
}

// Helper untuk format mata uang
const fmt = (n) => "Rp " + n.toLocaleString('id-ID')

const StatusBadge = ({ status }) => {
  const map = {
    Selesai: 'bg-green-500/10 text-green-400 border-green-500/20',
    'Sedang Dikerjakan': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    Menunggu: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  }
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs border ${map[status] || map.Menunggu}`}>{status}</span>
}

export default function Customers() {
  const [customers, setCustomers] = useState(() => loadFromLocalStorage())
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [editId, setEditId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [previewPhoto, setPreviewPhoto] = useState('')
  const [detailTarget, setDetailTarget] = useState(null)

  useEffect(() => {
    saveToLocalStorage(customers)
  }, [customers])

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  )

  const openAdd = () => {
    setForm(initialForm)
    setPreviewPhoto('')
    setEditId(null)
    setShowModal(true)
  }

  const openEdit = (c, e) => {
    e.stopPropagation()
    setForm({
      name: c.name,
      email: c.email,
      phone: c.phone,
      loyalty: c.loyalty,
      photo: c.photo || ''
    })
    setPreviewPhoto(c.photo || '')
    setEditId(c.id)
    setShowModal(true)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result
      setForm(prev => ({ ...prev, photo: base64 }))
      setPreviewPhoto(base64)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (ev) => {
    ev.preventDefault()
    if (editId) {
      setCustomers(prev => prev.map(c =>
        c.id === editId ? { ...c, ...form } : c
      ))
    } else {
      const newId = `C-${String(customers.length + 1).padStart(3, '0')}`
      const newCustomer = {
        ...form,
        id: newId,
        totalOrders: 0,
        joinDate: new Date().toISOString().slice(0, 10),
      }
      setCustomers(prev => [newCustomer, ...prev])
    }
    setShowModal(false)
    setPreviewPhoto('')
  }

  const handleDelete = () => {
    setCustomers(prev => prev.filter(c => c.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <div className="page-animate">
      <PageHeader title="Data Pelanggan" breadcrumb={['Pelanggan']}>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
          <MdAdd size={18} /> Tambah Pelanggan
        </button>
      </PageHeader>

      <div className="glass-card p-5">
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama, email, telepon..." className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-gray-300 outline-none" style={{ background: 'rgba(11,59,46,0.4)', border: '1px solid rgba(34,197,94,0.12)' }} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgba(34,197,94,0.1)' }}>
                {['ID', 'Foto', 'Nama', 'Email', 'Telepon', 'Loyalty', 'Total Order', 'Bergabung', 'Aksi'].map(h => (
                  <th key={h} className="text-left py-3 pr-4 text-xs text-gray-500 font-semibold uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr
                  key={i}
                  onClick={() => setDetailTarget(c)}
                  className="border-b transition-colors hover:bg-green-500/5 cursor-pointer"
                  style={{ borderColor: 'rgba(34,197,94,0.05)' }}
                >
                  <td className="py-3 pr-4 text-xs text-gray-500 font-mono">{c.id}</td>
                  <td className="py-3 pr-4">
                    {c.photo ? (
                      <img src={c.photo} alt={c.name} className="w-8 h-8 rounded-full object-cover border border-green-500/30" />
                    ) : (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)' }}>
                        {c.name[0]}
                      </div>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white font-medium whitespace-nowrap">{c.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-sm text-gray-400">{c.email}</td>
                  <td className="py-3 pr-4 text-sm text-gray-400 whitespace-nowrap">{c.phone}</td>
                  <td className="py-3 pr-4"><LoyaltyBadge loyalty={c.loyalty} /></td>
                  <td className="py-3 pr-4 text-sm text-white font-semibold">{c.totalOrders}</td>
                  <td className="py-3 pr-4 text-xs text-gray-500 whitespace-nowrap">{c.joinDate}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <button onClick={(e) => openEdit(c, e)} title="Edit" className="w-7 h-7 rounded-lg flex items-center justify-center text-yellow-400 transition-all hover:bg-yellow-500/15">
                        <MdEdit size={15} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(c) }} title="Hapus" className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 transition-all hover:bg-red-500/15">
                        <MdDelete size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-4">Menampilkan {filtered.length} dari {customers.length} pelanggan</p>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: '#06281F', border: '1px solid rgba(34,197,94,0.2)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-display font-bold text-xl">{editId ? 'Edit Pelanggan' : 'Tambah Pelanggan'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white"><MdClose size={22} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Foto Pelanggan</label>
                <div className="flex items-center gap-3">
                  {previewPhoto ? (
                    <img src={previewPhoto} alt="Preview" className="w-16 h-16 rounded-full object-cover border border-green-500/30" />
                  ) : (
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{ background: 'linear-gradient(135deg,#16A34A,#22C55E)' }}>
                      {form.name ? form.name[0] : '?'}
                    </div>
                  )}
                  <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-green-400 border border-green-500/20 hover:bg-green-500/10 transition-all">
                    <MdPhotoCamera size={18} />
                    Upload Foto
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              {[
                { label: 'Nama Lengkap', key: 'name', placeholder: 'Andi Wijaya' },
                { label: 'Email', key: 'email', placeholder: 'andi@email.com', type: 'email' },
                { label: 'Telepon', key: 'phone', placeholder: '0812-3456-7890' },
              ].map(({ label, key, placeholder, type = 'text' }) => (
                <div key={key}>
                  <label className="block text-sm text-gray-400 mb-1.5">{label}</label>
                  <input type={type} required value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder}
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: 'rgba(11,59,46,0.5)', border: '1px solid rgba(34,197,94,0.15)' }} />
                </div>
              ))}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Loyalty</label>
                <select value={form.loyalty} onChange={e => setForm({ ...form, loyalty: e.target.value })} className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none" style={{ background: 'rgba(11,59,46,0.5)', border: '1px solid rgba(34,197,94,0.15)' }}>
                  {['Bronze', 'Silver', 'Gold', 'Platinum'].map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400" style={{ border: '1px solid rgba(34,197,94,0.15)' }}>Batal</button>
                <button type="submit" className="btn-primary flex-1 py-2.5 rounded-xl text-sm">{editId ? 'Simpan Perubahan' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && <DeleteConfirm target={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}
      {detailTarget && <DetailModal customer={detailTarget} onClose={() => setDetailTarget(null)} />}
    </div>
  )
}