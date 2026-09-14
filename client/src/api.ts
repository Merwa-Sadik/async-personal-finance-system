import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'
import { Budget, TransactionType, User } from './types'

const API_BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:5000/api'
  : 'http://localhost:5000/api'

const TOKEN_KEY = 'pfms_token'

export type ApiTransaction = {
  id: number
  type: TransactionType
  category: string
  amount: number | string
  description: string | null
  date: string
  created_at: string
}

type AuthResponse = {
  user: { id: number; name: string; email: string }
  token: string
}

type RequestOptions = RequestInit & { requiresAuth?: boolean }

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (options.requiresAuth) {
    const token = await AsyncStorage.getItem(TOKEN_KEY)
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers })
  const body = await response.json().catch(() => null) as { message?: string } | T | null
  if (!response.ok) {
    const message = body && typeof body === 'object' && 'message' in body ? body.message : null
    throw new Error((typeof message === 'string' ? message : null) || 'Request failed')
  }
  return body as T
}

export const login = async (email: string, password: string): Promise<User> => {
  const response = await request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  await AsyncStorage.setItem(TOKEN_KEY, response.token)
  return toUser(response.user)
}

export const register = async (name: string, email: string, password: string): Promise<User> => {
  const response = await request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
  await AsyncStorage.setItem(TOKEN_KEY, response.token)
  return toUser(response.user)
}

export const logout = async (): Promise<void> => {
  await AsyncStorage.removeItem(TOKEN_KEY)
}

export const getTransactions = (): Promise<ApiTransaction[]> => request('/transactions', { requiresAuth: true })

export const createTransaction = (input: {
  type: TransactionType
  category: string
  amount: number
  description: string
  date: string
}): Promise<ApiTransaction> => request('/transactions', {
  method: 'POST',
  body: JSON.stringify(input),
  requiresAuth: true,
})

export const removeTransaction = (id: number): Promise<void> => request(`/transactions/${id}`, {
  method: 'DELETE',
  requiresAuth: true,
})

export const getBudgets = (): Promise<Budget[]> => request('/budgets', { requiresAuth: true })

const toUser = (user: AuthResponse['user']): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: '',
  currency: 'ETB',
  budgetAlerts: true,
  memberSince: new Date().toISOString(),
})
