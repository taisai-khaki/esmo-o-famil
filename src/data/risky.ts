import type { Personality } from '../types';

/**
 * Kian's "risky" words — absurd, funny, definitely debatable.
 * Any of these opens the family debate panel.
 */
export const RISKY_WORDS: Record<string, string[]> = {
  name: ['پپه‌نک', 'چیتابا', 'بوزبازی', 'چیپس', 'کروکی', 'پاپوشی', 'شیرپاک', 'جیگرکیان', 'نوزادی', 'بامبام'],
  family: ['قندیلو', 'بامبام‌خان', 'چیتون‌خان', 'پاتکینو', 'کرتی', 'نیمک', 'چربک', 'دوپینگ'],
  city: ['کوچه‌پهنه', 'شهرستان‌مو', 'دشت‌پرتقال', 'کوه‌نمک', 'رودخانه‌شیر', 'گوره‌شیرینی', 'پل‌چرخی', 'سنگ‌زر'],
  country: ['جمهوری‌شکلات', 'اقیانوس‌پنیر', 'کشور‌نوزاد', 'قاره‌نمکین', 'دولت‌برف'],
  plant: ['کرفس‌موشی', 'انگور‌باتری', 'کدو‌فضاپیما', 'سیب‌ربات', 'گل‌خندان', 'چوب‌دندانی'],
  animal: ['خرگوش‌ربات', 'موش‌پرنده', 'ببر‌پنیری', 'قورباغه‌حسین', 'شیر‌خوابالو', 'مگس‌فضایی', 'کوسه‌پنیری'],
  object: ['صندلی‌پرنده', 'قلم‌مغناطیسی', 'آینه‌شکسته', 'دسته‌کشک', 'پنیر‌برقی'],
  color: ['بنفش‌خسته', 'سبز‌مورچه', 'قرمز‌پنبه‌ای', 'طوسی‌خودرویی', 'زرد‌شکلاتی'],
  food: ['کباب‌فضایی', 'چای‌پنیری', 'نان‌ربات', 'پلو‌چت', 'آش‌ببر', 'بستنی‌یخ‌فرهنگ'],
};

export interface DebateLine {
  en: string;
  fa: string;
}

/**
 * Personality-flavored debate lines. Each AI picks a line matching its vote,
 * so the comic beats line up with the actual votes shown.
 */
export const DEBATE_LINES: Record<Personality, { support: DebateLine[]; skeptic: DebateLine[] }> = {
  hassan: {
    support: [
      { en: 'Hmm… acceptable. A word like a quiet garden.', fa: 'همم… قابل است. کلمه‌ای همچون باغی آرام.' },
      { en: 'In my day we wrote more modest words, but I accept this one.', fa: 'ما آن روزگار، کلمه‌های ساده‌تر می‌نوشتیم، اما این را می‌پذیرم.' },
      { en: 'I have seen stranger words in poetry. It passes.', fa: 'در شعر، کلمات عجیب‌تر از این دیده‌ام. قبول است.' },
      { en: 'Your grandfather would have accepted it. So shall I.', fa: 'پدربزرگِ تو آن را قبول می‌کرد. پس من هم می‌پذیرم.' },
    ],
    skeptic: [
      { en: 'Back in my day, words had roots! This one? Not in my dictionary.', fa: 'ما آن روزگار، کلمه‌های اصیل می‌نوشتیم. این؟ در لغت‌نامه‌ی من نیست.' },
      { en: 'A child could make up that word and call it lunch. No.', fa: 'هر بچه‌ای می‌تواند آن کلمه را اختراع کند و بگوید ناهار است. نه.' },
      { en: 'Our language is ancient. We do not write such things.', fa: 'زبانِ ما کهن است. ما چنین چیزهایی نمی‌نویسیم.' },
      { en: 'I raised the word "respect". This one shows none.', fa: 'من کلمه‌ی «احترام» را بزرگ کرده‌ام. این یکی، هیچ احترامی ندارد.' },
    ],
  },
  sara: {
    support: [
      { en: 'I just checked the dictionary app — totally valid, trust me!', fa: 'فقط با اپلیکیشنِ لغت‌نامه چک کردم — کاملاً معتبر است، باور کن!' },
      { en: 'It passed my spelling test. That counts for something.', fa: 'از امتحانِ املای من رد شد. این خودش یک چیز است.' },
      { en: 'My professor says creativity is part of language. Yes vote!', fa: 'استادم گفته خلاقیت بخشی از زبان است. رأی مثبت!' },
      { en: 'Okay, I googled it… it is weird, but it works. Yes!', fa: 'باشه، گوگلش کردم… عجیب است، اما جواب می‌دهد. بله!' },
    ],
    skeptic: [
      { en: 'Uh… it is not in Farhang. Let me double-check.', fa: 'اُهم… در فارخ نیست. دوباره چک می‌کنم.' },
      { en: 'My dictionary app is shaking its head. That is a no.', fa: 'اپلیکیشنِ لغت‌نامه‌ی من سر تکان می‌دهد. یعنی نه.' },
      { en: 'It fails my spelling test on page 47. Sorry.', fa: 'در امتحانِ املای صفحه‌ی ۴۷ شکست خورد. متأسفم.' },
      { en: 'I cannot believe I have to fact-check my own family.', fa: 'باور نمی‌کنم باید روی خانواده‌ی خودم فکت‌چک کنم.' },
    ],
  },
  kian: {
    support: [
      { en: 'GREAT word! I am drawing a picture of it right now!', fa: 'چه کلمه‌ی عالی! همین الان دارم نقاشی‌اش را می‌کشم!' },
      { en: '10 out of 10! It sounds like a superhero name.', fa: '۱۰ از ۱۰! مثل اسم ابرقهرمان به گوش می‌رسد.' },
      { en: 'If Uncle Hassan does not like it, I will paint it on the wall.', fa: 'اگر عمو حسن قبول نکند، روی دیوار نقاشی‌اش می‌کنم.' },
      { en: 'It is valid! I am naming my hamster that!', fa: 'درست است! همین حالا شپوتِ خودم را با همان صدا می‌گذارم!' },
    ],
    skeptic: [
      { en: 'Wait — I made that word up. Can I keep it?', fa: 'صبر کن — من آن کلمه را اختراع کردم. می‌شود نگهش دارم؟' },
      { en: 'Honestly? A little too long. I would make a shorter one.', fa: 'راستش را بخواهم؟ کمی بلند است. من یکی کوتاه‌تر می‌سازم.' },
      { en: 'No no no — Sara always says no! I say… also no.', fa: 'نه نه نه — سارا همیشه «نه» می‌گوید! من هم… باز هم «نه».' },
      { en: 'I only accept words that rhyme with "popcorn". This one fails.', fa: 'فقط کلماتی را قبول دارم که با «پُپ‌کورن» قافیه شوند. این رد شد.' },
    ],
  },
};

/** Probability each personality votes "valid" for a disputed word. */
export const VOTE_TENDENCY: Record<Personality, number> = {
  hassan: 0.3,
  sara: 0.55,
  kian: 0.85,
};
