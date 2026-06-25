export default function AlertBox({ type = "info", children }) {
  const styles = {
    success: { bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.3)',  text: '#86efac' },
    error:   { bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.3)',  text: '#fca5a5' },
    info:    { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', text: '#93c5fd' },
  }
  const s = styles[type] || styles.info

  return (
    <div
      className="px-4 py-3 rounded-2xl mb-4 text-sm font-medium"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.text }}
    >
      {children}
    </div>
  )
}
