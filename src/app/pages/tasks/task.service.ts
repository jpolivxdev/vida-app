import { Injectable, signal } from '@angular/core';
import { Task } from './task.model';

const STORAGE_KEY = 'tasks';

@Injectable({ providedIn: 'root' })
export class TaskService {

  private readonly _tasks = signal<Task[]>(this.loadFromStorage());

  readonly tasks = this._tasks.asReadonly();

  add(text: string, date: string, time?: string): void {
    if (!text.trim() || !date) return;

    const task: Task = {
      id: crypto.randomUUID(),
      text: text.trim(),
      date,
      time,
      done: false
    };

    this._tasks.update(list => [...list, task]);
    this.persist();
  }

  toggleDone(id: string): void {
    this._tasks.update(list =>
      list.map(t => t.id === id ? { ...t, done: !t.done } : t)
    );
    this.persist();
  }

  delete(id: string): void {
    this._tasks.update(list => list.filter(t => t.id !== id));
    this.persist();
  }

  getTodayTasks(today: string): Task[] {
    return this._tasks().filter(t => !t.done && t.date === today);
  }

  getNextTasks(today: string, limit = 3): Task[] {
    return this._tasks()
      .filter(t => !t.done && t.date > today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, limit);
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._tasks()));
  }

  private loadFromStorage(): Task[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}