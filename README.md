# ✏️ Esm-o-Famil (اسم و فامیل) - Persian Word Game

A polished, full-featured, and interactive browser game version of **"Esm-o-Famil" (اسم و فامیل)** — the traditional Iranian pen-and-paper gathering word game (the Persian equivalent of *Scattergories* or *Stadt, Land, Fluss*).

Built with **React 19**, **Vite**, **TypeScript**, and **Tailwind CSS**, featuring custom **Web Audio API sound synthesis**, real-time **AI family competitors**, **Fingilish-to-Persian auto-conversion**, responsive touch/keyboard controls, and interactive family voting disputes.

---

## ✨ Key Features

- 📜 **Traditional Gathering Gameplay**: 9 categories including First Name (اسم), Last Name (فامیل), City (شهر), Country (کشور), Plant/Fruit (گیاه/میوه), Animal (حیوان), Object (کالا/اشیاء), Color (رنگ), and Food (غذا).
- 🎙️ **Silent Reciter & Alphabet Spinner**: Mimics the nostalgic kitchen-table method where one player recites the alphabet in their head until someone shouts *"STOP!"*.
- 🔀 **Fingilish Auto-Transliteration**: Type using standard English keys (e.g. `amin` -> `امین`, `tehran` -> `تهران`, `shiraz` -> `شیراز`) if you don't have a Persian layout keyboard!
- 👵 **Interactive AI Family Competitors**: Play against 3 AI members with distinct personalities:
  - **Uncle Hassan (عمو حسن)**: Wise elder who knows classical, poetic Farsi words.
  - **Sara (سارا)**: Fast-typing college cousin.
  - **Kian (کیان)**: Playful nephew who writes funny slang or doodles.
- 🗣️ **Family Debates & Voting**: When a player writes an unlisted or rare word, an animated comic debate panel opens where family members argue and you hold the final vote!
- 🔊 **Web Audio Synthesizer**: No external audio files needed! Generates retro clicks, clock ticks, stopping fanfare, buzzers, and victory melodies in real-time.
- 🎆 **60fps Juice & Polish**: Screen shaking, floating badges, and a custom particle engine firing gold confetti and star bursts.
- 🌐 **Bilingual (English / Persian)**: Full RTL (Right-to-Left) and LTR layout toggle.
- 🏆 **Local High Scores & Podium**: Stored in `localStorage` with a 3D winning podium screen.

---

## 🚀 How to Run Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/taisai-khaki/esmo-o-famil.git
   cd esmo-o-famil
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```
   Preview the production build with `npm run preview`.

---

## 📤 How to Deploy This Project

- **Vercel / Netlify**: Connect this repository for instant 1-click deployment (static `dist/` output).
- **GitHub Pages**: Push the `dist/` folder after `npm run build`.

---

## 🧩 How a Round Plays

1. A random family member becomes the **reciter** and "reads the alphabet in their head" — the letter slot spins until you hit **STOP** (button or `Space`).
2. The family races for **75 seconds**: fill up to **3 words per category** (9 categories) with the chosen letter.
3. Words are checked live:
   - ✅ In the family word bank → instant point (+1 with confetti).
   - ⚠️ Unknown Persian word → **Family debate!** The timer pauses, the family argues in a comic panel, and **you cast the final vote**.
   - ❌ Wrong letter / already used / not a word → buzzer + screen shake.
4. After **3 rounds**, the family climbs the **3D podium** and your score joins the local records.

---

## 🛠️ Built With

- **React 19** + **TypeScript**
- **Vite**
- **Tailwind CSS v4**
- **Lucide React Icons**
- **Web Audio API**
