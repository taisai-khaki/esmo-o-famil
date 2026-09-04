/**
 * Fingilish → Persian transliteration.
 *
 * Converts standard English-keyboard romanization into Persian script,
 * following the conventions Iranian speakers actually type with
 * (e.g. tehran → تهران, shiraz → شیراز, amin → امین, shirazi → شیرازی).
 */

const SINGLE: Record<string, string> = {
  a: 'ا',
  b: 'ب',
  p: 'پ',
  t: 'ت',
  j: 'ج',
  h: 'ه',
  x: 'خ',
  d: 'د',
  r: 'ر',
  z: 'ز',
  s: 'س',
  v: 'و',
  f: 'ف',
  q: 'ق',
  k: 'ک',
  g: 'گ',
  l: 'ل',
  m: 'م',
  n: 'ن',
  o: 'و',
  u: 'و',
  w: 'و',
  y: 'ی',
  e: 'ا',
  i: 'ی',
  é: 'ا',
  á: 'ا',
  â: 'ا',
  ö: 'و',
  ü: 'و',
  ' ': '',
};

/**
 * Multi-character digraphs — checked before single letters,
 * longest first. Order within the same length matters: more specific first.
 */
const MULTI: [string, string][] = [
  ['tem', 'طم'], // "fatemeh" -> فاطمه
  ['kh', 'خ'],
  ['ch', 'چ'],
  ['sh', 'ش'],
  ['zh', 'ژ'],
  ['tm', 'ط'], // "fatmeh" -> فاطمه
  ['eh', 'ه'], // "tehran" -> تهران, "meh" -> مه
  ['hh', 'ه'],
  ['ay', 'ای'],
  ['ai', 'ای'],
  ['ey', 'ای'],
  ['iy', 'ای'],
  ['oy', 'وی'],
  ['uy', 'وی'],
  ['ui', 'وی'],
  ['ue', 'وی'],
  ['oo', 'و'],
];

export function translit(input: string): string {
  const lower = input.toLowerCase();
  let out = '';
  let i = 0;
  while (i < lower.length) {
    let consumed = false;
    // longest digraphs first (3-char, then 2-char, then single letter)
    for (const len of [3, 2]) {
      const two = lower.slice(i, i + len);
      const multi = MULTI.find(([m]) => m.length === len && m === two);
      if (multi) {
        out += multi[1];
        i += len;
        consumed = true;
        break;
      }
    }
    if (consumed) continue;
    const c = lower[i];
    if (c in SINGLE) {
      out += SINGLE[c];
    } else if (/[0-9،.]/.test(c)) {
      out += c;
    }
    i += 1;
  }
  return out.replace(/\s+/g, ' ').trim();
}

export function containsLatin(s: string): boolean {
  return /[a-zA-Z]/.test(s);
}

/** If the raw input is romanized, return its Persian form; otherwise return as-is. */
export function toPersian(raw: string): string {
  return containsLatin(raw) ? translit(raw) : raw.trim();
}
