export interface Task {
  id: string;
  text: string;
  date: string; // YYYY-MM-DD (local)
  time?: string; // HH:mm
  done: boolean;
  /** minutos de antecedência para o lembrete; ausente = sem lembrete */
  remindBefore?: number;
  createdAt: string; // ISO datetime
}

export const REMIND_OPTIONS: readonly { label: string; minutes: number }[] = [
  { label: 'Sem lembrete', minutes: 0 },
  { label: '10 min antes', minutes: 10 },
  { label: '30 min antes', minutes: 30 },
  { label: '1 hora antes', minutes: 60 },
] as const;
