export type TransactionType = 'income' | 'expense';

export type Category =
  | 'Alimentação'
  | 'Transporte'
  | 'Lazer'
  | 'Compras'
  | 'Contas'
  | 'Saúde'
  | 'Outros';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: string; // ISO datetime
}

export interface CategoryTotal {
  category: Category;
  total: number;
}

export const CATEGORIES: readonly Category[] = [
  'Alimentação',
  'Transporte',
  'Lazer',
  'Compras',
  'Contas',
  'Saúde',
  'Outros',
] as const;

export const CATEGORY_COLORS: Record<Category, string> = {
  'Alimentação': '#ff7aa2',
  'Transporte': '#4dabf7',
  'Lazer': '#9775fa',
  'Compras': '#ffa94d',
  'Contas': '#f06595',
  'Saúde': '#38d9a9',
  'Outros': '#adb5bd',
};

export function categoryColor(category: string): string {
  return CATEGORY_COLORS[category as Category] ?? '#ced4da';
}
