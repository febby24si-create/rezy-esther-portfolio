/**
 * InputField — themed text input
 * Props: label, id, type, placeholder, value, onChange, icon, error, required, disabled, hint
 */

export default function InputField({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon: Icon,
  error,
  required = false,
  disabled = false,
  hint,
  className = '',
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-400">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon size={16} className={error ? 'text-red-400' : 'text-gray-500'} />
          </div>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`
            w-full py-2.5 rounded-xl text-sm text-white outline-none
            transition-all duration-200 placeholder:text-gray-600
            disabled:opacity-50 disabled:cursor-not-allowed
            ${Icon ? 'pl-10 pr-4' : 'px-4'}
            ${error
              ? 'border border-red-500/50 bg-red-500/5 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.08)]'
              : 'border focus:border-green-500/50 focus:shadow-[0_0_0_3px_rgba(34,197,94,0.06)]'
            }
          `}
          style={error ? {} : {
            background: 'rgba(11,59,46,0.4)',
            borderColor: 'rgba(34,197,94,0.18)',
          }}
        />
      </div>

      {hint && !error && (
        <p className="text-xs text-gray-600">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}