import { Injectable, computed, inject, signal } from '@angular/core';

import { readJson, writeJson } from '../core/storage';
import { parseLocalDate } from '../core/date.util';
import { Task } from '../models/task';
import { TaskService } from './task.service';

const FIRED_KEY = 'vida.reminders.fired.v1';
const CHECK_EVERY_MS = 30_000;
const GRACE_MS = 10 * 60_000; // ainda avisa até 10 min depois da hora

export type NotifyPermission = 'default' | 'granted' | 'denied' | 'unsupported';

export interface ScheduledReminder {
  task: Task;
  fireAt: Date;
  eventAt: Date;
}

export interface Toast {
  id: string;
  title: string;
  body: string;
}

@Injectable({ providedIn: 'root' })
export class ReminderService {
  private readonly tasks = inject(TaskService);

  private readonly supported =
    typeof window !== 'undefined' && 'Notification' in window;

  private readonly _permission = signal<NotifyPermission>(
    this.supported ? (Notification.permission as NotifyPermission) : 'unsupported',
  );
  readonly permission = this._permission.asReadonly();

  readonly canNotify = computed(() => this._permission() === 'granted');
  readonly isSupported = this.supported;

  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private firedIds = new Set<string>(readJson<string[]>(FIRED_KEY, []));

  /** Próximos lembretes agendados (tarefas pendentes com hora + antecedência). */
  readonly scheduled = computed<ScheduledReminder[]>(() =>
    this.tasks
      .pending()
      .filter((t) => t.time && t.remindBefore)
      .map((task) => {
        const eventAt = combine(task.date, task.time!);
        const fireAt = new Date(eventAt.getTime() - task.remindBefore! * 60_000);
        return { task, fireAt, eventAt };
      })
      .filter(({ eventAt }) => eventAt.getTime() + GRACE_MS > Date.now())
      .sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime()),
  );

  constructor() {
    if (typeof window === 'undefined') return;
    this.check();
    setInterval(() => this.check(), CHECK_EVERY_MS);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') this.check();
    });
  }

  async enable(): Promise<void> {
    if (!this.supported) return;
    try {
      const result = await Notification.requestPermission();
      this._permission.set(result as NotifyPermission);
    } catch {
      /* usuário fechou o prompt */
    }
  }

  sendTest(): void {
    this.fire('Lembrete de teste 🔔', 'É assim que os avisos vão aparecer.');
  }

  dismissToast(id: string): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }

  // ----- internos -----

  private check(): void {
    const now = Date.now();
    let changed = false;

    for (const { task, fireAt, eventAt } of this.scheduled()) {
      if (this.firedIds.has(task.id)) continue;
      if (now < fireAt.getTime()) continue;
      if (now > eventAt.getTime() + GRACE_MS) continue;

      const whenLabel = task.time ? ` às ${task.time}` : '';
      this.fire(task.text, `Compromisso${whenLabel}.`);
      this.firedIds.add(task.id);
      changed = true;
    }

    // não deixa o registro de "já disparados" crescer para sempre
    const alive = new Set(this.tasks.tasks().map((t) => t.id));
    for (const id of this.firedIds) {
      if (!alive.has(id)) {
        this.firedIds.delete(id);
        changed = true;
      }
    }

    if (changed) writeJson(FIRED_KEY, [...this.firedIds]);
  }

  private fire(title: string, body: string): void {
    if (this.canNotify()) {
      try {
        new Notification(title, { body, tag: title, icon: 'favicon.ico' });
      } catch {
        /* alguns navegadores exigem service worker; cai no toast abaixo */
      }
    }

    const toast: Toast = { id: crypto.randomUUID(), title, body };
    this._toasts.update((list) => [...list, toast]);
    setTimeout(() => this.dismissToast(toast.id), 8000);
  }
}

function combine(dateIso: string, time: string): Date {
  const base = parseLocalDate(dateIso);
  const [h, m] = time.split(':').map(Number);
  base.setHours(h || 0, m || 0, 0, 0);
  return base;
}
