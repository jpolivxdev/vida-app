export type TransactionType = 'income' | 'expense';

export type Category =
  | 'Alimentação'
  | 'Transporte'
  | 'Lazer'
  | 'Compras'
  | 'Outros';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: string; // ISO string
}

export interface CategoryTotal {
  category: string;
  total: number;
}