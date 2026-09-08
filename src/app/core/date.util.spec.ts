import { describe, expect, it } from 'vitest';

import {
  daysBetween,
  parseLocalDate,
  relativeDayLabel,
  toLocalIsoDate,
} from './date.util';

describe('date.util', () => {
  it('toLocalIsoDate usa o fuso local (não UTC)', () => {
    // 23:30 no horário local — o bug antigo com toISOString() pularia para o dia seguinte
    const lateNight = new Date(2026, 8, 8, 23, 30, 0);
    expect(toLocalIsoDate(lateNight)).toBe('2026-09-08');
  });

  it('parseLocalDate volta para meia-noite local', () => {
    const d = parseLocalDate('2026-09-08');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(8);
    expect(d.getDate()).toBe(8);
    expect(d.getHours()).toBe(0);
  });

  it('daysBetween conta dias inteiros', () => {
    expect(daysBetween('2026-09-08', '2026-09-08')).toBe(0);
    expect(daysBetween('2026-09-08', '2026-09-09')).toBe(1);
    expect(daysBetween('2026-09-10', '2026-09-08')).toBe(-2);
  });

  it('relativeDayLabel gera rótulos amigáveis', () => {
    const base = '2026-09-08';
    expect(relativeDayLabel('2026-09-08', base)).toBe('hoje');
    expect(relativeDayLabel('2026-09-09', base)).toBe('amanhã');
    expect(relativeDayLabel('2026-09-07', base)).toBe('ontem');
    expect(relativeDayLabel('2026-09-05', base)).toBe('atrasada');
    expect(relativeDayLabel('2026-09-11', base)).toBe('em 3 dias');
    expect(relativeDayLabel('2026-10-20', base)).toBe('20 out');
  });
});
