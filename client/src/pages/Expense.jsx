import { useMemo, useState } from 'react'
import { Plus, TrendingDown } from 'lucide-react'
import TransactionModal from '../components/TransactionModal'
import TransactionTable from '../components/TransactionTable'
import { useFinance } from '../context/FinanceContext'
import { transactionsApi } from '../services/api'
import { categoriesApi } from '../services/api'

const Expense = () => {
  const { expenses, setExpenses, categories, setCategories } = useFinance()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterMonth, setFilterMonth] = useState('')

  const filterCategories = ['All', ...new Set(expenses.map((r) => r.category))]

  const filtered = useMemo(() => {
    return expenses.filter((r) => {
      const matchCat = filterCategory === 'All' || r.category === filterCategory
      const matchMonth = !filterMonth || r.date.startsWith(filterMonth)
      return matchCat && matchMonth
    })
  }, [expenses, filterCategory, filterMonth])

  const total = filtered.reduce((sum, r) => sum + r.amount, 0)

  const handleSave = async (data) => {
    const payload = { ...data, type: 'expense' }
    const response = editing
      ? await transactionsApi.update(editing.id, payload)
      : await transactionsApi.create(payload)
    const saved = { ...response.data, amount: Number(response.data.amount) }
    if (editing) setExpenses((p) => p.map((r) => (r.id === editing.id ? saved : r)))
    else setExpenses((p) => [saved, ...p])
    setEditing(null)
  }

  const handleEdit = (item) => { setEditing(item); setModalOpen(true) }
  const handleDelete = async (id) => {
    await transactionsApi.remove(id)
    setExpenses((p) => p.filter((r) => r.id !== id))
  }

  const handleAddCategory = async (name, type) => {
    if (categories.some((category) => category.type === type && category.name.toLowerCase() === name.toLowerCase())) {
      throw new Error('This expense category already exists')
    }
    const response = await categoriesApi.create({ name, type })
    setCategories((current) => [...current, response.data])
    return response.data
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
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

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center gap-5">
        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
          <TrendingDown size={22} className="text-red-500" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Total Expenses</p>
          <p className="text-2xl font-bold text-red-500">{total.toLocaleString()} ETB</p>
          <p className="text-xs text-gray-400 mt-0.5">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-wrap gap-3">
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#1e3a5f] transition">
          {filterCategories.map((c) => <option key={c}>{c}</option>)}
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
        <TransactionTable data={filtered} type="expense" onEdit={handleEdit} onDelete={handleDelete} />
      </div>

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSave={handleSave}
        editing={editing}
        type="expense"
        categories={categories}
        onAddCategory={handleAddCategory}
      />
    </div>
  )
}

export default Expense
