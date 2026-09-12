import { useFinance } from '../context/FinanceContext'

const Budgets = () => {
  const { budgets, expenses } = useFinance()

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Budgets</h1>
        <p className="text-sm text-gray-500 mt-0.5">Monitor your spending limits</p>
      </div>
      {budgets.length ? <div className="grid gap-4 md:grid-cols-2">
        {budgets.map((budget) => {
          const spent = expenses.filter((expense) => expense.category === budget.category && new Date(expense.date).getMonth() + 1 === budget.month && new Date(expense.date).getFullYear() === budget.year).reduce((sum, expense) => sum + Number(expense.amount), 0)
          const progress = Math.min((spent / Number(budget.amount)) * 100, 100)
          return <div key={budget.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex justify-between items-start"><div><h2 className="font-bold text-[#1e3a5f]">{budget.category}</h2><p className="text-xs text-gray-400">{budget.month}/{budget.year}</p></div><strong className="text-sm">{Number(budget.amount).toLocaleString()} ETB</strong></div>
            <div className="mt-5 h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${progress >= 100 ? 'bg-red-500' : progress >= 80 ? 'bg-amber-400' : 'bg-green-500'}`} style={{ width: `${progress}%` }} /></div>
            <div className="flex justify-between mt-2 text-xs text-gray-500"><span>{spent.toLocaleString()} ETB spent</span><span>{Math.round(progress)}%</span></div>
          </div>
        })}
      </div> : <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center text-gray-400">No budgets found</div>}
    </div>
  )
}

export default Budgets
