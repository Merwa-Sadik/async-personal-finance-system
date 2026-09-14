import React, { createContext, useContext, useEffect, useState } from 'react'
import { createTransaction, getBudgets, getTransactions, removeTransaction } from '../api'
import { Budget, Expense, Income, Notification, ThemeMode, Transaction, User } from '../types'

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
  addTransaction: (input: Omit<Transaction, 'id'>) => Promise<void>
  deleteTransaction: (id: number) => Promise<void>
  isLoading: boolean
  error: string | null
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

type ApiTransaction = {
  id: number
  type: 'income' | 'expense'
  category: string
  amount: number | string
  description: string | null
  date: string
}

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [income, setIncome] = useState<Income[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [user, setUser] = useState<User>({
    id: 0,
    name: '',
    email: '',
    phone: '',
    currency: 'ETB',
    budgetAlerts: true,
    memberSince: '',
  })
  const [theme, setTheme] = useState<ThemeMode>('light')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user.email) return

    setIsLoading(true)
    Promise.all([getTransactions(), getBudgets()])
      .then(([transactions, nextBudgets]) => {
        setIncome(transactions.filter((item) => item.type === 'income').map(toIncome))
        setExpenses(transactions.filter((item) => item.type === 'expense').map(toExpense))
        setBudgets(nextBudgets.map((budget) => ({ ...budget, amount: Number(budget.amount) })))
        setError(null)
      })
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setIsLoading(false))
  }, [user.email])

  const addTransaction = async (input: Omit<Transaction, 'id'>): Promise<void> => {
    const created = await createTransaction(input)
    if (created.type === 'income') setIncome((items) => [toIncome(created), ...items])
    else setExpenses((items) => [toExpense(created), ...items])
  }

  const deleteTransaction = async (id: number): Promise<void> => {
    await removeTransaction(id)
    setIncome((items) => items.filter((item) => item.id !== id))
    setExpenses((items) => items.filter((item) => item.id !== id))
  }

  return (
    <FinanceContext.Provider value={{ income, setIncome, expenses, setExpenses, budgets, setBudgets, notifications, setNotifications, user, setUser, theme, setTheme, addTransaction, deleteTransaction, isLoading, error }}>
      {children}
    </FinanceContext.Provider>
  )
}

const toIncome = (transaction: ApiTransaction): Income => ({
  id: transaction.id,
  description: transaction.description || transaction.category,
  category: transaction.category,
  amount: Number(transaction.amount),
  date: transaction.date,
})

const toExpense = (transaction: ApiTransaction): Expense => toIncome(transaction)

export const useFinance = (): FinanceContextType => {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider')
  return ctx
}
