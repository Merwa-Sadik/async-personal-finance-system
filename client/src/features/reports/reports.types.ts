export type ReportPeriod = 'week' | 'month' | 'quarter' | 'year';

export interface ReportSummary {
  period: ReportPeriod;
  income: number;
  expenses: number;
  balance: number;
}
