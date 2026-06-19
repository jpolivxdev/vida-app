import { Injectable, signal, computed } from '@angular/core';
import { Transaction, CategoryTotal, Category } from './transaction.model';

const STORAGE_KEY = 'finance';

const CATEGORY_COLORS: Record<Category, string> = {
  'Alimentação': '#ff7aa2',
  'Transporte': '#4dabf7',
  'Lazer': '#9775fa',
  'Compras': '#ffa94d',
  'Outros': '#adb5bd'
};

@Injectable({ providedIn: 'root' })
export class FinanceService {

  // signal = estado reativo. Qualquer componente que ler isso
  // é atualizado automaticamente quando o valor muda — sem
  // precisar de ngDoCheck nem polling manual do localStorage.
  private readonly _transactions = signal<Transaction[]>(this.loadFromStorage());

  readonly transactions = this._transactions.asReadonly();

  // computed = valor derivado, recalculado só quando `transactions` muda
  readonly balance = computed(() =>
    this._transactions().reduce((total, t) =>
      t.type === 'income' ? total + t.amount : total - t.amount, 0
    )
  );

  readonly expensesByCategory = computed<CategoryTotal[]>(() => {
    const totals = new Map<string, number>();

    for (const t of this._transactions()) {
      if (t.type !== 'expense') continue;
      totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount);
    }

    return Array.from(totals, ([category, total]) => ({ category, total }));
  });

  add(input: Omit<Transaction, 'id' | 'date'>): void {
    if (!input.description?.trim() || !input.amount) return;

    const transaction: Transaction = {
      ...input,
      id: crypto.randomUUID(),
      date: new Date().toISOString()
    };

    this._transactions.update(list => [...list, transaction]);
    this.persist();
  }

  delete(id: string): void {
    this._transactions.update(list => list.filter(t => t.id !== id));
    this.persist();
  }

  getColorFor(category: string): string {
    return CATEGORY_COLORS[category as Category] ?? '#ccc';
  }

  groupByDay(): Record<string, Transaction[]> {
    const groups: Record<string, Transaction[]> = {};

    for (const t of this._transactions()) {
      const day = new Date(t.date).toLocaleDateString();
      (groups[day] ??= []).push(t);
    }

    return groups;
  }

  getWeeklyComparisonMessage(): string {
    const current = this.totalExpensesInRange(this.startOfWeek(new Date()), new Date());
    const lastWeekStart = this.addDays(this.startOfWeek(new Date()), -7);
    const lastWeekEnd = this.startOfWeek(new Date());
    const last = this.totalExpensesInRange(lastWeekStart, lastWeekEnd);

    if (last === 0) return 'Sem dados da semana passada ainda 📊';
    if (current > last) return 'Você gastou mais que na semana passada 📈';
    if (current < last) return 'Você economizou essa semana 👏';
    return 'Se manteve igual à semana passada 😎';
  }

  // --- helpers privados de data, sem efeitos colaterais (não mutam o Date recebido) ---

  private startOfWeek(date: Date): Date {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    copy.setDate(copy.getDate() - copy.getDay());
    return copy;
  }

  private addDays(date: Date, days: number): Date {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
  }

  private totalExpensesInRange(start: Date, end: Date): number {
    return this._transactions()
      .filter(t => {
        const d = new Date(t.date);
        return t.type === 'expense' && d >= start && d < end;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._transactions()));
  }

  private loadFromStorage(): Transaction[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      // dado corrompido no localStorage não derruba a aplicação
      return [];
    }
  }
}