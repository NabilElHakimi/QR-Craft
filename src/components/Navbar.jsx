const IconSun = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
  </svg>
)

const IconMoon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

export default function Navbar({ darkMode, onToggleDark }) {
  return (
    <nav className="navbar">
      <div className="nav-inner">

        <div className="nav-left">
          <a href="#" className="nav-brand" aria-label="QRCraft home">
            <svg className="brand-logo" width="30" height="30" viewBox="0 0 34 34" fill="none" aria-hidden="true">
              <rect width="34" height="34" rx="9" fill="#6366f1"/>
              <rect x="7"  y="7"  width="8"   height="8"   rx="1.5" fill="white"/>
              <rect x="7"  y="19" width="8"   height="8"   rx="1.5" fill="white"/>
              <rect x="19" y="7"  width="8"   height="8"   rx="1.5" fill="white"/>
              <rect x="19" y="19" width="3.5" height="3.5" rx="1"   fill="white"/>
              <rect x="23.5" y="19" width="3.5" height="3.5" rx="1" fill="white"/>
              <rect x="19" y="23.5" width="3.5" height="3.5" rx="1" fill="white"/>
              <rect x="23.5" y="23.5" width="3.5" height="3.5" rx="1" fill="white"/>
            </svg>
            <span className="brand-name">QRCraft</span>
          </a>

          <span className="nav-sep" aria-hidden="true">/</span>
          <span className="nav-page">QR Generator</span>
        </div>

        <div className="nav-right">
          <span className="nav-chip">Free · No signup</span>

          <button
            className="theme-btn"
            onClick={onToggleDark}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <IconSun /> : <IconMoon />}
            <span>{darkMode ? 'Light' : 'Dark'}</span>
          </button>
        </div>

      </div>
    </nav>
  )
}
