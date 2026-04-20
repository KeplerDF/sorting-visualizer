# 🏁 Multi-Threaded Sorting Visualizer

A high-performance, synchronized sorting race built with **Vanilla JavaScript**, **CSS Grid**, and **Web Audio API**.



## 🚀 Key Technical Features
- **Parallel Execution:** Uses `Promise.all` to run four independent recursive algorithms simultaneously without blocking the main thread.
- **Custom Synchronization:** Implemented a unique `wait` handler using a global `stepCount` and local trackers to allow synchronized "Step Forward" debugging across multiple algorithms.
- **Lazy-Loaded Audio:** Direct integration with the Web Audio API to provide real-time sonic feedback for every array modification.
- **Responsive Architecture:** Fully mobile-responsive layout using CSS Flexbox and Grid, avoiding heavy frameworks for maximum performance.

## 📊 Performance Metrics
The dashboard tracks real-time comparisons and swaps, demonstrating the efficiency difference between $O(n \log n)$ and $O(n^2)$ algorithms in a visual and auditory environment.

## 🛠️ How to Run it Yourself
1. Clone the repo.
2. Open `index.html` in any modern browser (No build step required).
