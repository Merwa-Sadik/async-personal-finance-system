
export type TransactionType = 'income' | 'expense'

export type ThemeMode = 'light' | 'dark'

export interface Transaction {
  id: number
  description: string
  category: string
  amount: number
  date: string
  type: TransactionType
}

export interface Income {
  id: number
  description: string
  category: string
  amount: number
  date: string
}

export interface Expense {
  id: number
  description: string
  category: string
  amount: number
  date: string
}

export interface Budget {
  id: number
  category: string
  amount: number
  month: number
  year: number
}

export interface User {
  id: number
  name: string
  email: string
  phone: string
  currency: string
  budgetAlerts: boolean
  memberSince: string
}

export interface Notification {
  id: string
  type: 'exceeded' | 'warning' | 'info' | 'summary' | 'reminder'
  title: string
  message: string
  time: string
  read: boolean
}

export type RootStackParamList = {
  Login: undefined
  Register: undefined
  Main: undefined
}

export type MainTabParamList = {
  Dashboard: undefined
  Profile: undefined
}
