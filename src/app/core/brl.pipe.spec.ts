import { describe, expect, it } from 'vitest';

import { BrlPipe, formatBrl } from './brl.pipe';

const NBSP = String.fromCharCode(0x00a0);
const NNBSP = String.fromCharCode(0x202f);

describe('formatBrl', () => {
  it('formata numero como moeda brasileira', () => {
    expect(formatBrl(10.5)).toBe('R$ 10,50');
    expect(formatBrl(1234.56)).toBe('R$ 1.234,56');
  });

  it('normaliza espaco nao separavel para espaco ASCII', () => {
    const out = formatBrl(1);
    expect(out.includes(NBSP)).toBe(false);
    expect(out.includes(NNBSP)).toBe(false);
    expect(out).toBe('R$ 1,00');
  });

  it('trata nulo/indefinido/NaN como zero', () => {
    expect(formatBrl(null)).toBe('R$ 0,00');
    expect(formatBrl(undefined)).toBe('R$ 0,00');
    expect(formatBrl(Number.NaN)).toBe('R$ 0,00');
  });

  it('a pipe delega para formatBrl', () => {
    expect(new BrlPipe().transform(42)).toBe(formatBrl(42));
  });
});
