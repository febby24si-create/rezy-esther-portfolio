import { useState, useEffect } from 'react'
import { MdDelete, MdEdit, MdSave, MdClose, MdPersonAdd } from 'react-icons/md'
import { userAPI } from '../services/userAPI'
import GenericTable from '../components/GenericTable'
import AlertBox from '../components/AlertBox'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'

const EMPTY_FORM = { name: '', email: '', password: '', role: 'user' }

// Kelas input sesuai dark theme Esther Garage
const inputCls = `w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all
  focus:ring-2 focus:ring-green-500/30 placeholder-gray-500`
const inputStyle = { background: 'rgba(11,59,46,0.4)', border: '1px solid rgba(34,197,94,0.12)' }

const cardStyle = {
  background: 'rgba(4,28,21,0.7)',
  border: '1px solid rgba(34,197,94,0.1)',
  backdropFilter: 'blur(12px)'
}

export default function User() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [dataForm, setDataForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState(EMPTY_FORM)

  useEffect(() => { loadUsers() }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await userAPI.fetchUsers()
      setUsers(data)
    } catch (err) {
      setError('Gagal memuat data user.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setDataForm({ ...dataForm, [name]: value })
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm({ ...editForm, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      setSuccess('')
      await userAPI.createUser(dataForm)
      setSuccess('User berhasil ditambahkan!')
      setDataForm(EMPTY_FORM)
      setTimeout(() => setSuccess(''), 3000)
      loadUsers()
    } catch (err) {
      setError(`Terjadi kesalahan: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    const konfirmasi = confirm('Yakin ingin menghapus user ini?')
    if (!konfirmasi) return
    try {
      setLoading(true)
      setError('')
      setSuccess('')
      await userAPI.deleteUser(id)
      setSuccess('User berhasil dihapus!')
      setTimeout(() => setSuccess(''), 3000)
      loadUsers()
    } catch (err) {
      setError(`Terjadi kesalahan: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEditStart = (user) => {
    setEditId(user.id)
    setEditForm({ name: user.name, email: user.email, password: user.password, role: user.role })
  }

  const handleEditSave = async (id) => {
    try {
      setLoading(true)
      setError('')
      setSuccess('')
      await userAPI.updateUser(id, editForm)
      setSuccess('User berhasil diperbarui!')
      setEditId(null)
      setTimeout(() => setSuccess(''), 3000)
      loadUsers()
    } catch (err) {
      setError(`Terjadi kesalahan: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEditCancel = () => {
    setEditId(null)
    setEditForm(EMPTY_FORM)
  }

  const roleBadge = (role) => {
    const map = {
      admin:   'bg-red-500/20 text-red-300 border border-red-500/30',
      mekanik: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
      user:    'bg-green-500/20 text-green-300 border border-green-500/30',
    }
    return map[role] || map.user
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* ── Header ── */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white tracking-wide">Manajemen User</h2>
        <p className="text-gray-400 text-sm mt-1">Kelola data user yang terdaftar di sistem</p>
      </div>

      {/* ── Alert ── */}
      {error   && <AlertBox type="error">{error}</AlertBox>}
      {success && <AlertBox type="success">{success}</AlertBox>}

      {/* ── Form Tambah User ── */}
      <div className="rounded-2xl p-6 mb-6" style={cardStyle}>
        <h3 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
          <MdPersonAdd className="text-green-400" size={20} />
          Tambah User Baru
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nama */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Nama Lengkap
              </label>
              <input
                type="text" name="name" value={dataForm.name}
                onChange={handleChange} placeholder="Nama lengkap"
                required disabled={loading}
                className={inputCls} style={inputStyle}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email" name="email" value={dataForm.email}
                onChange={handleChange} placeholder="email@contoh.com"
                required disabled={loading}
                className={inputCls} style={inputStyle}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                type="password" name="password" value={dataForm.password}
                onChange={handleChange} placeholder="Password"
                required disabled={loading}
                className={inputCls} style={inputStyle}
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Role
              </label>
              <select
                name="role" value={dataForm.role}
                onChange={handleChange} disabled={loading}
                className={inputCls} style={inputStyle}
              >
                <option value="user"    className="bg-garage-900">User</option>
                <option value="admin"   className="bg-garage-900">Admin</option>
                <option value="mekanik" className="bg-garage-900">Mekanik</option>
              </select>
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold
              rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-green-500/40 shadow-lg shadow-green-900/30"
          >
            {loading ? 'Mohon Tunggu...' : 'Tambah User'}
          </button>
        </form>
      </div>

      {/* ── Tabel Daftar User ── */}
      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(34,197,94,0.1)' }}>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            Daftar User
            <span className="text-xs font-normal text-gray-400 bg-white/5 px-2.5 py-1 rounded-full">
              {users.length} user
            </span>
          </h3>
        </div>

        {loading && <LoadingSpinner text="Memuat data user..." />}

        {!loading && users.length === 0 && !error && (
          <EmptyState text="Belum ada user. Tambah user pertama!" />
        )}

        {!loading && users.length === 0 && error && (
          <EmptyState text="Terjadi kesalahan. Coba lagi nanti." />
        )}

        {!loading && users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(34,197,94,0.1)' }}>
                  {['#', 'Nama', 'Email', 'Role', 'Aksi'].map((col) => (
                    <th
                      key={col}
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr
                    key={user.id}
                    className="transition-colors"
                    style={{ borderBottom: '1px solid rgba(34,197,94,0.06)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,197,94,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* No */}
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                      {index + 1}.
                    </td>

                    {/* Nama */}
                    <td className="px-6 py-4">
                      {editId === user.id ? (
                        <input
                          type="text" name="name" value={editForm.name}
                          onChange={handleEditChange}
                          className="w-full px-3 py-1.5 rounded-lg text-sm text-white outline-none focus:ring-2 focus:ring-green-500/30"
                          style={{ background: 'rgba(11,59,46,0.6)', border: '1px solid rgba(34,197,94,0.2)' }}
                        />
                      ) : (
                        <span className="text-sm font-semibold text-white">{user.name}</span>
                      )}
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4">
                      {editId === user.id ? (
                        <input
                          type="email" name="email" value={editForm.email}
                          onChange={handleEditChange}
                          className="w-full px-3 py-1.5 rounded-lg text-sm text-white outline-none focus:ring-2 focus:ring-green-500/30"
                          style={{ background: 'rgba(11,59,46,0.6)', border: '1px solid rgba(34,197,94,0.2)' }}
                        />
                      ) : (
                        <span className="text-sm text-gray-400">{user.email}</span>
                      )}
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      {editId === user.id ? (
                        <select
                          name="role" value={editForm.role}
                          onChange={handleEditChange}
                          className="w-full px-3 py-1.5 rounded-lg text-sm text-white outline-none focus:ring-2 focus:ring-green-500/30"
                          style={{ background: 'rgba(11,59,46,0.6)', border: '1px solid rgba(34,197,94,0.2)' }}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="mekanik">Mekanik</option>
                        </select>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${roleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {editId === user.id ? (
                          <>
                            <button
                              onClick={() => handleEditSave(user.id)}
                              disabled={loading}
                              title="Simpan"
                              className="w-8 h-8 rounded-lg flex items-center justify-center
                                text-green-400 hover:text-green-300 hover:bg-green-500/10 transition-all disabled:opacity-50"
                            >
                              <MdSave size={18} />
                            </button>
                            <button
                              onClick={handleEditCancel}
                              title="Batal"
                              className="w-8 h-8 rounded-lg flex items-center justify-center
                                text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all"
                            >
                              <MdClose size={18} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditStart(user)}
                              disabled={loading}
                              title="Edit"
                              className="w-8 h-8 rounded-lg flex items-center justify-center
                                text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all disabled:opacity-50"
                            >
                              <MdEdit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              disabled={loading}
                              title="Hapus"
                              className="w-8 h-8 rounded-lg flex items-center justify-center
                                text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all disabled:opacity-50"
                            >
                              <MdDelete size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
