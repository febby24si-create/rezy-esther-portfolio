export default function PageHeader({
  title,
  breadcrumb = [],
  children,
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        {breadcrumb.length > 0 && (
          <div className="flex items-center gap-2 mb-1 text-xs text-gray-500">
            {breadcrumb.map((item, index) => (
              <span key={index} className="flex items-center gap-2">
                {index > 0 && <span>/</span>}
                <span
                  className={
                    index === breadcrumb.length - 1
                      ? 'text-gray-300'
                      : 'text-gray-500'
                  }
                >
                  {item}
                </span>
              </span>
            ))}
          </div>
        )}

        <h1 className="text-2xl font-display font-bold tracking-wide text-white">
          {title}
        </h1>
      </div>

      {children && (
        <div className="flex items-center gap-3">
          {children}
        </div>
      )}
    </div>
  )
}