import type { CatDef } from '../types';

/** The classic 9 Esm-o-Famil rows, in traditional order. */
export const CATEGORIES: CatDef[] = [
  { id: 'name', en: 'First Name', fa: 'اسم', color: '#e0556b' },
  { id: 'family', en: 'Last Name', fa: 'فامیل', color: '#c2410c' },
  { id: 'city', en: 'City', fa: 'شهر', color: '#0d9488' },
  { id: 'country', en: 'Country', fa: 'کشور', color: '#2563eb' },
  { id: 'plant', en: 'Plant / Fruit', fa: 'گیاه / میوه', color: '#16a34a' },
  { id: 'animal', en: 'Animal', fa: 'حیوان', color: '#d97706' },
  { id: 'object', en: 'Object', fa: 'کالا / اشیاء', color: '#7c3aed' },
  { id: 'color', en: 'Color', fa: 'رنگ', color: '#db2777' },
  { id: 'food', en: 'Food', fa: 'غذا', color: '#b45309' },
];

export const CAT_IDS = CATEGORIES.map((c) => c.id);
