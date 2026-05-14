import { MdEngineering, MdStar, MdPhone, MdCheckCircle, MdSchedule } from 'react-icons/md'
import PageHeader from '../components/PageHeader'
import { mechanicsData } from '../data/dummy'

export default function Mechanics() {
  return (
    <div className="page-animate">
      <PageHeader title="Data Mekanik" breadcrumb={['Mekanik']} />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {mechanicsData.map((m, i) => (
          <div key={i} className="glass-card glass-card-hover p-5">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-display font-bold text-white flex-shrink-0" style={{background:'linear-gradient(135deg, #0B3B2E, #16A34A)'}}>
                {m.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold">{m.name}</h3>
                  <span className={`status-badge text-xs ${m.status === 'Tersedia' ? 'status-selesai' : 'status-proses'}`}>{m.status}</span>
                </div>
                <p className="text-green-400 text-xs mt-0.5">{m.specialty}</p>
              </div>
            </div>
            <div className="space-y-2 pt-3" style={{borderTop:'1px solid rgba(34,197,94,0.08)'}}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1.5"><MdSchedule size={14} />Pengalaman</span>
                <span className="text-white font-medium">{m.experience}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1.5"><MdStar size={14} />Rating</span>
                <span className="text-yellow-400 font-bold">⭐ {m.rating}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 flex items-center gap-1.5"><MdPhone size={14} />Telepon</span>
                <span className="text-gray-300 text-xs">{m.phone}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
