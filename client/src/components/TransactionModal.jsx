import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const TransactionModal = ({ isOpen, onClose, onSave, onAddCategory, editing, type, categories }) => {
  const typeCategories = categories.filter((category) => category.type === type).map((category) => category.name)
  const fallbackCategory = type === 'income' ? 'Other' : 'Other'
  const categoryOptions = typeCategories.length
    ? [...typeCategories.filter((category) => category !== fallbackCategory), fallbackCategory]
    : [fallbackCategory]
  const empty = { description: '', category: categoryOptions[0], amount: '', date: '' }
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [newCategory, setNewCategory] = useState('')

  useEffect(() => {
    setForm(editing ? { ...editing } : empty)
    setErrors({})
    setNewCategory('')
  }, [editing, isOpen])

  const handleCategoryChange = (event) => {
    if (event.target.value !== '__new__') {
      handleChange(event)
      return
    }
    setNewCategory('')
    setForm((current) => ({ ...current, category: '__new__' }))
  }

  const saveNewCategory = async () => {
    const name = newCategory.trim()
    if (!name) return setErrors((current) => ({ ...current, category: 'Enter a category name' }))
    try {
      const created = await onAddCategory(name, type)
      setForm((current) => ({ ...current, category: created.name }))
      setNewCategory('')
      setErrors((current) => ({ ...current, category: '' }))
    } catch (error) {
      setErrors((current) => ({ ...current, category: error.response?.data?.message || error.message || 'Unable to add category' }))
    }
  }

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
              onChange={handleCategoryChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#1e3a5f] transition"
            >
                {categoryOptions.map((c) => <option key={c}>{c}</option>)}
              <option value="__new__">+ Add new category...</option>
            </select>
              {form.category === '__new__' && (
                <div className="flex gap-2 mt-2">
                  <input
                    value={newCategory}
                    onChange={(event) => setNewCategory(event.target.value)}
                    placeholder={`Enter ${type} category name`}
                    autoFocus
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                  />
                  <button type="button" onClick={saveNewCategory} className="rounded-lg bg-[#1e3a5f] px-3 py-2 text-sm font-semibold text-white">Save</button>
                </div>
              )}
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
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
