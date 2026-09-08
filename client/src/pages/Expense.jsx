import { useState, useMemo } from 'react'
import { Plus, TrendingDown } from 'lucide-react'
import TransactionModal from '../components/TransactionModal'
import TransactionTable from '../components/TransactionTable'

const SAMPLE = [
  { id: 1, description: 'Grocery Shopping', category: 'Food', amount: 150, date: '2025-01-03' },
  { id: 2, description: 'Monthly Rent', category: 'Housing', amount: 1200, date: '2025-01-05' },
  { id: 3, description: 'Bus Pass', category: 'Transport', amount: 60, date: '2025-01-07' },
  { id: 4, description: 'Gym Membership', category: 'Health', amount: 45, date: '2025-01-10' },
]

const Expense = () => {
  const [records, setRecords] = useState(SAMPLE)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterMonth, setFilterMonth] = useState('')

  const categories = ['All', ...new Set(records.map((r) => r.category))]

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchCat = filterCategory === 'All' || r.category === filterCategory
      const matchMonth = !filterMonth || r.date.startsWith(filterMonth)
      return matchCat && matchMonth
    })
  }, [records, filterCategory, filterMonth])

  const total = filtered.reduce((sum, r) => sum + r.amount, 0)

  const handleSave = (data) => {
    if (editing) {
      setRecords((p) => p.map((r) => (r.id === editing.id ? { ...data, id: r.id } : r)))
    } else {
      setRecords((p) => [...p, { ...data, id: Date.now() }])
    }
    setEditing(null)
  }

  const handleEdit = (item) => { setEditing(item); setModalOpen(true) }
  const handleDelete = (id) => setRecords((p) => p.filter((r) => r.id !== id))

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1e3a5f]">Expenses</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track all your spending</p>
          </div>
          <button
            onClick={() => { setEditing(null); setModalOpen(true) }}
            className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#16304f] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition"
          >
            <Plus size={16} /> Add Expense
          </button>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
            <TrendingDown size={22} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Expenses</p>
            <p className="text-2xl font-bold text-red-500">${total.toFixed(2)}</p>
            <p className="text-xs text-gray-400 mt-0.5">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-wrap gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#1e3a5f] transition"
          >
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#1e3a5f] transition"
          />
          {(filterCategory !== 'All' || filterMonth) && (
            <button
              onClick={() => { setFilterCategory('All'); setFilterMonth('') }}
              className="text-sm text-red-500 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <TransactionTable data={filtered} type="expense" onEdit={handleEdit} onDelete={handleDelete} />
        </div>
      </div>

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSave={handleSave}
        editing={editing}
        type="expense"
      />
    </div>
  )
}

export default Expense
