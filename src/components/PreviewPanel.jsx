export default function PreviewPanel({
  canvasRef, qrFrameRef,
  qrVisible, isLoading, svgData, resolution,
  errorMsg, successMsg,
  onDownloadPNG, onDownloadSVG, onCopyText,
}) {
  return (
    <div className="preview-panel">
      <div className="preview-hd">
        <span className="preview-title">Preview</span>
        {resolution && <span className="res-tag">{resolution}</span>}
      </div>

      {/* Empty state */}
      {!qrVisible && !isLoading && (
        <div className="empty-state">
          <svg className="empty-svg" width="80" height="80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="1.5"/>
            <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="1.5"/>
            <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="1.5"/>
            <rect x="5" y="5" width="3" height="3" rx=".5" fill="currentColor"/>
            <rect x="16" y="5" width="3" height="3" rx=".5" fill="currentColor"/>
            <rect x="5" y="16" width="3" height="3" rx=".5" fill="currentColor"/>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 14h2m2 0h2m-2 0v2m0 2v2"/>
          </svg>
          <p className="empty-title">Your QR code will appear here</p>
          <p className="empty-hint">
            Type your text or URL on the left,<br/>
            then click <strong>Generate QR Code</strong>.
          </p>
        </div>
      )}

      {/* Loader */}
      {isLoading && (
        <div className="loader visible" aria-live="polite" aria-label="Generating QR code">
          <div className="spinner" />
          Generating…
        </div>
      )}

      {/* QR output — canvas stays in DOM always; visibility toggled via CSS class */}
      <div className={`qr-result${qrVisible ? ' visible' : ''}`} aria-live="polite">
        <div className="qr-canvas-frame" ref={qrFrameRef}>
          <canvas ref={canvasRef} id="qrCanvas" aria-label="Generated QR code" />
        </div>

        <div className="result-actions">
          <div className="dl-row">
            <button className="btn-dl" onClick={onDownloadPNG} aria-label="Download PNG">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12M12 16.5V3"/>
              </svg>
              Download PNG
            </button>
            <button className="btn-dl btn-dl-outline" onClick={onDownloadSVG} aria-label="Download SVG">
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12M12 16.5V3"/>
              </svg>
              Download SVG
            </button>
          </div>
          <button className="btn-copy-text" onClick={onCopyText} aria-label="Copy text to clipboard">
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2"/><path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
            Copy text to clipboard
          </button>
        </div>
      </div>

      {/* Status messages */}
      {errorMsg && (
        <div className="status-msg error-msg visible" role="alert">{errorMsg}</div>
      )}
      {successMsg && (
        <div className="status-msg success-msg visible" role="status">{successMsg}</div>
      )}
    </div>
  )
}
