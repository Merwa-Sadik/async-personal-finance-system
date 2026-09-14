import type { Budget } from '../budget/budget.types';
import type { Category } from '../categories/categories.types';
import type { Transaction } from '../transactions/transactions.types';

export const isValidDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

export const getCategoryName = (categoryId: string, categories: Category[]) =>
  categories.find((category) => category.id === categoryId)?.name ?? 'Uncategorized';

export const getBudgetRemaining = (budget: Budget) => budget.limit - budget.spent;

export const getBudgetProgress = (budget: Budget) =>
  budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;

export const getTransactionTotal = (transactions: Transaction[], type: Transaction['type']) =>
  transactions
    .filter((transaction) => transaction.type === type)
    .reduce((total, transaction) => total + transaction.amount, 0);
