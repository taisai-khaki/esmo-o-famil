/**
 * Persian (Farsi) alphabet — display order.
 * 28 core letters + آ (alef-maqsura) which is treated as its own spinner tile.
 */
export const FA_LETTERS: string[] = [
  'ا', 'آ', 'ب', 'پ', 'ت', 'ث', 'ج', 'چ', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز',
  'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ک', 'گ', 'ل', 'م',
  'ن', 'ه', 'و', 'ی',
];

export const FA_LETTERS_SET = new Set(FA_LETTERS);
