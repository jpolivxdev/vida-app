import { Pipe, PipeTransform } from '@angular/core';

const FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/** Formata número como moeda: 10.5 -> "R$ 10,50". Sem precisar registrar locale. */
export function formatBrl(value: number | null | undefined): string {
  // ICU separa "R$" do número com espaco nao separavel; normaliza para espaco comum
  return FORMATTER.format(Number(value) || 0).replace(/\s/g, ' ');
}

@Pipe({ name: 'brl' })
export class BrlPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return formatBrl(value);
  }
}
