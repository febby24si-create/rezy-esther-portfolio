export default function PageHeader({ title, breadcrumb, children }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          <span className="text-green-500">EstherGarage</span>
          <span>/</span>
          {breadcrumb && breadcrumb.map((b, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span>/</span>}
              <span className={i === breadcrumb.length - 1 ? 'text-gray-300' : 'text-gray-500'}>{b}</span>
            </span>
          ))}
        </div>
        <h1 className="text-2xl font-display font-bold text-white tracking-wide">{title}</h1>
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  )
}
