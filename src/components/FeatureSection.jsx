/**
 * FeatureSection — grid of feature highlight cards
 * Props: title, subtitle, features[]
 */
import Card from './Card'

export default function FeatureSection({
  title    = 'Semua yang kamu butuhkan',
  subtitle = 'Fitur lengkap untuk manajemen bengkel profesional',
  features = [],
}) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <p className="text-xs text-green-500 font-semibold uppercase tracking-widest mb-1">Fitur Unggulan</p>
          <h2 className="font-display font-bold text-white text-2xl">{title}</h2>
        </div>
        {subtitle && (
          <p className="text-gray-500 text-sm max-w-xs text-right hidden sm:block">{subtitle}</p>
        )}
      </div>

      <hr className="section-divider" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map(({ icon: Icon, title: t, description, color = '34,197,94', tag }) => (
          <Card key={t} hover className="relative overflow-hidden group">
            {/* Hover glow */}
            <div
              className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: `radial-gradient(circle, rgba(${color},0.12) 0%, transparent 70%)` }}
            />

            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{
                background: `rgba(${color},0.12)`,
                border: `1px solid rgba(${color},0.25)`,
              }}
            >
              {Icon && <Icon size={20} style={{ color: `rgb(${color})` }} />}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-display font-bold text-white text-base">{t}</h3>
              {tag && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{
                    background: `rgba(${color},0.15)`,
                    color: `rgb(${color})`,
                    border: `1px solid rgba(${color},0.25)`,
                  }}
                >
                  {tag}
                </span>
              )}
            </div>

            <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}