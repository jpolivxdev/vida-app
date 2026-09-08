import { Injectable, computed, signal } from '@angular/core';

import { readJson, writeJson } from '../core/storage';
import { daysBetween, todayIso } from '../core/date.util';
import { Task } from '../models/task';

const STORAGE_KEY = 'vida.tasks.v1';
const LEGACY_KEY = 'tasks';

export interface NewTask {
  text: string;
  date: string;
  time?: string;
  remindBefore?: number;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly _tasks = signal<Task[]>(this.load());

  readonly tasks = this._tasks.asReadonly();

  /** Pendentes ordenadas por data/hora crescente. */
  readonly pending = computed(() =>
    this._tasks()
      .filter((t) => !t.done)
      .sort(byDateTime),
  );

  /** Concluídas, mais recentes primeiro. */
  readonly completed = computed(() =>
    this._tasks()
      .filter((t) => t.done)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );

  readonly pendingCount = computed(() => this.pending().length);

  readonly today = computed(() => {
    const t = todayIso();
    return this.pending().filter((task) => task.date === t);
  });

  readonly overdue = computed(() => {
    const t = todayIso();
    return this.pending().filter((task) => task.date < t);
  });

  readonly upcoming = computed(() => {
    const t = todayIso();
    return this.pending().filter((task) => task.date > t);
  });

  add(input: NewTask): boolean {
    const text = input.text.trim();
    if (!text || !input.date) return false;

    const task: Task = {
      id: crypto.randomUUID(),
      text,
      date: input.date,
      time: input.time || undefined,
      done: false,
      remindBefore:
        input.time && input.remindBefore ? input.remindBefore : undefined,
      createdAt: new Date().toISOString(),
    };

    this._tasks.update((list) => [...list, task]);
    this.persist();
    return true;
  }

  toggle(id: string): void {
    this._tasks.update((list) =>
      list.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
    this.persist();
  }

  remove(id: string): void {
    this._tasks.update((list) => list.filter((t) => t.id !== id));
    this.persist();
  }

  clearCompleted(): void {
    this._tasks.update((list) => list.filter((t) => !t.done));
    this.persist();
  }

  isUrgent(task: Task): boolean {
    return daysBetween(todayIso(), task.date) <= 0;
  }

  // ----- internos -----

  private persist(): void {
    writeJson(STORAGE_KEY, this._tasks());
  }

  private load(): Task[] {
    const current = readJson<Task[]>(STORAGE_KEY, []);
    if (current.length) return current.map(normalize);

    const legacy = readJson<Task[]>(LEGACY_KEY, []);
    if (legacy.length) {
      const migrated = legacy.map(normalize);
      writeJson(STORAGE_KEY, migrated);
      return migrated;
    }
    return [];
  }
}

function byDateTime(a: Task, b: Task): number {
  const keyA = `${a.date} ${a.time ?? '99:99'}`;
  const keyB = `${b.date} ${b.time ?? '99:99'}`;
  return keyA.localeCompare(keyB);
}

function normalize(t: Partial<Task>): Task {
  return {
    id: t.id ?? crypto.randomUUID(),
    text: String(t.text ?? '').trim() || 'Sem título',
    date: t.date ?? todayIso(),
    time: t.time || undefined,
    done: Boolean(t.done),
    remindBefore: typeof t.remindBefore === 'number' ? t.remindBefore : undefined,
    createdAt: t.createdAt ?? new Date().toISOString(),
  };
}
