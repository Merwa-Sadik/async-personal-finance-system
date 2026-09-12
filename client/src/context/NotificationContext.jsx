import { createContext, useContext, useState, useMemo } from 'react'
import { useFinance } from './FinanceContext'

const NotificationContext = createContext()

const generateNotifications = (budgets, expenses, income) => {
  const notifications = []
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  // Budget warnings & exceeded
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

      if (ratio > 1) {
        notifications.push({
          id: `exceeded-${b.id}`,
          type: 'exceeded',
          title: 'Budget Exceeded',
          message: `Your ${b.category} budget has been exceeded by ${(spent - b.amount).toLocaleString()} ETB.`,
          time: new Date(now - 1000 * 60 * 30).toISOString(),
          read: false,
        })
      } else if (ratio >= 0.8) {
        notifications.push({
          id: `warning-${b.id}`,
          type: 'warning',
          title: 'Budget Warning',
          message: `You have used ${(ratio * 100).toFixed(0)}% of your ${b.category} budget.`,
          time: new Date(now - 1000 * 60 * 60).toISOString(),
          read: false,
        })
      }
    })

  // No recent transactions
  const allTx = [...income, ...expenses].sort((a, b) => new Date(b.date) - new Date(a.date))
  if (allTx.length > 0) {
    const diff = Math.floor((now - new Date(allTx[0].date)) / 86400000)
    if (diff >= 3) {
      notifications.push({
        id: 'no-recent-tx',
        type: 'info',
        title: 'No Recent Transactions',
        message: `You haven't added any transactions in the last ${diff} days.`,
        time: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
        read: false,
      })
    }
  }

  // Monthly summary
  const totalIncome = income
    .filter((r) => { const d = new Date(r.date); return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear })
    .reduce((s, r) => s + r.amount, 0)
  const totalExpenses = expenses
    .filter((r) => { const d = new Date(r.date); return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear })
    .reduce((s, r) => s + r.amount, 0)

  notifications.push({
    id: 'monthly-summary',
    type: 'summary',
    title: 'Monthly Summary',
    message: `This month: ${totalIncome.toLocaleString()} ETB income, ${totalExpenses.toLocaleString()} ETB expenses. Balance: ${(totalIncome - totalExpenses).toLocaleString()} ETB.`,
    time: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
    read: true,
  })

  // Reminder
  notifications.push({
    id: 'review-reminder',
    type: 'reminder',
    title: 'Monthly Review Reminder',
    message: 'Take a moment to review your monthly spending and adjust your budgets if needed.',
    time: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
  })

  return notifications
}

export const NotificationProvider = ({ children }) => {
  const { budgets, expenses, income } = useFinance()
  const base = useMemo(() => generateNotifications(budgets, expenses, income), [])
  const [notifications, setNotifications] = useState(base)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markRead = (id) =>
    setNotifications((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)))

  const markAllRead = () =>
    setNotifications((p) => p.map((n) => ({ ...n, read: true })))

  const remove = (id) =>
    setNotifications((p) => p.filter((n) => n.id !== id))

  const clearAll = () => setNotifications([])

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, remove, clearAll }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
