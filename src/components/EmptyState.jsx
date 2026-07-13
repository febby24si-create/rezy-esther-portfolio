import { MdInbox } from 'react-icons/md';

export default function EmptyState({ 
  icon: Icon = MdInbox, 
  title, 
  description, 
  text = "Belum ada data", 
  actionLabel, 
  onAction 
}) {
  const displayTitle = title || text;
  
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center w-full">
      <div className="w-20 h-20 bg-garage-800/80 rounded-full flex items-center justify-center mb-6 shadow-inner border border-garage-700/50">
        <Icon className="text-emerald-500/80" size={40} />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">{displayTitle}</h3>
      {description && (
        <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-medium rounded-xl shadow-lg shadow-emerald-900/20 transition-all duration-200 active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
