import { useState, useEffect, useRef, useCallback } from 'react'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import ControlsPanel from './components/ControlsPanel.jsx'
import PreviewPanel from './components/PreviewPanel.jsx'
import Features from './components/Features.jsx'
import Footer from './components/Footer.jsx'
import { computeMatrix, renderToCanvas, overlayLogo, buildSVG } from './utils/qrUtils.js'

const STORAGE_KEY = 'qrcraft_v4'
const DEFAULTS = { fgColor: '#000000', bgColor: '#ffffff', size: 300, margin: 4, ecLevel: 'M', logoSize: 25, darkMode: false }

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

  // ── Text input
  const [inputText, setInputText] = useState('')

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
  snap.current = { fgColor, bgColor, size, margin, ecLevel, logoSize, logoData, logoImage, logoECForced, inputText, darkMode }

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
  }, [])

  function persistSettings() {
    const s = snap.current
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        fgColor: s.fgColor, bgColor: s.bgColor,
        size: s.size,       margin: s.margin,
        ecLevel: s.ecLevel, logoSize: s.logoSize,
        darkMode: s.darkMode,
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
      showError('❌ QR library not loaded — make sure qrcode.min.js is in the public/ folder.')
      return
    }
    const s     = snap.current
    const input = (explicitText ?? s.inputText).trim()
    if (!input)            { showError('⚠️ Please enter some text or URL first.'); return }
    if (isGenRef.current)  return

    isGenRef.current = true
    setIsLoading(true); setQrVisible(false); setErrorMsg(''); setSuccessMsg('')

    requestAnimationFrame(() => {
      try {
        const matrix = computeMatrix(input, s.ecLevel)
        const canvas = canvasRef.current
        renderToCanvas(matrix, canvas, s.size, s.margin, s.fgColor, s.bgColor)
        if (s.logoImage) overlayLogo(canvas, s.size, s.logoImage, s.logoSize)

        setSvgData(buildSVG(matrix, s.margin, s.fgColor, s.bgColor, s.logoData, s.logoImage ? s.logoSize : null))
        if (qrFrameRef.current) qrFrameRef.current.style.background = s.bgColor
        setResolution(`${s.size} × ${s.size} px`)
        setIsLoading(false); setQrVisible(true)
        showSuccess('✅ QR code generated!')
        persistSettings()
      } catch (err) {
        setIsLoading(false)
        showError(`❌ ${friendlyError(err)}`)
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
  }, [fgColor, bgColor, size, margin, ecLevel, logoSize, logoImage, scheduleAutoGenerate])

  // Re-generate when text changes (debounced)
  useEffect(() => {
    scheduleAutoGenerate()
    return () => clearTimeout(debounceRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText, scheduleAutoGenerate])

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
    const text = snap.current.inputText.trim()
    if (!text) { showError('⚠️ Nothing to copy!'); return }
    try {
      await navigator.clipboard.writeText(text)
      showSuccess('📋 Copied to clipboard!')
    } catch {
      showError('❌ Copy failed — please copy manually.')
    }
  }

  // ── Clear
  function clearAll() {
    setInputText(''); setSvgData(null); setQrVisible(false)
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
    if (file.size > 2 * 1024 * 1024) { showError('⚠️ Logo too large (max 2 MB).'); return }
    if (!file.type.startsWith('image/')) { showError('⚠️ Please choose an image file.'); return }
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
      showError('❌ Could not load the logo image.')
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
      showError('⚠️ Drop a .txt file or an image for the logo.')
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
      setInputText(trimmed)
      setTimeout(() => generateRef.current?.(trimmed), 0)
    } catch { showError('❌ Could not read the file.') }
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
    <div>
      <Navbar darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} />
      <Hero />

      <main className="workspace">
        <ControlsPanel
          // Text
          inputText={inputText}
          onInputChange={setInputText}
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

        <PreviewPanel
          canvasRef={canvasRef}
          qrFrameRef={qrFrameRef}
          qrVisible={qrVisible}
          isLoading={isLoading}
          svgData={svgData}
          resolution={resolution}
          errorMsg={errorMsg}
          successMsg={successMsg}
          onDownloadPNG={downloadPNG}
          onDownloadSVG={downloadSVG}
          onCopyText={copyToClipboard}
        />
      </main>

      <Features />
      <Footer />
    </div>
  )
}
