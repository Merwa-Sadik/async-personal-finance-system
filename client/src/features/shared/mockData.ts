import type { Budget } from '../budget/budget.types';
import type { Category } from '../categories/categories.types';
import type { Transaction } from '../transactions/transactions.types';

export const mockCategories: Category[] = [
  { id: 'cat-salary', name: 'Salary', type: 'income', icon: '↗', color: '#16A34A' },
  { id: 'cat-freelance', name: 'Freelance', type: 'income', icon: '↗', color: '#2563EB' },
  { id: 'cat-food', name: 'Food', type: 'expense', icon: '◈', color: '#DC5028' },
  { id: 'cat-transport', name: 'Transportation', type: 'expense', icon: '⌁', color: '#D97706' },
  { id: 'cat-bills', name: 'Bills', type: 'expense', icon: '▤', color: '#7C3AED' },
  { id: 'cat-entertainment', name: 'Entertainment', type: 'expense', icon: '◇', color: '#DB2777' },
];

export const mockTransactions: Transaction[] = [
  { id: 'tx-1', title: 'Salary - May 2025', amount: 25000, type: 'income', categoryId: 'cat-salary', occurredAt: '2025-05-24' },
  { id: 'tx-2', title: 'Lunch', amount: 350, type: 'expense', categoryId: 'cat-food', occurredAt: '2025-05-23' },
  { id: 'tx-3', title: 'Bus Fare', amount: 50, type: 'expense', categoryId: 'cat-transport', occurredAt: '2025-05-22' },
  { id: 'tx-4', title: 'Freelance Project', amount: 3000, type: 'income', categoryId: 'cat-freelance', occurredAt: '2025-05-21' },
  { id: 'tx-5', title: 'Internet Bill', amount: 900, type: 'expense', categoryId: 'cat-bills', occurredAt: '2025-05-20' },
  { id: 'tx-6', title: 'Movie', amount: 250, type: 'expense', categoryId: 'cat-entertainment', occurredAt: '2025-05-20' },
];

export const mockBudgets: Budget[] = [
  { id: 'budget-food', name: 'Food', categoryId: 'cat-food', limit: 3000, spent: 2500, periodStart: '2025-05-01', periodEnd: '2025-05-31' },
  { id: 'budget-transport', name: 'Transportation', categoryId: 'cat-transport', limit: 2000, spent: 1200, periodStart: '2025-05-01', periodEnd: '2025-05-31' },
  { id: 'budget-bills', name: 'Bills', categoryId: 'cat-bills', limit: 1500, spent: 900, periodStart: '2025-05-01', periodEnd: '2025-05-31' },
  { id: 'budget-entertainment', name: 'Entertainment', categoryId: 'cat-entertainment', limit: 1000, spent: 1200, periodStart: '2025-05-01', periodEnd: '2025-05-31' },
];
