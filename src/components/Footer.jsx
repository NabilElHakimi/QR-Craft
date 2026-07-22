const YEAR = new Date().getFullYear()

const IconGitHub = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
)

const IconReact = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <circle cx="12" cy="12" r="2"/>
    <ellipse cx="12" cy="12" rx="10" ry="4"/>
    <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)"/>
    <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)"/>
  </svg>
)

export default function Footer() {
  return (
    <footer className="app-footer">

      <div className="footer-left">
        <svg width="18" height="18" viewBox="0 0 34 34" fill="none" aria-hidden="true">
          <rect width="34" height="34" rx="7" fill="#6366f1"/>
          <rect x="7"    y="7"    width="8"   height="8"   rx="1.5" fill="white"/>
          <rect x="7"    y="19"   width="8"   height="8"   rx="1.5" fill="white"/>
          <rect x="19"   y="7"    width="8"   height="8"   rx="1.5" fill="white"/>
          <rect x="19"   y="19"   width="3.5" height="3.5" rx="1"   fill="white"/>
          <rect x="23.5" y="19"   width="3.5" height="3.5" rx="1"   fill="white"/>
          <rect x="19"   y="23.5" width="3.5" height="3.5" rx="1"   fill="white"/>
          <rect x="23.5" y="23.5" width="3.5" height="3.5" rx="1"   fill="white"/>
        </svg>
        <span className="footer-brand">QRCraft</span>
        <span className="footer-divider" aria-hidden="true"/>
        <span className="footer-copy">© {YEAR} · Free &amp; open source</span>
      </div>

      <div className="footer-right">
        <span className="footer-stack">
          <IconReact />
          React + Vite
        </span>
        <span className="footer-sep" aria-hidden="true">·</span>
        <span className="footer-note">100% client‑side</span>
        <span className="footer-sep" aria-hidden="true">·</span>
        <a
          href="https://github.com/NabilElHakimi/QR-Craft"
          className="footer-gh"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View source on GitHub"
        >
          <IconGitHub />
          GitHub
        </a>
        <span className="footer-sep" aria-hidden="true">·</span>
        <span className="footer-mit">MIT</span>
      </div>

    </footer>
  )
}
