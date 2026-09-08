/**
 * Leitura/escrita tipada no localStorage, à prova de:
 *  - ambiente sem localStorage (SSR, modo privado antigo)
 *  - JSON corrompido
 *  - cota estourada
 *
 * Nunca lança — no pior caso devolve o fallback e a aplicação segue.
 */

function getStore(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

export function readJson<T>(key: string, fallback: T): T {
  const store = getStore();
  if (!store) return fallback;

  try {
    const raw = store.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  const store = getStore();
  if (!store) return;

  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    // cota cheia ou storage bloqueado — ignora de propósito
  }
}

export function removeKey(key: string): void {
  const store = getStore();
  if (!store) return;
  try {
    store.removeItem(key);
  } catch {
    /* ignore */
  }
}
