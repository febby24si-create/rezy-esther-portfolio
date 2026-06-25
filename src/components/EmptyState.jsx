import { MdInbox } from 'react-icons/md'

export default function EmptyState({ text = "Belum ada data" }) {
  return (
    <div className="p-10 text-center">
      <MdInbox className="mx-auto mb-3 text-gray-600" size={40} />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  )
}
