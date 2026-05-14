import { Outlet, Link } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{background:'linear-gradient(135deg, #020f09 0%, #041C15 50%, #06281F 100%)'}}>
      {/* Background fx */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10" style={{background:'radial-gradient(circle, #22C55E, transparent)'}}></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10" style={{background:'radial-gradient(circle, #16A34A, transparent)'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-5" style={{background:'radial-gradient(circle, #22C55E, transparent)'}}></div>
        {/* Grid lines */}
        <div className="absolute inset-0" style={{backgroundImage:'linear-gradient(rgba(34,197,94,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.03) 1px, transparent 1px)', backgroundSize:'60px 60px'}}></div>
      </div>
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center neon-border" style={{background:'linear-gradient(135deg, #0B3B2E, #06281F)'}}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <div>
              <p className="text-xl font-display font-bold text-white tracking-widest">ESTHER<span className="text-green-400">GARAGE</span></p>
              <p className="text-xs text-gray-500 tracking-widest uppercase">Bengkel Terpercaya</p>
            </div>
          </Link>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
