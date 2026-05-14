import { Link } from 'react-router-dom'
import { MdArrowBack, MdHome } from 'react-icons/md'

const errorInfo = {
  '400': { title: 'Bad Request', desc: 'Permintaan tidak valid atau tidak dapat diproses oleh server.', icon: '⚠️' },
  '401': { title: 'Unauthorized', desc: 'Anda belum terautentikasi. Silakan login terlebih dahulu.', icon: '🔐' },
  '403': { title: 'Forbidden', desc: 'Anda tidak memiliki izin untuk mengakses halaman ini.', icon: '🚫' },
  '404': { title: 'Not Found', desc: 'Halaman yang Anda cari tidak dapat ditemukan.', icon: '🔍' },
}

export default function ErrorPage({ code = '404', message, description }) {
  const info = errorInfo[code] || errorInfo['404']
  return (
    <div className="page-animate flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="relative mb-6">
        <div className="text-8xl font-display font-black text-transparent select-none" style={{WebkitTextStroke:'2px rgba(34,197,94,0.3)'}}>
          {code}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-4xl">{info.icon}</div>
        </div>
      </div>
      <div className="mb-2 inline-block px-4 py-1.5 rounded-full text-sm font-semibold text-green-400" style={{background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.2)'}}>
        Error {code}
      </div>
      <h2 className="text-2xl font-display font-bold text-white mt-3 mb-2">{message || info.title}</h2>
      <p className="text-gray-400 mb-8 max-w-sm text-sm leading-relaxed">{description || info.desc}</p>
      <div className="flex gap-3">
        <Link to="/" className="btn-primary flex items-center gap-2 text-sm">
          <MdHome size={18} /> Kembali ke Dashboard
        </Link>
        <button onClick={() => window.history.back()} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-gray-400 transition-all hover:text-white" style={{border:'1px solid rgba(34,197,94,0.15)'}}>
          <MdArrowBack size={18} /> Halaman Sebelumnya
        </button>
      </div>
      <div className="mt-12 w-64 h-1 rounded-full opacity-20" style={{background:'linear-gradient(90deg, transparent, #22C55E, transparent)'}}></div>
    </div>
  )
}
