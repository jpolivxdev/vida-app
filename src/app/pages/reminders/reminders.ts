import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { relativeDayLabel } from '../../core/date.util';
import { ReminderService } from '../../services/reminder.service';

@Component({
  selector: 'app-reminders',
  imports: [RouterLink],
  templateUrl: './reminders.html',
  styleUrl: './reminders.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RemindersPage {
  protected readonly reminders = inject(ReminderService);

  protected readonly statusText = computed(() => {
    switch (this.reminders.permission()) {
      case 'granted':
        return 'Ativado — os avisos aparecem na tela e como notificação.';
      case 'denied':
        return 'Bloqueado nas configurações do navegador. Os avisos ainda aparecem dentro do app.';
      case 'unsupported':
        return 'Este navegador não suporta notificações. Os avisos aparecem dentro do app.';
      default:
        return 'Toque em "Ativar notificações" para receber avisos mesmo com o app em segundo plano.';
    }
  });

  protected readonly canAskPermission = computed(
    () => this.reminders.permission() === 'default',
  );

  protected timeLabel(date: Date): string {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  protected dayLabel(date: Date): string {
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0',
    )}-${String(date.getDate()).padStart(2, '0')}`;
    return relativeDayLabel(iso);
  }

  protected enable(): void {
    void this.reminders.enable();
  }
}
