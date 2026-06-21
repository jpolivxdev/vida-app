import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from './task.service';
import { Task } from './task.model';

type Filter = 'all' | 'today' | 'upcoming';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css'
})
export class TasksComponent {

  filter: Filter = 'all';
  sheetOpen = false;

  newText = '';
  newDate = this.today();
  newTime = '';

  constructor(private taskService: TaskService) {}

  get pending(): Task[] {
    const all = this.taskService.tasks().filter(t => !t.done);
    const today = this.today();

    if (this.filter === 'today') {
      return all.filter(t => t.date === today);
    }
    if (this.filter === 'upcoming') {
      return all.filter(t => t.date > today);
    }
    return all;
  }

  get completed(): Task[] {
    return this.taskService.tasks().filter(t => t.done);
  }

  get pendingCount(): number {
    return this.taskService.tasks().filter(t => !t.done).length;
  }

  openSheet(): void {
    this.newText = '';
    this.newDate = this.today();
    this.newTime = '';
    this.sheetOpen = true;
  }

  closeSheet(): void {
    this.sheetOpen = false;
  }

  addTask(): void {
    if (!this.newText.trim()) return;

    this.taskService.add(this.newText, this.newDate, this.newTime || undefined);
    this.closeSheet();
  }

  toggleDone(id: string): void {
    this.taskService.toggleDone(id);
  }

  deleteTask(id: string): void {
    this.taskService.delete(id);
  }

  // Rótulo amigável de data: "hoje", "amanhã", "em N dias" ou data curta
  dateLabel(dateStr: string): string {
    const today = this.today();
    const diff = this.daysBetween(today, dateStr);

    if (diff === 0) return 'hoje';
    if (diff === 1) return 'amanhã';
    if (diff > 1 && diff <= 7) return `em ${diff} dias`;
    if (diff < 0) return 'atrasada';

    const [, month, day] = dateStr.split('-');
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    return `${day} ${months[Number(month) - 1]}`;
  }

  isUrgent(dateStr: string): boolean {
    const diff = this.daysBetween(this.today(), dateStr);
    return diff <= 0;
  }

  private today(): string {
    return new Date().toISOString().split('T')[0];
  }

  private daysBetween(fromStr: string, toStr: string): number {
    const from = new Date(fromStr);
    const to = new Date(toStr);
    const ms = to.getTime() - from.getTime();
    return Math.round(ms / (1000 * 60 * 60 * 24));
  }
}