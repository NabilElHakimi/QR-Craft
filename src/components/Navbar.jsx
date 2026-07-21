export default function Navbar({ darkMode, onToggleDark }) {
  return (
    <nav className="navbar">
      <div className="nav-inner">
        <a href="#" className="nav-brand">
          <svg className="brand-logo" width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
            <rect width="34" height="34" rx="9" fill="#6366f1"/>
            <rect x="7" y="7" width="8" height="8" rx="1.5" fill="white"/>
            <rect x="7" y="19" width="8" height="8" rx="1.5" fill="white"/>
            <rect x="19" y="7" width="8" height="8" rx="1.5" fill="white"/>
            <rect x="19" y="19" width="3.5" height="3.5" rx="1" fill="white"/>
            <rect x="23.5" y="19" width="3.5" height="3.5" rx="1" fill="white"/>
            <rect x="19" y="23.5" width="3.5" height="3.5" rx="1" fill="white"/>
            <rect x="23.5" y="23.5" width="3.5" height="3.5" rx="1" fill="white"/>
          </svg>
          <span className="brand-name">QRCraft</span>
          <span className="brand-pill">Free</span>
        </a>
        <button className="theme-btn" onClick={onToggleDark} aria-label="Toggle dark mode">
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  )
}
