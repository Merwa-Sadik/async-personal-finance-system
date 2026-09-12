import { useFinance } from '../context/FinanceContext'

const Reports = () => {
  const { income, expenses, budgets } = useFinance()
  const totalIncome = income.reduce((sum, item) => sum + Number(item.amount), 0)
  const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0)
  const categories = [...new Set(expenses.map((item) => item.category))].map((category) => ({ category, total: expenses.filter((item) => item.category === category).reduce((sum, item) => sum + Number(item.amount), 0) })).sort((left, right) => right.total - left.total)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div><h1 className="text-2xl font-bold text-[#1e3a5f]">Reports</h1><p className="text-sm text-gray-500 mt-0.5">Understand your financial performance</p></div>
      <div className="grid gap-4 md:grid-cols-3">
        {[['Total income', totalIncome, 'text-green-600'], ['Total expenses', totalExpenses, 'text-red-500'], ['Balance', totalIncome - totalExpenses, 'text-[#1e3a5f]']].map(([label, value, color]) => <div key={label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"><p className="text-sm text-gray-500">{label}</p><p className={`text-2xl font-bold mt-2 ${color}`}>{Number(value).toLocaleString()} ETB</p></div>)}
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"><h2 className="font-bold text-[#1e3a5f] mb-4">Spending by category</h2>{categories.length ? categories.map(({ category, total }) => <div key={category} className="flex justify-between border-b border-gray-100 py-3 text-sm"><span>{category}</span><strong>{total.toLocaleString()} ETB</strong></div>) : <p className="text-gray-400 py-6 text-center">No expense data found</p>}</div>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"><h2 className="font-bold text-[#1e3a5f] mb-4">Budget overview</h2><p className="text-sm text-gray-500">{budgets.length} budget{budgets.length === 1 ? '' : 's'} configured</p></div>
    </div>
  )
}

export default Reports
