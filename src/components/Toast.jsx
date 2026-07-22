const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5"/>
  </svg>
)

const IconAlert = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

const IconClose = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
)

export default function Toast({ successMsg, errorMsg, onDismissSuccess, onDismissError }) {
  if (!successMsg && !errorMsg) return null

  return (
    <div className="toast-area" aria-live="polite" aria-atomic="false">
      {successMsg && (
        <div className="toast toast-success" role="status">
          <span className="toast-icon" aria-hidden="true">
            <IconCheck />
          </span>
          <p className="toast-msg">{successMsg}</p>
          <button
            className="toast-dismiss"
            onClick={onDismissSuccess}
            aria-label="Dismiss notification"
          >
            <IconClose />
          </button>
        </div>
      )}
      {errorMsg && (
        <div className="toast toast-error" role="alert">
          <span className="toast-icon" aria-hidden="true">
            <IconAlert />
          </span>
          <p className="toast-msg">{errorMsg}</p>
          <button
            className="toast-dismiss"
            onClick={onDismissError}
            aria-label="Dismiss notification"
          >
            <IconClose />
          </button>
        </div>
      )}
    </div>
  )
}
