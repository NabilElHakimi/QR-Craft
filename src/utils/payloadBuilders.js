export const SOCIAL_PLATFORMS = [
  { id: 'linkedin',  label: 'LinkedIn',    base: 'https://linkedin.com/in/' },
  { id: 'twitter',   label: 'X / Twitter', base: 'https://x.com/' },
  { id: 'instagram', label: 'Instagram',   base: 'https://instagram.com/' },
  { id: 'github',    label: 'GitHub',      base: 'https://github.com/' },
  { id: 'youtube',   label: 'YouTube',     base: 'https://youtube.com/@' },
  { id: 'tiktok',    label: 'TikTok',      base: 'https://tiktok.com/@' },
  { id: 'facebook',  label: 'Facebook',    base: 'https://facebook.com/' },
  { id: 'snapchat',  label: 'Snapchat',    base: 'https://snapchat.com/add/' },
]

export const DEFAULT_FIELDS = {
  // web
  url: '',
  // contact
  firstName: '', lastName: '', phone: '', email: '',
  company: '', jobTitle: '', website: '', address: '',
  // location
  lat: '', lng: '', locationLabel: '',
  // event
  eventTitle: '', startDate: '', startTime: '',
  endDate: '', endTime: '', eventLocation: '', eventDescription: '',
  // social
  socialPlatform: 'linkedin', socialUsername: '',
  // url builder
  utmUrl: '', utmSource: '', utmMedium: '', utmCampaign: '', utmTerm: '', utmContent: '',
  // other / free text
  text: '',
}

export function buildPayload(type, f) {
  switch (type) {
    case 'web':      return _web(f)
    case 'contact':  return _contact(f)
    case 'location': return _location(f)
    case 'event':    return _event(f)
    case 'social':   return _social(f)
    case 'urlbuild': return _utm(f)
    default:         return (f.text || '').trim()
  }
}

function _web({ url = '' }) {
  const u = url.trim()
  if (!u) return ''
  // Allow any URI scheme (mailto:, tel:, sms:, geo:…) — only auto-prefix bare hosts
  return /^[a-z][a-z\d+\-.]*:/i.test(u) ? u : 'https://' + u
}

function _esc(s) {
  return (s || '').replace(/[,;\\]/g, c => '\\' + c).replace(/\n/g, '\\n')
}

function _contact({ firstName='', lastName='', phone='', email='', company='', jobTitle='', website='', address='' }) {
  if (!firstName && !lastName && !phone && !email) return ''
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${_esc(lastName)};${_esc(firstName)};;;`,
    `FN:${_esc(`${firstName} ${lastName}`.trim())}`,
  ]
  if (company)  lines.push(`ORG:${_esc(company)}`)
  if (jobTitle) lines.push(`TITLE:${_esc(jobTitle)}`)
  if (phone)    lines.push(`TEL;TYPE=CELL:${phone.trim()}`)
  if (email)    lines.push(`EMAIL:${email.trim()}`)
  if (website) {
    const w = website.trim()
    lines.push(`URL:${/^https?:\/\//i.test(w) ? w : 'https://' + w}`)
  }
  if (address) lines.push(`ADR;TYPE=WORK:;;${_esc(address)};;;;`)
  lines.push('END:VCARD')
  return lines.join('\n')
}

function _location({ lat='', lng='', locationLabel='' }) {
  const la = lat.toString().trim(), lo = lng.toString().trim()
  if (!la || !lo) return ''
  const lbl = locationLabel.trim()
  return lbl ? `geo:${la},${lo}?q=${encodeURIComponent(lbl)}` : `geo:${la},${lo}`
}

function _event({ eventTitle='', startDate='', startTime='', endDate='', endTime='', eventLocation='', eventDescription='' }) {
  if (!eventTitle || !startDate) return ''
  const fmt = (d, t) => `${d.replace(/-/g, '')}T${t ? t.replace(/:/g, '') + '00' : '000000'}Z`
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//QRCraft//EN',
    'BEGIN:VEVENT',
    `SUMMARY:${_esc(eventTitle)}`,
    `DTSTART:${fmt(startDate, startTime)}`,
  ]
  if (endDate)          lines.push(`DTEND:${fmt(endDate, endTime)}`)
  if (eventLocation)    lines.push(`LOCATION:${_esc(eventLocation)}`)
  if (eventDescription) lines.push(`DESCRIPTION:${_esc(eventDescription)}`)
  lines.push('END:VEVENT', 'END:VCALENDAR')
  return lines.join('\r\n')
}

function _social({ socialPlatform='linkedin', socialUsername='' }) {
  const u = socialUsername.trim()
  if (!u) return ''
  if (/^https?:\/\//i.test(u)) return u
  const p = SOCIAL_PLATFORMS.find(x => x.id === socialPlatform)
  return p ? p.base + u.replace(/^@/, '') : u
}

function _utm({ utmUrl='', utmSource='', utmMedium='', utmCampaign='', utmTerm='', utmContent='' }) {
  const base = utmUrl.trim()
  if (!base) return ''
  const url = /^https?:\/\//i.test(base) ? base : 'https://' + base
  const params = new URLSearchParams()
  if (utmSource)   params.set('utm_source',   utmSource.trim())
  if (utmMedium)   params.set('utm_medium',   utmMedium.trim())
  if (utmCampaign) params.set('utm_campaign', utmCampaign.trim())
  if (utmTerm)     params.set('utm_term',     utmTerm.trim())
  if (utmContent)  params.set('utm_content',  utmContent.trim())
  const qs = params.toString()
  return qs ? `${url}${url.includes('?') ? '&' : '?'}${qs}` : url
}
