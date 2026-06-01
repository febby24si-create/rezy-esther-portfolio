/**
 * Pagination — navigasi halaman untuk tabel data
 * Props:
 *   currentPage  — halaman aktif (1-based)
 *   totalPages   — total halaman
 *   onPageChange — callback(page: number)
 */
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  // Hitung range nomor halaman yang ditampilkan (maks 5)
  const getPageNumbers = () => {
    const delta = 2
    const start = Math.max(1, currentPage - delta)
    const end   = Math.min(totalPages, currentPage + delta)
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
    <div className="flex items-center justify-between mt-5 pt-4" style={{ borderTop: '1px solid rgba(34,197,94,0.08)' }}>
      <p className="text-xs text-gray-500">
        Halaman <span className="text-gray-300 font-medium">{currentPage}</span> dari{' '}
        <span className="text-gray-300 font-medium">{totalPages}</span>
      </p>

      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Halaman sebelumnya"
          className={`${btnBase} ${currentPage === 1 ? btnDisabled : btnInactive}`}
          style={{ border: '1px solid rgba(34,197,94,0.1)' }}
        >
          <MdChevronLeft size={16} />
        </button>

        {/* Nomor halaman */}
        {pageNumbers.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-label={`Halaman ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
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

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Halaman berikutnya"
          className={`${btnBase} ${currentPage === totalPages ? btnDisabled : btnInactive}`}
          style={{ border: '1px solid rgba(34,197,94,0.1)' }}
        >
          <MdChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
