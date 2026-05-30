/**
 * Card — glass-morphism content wrapper
 * Props: children, hover, neon, padding, className
 */

export default function Card({
  children,
  hover = false,
  neon = false,
  padding = 'p-6',
  className = '',
}) {
  return (
    <div
      className={`
        glass-card
        ${padding}
        ${hover ? 'glass-card-hover cursor-pointer' : ''}
        ${neon ? 'neon-border' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}