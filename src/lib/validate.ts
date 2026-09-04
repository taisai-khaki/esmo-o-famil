/**
 * Word normalization + validation helpers.
 *
 * Persian input varies wildly (alef variants, yeh variants, ZWNJ spaces),
 * so every comparison happens in normalized space.
 */

export const ZWNJ = '\u200c';

export function normalizeFa(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\u200b\u200c\u200f\u0640\s]/g, '') // zero-width + ZWNJ + tatweel + spaces
    .replace(/[أإآٱ]/g, 'ا') // alef variants
    .replace(/[یى]/g, 'ی') // yeh variants
    .replace(/ة/g, 'ه'); // taa marbuta
}

const FA_RE = /[\u0600-\u06FF]/;

export function isPersianText(s: string): boolean {
  return FA_RE.test(s) && !/[a-zA-Z]/.test(s);
}

export function startsWithLetter(word: string, letter: string): boolean {
  return normalizeFa(word).startsWith(normalizeFa(letter));
}
