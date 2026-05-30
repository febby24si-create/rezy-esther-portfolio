/**
 * Table — responsive data table
 * Exports: Table (default), TableRow, Td
 */

export default function Table({ headers = [], children, emptyMessage = 'Tidak ada data.' }) {
  return (
    <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(34,197,94,0.12)' }}>
      <table className="w-full min-w-max">
        <thead>
          <tr style={{ background: 'rgba(11,59,46,0.5)', borderBottom: '1px solid rgba(34,197,94,0.15)' }}>
            {headers.map((h, i) => (
              <th
                key={i}
                className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children || (
            <tr>
              <td colSpan={headers.length} className="text-center py-12 text-gray-600 text-sm">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export function TableRow({ children, onClick }) {
  return (
    <tr
      onClick={onClick}
      className="transition-colors duration-150"
      style={{ borderBottom: '1px solid rgba(34,197,94,0.07)' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(34,197,94,0.04)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {children}
    </tr>
  )
}

export function Td({ children, className = '' }) {
  return (
    <td className={`px-5 py-3.5 text-sm text-gray-300 whitespace-nowrap ${className}`}>
      {children}
    </td>
  )
}