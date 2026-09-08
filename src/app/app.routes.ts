import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Início · Vida',
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then((m) => m.DashboardPage),
  },
  {
    path: 'tarefas',
    title: 'Tarefas · Vida',
    loadComponent: () => import('./pages/tasks/tasks').then((m) => m.TasksPage),
  },
  {
    path: 'financeiro',
    title: 'Financeiro · Vida',
    loadComponent: () =>
      import('./pages/finance/finance').then((m) => m.FinancePage),
  },
  {
    path: 'lembretes',
    title: 'Lembretes · Vida',
    loadComponent: () =>
      import('./pages/reminders/reminders').then((m) => m.RemindersPage),
  },
  // rotas antigas em inglês continuam funcionando para links salvos
  { path: 'tasks', redirectTo: 'tarefas' },
  { path: 'finance', redirectTo: 'financeiro' },
  { path: 'reminders', redirectTo: 'lembretes' },
  { path: '**', redirectTo: '' },
];
