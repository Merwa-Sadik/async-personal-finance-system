import { useMemo, useState } from 'react'
import { TrendingUp, TrendingDown, Wallet, PiggyBank, AlertTriangle, XCircle, Info, Calendar } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as PieTooltip,
} from 'recharts'
import { useFinance } from '../context/FinanceContext'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

const fmt = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 0 })

const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const SummaryCard = ({ title, value, sub, subPositive, icon: Icon, iconBg, iconColor, valueColor }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3">
    <div className="flex items-start justify-between">
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
        <Icon size={18} className={iconColor} />
      </div>
    </div>
    <p className={`text-2xl font-bold ${valueColor}`}>{value} ETB</p>
    <p className={`text-xs font-medium ${subPositive ? 'text-green-600' : 'text-red-500'}`}>{sub}</p>
  </div>
)

const Dashboard = () => {
  const { income, expenses, budgets, user } = useFinance()
  const today = new Date()
  const [txSearch, setTxSearch] = useState('')
  const [txType, setTxType] = useState('All')
  const [txCategory, setTxCategory] = useState('All')
  const [txPage, setTxPage] = useState(1)
  const PER_PAGE = 5

  // ── Summary calculations ──────────────────────────────────────────
  const currentMonth = today.getMonth() + 1
  const currentYear = today.getFullYear()
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear

  const sumByMonth = (arr, m, y) =>
    arr.filter((r) => {
      const d = new Date(r.date)
      return d.getMonth() + 1 === m && d.getFullYear() === y
    }).reduce((s, r) => s + r.amount, 0)

  const totalIncome = sumByMonth(income, currentMonth, currentYear)
  const lastIncome = sumByMonth(income, lastMonth, lastMonthYear)
  const totalExpenses = sumByMonth(expenses, currentMonth, currentYear)
  const lastExpenses = sumByMonth(expenses, lastMonth, lastMonthYear)
  const balance = totalIncome - totalExpenses
  const lastBalance = lastIncome - lastExpenses

  const pct = (curr, prev) => prev === 0 ? 100 : (((curr - prev) / prev) * 100).toFixed(1)
  const incomePct = pct(totalIncome, lastIncome)
  const expensePct = pct(totalExpenses, lastExpenses)
  const balancePct = pct(balance, lastBalance)

  const totalBudget = budgets
    .filter((b) => b.month === currentMonth && b.year === currentYear)
    .reduce((s, b) => s + b.amount, 0)
  const budgetRemaining = totalBudget - totalExpenses
  const budgetPct = totalBudget > 0 ? ((budgetRemaining / totalBudget) * 100).toFixed(0) : 0

  // ── Bar chart data (last 6 months) ────────────────────────────────
  const barData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(currentYear, currentMonth - 1 - (5 - i))
      const m = d.getMonth() + 1
      const y = d.getFullYear()
      return {
        month: MONTHS[d.getMonth()],
        Income: sumByMonth(income, m, y),
        Expense: sumByMonth(expenses, m, y),
      }
    })
  }, [income, expenses])

  // ── Donut chart data ──────────────────────────────────────────────
  const donutData = useMemo(() => {
    const map = {}
    expenses
      .filter((e) => {
        const d = new Date(e.date)
        return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear
      })
      .forEach((e) => { map[e.category] = (map[e.category] || 0) + e.amount })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [expenses])

  const donutTotal = donutData.reduce((s, d) => s + d.value, 0)

  // ── Alerts ────────────────────────────────────────────────────────
  const alerts = useMemo(() => {
    const list = []
    budgets
      .filter((b) => b.month === currentMonth && b.year === currentYear)
      .forEach((b) => {
        const spent = expenses
          .filter((e) => {
            const d = new Date(e.date)
            return e.category === b.category && d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear
          })
          .reduce((s, e) => s + e.amount, 0)
        const ratio = spent / b.amount
        if (ratio > 1)
          list.push({ type: 'exceeded', msg: `Your ${b.category} budget has been exceeded.` })
        else if (ratio >= 0.8)
          list.push({ type: 'warning', msg: `You have used ${(ratio * 100).toFixed(0)}% of your ${b.category} budget.` })
      })
    const lastTx = [...income, ...expenses].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    if (lastTx) {
      const diff = Math.floor((today - new Date(lastTx.date)) / 86400000)
      if (diff >= 3) list.push({ type: 'info', msg: `You haven't added transactions in the last ${diff} days.` })
    }
    list.push({ type: 'reminder', msg: 'Review your monthly spending summary.' })
    return list
  }, [budgets, expenses, income])

  // ── Recent transactions ───────────────────────────────────────────
  const allTx = useMemo(() => {
    const inc = income.map((r) => ({ ...r, type: 'Income' }))
    const exp = expenses.map((r) => ({ ...r, type: 'Expense' }))
    return [...inc, ...exp].sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [income, expenses])

  const txCategories = ['All', ...new Set(allTx.map((t) => t.category))]

  const filteredTx = useMemo(() => {
    return allTx.filter((t) => {
      const matchSearch = t.description.toLowerCase().includes(txSearch.toLowerCase()) ||
        t.category.toLowerCase().includes(txSearch.toLowerCase())
      const matchType = txType === 'All' || t.type === txType
      const matchCat = txCategory === 'All' || t.category === txCategory
      return matchSearch && matchType && matchCat
    })
  }, [allTx, txSearch, txType, txCategory])

  const totalPages = Math.ceil(filteredTx.length / PER_PAGE)
  const pagedTx = filteredTx.slice((txPage - 1) * PER_PAGE, txPage * PER_PAGE)

  const alertStyle = {
    warning: { bg: 'bg-yellow-50 border-yellow-200', icon: <AlertTriangle size={16} className="text-yellow-500" />, label: 'Budget Warning', text: 'text-yellow-800' },
    exceeded: { bg: 'bg-red-50 border-red-200', icon: <XCircle size={16} className="text-red-500" />, label: 'Budget Exceeded', text: 'text-red-800' },
    info: { bg: 'bg-blue-50 border-blue-200', icon: <Info size={16} className="text-blue-500" />, label: 'No Recent Transactions', text: 'text-blue-800' },
    reminder: { bg: 'bg-gray-50 border-gray-200', icon: <Info size={16} className="text-gray-500" />, label: 'Reminder', text: 'text-gray-700' },
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Greeting + Date */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1e3a5f]">{getGreeting()}, {user.name}! 👋</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Here's your financial overview for {today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm self-start sm:self-auto">
          <Calendar size={16} className="text-[#1e3a5f]" />
          <span className="text-sm font-medium text-[#1e3a5f]">
            {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Income" value={fmt(totalIncome)}
          sub={`▲ ${incomePct}% from last month`} subPositive
          icon={TrendingUp} iconBg="bg-green-50" iconColor="text-green-600" valueColor="text-green-600"
        />
        <SummaryCard
          title="Total Expenses" value={fmt(totalExpenses)}
          sub={`▼ ${Math.abs(expensePct)}% from last month`} subPositive={false}
          icon={TrendingDown} iconBg="bg-red-50" iconColor="text-red-500" valueColor="text-red-500"
        />
        <SummaryCard
          title="Current Balance" value={fmt(balance)}
          sub={`▲ ${balancePct}% from last month`} subPositive={balance >= lastBalance}
          icon={Wallet} iconBg="bg-blue-50" iconColor="text-blue-600" valueColor="text-[#1e3a5f]"
        />
        <SummaryCard
          title="Budget Remaining" value={fmt(Math.max(budgetRemaining, 0))}
          sub={`▲ ${budgetPct}% of budget remaining`} subPositive={budgetRemaining > 0}
          icon={PiggyBank} iconBg="bg-purple-50" iconColor="text-purple-600" valueColor="text-purple-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-base font-bold text-[#1e3a5f] mb-4">Income vs Expense</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => `${fmt(v)} ETB`} contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expense" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-base font-bold text-[#1e3a5f] mb-4">Spending by Category</h2>
          <div className="flex flex-col items-center">
            <div className="relative">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {donutData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <PieTooltip formatter={(v, n) => [`${fmt(v)} ETB`, n]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-lg font-bold text-[#1e3a5f]">{fmt(donutTotal)}</p>
                <p className="text-xs text-gray-400">ETB</p>
              </div>
            </div>
            <div className="mt-3 w-full space-y-1.5">
              {donutData.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-600">{d.name}</span>
                  </div>
                  <span className="font-medium text-gray-700">{donutTotal > 0 ? ((d.value / donutTotal) * 100).toFixed(0) : 0}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Alerts + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Alerts */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-base font-bold text-[#1e3a5f] mb-4">Alerts & Notifications</h2>
          <div className="space-y-3">
            {alerts.map((a, i) => {
              const s = alertStyle[a.type]
              return (
                <div key={i} className={`flex gap-3 p-3 rounded-xl border ${s.bg}`}>
                  <div className="mt-0.5 shrink-0">{s.icon}</div>
                  <div>
                    <p className={`text-xs font-semibold ${s.text}`}>{s.label}</p>
                    <p className={`text-xs mt-0.5 ${s.text} opacity-80`}>{a.msg}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h2 className="text-base font-bold text-[#1e3a5f] mb-4">Recent Transactions</h2>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <input
              value={txSearch} onChange={(e) => { setTxSearch(e.target.value); setTxPage(1) }}
              placeholder="Search..."
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[#1e3a5f] flex-1 min-w-[120px]"
            />
            <select value={txType} onChange={(e) => { setTxType(e.target.value); setTxPage(1) }}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[#1e3a5f]">
              {['All', 'Income', 'Expense'].map((t) => <option key={t}>{t}</option>)}
            </select>
            <select value={txCategory} onChange={(e) => { setTxCategory(e.target.value); setTxPage(1) }}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-[#1e3a5f]">
              {txCategories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wide">
                  <th className="pb-2 text-left font-semibold">Date</th>
                  <th className="pb-2 text-left font-semibold">Description</th>
                  <th className="pb-2 text-left font-semibold hidden sm:table-cell">Category</th>
                  <th className="pb-2 text-left font-semibold hidden md:table-cell">Type</th>
                  <th className="pb-2 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pagedTx.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-gray-400">No transactions found</td></tr>
                ) : pagedTx.map((t) => (
                  <tr key={`${t.type}-${t.id}`} className="hover:bg-gray-50 transition">
                    <td className="py-2.5 pr-3 text-gray-500 whitespace-nowrap">
                      {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-2.5 pr-3 text-gray-800 font-medium">{t.description}</td>
                    <td className="py-2.5 pr-3 hidden sm:table-cell">
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{t.category}</span>
                    </td>
                    <td className="py-2.5 pr-3 hidden md:table-cell">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.type === 'Income' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className={`py-2.5 text-right font-semibold ${t.type === 'Income' ? 'text-green-600' : 'text-red-500'}`}>
                      {t.type === 'Income' ? '+' : '-'}{fmt(t.amount)} ETB
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400">Page {txPage} of {totalPages}</p>
              <div className="flex gap-1">
                <button disabled={txPage === 1} onClick={() => setTxPage((p) => p - 1)}
                  className="px-3 py-1 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition">
                  Prev
                </button>
                <button disabled={txPage === totalPages} onClick={() => setTxPage((p) => p + 1)}
                  className="px-3 py-1 text-xs rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
