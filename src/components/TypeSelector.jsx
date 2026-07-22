import { SOCIAL_PLATFORMS } from '../utils/payloadBuilders.js'

// ── Type definitions ──────────────────────────────────────────
const TYPE_DEFS = [
  { id: 'web',      label: 'Web',         icon: 'globe'     },
  { id: 'contact',  label: 'Contact',     icon: 'user'      },
  { id: 'location', label: 'Location',    icon: 'map-pin'   },
  { id: 'event',    label: 'Event',       icon: 'calendar'  },
  { id: 'social',   label: 'Social',      icon: 'share'     },
  { id: 'urlbuild', label: 'URL Builder', icon: 'wrench'    },
  { id: 'text',     label: 'Other',       icon: 'file-text' },
]

const ICONS = {
  globe: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  user: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  'map-pin': (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  calendar: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  share: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/>
      <circle cx="6" cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  ),
  wrench: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  ),
  'file-text': (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
}

// ── Shared field primitives ────────────────────────────────────
function Field({ label, required, hint, children }) {
  return (
    <div className="type-field">
      <span className="type-field-label">
        {label}
        {required && <span className="type-field-req" aria-hidden="true"> *</span>}
      </span>
      {children}
      {hint && <span className="type-field-hint">{hint}</span>}
    </div>
  )
}

function TwoCol({ children }) {
  return <div className="type-field-row">{children}</div>
}

// ── Individual type forms ──────────────────────────────────────

function WebForm({ f, onF, onGenerate }) {
  return (
    <div className="type-form-fields">
      <Field label="URL or link" required>
        <input
          className="type-input"
          type="url"
          placeholder="https://example.com"
          value={f.url}
          onChange={e => onF('url', e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onGenerate() } }}
          autoComplete="off"
          spellCheck={false}
        />
      </Field>
      <p className="type-hint">
        HTTP/HTTPS added automatically if missing · also supports <code>mailto:</code>, <code>tel:</code>, <code>sms:</code>
      </p>
    </div>
  )
}

function ContactForm({ f, onF }) {
  return (
    <div className="type-form-fields">
      <TwoCol>
        <Field label="First name" required>
          <input className="type-input" placeholder="John" value={f.firstName} onChange={e => onF('firstName', e.target.value)} />
        </Field>
        <Field label="Last name">
          <input className="type-input" placeholder="Doe" value={f.lastName} onChange={e => onF('lastName', e.target.value)} />
        </Field>
      </TwoCol>
      <TwoCol>
        <Field label="Phone">
          <input className="type-input" type="tel" placeholder="+1 234 567 890" value={f.phone} onChange={e => onF('phone', e.target.value)} />
        </Field>
        <Field label="Email">
          <input className="type-input" type="email" placeholder="john@example.com" value={f.email} onChange={e => onF('email', e.target.value)} />
        </Field>
      </TwoCol>
      <TwoCol>
        <Field label="Company">
          <input className="type-input" placeholder="Acme Inc." value={f.company} onChange={e => onF('company', e.target.value)} />
        </Field>
        <Field label="Job title">
          <input className="type-input" placeholder="Engineer" value={f.jobTitle} onChange={e => onF('jobTitle', e.target.value)} />
        </Field>
      </TwoCol>
      <Field label="Website">
        <input className="type-input" placeholder="https://example.com" value={f.website} onChange={e => onF('website', e.target.value)} />
      </Field>
      <Field label="Address">
        <input className="type-input" placeholder="123 Main St, City, Country" value={f.address} onChange={e => onF('address', e.target.value)} />
      </Field>
      <p className="type-hint">Generates a vCard 3.0 — scannable by all phone contacts apps.</p>
    </div>
  )
}

function LocationForm({ f, onF }) {
  return (
    <div className="type-form-fields">
      <TwoCol>
        <Field label="Latitude" required>
          <input
            className="type-input"
            type="number"
            step="any"
            placeholder="48.8566"
            value={f.lat}
            onChange={e => onF('lat', e.target.value)}
          />
        </Field>
        <Field label="Longitude" required>
          <input
            className="type-input"
            type="number"
            step="any"
            placeholder="2.3522"
            value={f.lng}
            onChange={e => onF('lng', e.target.value)}
          />
        </Field>
      </TwoCol>
      <Field label="Label (optional)">
        <input
          className="type-input"
          placeholder="e.g. Eiffel Tower, Paris"
          value={f.locationLabel}
          onChange={e => onF('locationLabel', e.target.value)}
        />
      </Field>
      <p className="type-hint">
        Tip: right-click any place on Google Maps and copy the coordinates.
      </p>
    </div>
  )
}

function EventForm({ f, onF }) {
  return (
    <div className="type-form-fields">
      <Field label="Event title" required>
        <input
          className="type-input"
          placeholder="Annual Meeting"
          value={f.eventTitle}
          onChange={e => onF('eventTitle', e.target.value)}
        />
      </Field>
      <TwoCol>
        <Field label="Start date" required>
          <input className="type-input type-input--date" type="date" value={f.startDate} onChange={e => onF('startDate', e.target.value)} />
        </Field>
        <Field label="Start time">
          <input className="type-input type-input--date" type="time" value={f.startTime} onChange={e => onF('startTime', e.target.value)} />
        </Field>
      </TwoCol>
      <TwoCol>
        <Field label="End date">
          <input className="type-input type-input--date" type="date" value={f.endDate} onChange={e => onF('endDate', e.target.value)} />
        </Field>
        <Field label="End time">
          <input className="type-input type-input--date" type="time" value={f.endTime} onChange={e => onF('endTime', e.target.value)} />
        </Field>
      </TwoCol>
      <Field label="Location">
        <input className="type-input" placeholder="Conference Room A, NYC" value={f.eventLocation} onChange={e => onF('eventLocation', e.target.value)} />
      </Field>
      <Field label="Description">
        <textarea
          className="type-input type-textarea"
          placeholder="Optional notes…"
          rows={2}
          value={f.eventDescription}
          onChange={e => onF('eventDescription', e.target.value)}
        />
      </Field>
      <p className="type-hint">Generates an iCalendar (VCALENDAR) — adds to calendar when scanned.</p>
    </div>
  )
}

function SocialForm({ f, onF }) {
  const platform = SOCIAL_PLATFORMS.find(p => p.id === f.socialPlatform) || SOCIAL_PLATFORMS[0]
  const u = f.socialUsername.trim()
  const preview = u
    ? (/^https?:\/\//i.test(u) ? u : platform.base + u.replace(/^@/, ''))
    : ''

  return (
    <div className="type-form-fields">
      <Field label="Platform">
        <select
          className="type-input type-select"
          value={f.socialPlatform}
          onChange={e => onF('socialPlatform', e.target.value)}
        >
          {SOCIAL_PLATFORMS.map(p => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
      </Field>
      <Field label="Username or full profile URL" required>
        <input
          className="type-input"
          placeholder="@username"
          value={f.socialUsername}
          onChange={e => onF('socialUsername', e.target.value)}
        />
      </Field>
      {preview && (
        <div className="type-url-preview">
          <span className="type-url-label">Link</span>
          <span className="type-url-value">{preview}</span>
        </div>
      )}
    </div>
  )
}

function UrlBuilderForm({ f, onF }) {
  const base = f.utmUrl.trim()
  let preview = ''
  if (base) {
    const url = /^https?:\/\//i.test(base) ? base : 'https://' + base
    const params = new URLSearchParams()
    if (f.utmSource)   params.set('utm_source',   f.utmSource.trim())
    if (f.utmMedium)   params.set('utm_medium',   f.utmMedium.trim())
    if (f.utmCampaign) params.set('utm_campaign', f.utmCampaign.trim())
    if (f.utmTerm)     params.set('utm_term',     f.utmTerm.trim())
    if (f.utmContent)  params.set('utm_content',  f.utmContent.trim())
    const qs = params.toString()
    preview = qs ? `${url}${url.includes('?') ? '&' : '?'}${qs}` : url
  }

  return (
    <div className="type-form-fields">
      <Field label="Base URL" required>
        <input
          className="type-input"
          placeholder="https://example.com/page"
          value={f.utmUrl}
          onChange={e => onF('utmUrl', e.target.value)}
          autoComplete="off"
        />
      </Field>
      <TwoCol>
        <Field label="UTM Source">
          <input className="type-input" placeholder="qr" value={f.utmSource} onChange={e => onF('utmSource', e.target.value)} />
        </Field>
        <Field label="UTM Medium">
          <input className="type-input" placeholder="print" value={f.utmMedium} onChange={e => onF('utmMedium', e.target.value)} />
        </Field>
      </TwoCol>
      <Field label="UTM Campaign">
        <input className="type-input" placeholder="spring_launch" value={f.utmCampaign} onChange={e => onF('utmCampaign', e.target.value)} />
      </Field>
      <TwoCol>
        <Field label="UTM Term">
          <input className="type-input" placeholder="(optional)" value={f.utmTerm} onChange={e => onF('utmTerm', e.target.value)} />
        </Field>
        <Field label="UTM Content">
          <input className="type-input" placeholder="(optional)" value={f.utmContent} onChange={e => onF('utmContent', e.target.value)} />
        </Field>
      </TwoCol>
      {preview && (
        <div className="type-url-preview">
          <span className="type-url-label">Full URL</span>
          <span className="type-url-value">{preview}</span>
        </div>
      )}
    </div>
  )
}

function TextForm({ f, onF, onGenerate }) {
  return (
    <div className="type-form-fields">
      <Field label="Text content" required>
        <textarea
          className="type-input type-textarea type-textarea--lg"
          placeholder="Paste a URL, email, phone number or any text…"
          maxLength={2300}
          value={f.text}
          onChange={e => onF('text', e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onGenerate() } }}
          spellCheck={false}
          autoComplete="off"
        />
      </Field>
      <p className="type-hint">{(f.text || '').length} / 2300 · Press Enter to generate · Drop a .txt file here</p>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────
export default function TypeSelector({ qrType, typeFields: f, onQrType, onFieldChange: onF, onGenerate }) {
  const formProps = { f, onF, onGenerate }

  const form = {
    web:      <WebForm      {...formProps} />,
    contact:  <ContactForm  {...formProps} />,
    location: <LocationForm {...formProps} />,
    event:    <EventForm    {...formProps} />,
    social:   <SocialForm   {...formProps} />,
    urlbuild: <UrlBuilderForm {...formProps} />,
    text:     <TextForm     {...formProps} />,
  }[qrType] ?? <TextForm {...formProps} />

  return (
    <div className="type-selector">
      <div className="type-tabs" role="tablist" aria-label="QR code content type">
        {TYPE_DEFS.map(({ id, label, icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={qrType === id}
            className={`type-tab${qrType === id ? ' active' : ''}`}
            onClick={() => onQrType(id)}
            type="button"
          >
            <span className="type-tab-icon" aria-hidden="true">{ICONS[icon]}</span>
            <span className="type-tab-label">{label}</span>
          </button>
        ))}
      </div>
      <div className="type-form" role="tabpanel">
        {form}
      </div>
    </div>
  )
}
