/**
 * TextArea — multi-line input with char counter
 * Props: label, id, placeholder, value, onChange, error, rows, maxLength, required, disabled
 */

export default function TextArea({
  label,
  id,
  placeholder,
  value = '',
  onChange,
  error,
  rows = 4,
  maxLength,
  required = false,
  disabled = false,
  className = '',
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="block text-sm font-medium text-gray-400">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
          {maxLength && (
            <span className={`text-xs ${value.length > maxLength * 0.9 ? 'text-yellow-400' : 'text-gray-600'}`}>
              {value.length}/{maxLength}
            </span>
          )}
        </div>
      )}

      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        className={`
          w-full px-4 py-3 rounded-xl text-sm text-white outline-none
          transition-all duration-200 resize-none placeholder:text-gray-600
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error
            ? 'border border-red-500/50 bg-red-500/5 focus:border-red-400'
            : 'border focus:border-green-500/50 focus:shadow-[0_0_0_3px_rgba(34,197,94,0.06)]'
          }
        `}
        style={error ? {} : {
          background: 'rgba(11,59,46,0.4)',
          borderColor: 'rgba(34,197,94,0.18)',
        }}
      />

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}