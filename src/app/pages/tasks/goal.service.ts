import { Injectable, signal, computed } from '@angular/core';
import { Goal } from './task.model';

const GOAL_KEY = 'goal';
const SAVED_KEY = 'saved';

@Injectable({ providedIn: 'root' })
export class GoalService {


  private readonly _goal = signal<Goal>(this.loadFromStorage());

  readonly goal = this._goal.asReadonly();

  readonly progress = computed(() => {
    const { target, saved } = this._goal();
    if (target <= 0) return 0;
    return Math.min(100, Math.round((saved / target) * 100));
  });

  readonly isCompleted = computed(() => {
    const { target, saved } = this._goal();
    return target > 0 && saved >= target;
  });

  save(target: number, saved: number): void {
    this._goal.set({ target, saved });
    this.persist();
  }

  addToSaved(amount: number): void {
    this._goal.update(g => ({ ...g, saved: g.saved + amount }));
    this.persist();
  }

  private persist(): void {
    localStorage.setItem(GOAL_KEY, JSON.stringify(this._goal().target));
    localStorage.setItem(SAVED_KEY, JSON.stringify(this._goal().saved));
  }

  private loadFromStorage(): Goal {
    try {
      const target = localStorage.getItem(GOAL_KEY);
      const saved = localStorage.getItem(SAVED_KEY);
      return {
        target: target ? JSON.parse(target) : 0,
        saved: saved ? JSON.parse(saved) : 0
      };
    } catch {
      return { target: 0, saved: 0 };
    }
  }
}