import { Routes } from '@angular/router';

// estamos importando os COMPONENTES (as telas)
import { DashboardComponent } from './pages/dashboard/dashboard';
import { FinanceComponent } from './pages/finance/finance';
import { TasksComponent } from './pages/tasks/tasks';
import { RemindersComponent } from './pages/reminders/reminders';
export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'tasks', component: TasksComponent },
  { path: 'finance', component: FinanceComponent },
  { path: 'reminders', component: RemindersComponent },
];