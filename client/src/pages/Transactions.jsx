import { useMemo, useState } from 'react'
import TransactionTable from '../components/TransactionTable'
import { useFinance } from '../context/FinanceContext'

const Transactions = () => {
  const { income, expenses } = useFinance()
  const [type, setType] = useState('all')
  const transactions = useMemo(() => [
    ...income.map((transaction) => ({ ...transaction, type: 'income' })),
    ...expenses.map((transaction) => ({ ...transaction, type: 'expense' })),
  ].sort((left, right) => new Date(right.date) - new Date(left.date)), [income, expenses])
  const filtered = type === 'all' ? transactions : transactions.filter((transaction) => transaction.type === type)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#1e3a5f]">Transactions</h1>
        <p className="text-sm text-gray-500 mt-0.5">View all your income and expenses</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex gap-2">
        {['all', 'income', 'expense'].map((option) => (
          <button key={option} onClick={() => setType(option)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${type === option ? 'bg-[#1e3a5f] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            {option}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        {filtered.length ? <TransactionTable data={filtered} type={type === 'expense' ? 'expense' : 'income'} /> : <p className="text-center text-gray-400 py-10">No transactions found</p>}
      </div>
    </div>
  )
}

export default Transactions
