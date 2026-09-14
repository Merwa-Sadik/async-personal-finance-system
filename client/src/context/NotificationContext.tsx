import React, { createContext, useContext, useState, useMemo, useEffect } from 'react'
import { Notification } from '../types'
import { useFinance } from './FinanceContext'

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markRead: (id: string) => void
  markAllRead: () => void
  remove: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

const generateNotifications = (
  budgets: any[],
  expenses: any[],
  income: any[]
): Notification[] => {
  const notifications: Notification[] = []
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  budgets
    .filter((b) => b.month === currentMonth && b.year === currentYear)
    .forEach((b) => {
      const spent = expenses
        .filter((e) => {
          const d = new Date(e.date)
          return e.category === b.category && d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear
        })
        .reduce((s: number, e: any) => s + e.amount, 0)
      const ratio = spent / b.amount

      if (ratio > 1) {
        notifications.push({
          id: `exceeded-${b.id}`,
          type: 'exceeded',
          title: 'Budget Exceeded',
          message: `Your ${b.category} budget has been exceeded by ${(spent - b.amount).toLocaleString()} ETB.`,
          time: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
          read: false,
        })
      } else if (ratio >= 0.8) {
        notifications.push({
          id: `warning-${b.id}`,
          type: 'warning',
          title: 'Budget Warning',
          message: `You have used ${(ratio * 100).toFixed(0)}% of your ${b.category} budget.`,
          time: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
          read: false,
        })
      }
    })

  const allTx = [...income, ...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  if (allTx.length > 0) {
    const diff = Math.floor((now.getTime() - new Date(allTx[0].date).getTime()) / 86400000)
    if (diff >= 3) {
      notifications.push({
        id: 'no-recent-tx',
        type: 'info',
        title: 'No Recent Transactions',
        message: `You haven't added any transactions in the last ${diff} days.`,
        time: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
        read: false,
      })
    }
  }

  notifications.push({
    id: 'monthly-summary',
    type: 'summary',
    title: 'Monthly Summary',
    message: `Track your income and expenses to stay on top of your finances.`,
    time: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(),
    read: true,
  })

  notifications.push({
    id: 'review-reminder',
    type: 'reminder',
    title: 'Monthly Review Reminder',
    message: 'Take a moment to review your monthly spending and adjust your budgets.',
    time: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
  })

  return notifications
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { budgets, expenses, income } = useFinance()
  const base = useMemo(() => generateNotifications(budgets, expenses, income), [budgets, expenses, income])
  const [notifications, setNotifications] = useState<Notification[]>(base)

  useEffect(() => {
    setNotifications(generateNotifications(budgets, expenses, income))
  }, [budgets, expenses, income])

  const unreadCount = notifications.filter((n) => !n.read).length
  const markRead = (id: string) => setNotifications((p) => p.map((n) => n.id === id ? { ...n, read: true } : n))
  const markAllRead = () => setNotifications((p) => p.map((n) => ({ ...n, read: true })))
  const remove = (id: string) => setNotifications((p) => p.filter((n) => n.id !== id))
  const clearAll = () => setNotifications([])

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, remove, clearAll }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = (): NotificationContextType => {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider')
  return ctx
}
