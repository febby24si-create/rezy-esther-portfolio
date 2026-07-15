// ============================================================
// AddressCard.jsx
// Card satu saved address dengan aksi Edit/Delete/Default
// ============================================================
import { motion } from 'framer-motion'
import { MdEdit, MdDelete, MdCheckCircle, MdStar } from 'react-icons/md'
import { ADDRESS_TYPES } from '../../lib/deliveryEngine'

export default function AddressCard({ address, selected, onSelect, onEdit, onDelete, onSetDefault }) {
  const typeInfo = ADDRESS_TYPES[address.type] || ADDRESS_TYPES.lainnya

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -1 }}
      onClick={() => onSelect?.(address)}
      className="relative cursor-pointer rounded-2xl p-4 transition-all"
      style={{
        background: selected
          ? 'rgba(34,197,94,0.1)'
          : 'rgba(255,255,255,0.03)',
        border: selected
          ? '1.5px solid rgba(34,197,94,0.4)'
          : '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Selected check */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3"
        >
          <MdCheckCircle className="text-green-400" size={20} />
        </motion.div>
      )}

      <div className="flex items-start gap-3 pr-6">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: `${typeInfo.color}18`, border: `1px solid ${typeInfo.color}30` }}>
          {typeInfo.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-white font-bold text-sm">{address.label || typeInfo.label}</p>
            {address.is_default && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold text-amber-400"
                style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)' }}>
                <MdStar size={10} />Default
              </span>
            )}
          </div>
          <p className="text-gray-300 text-xs leading-relaxed line-clamp-2">{address.full_address || address.address}</p>
          {address.recipient_name && (
            <p className="text-gray-500 text-xs mt-1">📞 {address.recipient_name} · {address.phone}</p>
          )}
          {address.notes && (
            <p className="text-gray-600 text-xs mt-0.5 italic">"{address.notes}"</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
        {!address.is_default && (
          <button
            onClick={e => { e.stopPropagation(); onSetDefault?.(address) }}
            className="flex-1 py-1.5 rounded-lg text-xs text-amber-400 hover:bg-amber-400/10 transition-colors"
          >
            ⭐ Set Default
          </button>
        )}
        <button
          onClick={e => { e.stopPropagation(); onEdit?.(address) }}
          className="flex-1 py-1.5 rounded-lg text-xs text-blue-400 hover:bg-blue-400/10 transition-colors flex items-center justify-center gap-1"
        >
          <MdEdit size={12} /> Edit
        </button>
        <button
          onClick={e => { e.stopPropagation(); onDelete?.(address) }}
          className="flex-1 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-400/10 transition-colors flex items-center justify-center gap-1"
        >
          <MdDelete size={12} /> Hapus
        </button>
      </div>
    </motion.div>
  )
}
