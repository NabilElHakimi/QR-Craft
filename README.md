# QRCraft — Free QR Code Generator

A professional, fully client-side QR code generator built with **React + Vite**. No backend, no account, no watermark. Everything runs in the browser.

---

## Features

- **Instant generation** — QR code updates automatically as you type (300ms debounce)
- **Logo overlay** — embed your own logo or icon inside the QR code
- **Custom colors** — choose foreground & background colors with 8 built-in presets
- **Error correction levels** — L / M / Q / H (auto-switches to H when a logo is added)
- **PNG & SVG export** — download crisp PNG up to 500px or infinitely scalable SVG
- **Copy to clipboard** — one click to copy your text/URL
- **Drag & drop** — drop a `.txt` file to load content, drop an image to set the logo
- **Dark mode** — full light/dark theme with localStorage persistence
- **Size & margin control** — output size from 150px to 500px, configurable quiet zone
- **100% offline** — no external API calls, your data never leaves your device

---

## Preview

| Light Mode | Dark Mode |
|---|---|
| ![Light](https://placehold.co/600x400?text=Light+Mode) | ![Dark](https://placehold.co/600x400?text=Dark+Mode) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 |
| Build Tool | Vite 5 |
| QR Engine | [qrcodejs](https://github.com/davidshimjs/qrcodejs) (bundled locally) |
| Styling | CSS custom properties (no UI library) |
| Storage | localStorage |

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repo
git clone https://github.com/NabilElHakimi/QR-Craft.git
cd QR-Craft

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

The output goes to the `dist/` folder — drop it on any static host (Vercel, Netlify, GitHub Pages, etc.).

---

## Project Structure

```
QR-Craft/
├── public/
│   └── qrcode.min.js          # QR library (bundled locally, works offline)
├── src/
│   ├── main.jsx               # React entry point
│   ├── App.jsx                # Root component — all state & logic
│   ├── App.css                # Global styles & design tokens
│   ├── utils/
│   │   └── qrUtils.js         # Pure functions: matrix, canvas, SVG rendering
│   └── components/
│       ├── Navbar.jsx         # Top nav with dark mode toggle
│       ├── Hero.jsx           # Hero section
│       ├── ControlsPanel.jsx  # All input controls (left column)
│       ├── PreviewPanel.jsx   # QR preview & download (right column)
│       ├── Features.jsx       # Feature cards section
│       └── Footer.jsx         # Footer
├── index.html
├── vite.config.js
└── package.json
```

---

## How It Works

1. **QR matrix** — [qrcodejs](https://github.com/davidshimjs/qrcodejs) computes the module matrix via a hidden sink element. Only the matrix is used — no DOM rendering from the library.
2. **Canvas rendering** — modules are drawn manually with `fillRect` for pixel-perfect control over size, margin, and colors.
3. **Logo overlay** — the logo is drawn on top of the canvas centered, with a white rounded-rectangle background for scannability. Error correction is auto-set to H (30% recovery) to compensate.
4. **SVG export** — generated as a pure SVG string with one `<rect>` per dark module and an optional base64 `<image>` for the logo.
5. **Persistence** — settings (colors, size, margin, EC level, dark mode) are saved to `localStorage` under the key `qrcraft_v4`.

---

## License

MIT — free to use, modify, and distribute.

---

> Built with React + Vite · Runs 100% in the browser · No server required
