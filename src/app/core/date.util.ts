/**
 * Helpers de data no fuso do dispositivo.
 *
 * O bug da versão anterior era usar `new Date().toISOString()` para achar
 * "hoje" — isso devolve a data em UTC, então depois das 21h no horário de
 * Brasília a tarefa criada "hoje" já aparecia como "amanhã". Aqui tudo é
 * calculado a partir dos componentes locais do Date.
 */

/** Data local no formato YYYY-MM-DD. */
export function toLocalIsoDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** String YYYY-MM-DD de hoje. */
export function todayIso(): string {
  return toLocalIsoDate();
}

/** Converte YYYY-MM-DD para Date local à meia-noite (sem surpresa de UTC). */
export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** Diferença em dias inteiros entre duas datas YYYY-MM-DD (to - from). */
export function daysBetween(fromIso: string, toIso: string): number {
  const from = parseLocalDate(fromIso).getTime();
  const to = parseLocalDate(toIso).getTime();
  return Math.round((to - from) / 86_400_000);
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

/** Domingo 00:00 da semana da data informada (não muta o argumento). */
export function startOfWeek(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - copy.getDay());
  return copy;
}

const MONTHS_PT = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

/** Rótulo curto e humano: "hoje", "amanhã", "em 3 dias", "atrasada", "12 mai". */
export function relativeDayLabel(dateIso: string, baseIso: string = todayIso()): string {
  const diff = daysBetween(baseIso, dateIso);
  if (diff === 0) return 'hoje';
  if (diff === 1) return 'amanhã';
  if (diff === -1) return 'ontem';
  if (diff < 0) return 'atrasada';
  if (diff <= 7) return `em ${diff} dias`;

  const d = parseLocalDate(dateIso);
  return `${d.getDate()} ${MONTHS_PT[d.getMonth()]}`;
}
