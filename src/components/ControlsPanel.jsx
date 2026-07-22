const QR_STYLES = [
  {
    value: 'classic',
    label: 'Classic',
    preview: (
      <svg viewBox="0 0 11 11" width="36" height="36" fill="currentColor" aria-hidden="true">
        {[0,4,8].flatMap(y => [0,4,8].map(x =>
          <rect key={`${x}-${y}`} x={x} y={y} width="3" height="3"/>
        ))}
      </svg>
    ),
  },
  {
    value: 'rounded',
    label: 'Rounded',
    preview: (
      <svg viewBox="0 0 11 11" width="36" height="36" fill="currentColor" aria-hidden="true">
        {[0,4,8].flatMap(y => [0,4,8].map(x =>
          <rect key={`${x}-${y}`} x={x} y={y} width="3" height="3" rx="0.9"/>
        ))}
      </svg>
    ),
  },
  {
    value: 'dots',
    label: 'Dots',
    preview: (
      <svg viewBox="0 0 11 11" width="36" height="36" fill="currentColor" aria-hidden="true">
        {[1.5,5.5,9.5].flatMap(cy => [1.5,5.5,9.5].map(cx =>
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.4"/>
        ))}
      </svg>
    ),
  },
  {
    value: 'diamond',
    label: 'Diamond',
    preview: (
      <svg viewBox="0 0 11 11" width="36" height="36" fill="currentColor" aria-hidden="true">
        {[1.5,5.5,9.5].flatMap(cy => [1.5,5.5,9.5].map(cx =>
          <polygon key={`${cx}-${cy}`} points={`${cx},${cy-1.4} ${cx+1.4},${cy} ${cx},${cy+1.4} ${cx-1.4},${cy}`}/>
        ))}
      </svg>
    ),
  },
  {
    value: 'fluid',
    label: 'Fluid',
    preview: (
      <svg viewBox="0 0 11 11" width="36" height="36" fill="currentColor" aria-hidden="true">
        <rect x="0" y="0" width="7" height="3" rx="0.9"/>
        <rect x="0" y="0" width="3" height="7" rx="0.9"/>
        <rect x="1.1" y="1.1" width="4.8" height="4.8"/>
        <rect x="8" y="0" width="3" height="3" rx="0.9"/>
        <rect x="0" y="8" width="3" height="3" rx="0.9"/>
        <rect x="8" y="8" width="3" height="3" rx="0.9"/>
      </svg>
    ),
  },
]

import TypeSelector from './TypeSelector.jsx'

const IconWand = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 4-1 1 5 5 1-1zM2 22l10-10M10 6 8 8M6 10l-2 2M20 14l-2 2M14 20l-2 2"/>
  </svg>
)

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

// ── Reusable section-label with icon ──────────────────────
function SectionLabel({ icon, children }) {
  return (
    <div className="form-label-row">
      <span className="label-icon" aria-hidden="true">{icon}</span>
      <span className="form-label">{children}</span>
    </div>
  )
}

// ── Small inline SVG icons ────────────────────────────────
const IconLink = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
)
const IconShield = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)
const IconPalette = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
  </svg>
)
const IconImage = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <path d="m21 15-5-5L5 21"/>
  </svg>
)
const IconSliders = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14"/>
    <line x1="4" y1="10" x2="4" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12" y2="3"/>
    <line x1="20" y1="21" x2="20" y2="16"/>
    <line x1="20" y1="12" x2="20" y2="3"/>
    <line x1="1" y1="14" x2="7" y2="14"/>
    <line x1="9" y1="8" x2="15" y2="8"/>
    <line x1="17" y1="16" x2="23" y2="16"/>
  </svg>
)

export default function ControlsPanel({
  qrType, onQrType, typeFields, onFieldChange,
  onGenerate, onClear,
  ecLevel, onEcLevel,
  fgColor, bgColor, onFgColor, onBgColor, onSwapColors, onPreset,
  logoData, logoFilename, logoSize, onLogoSize,
  logoECForced, logoDragOver,
  onLogoFile, onLogoRemove,
  onLogoDragEnter, onLogoDragLeave, onLogoDragOver, onLogoDrop,
  qrStyle, onQrStyle,
  size, margin, onSize, onMargin,
  panelDragActive,
  onPanelDragEnter, onPanelDragLeave, onPanelDragOver, onPanelDrop,
}) {
  function handleLogoInputChange(e) {
    const file = e.target.files?.[0]
    if (file) onLogoFile(file)
    e.target.value = ''
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
      {/* Drop overlay */}
      <div className={`drop-overlay${panelDragActive ? ' active' : ''}`} aria-hidden="true">
        <div className="drop-content">
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
          </svg>
          <p>Drop a .txt file or image here</p>
        </div>
      </div>

      {/* ── Branded panel header */}
      <div className="panel-hd">
        <div className="panel-hd-icon" aria-hidden="true">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.2"/>
            <rect x="14" y="3" width="7" height="7" rx="1.2"/>
            <rect x="3" y="14" width="7" height="7" rx="1.2"/>
            <path d="M14 14h3m0 0h3m-3 0v3m0 0v3"/>
          </svg>
        </div>
        <div>
          <p className="panel-hd-title">QR Configuration</p>
          <p className="panel-hd-sub">Customise · Generate · Export</p>
        </div>
      </div>

      {/* ── Scrollable form content ── */}
      <div className="panel-content">

      {/* ── Content type + fields */}
      <div className="form-block form-block--type">
        <SectionLabel icon={<IconLink />}>Content</SectionLabel>
        <TypeSelector
          qrType={qrType}
          typeFields={typeFields}
          onQrType={onQrType}
          onFieldChange={onFieldChange}
          onGenerate={onGenerate}
        />
      </div>

      {/* ── Error Correction */}
      <div className="form-block">
        <div className="form-block-hd">
          <SectionLabel icon={<IconShield />}>Error Correction</SectionLabel>
          <span className="tooltip-host" tabIndex={0} aria-label="About error correction">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-subtle)', cursor: 'help' }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <div className="tooltip" role="tooltip">
              L — 7% recovery · smallest QR<br/>
              M — 15% recovery · balanced<br/>
              Q — 25% recovery · great for logos<br/>
              H — 30% recovery · best with logo
            </div>
          </span>
        </div>
        <div className="ec-group" role="radiogroup" aria-label="Error correction level">
          {EC_LEVELS.map(({ value, label, sub }) => (
            <label key={value} className="ec-pill">
              <input type="radio" name="ecLevel" value={value} checked={ecLevel === value} onChange={() => onEcLevel(value)} />
              <span>{label}<small>{sub}</small></span>
            </label>
          ))}
        </div>
        {logoECForced && (
          <p className="input-hint ec-forced-hint">
            ✦ Auto-switched to H for best logo scannability
          </p>
        )}
      </div>

      {/* ── Colors */}
      <div className="form-block">
        <SectionLabel icon={<IconPalette />}>Colors</SectionLabel>
        <div className="color-row">
          <div className="color-field">
            <span className="color-field-label">Foreground</span>
            <div className="color-input-row">
              <input type="color" value={fgColor} onChange={e => onFgColor(e.target.value)} aria-label="Foreground color" />
              <span className="color-hex">{fgColor.toUpperCase()}</span>
            </div>
          </div>

          <button className="swap-btn" onClick={onSwapColors} title="Swap colors" aria-label="Swap foreground and background">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/>
            </svg>
          </button>

          <div className="color-field">
            <span className="color-field-label">Background</span>
            <div className="color-input-row">
              <input type="color" value={bgColor} onChange={e => onBgColor(e.target.value)} aria-label="Background color" />
              <span className="color-hex">{bgColor.toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="presets-row">
          <span className="presets-label">Presets</span>
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

      {/* ── Logo */}
      <div className="form-block">
        <div className="form-block-hd">
          <SectionLabel icon={<IconImage />}>Logo / Icon</SectionLabel>
          <span className="optional-badge">Optional</span>
        </div>

        {!logoData && (
          <div
            className={`logo-zone${logoDragOver ? ' drag-over' : ''}`}
            onDragEnter={onLogoDragEnter}
            onDragLeave={onLogoDragLeave}
            onDragOver={onLogoDragOver}
            onDrop={onLogoDrop}
          >
            <label className="logo-zone-label" htmlFor="logoFileInput">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"/>
              </svg>
              <div>
                <span>Click or drag an image</span>
                <small>PNG, JPG, SVG · max 2 MB</small>
              </div>
            </label>
            <input id="logoFileInput" type="file" accept="image/*" className="sr-only" onChange={handleLogoInputChange} />
          </div>
        )}

        {logoData && (
          <div className="logo-preview-row">
            <img src={logoData} alt="Logo preview" className="logo-thumb" />
            <div className="logo-meta">
              <span className="logo-filename">{logoFilename}</span>
              <button className="logo-remove-btn" onClick={onLogoRemove} aria-label="Remove logo">
                <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/>
                </svg>
                Remove logo
              </button>
            </div>
          </div>
        )}

        {logoData && (
          <div className="slider-row">
            <label>
              <span>Logo size</span>
              <span><strong>{logoSize}%</strong> <span className="unit">of QR</span></span>
            </label>
            <input type="range" min="10" max="35" value={logoSize} onChange={e => onLogoSize(+e.target.value)} aria-label="Logo size" />
          </div>
        )}

        {logoData && (
          <div className="logo-tip">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            EC level H is active — QR stays scannable with up to 30% covered.
          </div>
        )}
      </div>

      {/* ── Module Style */}
      <div className="form-block">
        <SectionLabel icon={<IconWand />}>Module Style</SectionLabel>
        <div className="style-picker" role="radiogroup" aria-label="QR module style">
          {QR_STYLES.map(({ value, label, preview }) => (
            <label key={value} className={`style-opt${qrStyle === value ? ' active' : ''}`} title={label}>
              <input
                type="radio"
                name="qrStyle"
                value={value}
                checked={qrStyle === value}
                onChange={() => onQrStyle(value)}
                className="sr-only"
              />
              <span className="style-opt-preview">{preview}</span>
              <span className="style-opt-label">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ── Output Settings */}
      <div className="form-block">
        <SectionLabel icon={<IconSliders />}>Output Settings</SectionLabel>
        <div className="slider-stack">
          <div className="slider-row">
            <label>
              <span>Size</span>
              <span><strong>{size}</strong> <span className="unit">px</span></span>
            </label>
            <input type="range" min="150" max="500" step="10" value={size} onChange={e => onSize(+e.target.value)} aria-label="QR code size" />
          </div>
          <div className="slider-row">
            <label>
              <span>Quiet zone</span>
              <span><strong>{margin}</strong> <span className="unit">cells</span></span>
            </label>
            <input type="range" min="0" max="10" value={margin} onChange={e => onMargin(+e.target.value)} aria-label="Quiet zone margin" />
          </div>
        </div>
      </div>

      </div>{/* end .panel-content */}

      {/* ── Actions */}
      <div className="action-bar">
        <button className="btn-generate" onClick={onGenerate} aria-label="Generate QR code">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 14h2m0 0h3m-3 0v3m0-3V14M17 17h3m-3 0v3"/>
          </svg>
          Generate QR Code
        </button>
        <button className="btn-secondary" onClick={onClear} title="Clear all fields" aria-label="Clear all">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
