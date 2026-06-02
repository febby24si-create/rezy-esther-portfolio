import { MdChevronLeft, MdChevronRight } from 'react-icons/md'

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const delta = 2
    const start = Math.max(1, currentPage - delta)
    const end = Math.min(totalPages, currentPage + delta)
    const pages = []
    for (let i = start; i <= end; i++) pages.push(i)
    return pages
  }

  const pageNumbers = getPageNumbers()

  const btnBase = 'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all'
  const btnActive = 'text-white font-bold'
  const btnInactive = 'text-gray-400 hover:text-white hover:bg-white/5'
  const btnDisabled = 'text-gray-600 cursor-not-allowed opacity-40'

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${btnBase} ${currentPage === 1 ? btnDisabled : btnInactive}`}
        style={{ border: '1px solid rgba(34,197,94,0.1)' }}
      >
        <MdChevronLeft size={16} />
      </button>

      {pageNumbers.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`${btnBase} ${page === currentPage ? btnActive : btnInactive}`}
          style={
            page === currentPage
              ? { background: 'linear-gradient(135deg,#16A34A,#22C55E)', border: '1px solid rgba(34,197,94,0.3)' }
              : { border: '1px solid rgba(34,197,94,0.1)' }
          }
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${btnBase} ${currentPage === totalPages ? btnDisabled : btnInactive}`}
        style={{ border: '1px solid rgba(34,197,94,0.1)' }}
      >
        <MdChevronRight size={16} />
      </button>
    </div>
  )
}