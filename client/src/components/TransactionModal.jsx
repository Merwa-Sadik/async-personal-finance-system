import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other']
const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Housing', 'Health', 'Education', 'Shopping', 'Entertainment', 'Other']

const TransactionModal = ({ isOpen, onClose, onSave, editing, type }) => {
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  const empty = { description: '', category: categories[0], amount: '', date: '' }
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setForm(editing ? { ...editing } : empty)
    setErrors({})
  }, [editing, isOpen])

  const validate = () => {
    const e = {}
    if (!form.description.trim()) e.description = 'Description is required'
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = 'Enter a valid amount'
    if (!form.date) e.date = 'Date is required'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) return setErrors(e2)
    onSave({ ...form, amount: parseFloat(form.amount) })
    onClose()
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    setErrors((p) => ({ ...p, [name]: '' }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-[#1e3a5f]">
            {editing ? 'Edit' : 'Add'} {type === 'income' ? 'Income' : 'Expense'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Description</label>
            <input
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="e.g. Monthly salary"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#1e3a5f] transition ${errors.description ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#1e3a5f] transition"
            >
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Amount ($)</label>
            <input
              name="amount"
              type="number"
              min="0"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#1e3a5f] transition ${errors.amount ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Date</label>
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#1e3a5f] transition ${errors.date ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg text-sm hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" className="flex-1 bg-[#1e3a5f] hover:bg-[#16304f] text-white py-2.5 rounded-lg text-sm font-semibold transition">
              {editing ? 'Save Changes' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TransactionModal
