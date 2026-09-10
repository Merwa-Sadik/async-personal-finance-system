import { createContext, useContext, useState } from 'react'

const FinanceContext = createContext()

const INCOME_DATA = [
  { id: 1, description: 'Monthly Salary', category: 'Salary', amount: 25000, date: '2025-05-01' },
  { id: 2, description: 'Freelance Project', category: 'Freelance', amount: 8000, date: '2025-04-10' },
  { id: 3, description: 'Stock Dividends', category: 'Investment', amount: 3200, date: '2025-03-15' },
  { id: 4, description: 'Monthly Salary', category: 'Salary', amount: 25000, date: '2025-04-01' },
  { id: 5, description: 'Monthly Salary', category: 'Salary', amount: 25000, date: '2025-03-01' },
  { id: 6, description: 'Monthly Salary', category: 'Salary', amount: 18000, date: '2025-02-01' },
  { id: 7, description: 'Monthly Salary', category: 'Salary', amount: 18000, date: '2025-01-01' },
  { id: 8, description: 'Monthly Salary', category: 'Salary', amount: 18000, date: '2024-12-01' },
]

const EXPENSE_DATA = [
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
  { id: 11, description: 'Grocery Shopping', category: 'Food', amount: 2100, date: '2025-03-18' },
  { id: 12, description: 'Monthly Rent', category: 'Housing', amount: 4200, date: '2025-03-05' },
  { id: 13, description: 'Grocery Shopping', category: 'Food', amount: 1900, date: '2025-02-10' },
  { id: 14, description: 'Monthly Rent', category: 'Housing', amount: 4200, date: '2025-02-05' },
  { id: 15, description: 'Grocery Shopping', category: 'Food', amount: 1700, date: '2025-01-12' },
  { id: 16, description: 'Monthly Rent', category: 'Housing', amount: 4200, date: '2025-01-05' },
  { id: 17, description: 'Grocery Shopping', category: 'Food', amount: 1600, date: '2024-12-15' },
  { id: 18, description: 'Monthly Rent', category: 'Housing', amount: 4200, date: '2024-12-05' },
]

const BUDGET_DATA = [
  { id: 1, category: 'Food', amount: 3000, month: 5, year: 2025 },
  { id: 2, category: 'Housing', amount: 4500, month: 5, year: 2025 },
  { id: 3, category: 'Transport', amount: 1500, month: 5, year: 2025 },
  { id: 4, category: 'Health', amount: 600, month: 5, year: 2025 },
  { id: 5, category: 'Education', amount: 2000, month: 5, year: 2025 },
  { id: 6, category: 'Entertainment', amount: 800, month: 5, year: 2025 },
  { id: 7, category: 'Shopping', amount: 2500, month: 5, year: 2025 },
]

export const FinanceProvider = ({ children }) => {
  const [income, setIncome] = useState(INCOME_DATA)
  const [expenses, setExpenses] = useState(EXPENSE_DATA)
  const [budgets, setBudgets] = useState(BUDGET_DATA)
  const [user, setUser] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    phone: '+1 234 567 8900',
    currency: 'ETB',
    budgetAlerts: true,
    memberSince: '2024-01-15',
  })

  return (
    <FinanceContext.Provider value={{ income, setIncome, expenses, setExpenses, budgets, setBudgets, user, setUser }}>
      {children}
    </FinanceContext.Provider>
  )
}

export const useFinance = () => useContext(FinanceContext)
