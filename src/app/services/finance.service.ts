import { Injectable, computed, signal } from '@angular/core';

import { readJson, writeJson } from '../core/storage';
import { addDays, startOfWeek } from '../core/date.util';
import {
  Category,
  CategoryTotal,
  Transaction,
  TransactionType,
} from '../models/transaction';

const STORAGE_KEY = 'vida.finance.v1';
const LEGACY_KEY = 'finance';

export interface NewTransaction {
  description: string;
  amount: number;
  type: TransactionType;
  category: Category;
}

export interface DayGroup {
  key: string; // YYYY-MM-DD
  label: string; // rótulo amigável
  items: Transaction[];
  total: number; // income - expense do dia
}

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private readonly _transactions = signal<Transaction[]>(this.load());

  /** Lista imutável, ordenada da mais recente para a mais antiga. */
  readonly transactions = computed(() =>
    [...this._transactions()].sort((a, b) => b.date.localeCompare(a.date)),
  );

  readonly count = computed(() => this._transactions().length);

  readonly income = computed(() => this.sum('income'));
  readonly expenses = computed(() => this.sum('expense'));
  readonly balance = computed(() => this.income() - this.expenses());

  readonly expensesByCategory = computed<CategoryTotal[]>(() => {
    const totals = new Map<Category, number>();
    for (const t of this._transactions()) {
      if (t.type !== 'expense') continue;
      totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount);
    }
    return [...totals]
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  });

  readonly topCategory = computed<CategoryTotal | null>(
    () => this.expensesByCategory()[0] ?? null,
  );

  /** Transações agrupadas por dia, dias mais recentes primeiro. */
  readonly byDay = computed<DayGroup[]>(() => {
    const groups = new Map<string, Transaction[]>();
    for (const t of this.transactions()) {
      const key = t.date.slice(0, 10);
      const bucket = groups.get(key);
      if (bucket) {
        bucket.push(t);
      } else {
        groups.set(key, [t]);
      }
    }

    const fmt = new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
    });

    return [...groups.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, items]) => ({
        key,
        label: fmt.format(new Date(`${key}T00:00:00`)),
        items,
        total: items.reduce(
          (acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount),
          0,
        ),
      }));
  });

  /** Frase comparando os gastos desta semana com a semana passada. */
  readonly weeklyComparison = computed(() => {
    const now = new Date();
    const thisWeekStart = startOfWeek(now);
    const lastWeekStart = addDays(thisWeekStart, -7);

    const current = this.expensesInRange(thisWeekStart, now);
    const previous = this.expensesInRange(lastWeekStart, thisWeekStart);

    if (previous === 0 && current === 0) {
      return 'Ainda sem gastos registrados nas últimas semanas 📊';
    }
    if (previous === 0) return 'Primeira semana com gastos registrados 📊';
    if (current > previous) return 'Você gastou mais que na semana passada 📈';
    if (current < previous) return 'Você economizou em relação à semana passada 👏';
    return 'Gastos iguais aos da semana passada 😎';
  });

  add(input: NewTransaction): boolean {
    const description = input.description.trim();
    const amount = Math.abs(Number(input.amount));

    if (!description || !Number.isFinite(amount) || amount <= 0) return false;

    const tx: Transaction = {
      id: crypto.randomUUID(),
      description,
      amount,
      type: input.type,
      category: input.category,
      date: new Date().toISOString(),
    };

    this._transactions.update((list) => [tx, ...list]);
    this.persist();
    return true;
  }

  remove(id: string): void {
    this._transactions.update((list) => list.filter((t) => t.id !== id));
    this.persist();
  }

  clearAll(): void {
    this._transactions.set([]);
    this.persist();
  }

  // ----- internos -----

  private sum(type: TransactionType): number {
    return this._transactions()
      .filter((t) => t.type === type)
      .reduce((acc, t) => acc + t.amount, 0);
  }

  private expensesInRange(start: Date, end: Date): number {
    return this._transactions()
      .filter((t) => {
        if (t.type !== 'expense') return false;
        const d = new Date(t.date);
        return d >= start && d < end;
      })
      .reduce((acc, t) => acc + t.amount, 0);
  }

  private persist(): void {
    writeJson(STORAGE_KEY, this._transactions());
  }

  private load(): Transaction[] {
    const current = readJson<Transaction[]>(STORAGE_KEY, []);
    if (current.length) return current.map(normalize);

    // migração automática do formato antigo
    const legacy = readJson<Transaction[]>(LEGACY_KEY, []);
    if (legacy.length) {
      const migrated = legacy.map(normalize);
      writeJson(STORAGE_KEY, migrated);
      return migrated;
    }
    return [];
  }
}

function normalize(t: Partial<Transaction>): Transaction {
  return {
    id: t.id ?? crypto.randomUUID(),
    description: String(t.description ?? '').trim() || 'Sem descrição',
    amount: Math.abs(Number(t.amount) || 0),
    type: t.type === 'income' ? 'income' : 'expense',
    category: (t.category as Category) ?? 'Outros',
    date: t.date ?? new Date().toISOString(),
  };
}
