export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function mixSeed(seed: number, key: string): number {
  let h = seed >>> 0;
  for (let i = 0; i < key.length; i++) {
    h = Math.imul(h ^ key.charCodeAt(i), 0x5bd1e995);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  return (h ^ (h >>> 13)) >>> 0;
}

export function shuffle<T>(list: T[], rng: () => number): T[] {
  const arr = list.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

export function freshSeed(): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] || 1;
}

export function formatSeed(seed: number): string {
  return (seed >>> 0).toString(36).toUpperCase();
}

export function parseSeed(text: string): number | null {
  const cleaned = text.trim().toLowerCase();
  if (!/^[0-9a-z]+$/.test(cleaned)) return null;
  const n = Number.parseInt(cleaned, 36);
  if (!Number.isFinite(n) || n < 0) return null;
  return n >>> 0;
}
