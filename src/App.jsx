import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import Navbar from './components/Navbar.jsx'
import ControlsPanel from './components/ControlsPanel.jsx'
import PreviewPanel from './components/PreviewPanel.jsx'
import Footer from './components/Footer.jsx'
import Toast from './components/Toast.jsx'
import { computeMatrix, renderToCanvas, overlayLogo, buildSVG } from './utils/qrUtils.js'
import { buildPayload, DEFAULT_FIELDS } from './utils/payloadBuilders.js'

const STORAGE_KEY = 'qrcraft_v4'
const DEFAULTS = { fgColor: '#000000', bgColor: '#ffffff', size: 300, margin: 4, ecLevel: 'M', logoSize: 25, darkMode: false, qrStyle: 'classic', qrType: 'web' }

function loadSaved() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } }
  catch { return { ...DEFAULTS } }
}

function friendlyError(err) {
  const m = err?.message ?? String(err)
  if (/too long|overflow/i.test(m)) return 'Input is too long. Please shorten the text.'
  return m.length > 120 ? m.slice(0, 120) + '…' : m
}

export default function App() {
  // ── Settings
  const [darkMode, setDarkMode] = useState(false)
  const [fgColor,  setFgColor]  = useState(DEFAULTS.fgColor)
  const [bgColor,  setBgColor]  = useState(DEFAULTS.bgColor)
  const [size,     setSize]     = useState(DEFAULTS.size)
  const [margin,   setMargin]   = useState(DEFAULTS.margin)
  const [ecLevel,  setEcLevel]  = useState(DEFAULTS.ecLevel)
  const [logoSize, setLogoSize] = useState(DEFAULTS.logoSize)
  const [qrStyle,  setQrStyle]  = useState(DEFAULTS.qrStyle)

  // ── Content type + fields
  const [qrType,     setQrType]     = useState(DEFAULTS.qrType)
  const [typeFields, setTypeFields] = useState(DEFAULT_FIELDS)
  const updateField = useCallback((key, value) => {
    setTypeFields(prev => ({ ...prev, [key]: value }))
  }, [])
  const payload = useMemo(() => buildPayload(qrType, typeFields), [qrType, typeFields])

  // ── Logo
  const [logoData,     setLogoData]     = useState(null)
  const [logoImage,    setLogoImage]    = useState(null)
  const [logoFilename, setLogoFilename] = useState('')
  const [logoECForced, setLogoECForced] = useState(false)
  const [logoDragOver, setLogoDragOver] = useState(false)

  // ── UI state
  const [svgData,     setSvgData]     = useState(null)
  const [qrVisible,   setQrVisible]   = useState(false)
  const [isLoading,   setIsLoading]   = useState(false)
  const [errorMsg,    setErrorMsg]    = useState('')
  const [successMsg,  setSuccessMsg]  = useState('')
  const [resolution,  setResolution]  = useState('')
  const [panelDrag,   setPanelDrag]   = useState(false)

  // ── DOM refs
  const canvasRef   = useRef(null)
  const qrFrameRef  = useRef(null)
  const debounceRef = useRef(null)
  const errTimerRef = useRef(null)
  const okTimerRef  = useRef(null)
  const isGenRef    = useRef(false)
  const dragDepth   = useRef(0)

  // Always-fresh snapshot — updated on every render to avoid stale closures
  const snap = useRef({})
  snap.current = { fgColor, bgColor, size, margin, ecLevel, logoSize, logoData, logoImage, logoECForced, inputText: payload, darkMode, qrStyle, qrType, typeFields }

  // ── Dark mode
  useEffect(() => {
    if (darkMode) document.documentElement.setAttribute('data-theme', 'dark')
    else          document.documentElement.removeAttribute('data-theme')
  }, [darkMode])

  // ── Load persisted settings on first mount
  useEffect(() => {
    const s = loadSaved()
    setFgColor(s.fgColor); setBgColor(s.bgColor)
    setSize(s.size);       setMargin(s.margin)
    setEcLevel(s.ecLevel); setLogoSize(s.logoSize)
    setDarkMode(s.darkMode)
    if (s.qrStyle)    setQrStyle(s.qrStyle)
    if (s.qrType)     setQrType(s.qrType)
    if (s.typeFields) setTypeFields({ ...DEFAULT_FIELDS, ...s.typeFields })
  }, [])

  function persistSettings() {
    const s = snap.current
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        fgColor: s.fgColor, bgColor: s.bgColor,
        size: s.size,       margin: s.margin,
        ecLevel: s.ecLevel, logoSize: s.logoSize,
        darkMode: s.darkMode, qrStyle: s.qrStyle,
        qrType: s.qrType, typeFields: s.typeFields,
      }))
    } catch {}
  }

  // ── Status messages
  function showError(msg) {
    setErrorMsg(msg); setSuccessMsg('')
    clearTimeout(errTimerRef.current)
    errTimerRef.current = setTimeout(() => setErrorMsg(''), 5000)
  }
  function showSuccess(msg) {
    setSuccessMsg(msg); setErrorMsg('')
    clearTimeout(okTimerRef.current)
    okTimerRef.current = setTimeout(() => setSuccessMsg(''), 3000)
  }

  // ── QR generation — stored in ref so it always sees fresh state via snap.current
  const generateRef = useRef(null)
  generateRef.current = function generateQR(explicitText) {
    if (typeof window.QRCode === 'undefined') {
      showError('QR library not loaded — make sure qrcode.min.js is in the public/ folder.')
      return
    }
    const s     = snap.current
    const input = (explicitText ?? s.inputText).trim()
    if (!input)            { showError('Please enter some text or URL first.'); return }
    if (isGenRef.current)  return

    isGenRef.current = true
    setIsLoading(true); setQrVisible(false); setErrorMsg(''); setSuccessMsg('')

    requestAnimationFrame(() => {
      try {
        const matrix = computeMatrix(input, s.ecLevel)
        const canvas = canvasRef.current
        renderToCanvas(matrix, canvas, s.size, s.margin, s.fgColor, s.bgColor, s.qrStyle)
        if (s.logoImage) overlayLogo(canvas, s.size, s.logoImage, s.logoSize)

        setSvgData(buildSVG(matrix, s.margin, s.fgColor, s.bgColor, s.logoData, s.logoImage ? s.logoSize : null, s.qrStyle))
        if (qrFrameRef.current) qrFrameRef.current.style.background = s.bgColor
        setResolution(`${s.size} × ${s.size} px`)
        setIsLoading(false); setQrVisible(true)
        showSuccess('QR code generated successfully!')
        persistSettings()
      } catch (err) {
        setIsLoading(false)
        showError(friendlyError(err))
        console.error('[QRCraft]', err)
      } finally {
        isGenRef.current = false
      }
    })
  }

  // Debounced auto-generate — stable reference, reads snap.current at call time
  const scheduleAutoGenerate = useCallback(() => {
    clearTimeout(debounceRef.current)
    if (!snap.current.inputText.trim()) return
    debounceRef.current = setTimeout(() => generateRef.current?.(), 300)
  }, [])

  // Re-generate when any relevant setting changes (debounced)
  useEffect(() => {
    if (snap.current.inputText.trim()) scheduleAutoGenerate()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fgColor, bgColor, size, margin, ecLevel, logoSize, logoImage, qrStyle, scheduleAutoGenerate])

  // Re-generate when content payload changes (debounced)
  useEffect(() => {
    scheduleAutoGenerate()
    return () => clearTimeout(debounceRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload, scheduleAutoGenerate])

  // ── Downloads
  function downloadPNG() {
    if (!qrVisible || !canvasRef.current) return
    const a = Object.assign(document.createElement('a'), {
      download: 'qrcode.png',
      href: canvasRef.current.toDataURL('image/png'),
    })
    a.click()
  }

  function downloadSVG() {
    if (!svgData) return
    const url = URL.createObjectURL(new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' }))
    const a   = Object.assign(document.createElement('a'), { download: 'qrcode.svg', href: url })
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  async function copyToClipboard() {
    if (!payload.trim()) { showError('Nothing to copy — enter some content first.'); return }
    try {
      await navigator.clipboard.writeText(payload)
      showSuccess('Content copied to clipboard!')
    } catch {
      showError('Copy failed — please copy the text manually.')
    }
  }

  // ── Clear
  function clearAll() {
    setTypeFields(DEFAULT_FIELDS)
    setSvgData(null); setQrVisible(false)
    setResolution(''); setErrorMsg(''); setSuccessMsg('')
    clearTimeout(debounceRef.current)
  }

  // ── Colors
  function swapColors() {
    const fg = fgColor, bg = bgColor
    setFgColor(bg); setBgColor(fg)
  }
  function applyPreset(fg, bg) { setFgColor(fg); setBgColor(bg) }

  // ── Logo file handler
  async function handleLogoFile(file) {
    if (file.size > 2 * 1024 * 1024) { showError('Logo file is too large — maximum size is 2 MB.'); return }
    if (!file.type.startsWith('image/')) { showError('Please choose an image file (PNG, JPG, or SVG).'); return }
    try {
      const dataUrl = await new Promise((res, rej) => {
        const r = new FileReader()
        r.onload  = e => res(e.target.result)
        r.onerror = rej
        r.readAsDataURL(file)
      })
      const img = await new Promise((res, rej) => {
        const i = new Image()
        i.onload  = () => res(i)
        i.onerror = rej
        i.src     = dataUrl
      })
      setLogoData(dataUrl); setLogoImage(img)
      setLogoFilename(file.name.length > 28 ? file.name.slice(0, 25) + '…' : file.name)
      if (ecLevel !== 'H') { setEcLevel('H'); setLogoECForced(true) }
    } catch {
      showError('Could not load the logo image.')
    }
  }

  function removeLogo() {
    setLogoData(null); setLogoImage(null); setLogoFilename('')
    if (logoECForced) { setEcLevel('M'); setLogoECForced(false) }
  }

  // ── Panel drag & drop handlers (.txt and image files)
  function handlePanelDragEnter(e) {
    e.preventDefault()
    dragDepth.current++
    setPanelDrag(true)
  }
  function handlePanelDragLeave() {
    dragDepth.current--
    if (dragDepth.current <= 0) { dragDepth.current = 0; setPanelDrag(false) }
  }
  function handlePanelDragOver(e) { e.preventDefault() }
  async function handlePanelDrop(e) {
    e.preventDefault()
    dragDepth.current = 0; setPanelDrag(false)
    const file = e.dataTransfer?.files?.[0]
    if (!file) return
    if (file.type.startsWith('image/')) { await handleLogoFile(file); return }
    if (!file.type.startsWith('text/') && !file.name.endsWith('.txt')) {
      showError('Drop a .txt file to load content, or an image to set the logo.')
      return
    }
    try {
      const content = await new Promise((res, rej) => {
        const r = new FileReader()
        r.onload  = e => res(e.target.result)
        r.onerror = rej
        r.readAsText(file, 'UTF-8')
      })
      const trimmed = content.trim().slice(0, 2300)
      setQrType('text')
      setTypeFields(prev => ({ ...prev, text: trimmed }))
    } catch { showError('Could not read the file.') }
  }

  // ── Logo zone drag & drop handlers
  function handleLogoDragEnter(e) { e.preventDefault(); e.stopPropagation(); setLogoDragOver(true) }
  function handleLogoDragLeave(e) { e.stopPropagation(); setLogoDragOver(false) }
  function handleLogoDragOver(e)  { e.preventDefault(); e.stopPropagation() }
  async function handleLogoDrop(e) {
    e.preventDefault(); e.stopPropagation(); setLogoDragOver(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) await handleLogoFile(file)
  }

  return (
    <div className="app-shell">
      <Navbar darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} />

      <main className="dashboard">
        <h1 className="sr-only">QRCraft — Free QR Code Generator</h1>

        {/* ── Left: Controls panel ── */}
        <div className="controls-col">
          <ControlsPanel
          // Content type
          qrType={qrType}
          onQrType={setQrType}
          typeFields={typeFields}
          onFieldChange={updateField}
          onGenerate={() => generateRef.current?.()}
          onClear={clearAll}

          // Error correction
          ecLevel={ecLevel}
          onEcLevel={(v) => { setEcLevel(v); if (v !== 'H') setLogoECForced(false) }}

          // Colors
          fgColor={fgColor}
          bgColor={bgColor}
          onFgColor={setFgColor}
          onBgColor={setBgColor}
          onSwapColors={swapColors}
          onPreset={applyPreset}

          // Logo
          logoData={logoData}
          logoFilename={logoFilename}
          logoSize={logoSize}
          onLogoSize={setLogoSize}
          logoECForced={logoECForced}
          logoDragOver={logoDragOver}
          onLogoFile={handleLogoFile}
          onLogoRemove={removeLogo}
          onLogoDragEnter={handleLogoDragEnter}
          onLogoDragLeave={handleLogoDragLeave}
          onLogoDragOver={handleLogoDragOver}
          onLogoDrop={handleLogoDrop}

          // QR Style
          qrStyle={qrStyle}
          onQrStyle={setQrStyle}

          // Size & margin
          size={size}
          margin={margin}
          onSize={setSize}
          onMargin={setMargin}

          // Panel drag & drop
          panelDragActive={panelDrag}
          onPanelDragEnter={handlePanelDragEnter}
          onPanelDragLeave={handlePanelDragLeave}
          onPanelDragOver={handlePanelDragOver}
          onPanelDrop={handlePanelDrop}
          />
        </div>

        {/* ── Right: Stats row + Preview ── */}
        <div className="preview-col">

          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon stat-icon--indigo" aria-hidden="true">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 4-1 1 5 5 1-1zM2 22l10-10M10 6 8 8M6 10l-2 2M20 14l-2 2M14 20l-2 2"/>
                </svg>
              </div>
              <div className="stat-body">
                <p className="stat-value">5 Styles</p>
                <p className="stat-label">Module patterns</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon--green" aria-hidden="true">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12M12 16.5V3"/>
                </svg>
              </div>
              <div className="stat-body">
                <p className="stat-value">PNG & SVG</p>
                <p className="stat-label">Export formats</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon--purple" aria-hidden="true">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div className="stat-body">
                <p className="stat-value">100% Private</p>
                <p className="stat-label">No data leaves device</p>
              </div>
            </div>
          </div>

          <PreviewPanel
            canvasRef={canvasRef}
            qrFrameRef={qrFrameRef}
            qrVisible={qrVisible}
            isLoading={isLoading}
            svgData={svgData}
            resolution={resolution}
            onDownloadPNG={downloadPNG}
            onDownloadSVG={downloadSVG}
            onCopyText={copyToClipboard}
          />

        </div>
      </main>

      <Footer />

      <Toast
        successMsg={successMsg}
        errorMsg={errorMsg}
        onDismissSuccess={() => setSuccessMsg('')}
        onDismissError={() => setErrorMsg('')}
      />
    </div>
  )
}
