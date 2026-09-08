import { Pencil, Trash2 } from 'lucide-react'

const TransactionTable = ({ data, type, onEdit, onDelete }) => {
  if (data.length === 0)
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        No {type === 'income' ? 'income' : 'expense'} records yet. Click "Add" to get started.
      </div>
    )

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <th className="pb-3 pr-4">Description</th>
            <th className="pb-3 pr-4">Category</th>
            <th className="pb-3 pr-4">Date</th>
            <th className="pb-3 pr-4 text-right">Amount</th>
            <th className="pb-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 transition">
              <td className="py-3 pr-4 text-gray-800 font-medium">{item.description}</td>
              <td className="py-3 pr-4">
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  {item.category}
                </span>
              </td>
              <td className="py-3 pr-4 text-gray-500">{item.date}</td>
              <td className={`py-3 pr-4 text-right font-semibold ${type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                {type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
              </td>
              <td className="py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg text-gray-400 hover:text-[#1e3a5f] hover:bg-gray-100 transition">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TransactionTable
