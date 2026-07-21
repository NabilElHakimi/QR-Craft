const PRESETS = [
  { fg: '#000000', bg: '#ffffff', title: 'Classic' },
  { fg: '#ffffff', bg: '#1e293b', title: 'Inverted' },
  { fg: '#1d4ed8', bg: '#eff6ff', title: 'Ocean' },
  { fg: '#15803d', bg: '#f0fdf4', title: 'Forest' },
  { fg: '#b91c1c', bg: '#fff1f2', title: 'Cherry' },
  { fg: '#7c3aed', bg: '#f5f3ff', title: 'Violet' },
  { fg: '#c2410c', bg: '#fff7ed', title: 'Sunset' },
  { fg: '#0f172a', bg: '#f8fafc', title: 'Slate' },
]

const EC_LEVELS = [
  { value: 'L', label: 'L', sub: '7%' },
  { value: 'M', label: 'M', sub: '15%' },
  { value: 'Q', label: 'Q', sub: '25%' },
  { value: 'H', label: 'H', sub: '30%' },
]

export default function ControlsPanel({
  // Text
  inputText, onInputChange, onGenerate, onClear,
  // Error correction
  ecLevel, onEcLevel,
  // Colors
  fgColor, bgColor, onFgColor, onBgColor, onSwapColors, onPreset,
  // Logo
  logoData, logoFilename, logoSize, onLogoSize,
  logoECForced, logoDragOver,
  onLogoFile, onLogoRemove,
  onLogoDragEnter, onLogoDragLeave, onLogoDragOver, onLogoDrop,
  // Size & margin
  size, margin, onSize, onMargin,
  // Panel drag & drop
  panelDragActive,
  onPanelDragEnter, onPanelDragLeave, onPanelDragOver, onPanelDrop,
}) {
  function handleLogoInputChange(e) {
    const file = e.target.files?.[0]
    if (file) onLogoFile(file)
    e.target.value = ''
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onGenerate() }
  }

  return (
    <div
      id="mainCard"
      className="controls-panel"
      onDragEnter={onPanelDragEnter}
      onDragLeave={onPanelDragLeave}
      onDragOver={onPanelDragOver}
      onDrop={onPanelDrop}
    >
      {/* Drop overlay for .txt files */}
      <div className={`drop-overlay${panelDragActive ? ' active' : ''}`} aria-hidden="true">
        <div className="drop-content">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
          </svg>
          <p>Drop your .txt file here</p>
        </div>
      </div>

      {/* ── Text input */}
      <div className="form-block">
        <div className="form-block-hd">
          <span className="form-label">Your Text or URL</span>
          <span className="char-count">{inputText.length} / 2300</span>
        </div>
        <textarea
          className="text-input"
          placeholder="Type a URL, email, phone, plain text…"
          maxLength={2300}
          value={inputText}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="QR code content"
          autoComplete="off"
          spellCheck={false}
        />
        <p className="input-hint">Press Enter or click Generate. Drag a .txt file onto this panel.</p>
      </div>

      {/* ── Error correction */}
      <div className="form-block">
        <div className="form-block-hd">
          <span className="form-label">Error Correction</span>
          <span className="tooltip-host" tabIndex={0} aria-label="Error correction info">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-subtle)', cursor: 'help' }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <div className="tooltip" role="tooltip">
              L — 7% recovery · smallest QR<br/>
              M — 15% recovery · balanced<br/>
              Q — 25% recovery · good for logos<br/>
              H — 30% recovery · best with logo
            </div>
          </span>
        </div>
        <div className="ec-group" role="radiogroup" aria-label="Error correction level">
          {EC_LEVELS.map(({ value, label, sub }) => (
            <label key={value} className="ec-pill">
              <input
                type="radio"
                name="ecLevel"
                value={value}
                checked={ecLevel === value}
                onChange={() => onEcLevel(value)}
              />
              <span>{label}<small>{sub}</small></span>
            </label>
          ))}
        </div>
        {logoECForced && (
          <p className="input-hint" style={{ color: 'var(--primary)' }}>
            ✦ Switched to H for best logo scannability
          </p>
        )}
      </div>

      {/* ── Colors */}
      <div className="form-block">
        <span className="form-label">Colors</span>
        <div className="color-row">
          <div className="color-field">
            <span className="color-field-label">Foreground</span>
            <div className="color-input-row">
              <input
                type="color"
                value={fgColor}
                onChange={e => onFgColor(e.target.value)}
                aria-label="Foreground color"
              />
              <span className="color-hex">{fgColor.toUpperCase()}</span>
            </div>
          </div>

          <button className="swap-btn" onClick={onSwapColors} title="Swap colors" aria-label="Swap foreground and background colors">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/>
            </svg>
          </button>

          <div className="color-field">
            <span className="color-field-label">Background</span>
            <div className="color-input-row">
              <input
                type="color"
                value={bgColor}
                onChange={e => onBgColor(e.target.value)}
                aria-label="Background color"
              />
              <span className="color-hex">{bgColor.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Presets */}
        <div className="presets-row">
          <span className="presets-label">Presets:</span>
          <div className="presets-grid">
            {PRESETS.map(({ fg, bg, title }) => {
              const isActive = fgColor.toLowerCase() === fg.toLowerCase() && bgColor.toLowerCase() === bg.toLowerCase()
              return (
                <button
                  key={title}
                  className={`preset-dot${isActive ? ' active' : ''}`}
                  style={{ background: `linear-gradient(135deg, ${fg} 50%, ${bg} 50%)` }}
                  title={title}
                  onClick={() => onPreset(fg, bg)}
                  aria-label={`${title} preset`}
                  aria-pressed={isActive}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Logo upload */}
      <div className="form-block">
        <div className="form-block-hd">
          <span className="form-label">Logo / Icon</span>
          <span className="optional-badge">Optional</span>
        </div>

        {/* Upload zone — shown when no logo */}
        {!logoData && (
          <div
            className={`logo-zone${logoDragOver ? ' drag-over' : ''}`}
            onDragEnter={onLogoDragEnter}
            onDragLeave={onLogoDragLeave}
            onDragOver={onLogoDragOver}
            onDrop={onLogoDrop}
          >
            <label className="logo-zone-label" htmlFor="logoFileInput">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"/>
              </svg>
              <span>Click or drag an image here</span>
              <small>PNG, JPG, SVG · max 2 MB</small>
            </label>
            <input
              id="logoFileInput"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleLogoInputChange}
            />
          </div>
        )}

        {/* Preview row — shown when logo is loaded */}
        {logoData && (
          <div className="logo-preview-row">
            <img src={logoData} alt="Logo preview" className="logo-thumb" />
            <div className="logo-meta">
              <span className="logo-filename">{logoFilename}</span>
              <button className="logo-remove-btn" onClick={onLogoRemove} aria-label="Remove logo">
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/>
                </svg>
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Logo size slider — shown when logo is loaded */}
        {logoData && (
          <div className="slider-row">
            <label>
              <span>Logo size</span>
              <span><strong>{logoSize}%</strong> <span className="unit">of QR</span></span>
            </label>
            <input
              type="range"
              min="10"
              max="35"
              value={logoSize}
              onChange={e => onLogoSize(+e.target.value)}
              aria-label="Logo size"
            />
          </div>
        )}

        {/* Tip banner */}
        {logoData && (
          <div className="logo-tip">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            Error correction H is active — your QR will still scan even with the logo covering up to 30% of the code.
          </div>
        )}
      </div>

      {/* ── Size & margin */}
      <div className="form-block">
        <span className="form-label">Size &amp; Margin</span>
        <div className="slider-stack">
          <div className="slider-row">
            <label>
              <span>Output size</span>
              <span><strong>{size}</strong> <span className="unit">px</span></span>
            </label>
            <input
              type="range"
              min="150"
              max="500"
              step="10"
              value={size}
              onChange={e => onSize(+e.target.value)}
              aria-label="QR code size"
            />
          </div>
          <div className="slider-row">
            <label>
              <span>Quiet zone (margin)</span>
              <span><strong>{margin}</strong> <span className="unit">cells</span></span>
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={margin}
              onChange={e => onMargin(+e.target.value)}
              aria-label="Quiet zone margin"
            />
          </div>
        </div>
      </div>

      {/* ── Action buttons */}
      <div className="action-bar">
        <button className="btn-generate" onClick={onGenerate} aria-label="Generate QR code">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 14h2m0 0h3m-3 0v3m0-3V14M17 17h3m-3 0v3"/>
          </svg>
          Generate QR Code
        </button>
        <button className="btn-secondary" onClick={onClear} aria-label="Clear all">
          Clear
        </button>
      </div>
    </div>
  )
}
