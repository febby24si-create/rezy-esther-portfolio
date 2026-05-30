/**
 * ProductCard — rich product/service card
 * Props: image, title, category, price, description, badge, badgeVariant, onDetail
 */
import Card from './Card'
import Badge from './Badge'
import Button from './Button'
import { MdArrowForward, MdImage } from 'react-icons/md'

export default function ProductCard({
  image,
  title,
  category,
  price,
  description,
  badge,
  badgeVariant = 'info',
  onDetail,
}) {
  return (
    <Card hover padding="p-0" className="overflow-hidden flex flex-col">

      {/* Image area */}
      <div className="relative h-44 w-full overflow-hidden" style={{ background: '#06281F' }}>
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MdImage size={40} className="text-gray-600" />
          </div>
        )}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(4,28,21,0.7) 0%, transparent 60%)' }}
        />
        {category && (
          <div className="absolute top-3 left-3">
            <Badge variant={badgeVariant} size="sm">{category}</Badge>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-display font-bold text-white text-base leading-tight">{title}</h3>
            {badge && <Badge variant="success" size="sm" dot>{badge}</Badge>}
          </div>
          {description && (
            <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{description}</p>
          )}
        </div>

        <div
          className="flex items-center justify-between pt-4 mt-4"
          style={{ borderTop: '1px solid rgba(34,197,94,0.1)' }}
        >
          <div>
            <p className="text-xs text-gray-600 mb-0.5">Harga</p>
            <p className="font-display font-bold text-green-400 text-lg">{price}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={MdArrowForward}
            iconPosition="right"
            onClick={onDetail}
          >
            Detail
          </Button>
        </div>
      </div>
    </Card>
  )
}