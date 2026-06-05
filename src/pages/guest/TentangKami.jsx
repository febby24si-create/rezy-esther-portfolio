import { bengkelProfile, mechanics } from '../../data/guestData'
import { MdStar, MdVerified, MdBuild } from 'react-icons/md'

export default function TentangKami() {
  return (
    <div className="pt-16" style={{ background: '#020f09' }}>

      {/* Hero */}
      <section className="relative py-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(34,197,94,0.1) 0%, transparent 60%), #020f09' }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <p className="text-green-400 text-sm font-semibold uppercase tracking-widest mb-3">Tentang Kami</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5">
            Bengkel Modern <span className="text-green-400">Sejak 2015</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">{bengkelProfile.description}</p>
        </div>
      </section>

      {/* Visi Misi */}
      <section className="py-16 px-4 sm:px-6" style={{ background: '#041C15' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-2xl p-7 border" style={{ borderColor: 'rgba(34,197,94,0.15)', background: 'rgba(34,197,94,0.04)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <MdStar className="text-green-400 text-xl" />
              </div>
              <h2 className="text-white font-bold text-xl">Visi Kami</h2>
            </div>
            <p className="text-gray-300 leading-relaxed">{bengkelProfile.visi}</p>
          </div>
          <div className="rounded-2xl p-7 border" style={{ borderColor: 'rgba(34,197,94,0.15)', background: 'rgba(34,197,94,0.04)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <MdBuild className="text-green-400 text-xl" />
              </div>
              <h2 className="text-white font-bold text-xl">Misi Kami</h2>
            </div>
            <ul className="space-y-2.5">
              {bengkelProfile.misi.map((m, i) => (
                <li key={i} className="flex items-start gap-2.5 text-gray-300 text-sm">
                  <span className="text-green-400 font-bold mt-0.5 flex-shrink-0">✓</span>
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Milestone / Sejarah */}
      <section className="py-16 px-4 sm:px-6" style={{ background: '#020f09' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-white text-center mb-10">Perjalanan Esther</h2>
          <div className="space-y-0">
            {bengkelProfile.milestones.map((m, i) => (
              <div key={m.year} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center flex-shrink-0">
                    <span className="w-2 h-2 rounded-full bg-green-400"></span>
                  </div>
                  {i < bengkelProfile.milestones.length - 1 && (
                    <div className="w-0.5 flex-1 bg-green-500/15 min-h-[40px]" />
                  )}
                </div>
                <div className="pb-8">
                  <span className="text-green-400 font-bold text-lg">{m.year}</span>
                  <p className="text-gray-300 text-sm mt-1">{m.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tim Mekanik */}
      <section className="py-16 px-4 sm:px-6" style={{ background: '#041C15' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-extrabold text-white text-center mb-10">Tim Mekanik Kami</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {mechanics.map((m) => (
              <div key={m.id} className="rounded-2xl p-6 text-center border transition-all hover:-translate-y-1"
                style={{ background: 'rgba(34,197,94,0.04)', borderColor: 'rgba(34,197,94,0.12)' }}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400/20 to-emerald-600/20 border border-green-500/20 flex items-center justify-center text-2xl font-bold text-green-400 mx-auto mb-4">
                  {m.name.split(' ').map(w => w[0]).slice(0,2).join('')}
                </div>
                <h3 className="text-white font-bold text-sm">{m.name}</h3>
                <p className="text-green-400 text-xs mb-1">{m.role}</p>
                <p className="text-gray-500 text-xs mb-3">{m.specialty} · {m.exp}</p>
                <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">{m.cert}</span>
                <div className="flex items-center justify-center gap-1 mt-3">
                  <MdStar className="text-yellow-400 text-sm" />
                  <span className="text-white text-sm font-bold">{m.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sertifikasi */}
      <section className="py-16 px-4 sm:px-6" style={{ background: '#020f09' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-extrabold text-white mb-8">Sertifikasi & Penghargaan</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {bengkelProfile.certifications.map((c) => (
              <div key={c} className="flex items-center gap-2 px-5 py-3 rounded-xl border"
                style={{ background: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.15)' }}>
                <MdVerified className="text-green-400 text-lg" />
                <span className="text-white font-semibold text-sm">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}