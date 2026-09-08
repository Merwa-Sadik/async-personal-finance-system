import { useState, useMemo } from 'react'
import { Plus, TrendingUp } from 'lucide-react'
import TransactionModal from '../components/TransactionModal'
import TransactionTable from '../components/TransactionTable'

const SAMPLE = [
  { id: 1, description: 'Monthly Salary', category: 'Salary', amount: 4500, date: '2025-01-01' },
  { id: 2, description: 'Freelance Project', category: 'Freelance', amount: 800, date: '2025-01-10' },
  { id: 3, description: 'Stock Dividends', category: 'Investment', amount: 320, date: '2025-01-15' },
]

const Income = () => {
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
            <h1 className="text-2xl font-bold text-[#1e3a5f]">Income</h1>
            <p className="text-sm text-gray-500 mt-0.5">Track all your income sources</p>
          </div>
          <button
            onClick={() => { setEditing(null); setModalOpen(true) }}
            className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#16304f] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition"
          >
            <Plus size={16} /> Add Income
          </button>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
            <TrendingUp size={22} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Income</p>
            <p className="text-2xl font-bold text-green-600">${total.toFixed(2)}</p>
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
          <TransactionTable data={filtered} type="income" onEdit={handleEdit} onDelete={handleDelete} />
        </div>
      </div>

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSave={handleSave}
        editing={editing}
        type="income"
      />
    </div>
  )
}

export default Income
