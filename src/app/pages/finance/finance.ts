import { Component, ElementRef, ViewChild, AfterViewInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';
import { FinanceService } from './finance.service';
import { Category, TransactionType } from './transaction.model';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finance.html',
  styleUrl: './finance.css'
})
export class FinanceComponent implements AfterViewInit {

  // @ViewChild garante que só acessamos o canvas depois que ele
  // existe de fato no DOM — sem precisar de setTimeout artificial.
  @ViewChild('financeChart') chartRef!: ElementRef<HTMLCanvasElement>;

  description = '';
  amount: number | null = null;
  type: TransactionType = 'expense';
  category: Category = 'Alimentação';

  readonly categories: Category[] = [
    'Alimentação', 'Transporte', 'Lazer', 'Compras', 'Outros'
  ];

  private chart?: Chart;

  // O constructor precisa vir ANTES das propriedades que usam
  // "this.finance" — em TS/JS as propriedades de instância são
  // inicializadas na ordem em que aparecem na classe, então
  // "this.finance" só existe a partir daqui pra baixo.
  constructor(private finance: FinanceService) {
    // Dados e cálculos vêm do service — o componente só "exibe".
  }

  get transactions() {
    return this.finance.transactions;
  }

  get balance() {
    return this.finance.balance;
  }

  get expensesByCategory() {
    return this.finance.expensesByCategory;
  }

  readonly weeklyComparisonMessage = computed(() =>
    this.finance.getWeeklyComparisonMessage()
  );

  readonly mainInsight = computed(() => {
    const byCategory = this.expensesByCategory();
    if (byCategory.length === 0) return 'Adicione gastos para ver insights 👀';

    const top = byCategory.reduce((max, c) => c.total > max.total ? c : max);
    return `Você gastou mais com ${top.category} (R$ ${top.total}) 👀`;
  });

  ngAfterViewInit(): void {
    this.createChart();
  }

  addTransaction(): void {
    if (!this.amount) return;

    this.finance.add({
      description: this.description,
      amount: this.amount,
      type: this.type,
      category: this.category
    });

    this.description = '';
    this.amount = null;
    this.createChart();
  }

  deleteTransaction(id: string): void {
    this.finance.delete(id);
    this.createChart();
  }

  groupedByDay() {
    return this.finance.groupByDay();
  }

  private createChart(): void {
    const byCategory = this.expensesByCategory();

    this.chart?.destroy();

    this.chart = new Chart(this.chartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: byCategory.map(c => c.category),
        datasets: [{
          data: byCategory.map(c => c.total),
          backgroundColor: byCategory.map(c => this.finance.getColorFor(c.category)),
          borderRadius: 10
        }]
      },
      options: {
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }
}