export default function GenericTable({ columns, data, renderRow }) {
  return (
    <table className="min-w-full divide-y divide-gray-200 overflow-hidden rounded-2xl shadow-lg">
      <thead className="bg-garage-800 text-white">
        <tr>
          {columns.map((col, idx) => (
            <th key={idx} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-100 text-sm text-gray-800">
        {data.map((item, index) => (
          <tr key={index} className="hover:bg-gray-50 transition-colors">
            {renderRow(item, index)}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
