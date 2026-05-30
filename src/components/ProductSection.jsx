/**
 * ProductSection — responsive product/service grid
 * Props: title, subtitle, products[], columns, onDetail
 */
import ProductCard from './ProductCard'

const COL_MAP = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

export default function ProductSection({
  title    = 'Layanan Kami',
  subtitle = 'Pilih layanan bengkel terbaik untuk kendaraan Anda',
  products = [],
  columns  = 3,
  onDetail,
}) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <p className="text-xs text-green-500 font-semibold uppercase tracking-widest mb-1">Katalog</p>
          <h2 className="font-display font-bold text-white text-2xl">{title}</h2>
        </div>
        {subtitle && (
          <p className="text-gray-500 text-sm max-w-xs text-right hidden sm:block">{subtitle}</p>
        )}
      </div>

      <hr className="section-divider" />

      {products.length === 0 ? (
        <div
          className="text-center py-16 rounded-xl"
          style={{ border: '1px dashed rgba(34,197,94,0.15)', background: 'rgba(34,197,94,0.02)' }}
        >
          <p className="text-gray-600 text-sm">Belum ada produk tersedia.</p>
        </div>
      ) : (
        <div className={`grid grid-cols-1 ${COL_MAP[columns] ?? COL_MAP[3]} gap-5`}>
          {products.map((product, i) => (
            <ProductCard key={i} {...product} onDetail={() => onDetail?.(product)} />
          ))}
        </div>
      )}
    </section>
  )
}