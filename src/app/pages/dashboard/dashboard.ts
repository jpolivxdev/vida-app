import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../tasks/task.service';
import { GoalService } from '../tasks/goal.service';
import { FinanceService } from '../finance/finance.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {

  // Campo temporário só para definir/editar a meta total
  goalInput = 0;

  // Campo temporário para adicionar um novo valor guardado
  addAmount: number | null = null;

  savedMessage = '';

  private readonly today = new Date().toISOString().split('T')[0];

  constructor(
    private router: Router,
    private tasks: TaskService,
    private goalService: GoalService,
    private finance: FinanceService
  ) {
    this.goalInput = this.goalService.goal().target;
  }

  get balance() {
    return this.finance.balance();
  }

  get goal() {
    return this.goalService.goal();
  }

  get progress() {
    return this.goalService.progress();
  }

  // Geometria do círculo de progresso: circunferência = 2πr (r = 27)
  // dashoffset = quanto da circunferência fica "vazio" (não preenchido)
  readonly circleCircumference = 2 * Math.PI * 27;

  get circleDashoffset(): number {
    return this.circleCircumference * (1 - this.progress / 100);
  }

  get remaining(): number {
    return Math.max(0, this.goal.target - this.goal.saved);
  }

  get isCompleted() {
    return this.goalService.isCompleted();
  }

  get todayTasks() {
    return this.tasks.getTodayTasks(this.today);
  }

  get nextTasks() {
    return this.tasks.getNextTasks(this.today);
  }

  get taskAlert(): string {
    const count = this.todayTasks.length;
    if (count === 0) return 'Nenhuma tarefa para hoje';
    if (count === 1) return 'Você tem 1 tarefa hoje';
    return `Você tem ${count} tarefas hoje`;
  }

  goTo(path: string): void {
    this.router.navigate([path]);
  }

  setGoalTarget(): void {
    this.goalService.save(this.goalInput, this.goalService.goal().saved);
    this.flashMessage('Meta atualizada');
  }

  addToGoal(): void {
    if (!this.addAmount || this.addAmount <= 0) return;

    this.goalService.addToSaved(this.addAmount);
    this.addAmount = null;

    this.flashMessage(
      this.goalService.isCompleted() ? 'Meta atingida!' : 'Valor adicionado'
    );
  }

  private flashMessage(text: string): void {
    this.savedMessage = text;
    setTimeout(() => this.savedMessage = '', 2500);
  }
}