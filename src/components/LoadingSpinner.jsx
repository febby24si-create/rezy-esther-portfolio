export default function LoadingSpinner({ text = "Loading..." }) {
  return (
    <div className="p-10 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500/20 border-t-green-400 mx-auto mb-3" />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  )
}
