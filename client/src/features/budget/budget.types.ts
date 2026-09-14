export interface Budget {
  id: string;
  name: string;
  categoryId?: string;
  limit: number;
  spent: number;
  periodStart: string;
  periodEnd: string;
}
