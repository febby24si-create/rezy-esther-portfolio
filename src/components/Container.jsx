/**
 * Container — responsive layout wrapper
 * Props: children, glass, className, maxWidth
 */

export default function Container({
  children,
  glass = false,
  className = '',
  maxWidth = 'max-w-7xl',
}) {
  return (
    <div
      className={`
        w-full ${maxWidth} mx-auto px-4 sm:px-6 lg:px-8
        ${glass ? 'glass-card p-6' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}