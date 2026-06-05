import { MdCheckCircle, MdRadioButtonChecked, MdRadioButtonUnchecked } from 'react-icons/md'

export default function TimelineStep({ step, isLast = false }) {
  const { label, time, done, active, note } = step

  return (
    <div className="flex gap-4">
      {/* Left: icon + line */}
      <div className="flex flex-col items-center">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all ${
          done && !active
            ? 'bg-green-500/20 border-2 border-green-500'
            : active
            ? 'bg-green-500 shadow-lg shadow-green-500/40'
            : 'bg-white/5 border-2 border-white/15'
        }`}>
          {done && !active
            ? <MdCheckCircle className="text-green-400 text-lg" />
            : active
            ? <MdRadioButtonChecked className="text-white text-lg animate-pulse" />
            : <MdRadioButtonUnchecked className="text-gray-600 text-lg" />
          }
        </div>
        {!isLast && (
          <div className={`w-0.5 flex-1 mt-1 min-h-[40px] ${done ? 'bg-green-500/30' : 'bg-white/8'}`} />
        )}
      </div>

      {/* Right: content */}
      <div className="pb-6 flex-1">
        <div className="flex items-center justify-between mb-0.5">
          <span className={`font-semibold text-sm ${done || active ? 'text-white' : 'text-gray-500'}`}>
            {label}
          </span>
          {time !== '—' && (
            <span className={`text-xs font-mono ${done ? 'text-green-400' : 'text-gray-600'}`}>{time}</span>
          )}
        </div>
        {active && (
          <span className="inline-flex items-center gap-1 text-xs text-green-400 font-semibold bg-green-500/10 px-2 py-0.5 rounded-full mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
            Sedang berjalan
          </span>
        )}
        {note && <p className="text-gray-500 text-xs leading-relaxed">{note}</p>}
      </div>
    </div>
  )
}