import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css'
})
export class TasksComponent {

  taskText = '';
  taskDate = '';
  taskTime = '';
  reminder = 0;

  tasks: any[] = [];

  constructor() {
    this.loadTasks();
    this.requestNotificationPermission();
  }

  addTask() {
    if (!this.taskText) return;

    const task = {
      text: this.taskText,
      date: this.taskDate,
      time: this.taskTime,
      reminder: this.reminder,
      done: false
    };

    this.tasks.push(task);
    this.saveTasks();

    this.scheduleNotification(task);

    this.taskText = '';
    this.taskDate = '';
    this.taskTime = '';
    this.reminder = 0;
  }

  toggleTask(i: number) {
    this.tasks[i].done = !this.tasks[i].done;
    this.saveTasks();
  }

  deleteTask(i: number) {
    this.tasks.splice(i, 1);
    this.saveTasks();
  }

  saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  loadTasks() {
    const data = localStorage.getItem('tasks');
    if (data) this.tasks = JSON.parse(data);
  }

  requestNotificationPermission() {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }

  scheduleNotification(task: any) {
    if (!task.date || !task.time) return;

    const taskDateTime = new Date(`${task.date}T${task.time}`);

    const notifyTime = new Date(
      taskDateTime.getTime() - (task.reminder * 60000)
    );

    const now = new Date();
    const delay = notifyTime.getTime() - now.getTime();

    if (delay > 0) {
      setTimeout(() => {
        new Notification("📌 Lembrete", {
          body: `${task.text} em ${task.reminder} min`
        });
      }, delay);
    }
  }
}