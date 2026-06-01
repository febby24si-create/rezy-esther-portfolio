import { useState } from 'react'
import {
  MdBusiness,
  MdPerson,
  MdLock,
  MdNotifications,
  MdSave,
} from 'react-icons/md'
import PageHeader from '../components/PageHeader'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile')

  const [profile, setProfile] = useState({
    name: 'Esther Admin',
    email: 'admin@esthergarage.id',
    phone: '0812-9999-0000',
  })

  const [business, setBusiness] = useState({
    name: 'EstherGarage',
    address: 'Jl. Otomotif No. 1, Jakarta',
    hours: '08:00 - 17:00',
  })

  const [security, setSecurity] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [notifications, setNotifications] = useState({
    orderBaru: true,
    servisSelesai: true,
    stokMenipis: false,
    laporanHarian: true,
  })

  const tabs = [
    { id: 'profile', icon: MdPerson, label: 'Profil' },
    { id: 'business', icon: MdBusiness, label: 'Bengkel' },
    { id: 'security', icon: MdLock, label: 'Keamanan' },
    { id: 'notif', icon: MdNotifications, label: 'Notifikasi' },
  ]

  const handleSaveProfile = () => {
    localStorage.setItem('eg_profile', JSON.stringify(profile))
    alert('Profil berhasil disimpan!')
  }

  const handleSaveBusiness = () => {
    localStorage.setItem('eg_business', JSON.stringify(business))
    alert('Data bengkel berhasil disimpan!')
  }

  const handleSaveSecurity = () => {
    if (security.newPassword !== security.confirmPassword) {
      alert('Konfirmasi password tidak cocok!')
      return
    }

    alert('Password berhasil diperbarui!')
    setSecurity({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
  }

  const handleSaveNotif = () => {
    localStorage.setItem(
      'eg_notifications',
      JSON.stringify(notifications)
    )
    alert('Pengaturan notifikasi berhasil disimpan!')
  }

  return (
    <div className="page-animate">
      <PageHeader title="Pengaturan" breadcrumb={['Pengaturan']} />

      <div className="glass-card overflow-hidden">
        {/* Tabs */}
        <div
          className="flex border-b"
          style={{ borderColor: 'rgba(34,197,94,0.1)' }}
        >
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all ${
                activeTab === id
                  ? 'text-green-400 border-b-2 border-green-400'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        <div className="p-6 max-w-xl">

          {/* PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold">
                Informasi Profil
              </h3>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Nama Lengkap
                </label>
                <input
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl text-white"
                  style={{
                    background: 'rgba(11,59,46,0.4)',
                    border: '1px solid rgba(34,197,94,0.12)',
                  }}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Email
                </label>
                <input
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      email: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl text-white"
                  style={{
                    background: 'rgba(11,59,46,0.4)',
                    border: '1px solid rgba(34,197,94,0.12)',
                  }}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Telepon
                </label>
                <input
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      phone: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl text-white"
                  style={{
                    background: 'rgba(11,59,46,0.4)',
                    border: '1px solid rgba(34,197,94,0.12)',
                  }}
                />
              </div>

              <button
                onClick={handleSaveProfile}
                className="btn-primary flex items-center gap-2"
              >
                <MdSave />
                Simpan Perubahan
              </button>
            </div>
          )}

          {/* BENGKEL */}
          {activeTab === 'business' && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold">
                Informasi Bengkel
              </h3>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Nama Bengkel
                </label>
                <input
                  value={business.name}
                  onChange={(e) =>
                    setBusiness({
                      ...business,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl text-white"
                  style={{
                    background: 'rgba(11,59,46,0.4)',
                    border: '1px solid rgba(34,197,94,0.12)',
                  }}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Alamat
                </label>
                <input
                  value={business.address}
                  onChange={(e) =>
                    setBusiness({
                      ...business,
                      address: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl text-white"
                  style={{
                    background: 'rgba(11,59,46,0.4)',
                    border: '1px solid rgba(34,197,94,0.12)',
                  }}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Jam Operasional
                </label>
                <input
                  value={business.hours}
                  onChange={(e) =>
                    setBusiness({
                      ...business,
                      hours: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl text-white"
                  style={{
                    background: 'rgba(11,59,46,0.4)',
                    border: '1px solid rgba(34,197,94,0.12)',
                  }}
                />
              </div>

              <button
                onClick={handleSaveBusiness}
                className="btn-primary flex items-center gap-2"
              >
                <MdSave />
                Simpan Perubahan
              </button>
            </div>
          )}

          {/* KEAMANAN */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold">
                Ubah Password
              </h3>

              <input
                type="password"
                placeholder="Password Lama"
                value={security.oldPassword}
                onChange={(e) =>
                  setSecurity({
                    ...security,
                    oldPassword: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl text-white"
                style={{
                  background: 'rgba(11,59,46,0.4)',
                  border: '1px solid rgba(34,197,94,0.12)',
                }}
              />

              <input
                type="password"
                placeholder="Password Baru"
                value={security.newPassword}
                onChange={(e) =>
                  setSecurity({
                    ...security,
                    newPassword: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl text-white"
                style={{
                  background: 'rgba(11,59,46,0.4)',
                  border: '1px solid rgba(34,197,94,0.12)',
                }}
              />

              <input
                type="password"
                placeholder="Konfirmasi Password Baru"
                value={security.confirmPassword}
                onChange={(e) =>
                  setSecurity({
                    ...security,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl text-white"
                style={{
                  background: 'rgba(11,59,46,0.4)',
                  border: '1px solid rgba(34,197,94,0.12)',
                }}
              />

              <button
                onClick={handleSaveSecurity}
                className="btn-primary flex items-center gap-2"
              >
                <MdSave />
                Ubah Password
              </button>
            </div>
          )}

          {/* NOTIFIKASI */}
          {activeTab === 'notif' && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold">
                Pengaturan Notifikasi
              </h3>

              {Object.entries(notifications).map(([key, value]) => (
                <label
                  key={key}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{
                    background: 'rgba(11,59,46,0.3)',
                    border: '1px solid rgba(34,197,94,0.1)',
                  }}
                >
                  <span className="text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>

                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() =>
                      setNotifications({
                        ...notifications,
                        [key]: !value,
                      })
                    }
                  />
                </label>
              ))}

              <button
                onClick={handleSaveNotif}
                className="btn-primary flex items-center gap-2"
              >
                <MdSave />
                Simpan Pengaturan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}