# ⚔️ Pixel-Monsters Arena

A lightweight, retro-inspired incremental auto-battler built entirely in React. Assemble a squad of pocket monsters, strategize your lineup order, and challenge scaling waves of enemy vanguards and monumental cosmic bosses.

---

## 🎮 Game Features

*   **Strategic Auto-Combat:** Position your squad carefully. Monsters automatically clash with enemy vanguards based on your lineup order in automated, fast-paced tactical rounds.
*   **Dynamic Wave Scaling:** Experience fully balanced progression. Both **Gold** and **EXP** rewards scale organically the deeper you venture into the arena, preventing late-game grinding stagnation.
*   **The Titan Milestones:** Every 10 waves, your squad face off against heavy-hitting, custom-rendered epic bosses:
    *   🌌 **Nebula-Kraken:** A cosmic deity radiating deep violet and neon magenta.
    *   ⚙️ **Rust-Behemoth:** A hulking industrial mecha built from reinforced plates.
    *   ⏳ **Chrono-Specter:** An ethereal, floating phantom manipulation clock-face geometry.
*   **Trainer Guild Progression:** Invest hard-earned gold back into your squad at the Training Center or hit the Academy to level up your Trainer Rank and unlock more monster deployment slots.

---

## 🎨 Custom Pixel Rendering Engine

Unlike traditional games that rely on bulky image assets, **Pixel-Monsters Arena** utilizes a lightweight, CSS-driven matrix rendering engine. 

Monsters and Titans are mapped directly as 16x16 coordinate grids inside `sprites.js`. The engine matches custom alphanumeric and numerical IDs against a centralized hexadecimal `COLOR_MAP`, dynamically injecting optimized inline styles to generate sharp, responsive pixel art on the fly.

---

## 🛠️ Tech Stack

*   **Framework:** React (Vite)
*   **Styling:** Tailwind CSS
*   **State Management:** React Hooks (`useState`, `useEffect`)
*   **Graphics:** Dynamic Matrix Color-Mapping Engine (No external asset overhead)