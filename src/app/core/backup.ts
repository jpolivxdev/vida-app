import { Goal } from '../models/goal';
import { Task } from '../models/task';
import { Transaction } from '../models/transaction';

/** Formato do arquivo de backup. O FinTrack importa exatamente este formato. */
export interface VidaBackup {
  app: 'vida-app';
  version: 1;
  exportedAt: string;
  transactions: Transaction[];
  tasks: Task[];
  goal: Goal;
}

export function buildBackup(transactions: Transaction[], tasks: Task[], goal: Goal): VidaBackup {
  return { app: 'vida-app', version: 1, exportedAt: new Date().toISOString(), transactions, tasks, goal };
}

export function backupFileName(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `vida-backup-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.json`;
}

/**
 * Entrega o arquivo: no celular abre a folha de compartilhar (salvar em Arquivos,
 * mandar no WhatsApp...), no computador baixa direto.
 */
export async function deliverBackup(backup: VidaBackup): Promise<'shared' | 'downloaded'> {
  const json = JSON.stringify(backup, null, 2);
  const file = new File([json], backupFileName(), { type: 'application/json' });

  if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Backup do Vida' });
      return 'shared';
    } catch (err) {
      // usuária cancelou a folha de compartilhar: não baixa por cima
      if (err instanceof DOMException && err.name === 'AbortError') return 'shared';
    }
  }

  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return 'downloaded';
}

/** Alternativa se o arquivo não der certo: copia o JSON para colar no FinTrack. */
export async function copyBackup(backup: VidaBackup): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(JSON.stringify(backup));
    return true;
  } catch {
    return false;
  }
}
