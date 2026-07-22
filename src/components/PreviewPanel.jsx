export default function PreviewPanel({
  canvasRef, qrFrameRef,
  qrVisible, isLoading, svgData, resolution,
  onDownloadPNG, onDownloadSVG, onCopyText,
}) {
  return (
    <div className="preview-panel">

      {/* ── Header */}
      <div className="preview-hd">
        <div className="preview-hd-left">
          <span className="preview-title">Preview</span>
          {qrVisible && (
            <span className="live-badge">
              <span className="live-dot" aria-hidden="true" />
              Live
            </span>
          )}
        </div>
        {resolution && <span className="res-tag">{resolution}</span>}
      </div>

      {/* ── Empty state */}
      {!qrVisible && !isLoading && (
        <div className="empty-state">
          <div className="empty-qr-wrap">
            <svg
              className="empty-qr-art"
              width="124"
              height="124"
              viewBox="0 0 44 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              {/* Top-left finder */}
              <rect x="2" y="2" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="5" y="5" width="7" height="7" rx="1" fill="currentColor" opacity="0.35"/>
              {/* Top-right finder */}
              <rect x="29" y="2" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="32" y="5" width="7" height="7" rx="1" fill="currentColor" opacity="0.35"/>
              {/* Bottom-left finder */}
              <rect x="2" y="29" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="5" y="32" width="7" height="7" rx="1" fill="currentColor" opacity="0.35"/>
              {/* Timing + data modules */}
              <rect x="17" y="2"  width="3" height="3" rx=".5" fill="currentColor" opacity="0.18"/>
              <rect x="21" y="2"  width="3" height="3" rx=".5" fill="currentColor" opacity="0.28"/>
              <rect x="25" y="2"  width="3" height="3" rx=".5" fill="currentColor" opacity="0.14"/>
              <rect x="17" y="6"  width="3" height="3" rx=".5" fill="currentColor" opacity="0.3"/>
              <rect x="25" y="6"  width="3" height="3" rx=".5" fill="currentColor" opacity="0.22"/>
              <rect x="17" y="10" width="3" height="3" rx=".5" fill="currentColor" opacity="0.14"/>
              <rect x="21" y="10" width="3" height="3" rx=".5" fill="currentColor" opacity="0.3"/>
              <rect x="17" y="17" width="3" height="3" rx=".5" fill="currentColor" opacity="0.24"/>
              <rect x="21" y="17" width="3" height="3" rx=".5" fill="currentColor" opacity="0.14"/>
              <rect x="25" y="17" width="3" height="3" rx=".5" fill="currentColor" opacity="0.3"/>
              <rect x="29" y="17" width="3" height="3" rx=".5" fill="currentColor" opacity="0.18"/>
              <rect x="33" y="17" width="3" height="3" rx=".5" fill="currentColor" opacity="0.28"/>
              <rect x="37" y="17" width="3" height="3" rx=".5" fill="currentColor" opacity="0.14"/>
              <rect x="17" y="21" width="3" height="3" rx=".5" fill="currentColor" opacity="0.3"/>
              <rect x="25" y="21" width="3" height="3" rx=".5" fill="currentColor" opacity="0.2"/>
              <rect x="33" y="21" width="3" height="3" rx=".5" fill="currentColor" opacity="0.24"/>
              <rect x="37" y="21" width="3" height="3" rx=".5" fill="currentColor" opacity="0.3"/>
              <rect x="17" y="25" width="3" height="3" rx=".5" fill="currentColor" opacity="0.14"/>
              <rect x="21" y="25" width="3" height="3" rx=".5" fill="currentColor" opacity="0.3"/>
              <rect x="25" y="25" width="3" height="3" rx=".5" fill="currentColor" opacity="0.18"/>
              <rect x="29" y="25" width="3" height="3" rx=".5" fill="currentColor" opacity="0.28"/>
              <rect x="37" y="25" width="3" height="3" rx=".5" fill="currentColor" opacity="0.14"/>
              <rect x="17" y="29" width="3" height="3" rx=".5" fill="currentColor" opacity="0.28"/>
              <rect x="25" y="29" width="3" height="3" rx=".5" fill="currentColor" opacity="0.22"/>
              <rect x="29" y="29" width="3" height="3" rx=".5" fill="currentColor" opacity="0.14"/>
              <rect x="33" y="29" width="3" height="3" rx=".5" fill="currentColor" opacity="0.3"/>
              <rect x="37" y="29" width="3" height="3" rx=".5" fill="currentColor" opacity="0.18"/>
              <rect x="17" y="33" width="3" height="3" rx=".5" fill="currentColor" opacity="0.18"/>
              <rect x="21" y="33" width="3" height="3" rx=".5" fill="currentColor" opacity="0.3"/>
              <rect x="29" y="33" width="3" height="3" rx=".5" fill="currentColor" opacity="0.14"/>
              <rect x="33" y="33" width="3" height="3" rx=".5" fill="currentColor" opacity="0.28"/>
              <rect x="17" y="37" width="3" height="3" rx=".5" fill="currentColor" opacity="0.28"/>
              <rect x="25" y="37" width="3" height="3" rx=".5" fill="currentColor" opacity="0.18"/>
              <rect x="33" y="37" width="3" height="3" rx=".5" fill="currentColor" opacity="0.3"/>
              <rect x="37" y="37" width="3" height="3" rx=".5" fill="currentColor" opacity="0.22"/>
            </svg>
          </div>

          <div>
            <p className="empty-title">Your QR code will appear here</p>
            <p className="empty-hint">
              Enter text or a URL on the left,<br />
              then click <strong>Generate QR Code</strong>.
            </p>
          </div>

          <div className="empty-steps">
            <div className="empty-step">
              <span className="step-num">1</span>
              <span>Enter content</span>
            </div>
            <span className="empty-step-arrow" aria-hidden="true">→</span>
            <div className="empty-step">
              <span className="step-num">2</span>
              <span>Customise</span>
            </div>
            <span className="empty-step-arrow" aria-hidden="true">→</span>
            <div className="empty-step">
              <span className="step-num">3</span>
              <span>Download</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Loader */}
      {isLoading && (
        <div className="loader visible" aria-live="polite" aria-label="Generating QR code">
          <div className="spinner" />
          Generating…
        </div>
      )}

      {/* ── QR output — canvas always in DOM, toggled by CSS class */}
      <div className={`qr-result${qrVisible ? ' visible' : ''}`} aria-live="polite">
        <div className="qr-result-wrap">
          <p className="qr-result-label">
            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
            </svg>
            Ready to scan
          </p>
          <div className="qr-canvas-frame" ref={qrFrameRef}>
            <canvas ref={canvasRef} id="qrCanvas" aria-label="Generated QR code" />
          </div>
        </div>

        <div className="result-actions">
          <p className="result-actions-label">Download as</p>
          <div className="dl-row">
            <button className="btn-dl" onClick={onDownloadPNG} aria-label="Download PNG">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12M12 16.5V3"/>
              </svg>
              <div className="btn-dl-text">
                <strong>PNG</strong>
                <small>Raster image</small>
              </div>
            </button>

            <button className="btn-dl btn-dl-outline" onClick={onDownloadSVG} aria-label="Download SVG">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12M12 16.5V3"/>
              </svg>
              <div className="btn-dl-text">
                <strong>SVG</strong>
                <small>Vector image</small>
              </div>
            </button>
          </div>

          <button className="btn-copy-text" onClick={onCopyText} aria-label="Copy text to clipboard">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
            Copy content to clipboard
          </button>
        </div>
      </div>

    </div>
  )
}
