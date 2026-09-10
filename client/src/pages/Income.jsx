import { useMemo, useState } from 'react'
import { Plus, TrendingUp } from 'lucide-react'
import TransactionModal from '../components/TransactionModal'
import TransactionTable from '../components/TransactionTable'
import { useFinance } from '../context/FinanceContext'

const Income = () => {
  const { income, setIncome } = useFinance()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterMonth, setFilterMonth] = useState('')

  const categories = ['All', ...new Set(income.map((r) => r.category))]

  const filtered = useMemo(() => {
    return income.filter((r) => {
      const matchCat = filterCategory === 'All' || r.category === filterCategory
      const matchMonth = !filterMonth || r.date.startsWith(filterMonth)
      return matchCat && matchMonth
    })
  }, [income, filterCategory, filterMonth])

  const total = filtered.reduce((sum, r) => sum + r.amount, 0)

  const handleSave = (data) => {
    if (editing) {
      setIncome((p) => p.map((r) => (r.id === editing.id ? { ...data, id: r.id } : r)))
    } else {
      setIncome((p) => [...p, { ...data, id: Date.now() }])
    }
    setEditing(null)
  }

  const handleEdit = (item) => { setEditing(item); setModalOpen(true) }
  const handleDelete = (id) => setIncome((p) => p.filter((r) => r.id !== id))

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
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

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center gap-5">
        <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
          <TrendingUp size={22} className="text-green-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Income</p>
          <p className="text-2xl font-bold text-green-600">{total.toLocaleString()} ETB</p>
          <p className="text-xs text-gray-400 mt-0.5">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-wrap gap-3">
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#1e3a5f] transition">
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
        <input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#1e3a5f] transition" />
        {(filterCategory !== 'All' || filterMonth) && (
          <button onClick={() => { setFilterCategory('All'); setFilterMonth('') }} className="text-sm text-red-500 hover:underline">
            Clear filters
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <TransactionTable data={filtered} type="income" onEdit={handleEdit} onDelete={handleDelete} />
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
