import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ArcElement,
  Chart,
  DoughnutController,
  Legend,
  Tooltip,
} from 'chart.js';

import { BrlPipe, formatBrl } from '../../core/brl.pipe';
import {
  CATEGORIES,
  Category,
  TransactionType,
  categoryColor,
} from '../../models/transaction';
import { FinanceService } from '../../services/finance.service';

Chart.register(DoughnutController, ArcElement, Legend, Tooltip);

@Component({
  selector: 'app-finance',
  imports: [FormsModule, BrlPipe],
  templateUrl: './finance.html',
  styleUrl: './finance.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinancePage {
  protected readonly finance = inject(FinanceService);

  private readonly canvas =
    viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');
  private chart?: Chart;

  protected readonly categories = CATEGORIES;
  protected readonly color = categoryColor;

  protected readonly description = signal('');
  protected readonly amount = signal<number | null>(null);
  protected readonly type = signal<TransactionType>('expense');
  protected readonly category = signal<Category>('Alimentação');
  protected readonly formOpen = signal(false);
  protected readonly error = signal('');

  protected readonly topInsight = computed(() => {
    const top = this.finance.topCategory();
    if (!top) return 'Registre gastos para ver seus insights 👀';
    return `Maior gasto: ${top.category} — ${formatBrl(top.total)}`;
  });

  protected readonly hasChart = computed(
    () => this.finance.expensesByCategory().length > 0,
  );

  constructor() {
    effect(() => {
      const el = this.canvas()?.nativeElement;
      const data = this.finance.expensesByCategory();
      if (!el) return;

      if (data.length === 0) {
        this.chart?.destroy();
        this.chart = undefined;
        return;
      }

      const labels = data.map((d) => d.category);
      const values = data.map((d) => d.total);
      const colors = data.map((d) => categoryColor(d.category));

      if (this.chart) {
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = values;
        this.chart.data.datasets[0].backgroundColor = colors;
        this.chart.update();
        return;
      }

      this.chart = new Chart(el, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [
            { data: values, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '62%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: { boxWidth: 10, boxHeight: 10, padding: 12, font: { size: 11 } },
            },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.label}: ${formatBrl(Number(ctx.raw))}`,
              },
            },
          },
        },
      });
    });
  }

  protected toggleForm(): void {
    this.formOpen.update((v) => !v);
    this.error.set('');
  }

  protected submit(): void {
    const ok = this.finance.add({
      description: this.description(),
      amount: Number(this.amount()),
      type: this.type(),
      category: this.category(),
    });

    if (!ok) {
      this.error.set('Preencha uma descrição e um valor maior que zero.');
      return;
    }

    this.description.set('');
    this.amount.set(null);
    this.error.set('');
    this.formOpen.set(false);
  }

  protected remove(id: string): void {
    this.finance.remove(id);
  }
}
