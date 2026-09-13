import React, { createContext, useContext, useState } from 'react'
import { Income, Expense, Budget, Notification, ThemeMode, User } from '../types'

interface FinanceContextType {
  income: Income[]
  setIncome: React.Dispatch<React.SetStateAction<Income[]>>
  expenses: Expense[]
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>
  budgets: Budget[]
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>
  notifications: Notification[]
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>
  user: User
  setUser: React.Dispatch<React.SetStateAction<User>>
  theme: ThemeMode
  setTheme: React.Dispatch<React.SetStateAction<ThemeMode>>
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

const INCOME_DATA: Income[] = [
  { id: 1, description: 'Monthly Salary', category: 'Salary', amount: 25000, date: '2025-05-01' },
  { id: 2, description: 'Freelance Project', category: 'Freelance', amount: 8000, date: '2025-04-10' },
  { id: 3, description: 'Stock Dividends', category: 'Investment', amount: 3200, date: '2025-03-15' },
  { id: 4, description: 'Monthly Salary', category: 'Salary', amount: 25000, date: '2025-04-01' },
  { id: 5, description: 'Monthly Salary', category: 'Salary', amount: 25000, date: '2025-03-01' },
  { id: 6, description: 'Monthly Salary', category: 'Salary', amount: 18000, date: '2025-02-01' },
  { id: 7, description: 'Monthly Salary', category: 'Salary', amount: 18000, date: '2025-01-01' },
  { id: 8, description: 'Monthly Salary', category: 'Salary', amount: 18000, date: '2024-12-01' },
]

const EXPENSE_DATA: Expense[] = [
  { id: 1, description: 'Grocery Shopping', category: 'Food', amount: 2460, date: '2025-05-24' },
  { id: 2, description: 'Monthly Rent', category: 'Housing', amount: 4200, date: '2025-05-05' },
  { id: 3, description: 'Bus Pass', category: 'Transport', amount: 1170, date: '2025-05-07' },
  { id: 4, description: 'Gym Membership', category: 'Health', amount: 450, date: '2025-05-10' },
  { id: 5, description: 'Online Course', category: 'Education', amount: 2990, date: '2025-05-12' },
  { id: 6, description: 'Netflix & Spotify', category: 'Entertainment', amount: 960, date: '2025-05-15' },
  { id: 7, description: 'Clothes Shopping', category: 'Shopping', amount: 2030, date: '2025-05-18' },
  { id: 8, description: 'Grocery Shopping', category: 'Food', amount: 1800, date: '2025-04-20' },
  { id: 9, description: 'Transport', category: 'Transport', amount: 900, date: '2025-04-22' },
  { id: 10, description: 'Monthly Rent', category: 'Housing', amount: 4200, date: '2025-04-05' },
]

const BUDGET_DATA: Budget[] = [
  { id: 1, category: 'Food', amount: 3000, month: 5, year: 2025 },
  { id: 2, category: 'Housing', amount: 4500, month: 5, year: 2025 },
  { id: 3, category: 'Transport', amount: 1500, month: 5, year: 2025 },
  { id: 4, category: 'Health', amount: 600, month: 5, year: 2025 },
  { id: 5, category: 'Education', amount: 2000, month: 5, year: 2025 },
  { id: 6, category: 'Entertainment', amount: 800, month: 5, year: 2025 },
  { id: 7, category: 'Shopping', amount: 2500, month: 5, year: 2025 },
]

const NOTIFICATION_DATA: Notification[] = [
  { id: 'food-warning', type: 'warning', title: 'Budget Warning', message: 'You have used 80% of your Food budget.', time: 'Today', read: false },
  { id: 'entertainment-exceeded', type: 'exceeded', title: 'Budget Exceeded', message: 'Your Entertainment budget has been exceeded.', time: 'Yesterday', read: false },
  { id: 'finance-summary', type: 'summary', title: 'Monthly summary ready', message: 'Your latest income and expense summary is ready to review.', time: '2 days ago', read: true },
]

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [income, setIncome] = useState<Income[]>(INCOME_DATA)
  const [expenses, setExpenses] = useState<Expense[]>(EXPENSE_DATA)
  const [budgets, setBudgets] = useState<Budget[]>(BUDGET_DATA)
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATION_DATA)
  const [user, setUser] = useState<User>({
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    phone: '+1 234 567 8900',
    currency: 'ETB',
    budgetAlerts: true,
    memberSince: '2024-01-15',
  })
  const [theme, setTheme] = useState<ThemeMode>('light')

  return (
    <FinanceContext.Provider value={{ income, setIncome, expenses, setExpenses, budgets, setBudgets, notifications, setNotifications, user, setUser, theme, setTheme }}>
      {children}
    </FinanceContext.Provider>
  )
}

export const useFinance = (): FinanceContextType => {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider')
  return ctx
}
