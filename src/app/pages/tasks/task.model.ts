export interface Task {
  id: string;
  text: string;
  date: string; // formato YYYY-MM-DD
  time?: string;
  done: boolean;
}

export interface Goal {
  target: number;
  saved: number;
}