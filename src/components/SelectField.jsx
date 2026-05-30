/**
 * SelectField — themed native select
 * Props: label, id, value, onChange, options, error, placeholder, required, disabled
 */
import { MdKeyboardArrowDown } from 'react-icons/md'

export default function SelectField({
  label,
  id,
  value,
  onChange,
  options = [],
  error,
  placeholder = 'Pilih opsi...',
  required = false,
  disabled = false,
  className = '',
}) {
  const normalized = options.map(o =>
    typeof o === 'string' ? { value: o, label: o } : o
  )

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-400">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`
            w-full px-4 py-2.5 pr-10 rounded-xl text-sm outline-none
            appearance-none cursor-pointer transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${!value ? 'text-gray-600' : 'text-white'}
            ${error
              ? 'border border-red-500/50 bg-red-500/5 focus:border-red-400'
              : 'border focus:border-green-500/50 focus:shadow-[0_0_0_3px_rgba(34,197,94,0.06)]'
            }
          `}
          style={error ? {} : {
            background: 'rgba(11,59,46,0.4)',
            borderColor: 'rgba(34,197,94,0.18)',
          }}
        >
          <option value="" disabled style={{ background: '#041C15', color: '#6b7280' }}>
            {placeholder}
          </option>
          {normalized.map(({ value: v, label: l }) => (
            <option key={v} value={v} style={{ background: '#041C15', color: '#e2e8f0' }}>
              {l}
            </option>
          ))}
        </select>

        <MdKeyboardArrowDown
          size={18}
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"
        />
      </div>

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}