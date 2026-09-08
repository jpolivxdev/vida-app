import { Injectable, computed, signal } from '@angular/core';

import { readJson, writeJson, removeKey } from '../core/storage';
import { EMPTY_GOAL, Goal } from '../models/goal';

const STORAGE_KEY = 'vida.goal.v1';
const LEGACY_TARGET = 'goal';
const LEGACY_SAVED = 'saved';

@Injectable({ providedIn: 'root' })
export class GoalService {
  private readonly _goal = signal<Goal>(this.load());

  readonly goal = this._goal.asReadonly();

  readonly progress = computed(() => {
    const { target, saved } = this._goal();
    if (target <= 0) return 0;
    return Math.min(100, Math.round((saved / target) * 100));
  });

  readonly remaining = computed(() => {
    const { target, saved } = this._goal();
    return Math.max(0, target - saved);
  });

  readonly isCompleted = computed(() => {
    const { target, saved } = this._goal();
    return target > 0 && saved >= target;
  });

  readonly hasGoal = computed(() => this._goal().target > 0);

  setTarget(target: number): void {
    const value = Math.max(0, Number(target) || 0);
    this._goal.update((g) => ({ ...g, target: value }));
    this.persist();
  }

  deposit(amount: number): boolean {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return false;
    this._goal.update((g) => ({ ...g, saved: g.saved + value }));
    this.persist();
    return true;
  }

  reset(): void {
    this._goal.set({ ...EMPTY_GOAL });
    this.persist();
  }

  // ----- internos -----

  private persist(): void {
    writeJson(STORAGE_KEY, this._goal());
  }

  private load(): Goal {
    const current = readJson<Goal | null>(STORAGE_KEY, null);
    if (current && typeof current.target === 'number') {
      return { target: current.target, saved: current.saved ?? 0 };
    }

    // migração do formato antigo (duas chaves separadas)
    const target = readJson<number>(LEGACY_TARGET, 0);
    const saved = readJson<number>(LEGACY_SAVED, 0);
    if (target || saved) {
      const migrated: Goal = { target, saved };
      writeJson(STORAGE_KEY, migrated);
      removeKey(LEGACY_TARGET);
      removeKey(LEGACY_SAVED);
      return migrated;
    }
    return { ...EMPTY_GOAL };
  }
}
