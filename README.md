# 🎵 Aura - Web Music Player

A sleek, modern, feature-rich web music player inspired by the **YouTube Music** interface. Built with vanilla HTML, CSS, and JavaScript, Aura features a pure OLED black aesthetic, dynamic background gradients, smart queue management, and a fully responsive layout for both mobile and desktop devices.

🌐 **Live Demo:** [theauramusic.vercel.app](https://www.google.com/search?q=https://theauramusic.vercel.app)

---

## ✨ Features

* **YouTube Music Aesthetic:** Clean, minimalist, high-contrast dark theme optimized for media consumption.


* **Dynamic Background Accents:** Uses ColorThief to dynamically extract cover art colors and generate smooth ambient gradients[cite: 8, 9].
* **Smart Queue Management:** Supports adding songs "Up Next", viewing current playlist queues, and managing track order.


* **Interactive Controls:** Fully functional shuffle and repeat toggles complete with YouTube-style active indicator dots[cite: 4, 8].
* **Favorites & Local Storage:** Save liked songs and custom playlists with automatic persistence across sessions via `localStorage`[cite: 7, 8, 11].
* **Instant Search:** Real-time local song lookup with recent search history tracking.


* **Fully Responsive:** Seamless layout adaptation for mobile viewports and multi-column widescreen desktop screens.



---

## 🛠️ Tech Stack

* **HTML5** & **CSS3** (Custom Properties, Flexbox, Grid)


* **Vanilla JavaScript (ES6+)**[cite: 8, 9, 10, 11]
* **Lucide Icons** for modern UI glyphs


* **ColorThief** for dynamic color extraction[cite: 8, 9]

---

## 📁 Project Structure

```text
Music-player/
├── css/
│   └── style.css          # Main stylesheet with CSS variables & responsive rules[cite: 4]
├── js/
│   ├── app.js             # Core app initialization and global UI bindings[cite: 5]
│   ├── data.js            # Song database and playlist arrays[cite: 6]
│   ├── dom.js             # DOM element references and global state[cite: 7]
│   ├── player.js          # Audio engine, playback controls, and queue logic[cite: 8]
│   ├── render.js          # UI rendering for home, playlists, and library[cite: 9]
│   ├── search.js          # Search engine and recent search persistence[cite: 10]
│   └── storage.js         # LocalStorage handlers for user favorites[cite: 11]
├── index.html             # Main entry point layout[cite: 4]
└── package.json

```

---

## 🚀 Getting Started

To run this project locally on your machine:

1. **Clone the repository:**
```bash
git clone https://github.com/anmolnegi09/Music-player.git

```


2. **Navigate to the project directory:**
```bash
cd Music-player

```


3. **Run the project:**
* Open `index.html` directly in your browser, or
* Use a live server extension (like VS Code's **Live Server**) for the best development experience.



---

## 📄 License

This project is open-source and available under the [MIT License](https://www.google.com/search?q=LICENSE).
