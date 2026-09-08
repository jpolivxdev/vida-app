import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { ReminderService } from './services/reminder.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  // injetado só para iniciar o agendador de lembretes junto com o app
  protected readonly reminders = inject(ReminderService);

  protected readonly nav = [
    { path: '/', exact: true, icon: '🏠', label: 'Início' },
    { path: '/tarefas', exact: false, icon: '✅', label: 'Tarefas' },
    { path: '/financeiro', exact: false, icon: '💰', label: 'Grana' },
    { path: '/lembretes', exact: false, icon: '⏰', label: 'Lembretes' },
  ];
}
