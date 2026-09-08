import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { BrlPipe } from '../../core/brl.pipe';
import { relativeDayLabel } from '../../core/date.util';
import { FinanceService } from '../../services/finance.service';
import { GoalService } from '../../services/goal.service';
import { TaskService } from '../../services/task.service';

const CIRCLE_RADIUS = 27;

@Component({
  selector: 'app-dashboard',
  imports: [FormsModule, RouterLink, BrlPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  private readonly finance = inject(FinanceService);
  protected readonly goals = inject(GoalService);
  protected readonly tasks = inject(TaskService);

  protected readonly balance = this.finance.balance;
  protected readonly todayTasks = this.tasks.today;
  protected readonly overdueTasks = this.tasks.overdue;
  protected readonly upcomingTasks = computed(() =>
    this.tasks.upcoming().slice(0, 4),
  );

  protected readonly depositAmount = signal<number | null>(null);
  protected readonly targetDraft = signal<number | null>(null);
  protected readonly flash = signal('');

  protected readonly greeting = computed(() => {
    const h = new Date().getHours();
    if (h < 6) return 'Boa madrugada';
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  });

  protected readonly taskAlert = computed(() => {
    const today = this.todayTasks().length;
    const late = this.overdueTasks().length;
    if (late > 0) {
      return `${late} tarefa${late > 1 ? 's' : ''} atrasada${late > 1 ? 's' : ''}`;
    }
    if (today === 0) return 'Nenhuma tarefa para hoje 🎉';
    return `Você tem ${today} tarefa${today > 1 ? 's' : ''} hoje`;
  });

  protected readonly circumference = 2 * Math.PI * CIRCLE_RADIUS;

  protected readonly dashOffset = computed(
    () => this.circumference * (1 - this.goals.progress() / 100),
  );

  protected dayLabel(dateIso: string): string {
    return relativeDayLabel(dateIso);
  }

  protected deposit(): void {
    const value = this.depositAmount();
    if (value == null) return;
    if (this.goals.deposit(value)) {
      this.depositAmount.set(null);
      this.showFlash(
        this.goals.isCompleted() ? 'Meta atingida! 🎉' : 'Valor guardado',
      );
    }
  }

  protected saveTarget(): void {
    const value = this.targetDraft();
    if (value == null || value < 0) return;
    this.goals.setTarget(value);
    this.targetDraft.set(null);
    this.showFlash('Meta atualizada');
  }

  private showFlash(text: string): void {
    this.flash.set(text);
    setTimeout(() => this.flash.set(''), 2500);
  }
}
