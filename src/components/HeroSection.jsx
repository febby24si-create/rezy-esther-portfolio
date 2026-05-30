/**
 * HeroSection — landing banner dengan stats grid
 * Props: title, titleAccent, subtitle, description, stats, primaryLabel, secondaryLabel, onPrimary, onSecondary
 */
import { MdArrowForward, MdBuild } from 'react-icons/md'
import Button from './Button'

export default function HeroSection({
  title          = 'Kelola Bengkel',
  titleAccent    = 'Lebih Efisien',
  subtitle       = 'Platform Manajemen Bengkel Modern',
  description    = 'Pantau order servis, kelola pelanggan, track mekanik, dan analisis laporan — semua dalam satu dashboard terintegrasi.',
  stats          = [],
  primaryLabel   = 'Mulai Sekarang',
  secondaryLabel = 'Lihat Demo',
  onPrimary,
  onSecondary,
}) {
  return (
    <section
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #041C15 0%, #0B3B2E 50%, #06281F 100%)',
        border: '1px solid rgba(34,197,94,0.15)',
        minHeight: 280,
      }}
    >
      {/* Grid texture */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(34,197,94,1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Glow orbs */}
      <div
        className="absolute -top-12 -right-12 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-16 -left-8 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)' }}
      />

      {/* Top neon line */}
      <div
        className="absolute top-0 left-1/4 right-1/4 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.5), transparent)' }}
      />

      <div className="relative z-10 px-8 py-10 flex flex-col lg:flex-row gap-10 items-start lg:items-center justify-between">

        {/* Text */}
        <div className="flex-1 max-w-xl">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-green-400 mb-5"
            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}
          >
            <MdBuild size={13} />
            {subtitle}
          </div>

          <h1
            className="font-display font-bold text-white leading-tight mb-4"
            style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}
          >
            {title}{' '}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #22C55E, #4ade80)' }}
            >
              {titleAccent}
            </span>
          </h1>

          <p className="text-gray-400 text-sm leading-relaxed mb-7 max-w-md">
            {description}
          </p>

          <div className="flex flex-wrap gap-3">
            <Button variant="primary" size="md" icon={MdArrowForward} iconPosition="right" onClick={onPrimary}>
              {primaryLabel}
            </Button>
            <Button variant="secondary" size="md" onClick={onSecondary}>
              {secondaryLabel}
            </Button>
          </div>
        </div>

        {/* Stats grid */}
        {stats.length > 0 && (
          <div className="grid grid-cols-2 gap-3 w-full lg:w-auto lg:min-w-[240px]">
            {stats.map(({ label, value, icon: Icon, color = '34,197,94' }) => (
              <div
                key={label}
                className="rounded-xl p-4"
                style={{
                  background: `rgba(${color},0.07)`,
                  border: `1px solid rgba(${color},0.18)`,
                }}
              >
                {Icon && <Icon size={18} style={{ color: `rgb(${color})` }} className="mb-2" />}
                <p className="font-display font-bold text-xl" style={{ color: `rgb(${color})` }}>
                  {value}
                </p>
                <p className="text-gray-500 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}