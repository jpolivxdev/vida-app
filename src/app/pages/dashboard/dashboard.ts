import { Component, DoCheck } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements DoCheck {

  name = 'Amor ❤️';

  transactions: any[] = [];
  tasks: any[] = [];

  goal: number = 0;
  saved: number = 0;

  savedMessage = '';
  completed = false;

  today = new Date().toISOString().split('T')[0];

  constructor(private router: Router) {
    this.loadData();
  }

  ngDoCheck() {
    this.loadData();
  }

  goTo(path: string) {
    this.router.navigate([path]);
  }

  loadData() {
    const finance = localStorage.getItem('finance');
    const tasks = localStorage.getItem('tasks');
    const goal = localStorage.getItem('goal');
    const saved = localStorage.getItem('saved');

    if (finance) this.transactions = JSON.parse(finance);
    if (tasks) this.tasks = JSON.parse(tasks);
    if (goal) this.goal = JSON.parse(goal);
    if (saved) this.saved = JSON.parse(saved);
  }

  // 💰 saldo
  getBalance() {
    return this.transactions.reduce((total, t) => {
      return t.type === 'income'
        ? total + t.amount
        : total - t.amount;
    }, 0);
  }

  // 🧠 insight financeiro
  getInsight() {
    if (this.transactions.length === 0) {
      return "Comece registrando seus gastos 💖";
    }

    let total = 0;

    this.transactions.forEach(t => {
      if (t.type === 'expense') total += t.amount;
    });

    return `Você já gastou R$ ${total} 💸`;
  }

  // 📋 tarefas de hoje
  getTodayTasks() {
    return this.tasks.filter(t =>
      !t.done && t.date === this.today
    );
  }

  // 📅 próximas tarefas
  getNextTasks() {
    return this.tasks
      .filter(t => !t.done && t.date && t.date > this.today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3);
  }

  // 🧠 alerta inteligente
  getTaskAlert() {
    const count = this.getTodayTasks().length;

    if (count === 0) return "Nenhuma tarefa hoje 😌";
    if (count === 1) return "Você tem 1 tarefa hoje 📌";

    return `Você tem ${count} tarefas hoje ⚡`;
  }

  // 🎯 meta
  saveGoal() {
    localStorage.setItem('goal', JSON.stringify(this.goal));
    localStorage.setItem('saved', JSON.stringify(this.saved));

    this.savedMessage = "Salvo com sucesso 💖";

    if (this.saved >= this.goal && this.goal > 0) {
      this.completed = true;
      this.savedMessage = "🎉 Meta atingida!";
    }

    setTimeout(() => this.savedMessage = '', 3000);
  }

  addSaved(value: number) {
    this.saved += value;
    this.saveGoal();
  }

  getProgress() {
    if (this.goal === 0) return 0;
    return (this.saved / this.goal) * 100;
  }
}