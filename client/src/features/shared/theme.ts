export const colors = {
  background: '#F4F6F9',
  surface: '#FFFFFF',
  primary: '#2563EB',
  primarySoft: '#EFF6FF',
  secondary: '#6B7280',
  text: '#111827',
  mutedText: '#6B7280',
  border: '#E5E7EB',
  income: '#16A34A',
  expense: '#DC5028',
  warning: '#D97706',
  danger: '#DC2626',
  white: '#FFFFFF',
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
};

export const formatCurrency = (amount: number) =>
  `${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })} ETB`;

export const parseAmount = (value: string) => {
  const amount = Number(value.replace(/,/g, '').trim());
  return Number.isFinite(amount) ? amount : NaN;
};
