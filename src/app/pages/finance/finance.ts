import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finance.html',
  styleUrl: './finance.css'
})
export class FinanceComponent {

  description = '';
  amount: number = 0;
  type = 'expense';

  categories = [
    'Alimentação',
    'Transporte',
    'Lazer',
    'Compras',
    'Outros'
  ];
  category = 'Alimentação';

  transactions: any[] = [];

  chart: any;

  constructor() {
    this.loadData();

    setTimeout(() => {
      this.createChart();
    }, 100);
  }

  addTransaction() {
    if (!this.description || !this.amount) return;

    this.transactions.push({
      description: this.description,
      amount: this.amount,
      type: this.type,
      category: this.category,
      date: new Date().toISOString()
    });

    this.description = '';
    this.amount = 0;

    this.saveData();
    this.createChart();
  }

  deleteTransaction(transaction: any) {
    this.transactions = this.transactions.filter(t => t !== transaction);
    this.saveData();
    this.createChart();
  }

  getBalance() {
    return this.transactions.reduce((total, t) => {
      return t.type === 'income'
        ? total + t.amount
        : total - t.amount;
    }, 0);
  }

  getMonthlySummary() {
    const currentMonth = new Date().getMonth();
    let total = 0;

    this.transactions.forEach(t => {
      const date = new Date(t.date);

      if (date.getMonth() === currentMonth) {
        total += t.type === 'income' ? t.amount : -t.amount;
      }
    });

    return total;
  }

  getTransactionsByDay() {
    const groups: any = {};

    this.transactions.forEach(t => {
      const day = new Date(t.date).toLocaleDateString();

      if (!groups[day]) {
        groups[day] = [];
      }

      groups[day].push(t);
    });

    return groups;
  }

  // 📊 gráfico
  createChart() {
    const categoryTotals: any = {};

    this.transactions.forEach(t => {
      if (t.type === 'expense') {
        if (!categoryTotals[t.category]) {
          categoryTotals[t.category] = 0;
        }
        categoryTotals[t.category] += t.amount;
      }
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    const colors: any = {
      'Alimentação': '#ff7aa2',
      'Transporte': '#4dabf7',
      'Lazer': '#9775fa',
      'Compras': '#ffa94d',
      'Outros': '#adb5bd'
    };

    const backgroundColors = labels.map((l: string) => colors[l] || '#ccc');

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart('financeChart', {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColors,
          borderRadius: 10
        }]
      },
      options: {
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  // 🧠 INSIGHT PRINCIPAL
  getInsights() {
    if (this.transactions.length === 0) {
      return "Adicione gastos para ver insights 👀";
    }

    const categoryTotals: any = {};

    this.transactions.forEach(t => {
      if (t.type === 'expense') {
        if (!categoryTotals[t.category]) {
          categoryTotals[t.category] = 0;
        }
        categoryTotals[t.category] += t.amount;
      }
    });

    let highestCategory = '';
    let highestValue = 0;

    for (let cat in categoryTotals) {
      if (categoryTotals[cat] > highestValue) {
        highestValue = categoryTotals[cat];
        highestCategory = cat;
      }
    }

    return `Você gastou mais com ${highestCategory} (R$ ${highestValue}) 👀`;
  }

  // 📅 GASTO SEMANA ATUAL
  getCurrentWeekTotal() {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));

    let total = 0;

    this.transactions.forEach(t => {
      const date = new Date(t.date);

      if (date >= weekStart && t.type === 'expense') {
        total += t.amount;
      }
    });

    return total;
  }

  // 📅 GASTO SEMANA PASSADA
  getLastWeekTotal() {
    const now = new Date();
    const startOfThisWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    let total = 0;

    this.transactions.forEach(t => {
      const date = new Date(t.date);

      if (
        date >= startOfLastWeek &&
        date < startOfThisWeek &&
        t.type === 'expense'
      ) {
        total += t.amount;
      }
    });

    return total;
  }

  // 🧠 COMPARAÇÃO SEMANAL
  getWeeklyComparison() {
    const current = this.getCurrentWeekTotal();
    const last = this.getLastWeekTotal();

    if (last === 0) {
      return "Sem dados da semana passada ainda 📊";
    }

    if (current > last) {
      return `Você gastou mais que na semana passada 📈`;
    } else if (current < last) {
      return `Você economizou essa semana 👏`;
    } else {
      return `Se manteve igual à semana passada 😎`;
    }
  }

  // 💾 salvar
  saveData() {
    localStorage.setItem('finance', JSON.stringify(this.transactions));
  }

  loadData() {
    const data = localStorage.getItem('finance');
    if (data) {
      this.transactions = JSON.parse(data);
    }
  }
}