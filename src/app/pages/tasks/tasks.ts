import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { relativeDayLabel, todayIso } from '../../core/date.util';
import { REMIND_OPTIONS, Task } from '../../models/task';
import { TaskService } from '../../services/task.service';

type Filter = 'all' | 'today' | 'upcoming';

@Component({
  selector: 'app-tasks',
  imports: [FormsModule],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksPage {
  protected readonly tasks = inject(TaskService);
  protected readonly remindOptions = REMIND_OPTIONS;

  protected readonly filter = signal<Filter>('all');
  protected readonly sheetOpen = signal(false);

  protected readonly draft = signal({
    text: '',
    date: todayIso(),
    time: '',
    remindBefore: 0,
  });

  protected readonly visible = computed<Task[]>(() => {
    const pending = this.tasks.pending();
    const today = todayIso();
    switch (this.filter()) {
      case 'today':
        return pending.filter((t) => t.date === today);
      case 'upcoming':
        return pending.filter((t) => t.date > today);
      default:
        return pending;
    }
  });

  protected dayLabel(dateIso: string): string {
    return relativeDayLabel(dateIso);
  }

  protected isUrgent(task: Task): boolean {
    return this.tasks.isUrgent(task);
  }

  protected patch(key: 'text' | 'date' | 'time', value: string): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  protected setRemind(minutes: number): void {
    this.draft.update((d) => ({ ...d, remindBefore: minutes }));
  }

  protected openSheet(): void {
    this.draft.set({ text: '', date: todayIso(), time: '', remindBefore: 0 });
    this.sheetOpen.set(true);
  }

  protected closeSheet(): void {
    this.sheetOpen.set(false);
  }

  protected addTask(): void {
    const d = this.draft();
    const created = this.tasks.add({
      text: d.text,
      date: d.date,
      time: d.time || undefined,
      remindBefore: d.remindBefore || undefined,
    });
    if (created) this.closeSheet();
  }

  protected toggle(id: string): void {
    this.tasks.toggle(id);
  }

  protected remove(id: string): void {
    this.tasks.remove(id);
  }
}
