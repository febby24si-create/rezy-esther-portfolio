import { useState } from 'react'
import { MdBusiness, MdPerson, MdLock, MdNotifications, MdSave } from 'react-icons/md'
import PageHeader from '../components/PageHeader'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile')
  const tabs = [
    { id:'profile', icon:MdPerson, label:'Profil' },
    { id:'business', icon:MdBusiness, label:'Bengkel' },
    { id:'security', icon:MdLock, label:'Keamanan' },
    { id:'notif', icon:MdNotifications, label:'Notifikasi' },
  ]

  return (
    <div className="page-animate">
      <PageHeader title="Pengaturan" breadcrumb={['Pengaturan']} />
      <div className="glass-card overflow-hidden">
        <div className="flex border-b" style={{borderColor:'rgba(34,197,94,0.1)'}}>
          {tabs.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all ${activeTab===id ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-500 hover:text-gray-300'}`}>
              <Icon size={16} />{label}
            </button>
          ))}
        </div>
        <div className="p-6 max-w-lg">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold mb-4">Informasi Profil</h3>
              {[{label:'Nama Lengkap',value:'Esther Admin'},{label:'Email',value:'admin@esthergarage.id'},{label:'Telepon',value:'0812-9999-0000'}].map(f=>(
                <div key={f.label}>
                  <label className="block text-sm text-gray-400 mb-1.5">{f.label}</label>
                  <input defaultValue={f.value} className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none" style={{background:'rgba(11,59,46,0.4)',border:'1px solid rgba(34,197,94,0.12)'}} />
                </div>
              ))}
              <button className="btn-primary flex items-center gap-2 text-sm mt-2"><MdSave size={16}/>Simpan Perubahan</button>
            </div>
          )}
          {activeTab === 'business' && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold mb-4">Informasi Bengkel</h3>
              {[{label:'Nama Bengkel',value:'EstherGarage'},{label:'Alamat',value:'Jl. Otomotif No. 1, Jakarta'},{label:'Jam Operasional',value:'08:00 - 17:00'}].map(f=>(
                <div key={f.label}>
                  <label className="block text-sm text-gray-400 mb-1.5">{f.label}</label>
                  <input defaultValue={f.value} className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none" style={{background:'rgba(11,59,46,0.4)',border:'1px solid rgba(34,197,94,0.12)'}} />
                </div>
              ))}
              <button className="btn-primary flex items-center gap-2 text-sm mt-2"><MdSave size={16}/>Simpan Perubahan</button>
            </div>
          )}
          {(activeTab === 'security' || activeTab === 'notif') && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🔧</div>
              <p className="text-gray-400">Fitur ini sedang dalam pengembangan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
