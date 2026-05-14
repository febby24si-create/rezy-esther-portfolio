export default function Loading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50" style={{background:'#041C15'}}>
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full border-4 border-garage-700 border-t-green-400 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-garage-600 border-b-green-500 animate-spin" style={{animationDirection:'reverse'}}></div>
        </div>
      </div>
      <div className="text-center">
        <p className="text-green-400 font-display font-bold text-xl tracking-widest uppercase">EstherGarage</p>
        <p className="text-gray-500 text-sm mt-1 tracking-wider">Loading...</p>
      </div>
    </div>
  )
}
