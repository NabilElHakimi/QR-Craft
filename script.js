'use strict';

// ═══════════════════════════════════════════════════════════════
//  QRCraft — script.js
//  Library: qrcodejs (bundled locally in qrcode.min.js).
//  The library is used only for matrix computation (._oQRCode).
//  All canvas/SVG rendering is done manually for full control.
//  Logo overlay: drawn on top of the canvas after QR rendering.
// ═══════════════════════════════════════════════════════════════

// ── State ──────────────────────────────────────────────────────
const state = {
  svgData:       null,
  debounceTimer: null,
  isGenerating:  false,
  logoData:      null,   // base64 data-URL of the uploaded logo
  logoImage:     null,   // pre-loaded HTMLImageElement
  logoECForced:  false,  // true when we auto-switched EC to H for logo
};

// ── DOM refs ───────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);

const dom = {
  // Input
  textInput:       $('textInput'),
  charCount:       $('charCount'),

  // Buttons
  generateBtn:     $('generateBtn'),
  clearBtn:        $('clearBtn'),
  copyBtn:         $('copyBtn'),
  downloadPng:     $('downloadPng'),
  downloadSvg:     $('downloadSvg'),
  darkToggle:      $('darkModeToggle'),
  themeIcon:       $('themeIcon'),

  // Colors
  fgColor:         $('fgColor'),
  bgColor:         $('bgColor'),
  fgHex:           $('fgHex'),
  bgHex:           $('bgHex'),
  swapColors:      $('swapColors'),

  // Sliders
  sizeSlider:      $('sizeSlider'),
  sizeValue:       $('sizeValue'),
  marginSlider:    $('marginSlider'),
  marginValue:     $('marginValue'),

  // Logo
  logoInput:       $('logoInput'),
  logoUploadZone:  $('logoUploadZone'),
  logoPreview:     $('logoPreview'),
  logoPreviewImg:  $('logoPreviewImg'),
  logoFilename:    $('logoFilename'),
  logoRemoveBtn:   $('logoRemoveBtn'),
  logoSizeSlider:  $('logoSizeSlider'),
  logoSizeValue:   $('logoSizeValue'),
  logoSizeControl: $('logoSizeControl'),
  logoTip:         $('logoTip'),

  // Status
  errorMsg:        $('errorMessage'),
  successMsg:      $('successMessage'),

  // Output
  loader:          $('loader'),
  emptyState:      $('emptyState'),
  qrOutput:        $('qrOutput'),
  qrCanvas:        $('qrCanvas'),
  qrFrame:         $('qrFrame'),
  resolution:      $('resolution'),

  // Drag-drop target (controls panel)
  mainCard:        $('mainCard'),
};

// ── Settings ───────────────────────────────────────────────────
const STORAGE_KEY = 'qrcraft_v4';

const DEFAULTS = {
  fgColor:  '#000000',
  bgColor:  '#ffffff',
  size:     300,
  margin:   4,
  ecLevel:  'M',
  logoSize: 25,
  darkMode: false,
};

function loadSettings() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') }; }
  catch { return { ...DEFAULTS }; }
}

function saveSettings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      fgColor:  dom.fgColor.value,
      bgColor:  dom.bgColor.value,
      size:     +dom.sizeSlider.value,
      margin:   +dom.marginSlider.value,
      ecLevel:  getECLevel(),
      logoSize: +dom.logoSizeSlider.value,
      darkMode: document.documentElement.getAttribute('data-theme') === 'dark',
    }));
  } catch { /* quota / private mode */ }
}

function applySettings(s) {
  dom.fgColor.value           = s.fgColor;
  dom.bgColor.value           = s.bgColor;
  dom.fgHex.textContent       = s.fgColor;
  dom.bgHex.textContent       = s.bgColor;
  dom.sizeSlider.value        = s.size;
  dom.sizeValue.textContent   = s.size;
  dom.marginSlider.value      = s.margin;
  dom.marginValue.textContent = s.margin;
  dom.logoSizeSlider.value    = s.logoSize;
  dom.logoSizeValue.textContent = s.logoSize;

  const ecRadio = document.querySelector(`input[name="ecLevel"][value="${s.ecLevel || 'M'}"]`);
  if (ecRadio) ecRadio.checked = true;

  syncActivePreset();
  if (s.darkMode) enableDark(false);
}

function getECLevel() {
  return document.querySelector('input[name="ecLevel"]:checked')?.value || 'M';
}

// ── Dark mode ──────────────────────────────────────────────────
function enableDark(save = true) {
  document.documentElement.setAttribute('data-theme', 'dark');
  dom.themeIcon.textContent = '☀️';
  if (save) saveSettings();
}
function disableDark(save = true) {
  document.documentElement.removeAttribute('data-theme');
  dom.themeIcon.textContent = '🌙';
  if (save) saveSettings();
}
function toggleDark() {
  document.documentElement.getAttribute('data-theme') === 'dark' ? disableDark() : enableDark();
}

// ── Messages ───────────────────────────────────────────────────
let errTimer, okTimer;

function showError(msg) {
  dom.errorMsg.textContent = msg;
  dom.errorMsg.classList.add('visible');
  dom.successMsg.classList.remove('visible');
  clearTimeout(errTimer);
  errTimer = setTimeout(() => dom.errorMsg.classList.remove('visible'), 5000);
}

function showSuccess(msg) {
  dom.successMsg.textContent = msg;
  dom.successMsg.classList.add('visible');
  dom.errorMsg.classList.remove('visible');
  clearTimeout(okTimer);
  okTimer = setTimeout(() => dom.successMsg.classList.remove('visible'), 3000);
}

function hideMessages() {
  dom.errorMsg.classList.remove('visible');
  dom.successMsg.classList.remove('visible');
}

// ── UI state helpers ───────────────────────────────────────────
function showLoader() {
  dom.loader.classList.add('visible');
  dom.qrOutput.classList.remove('visible');
  hideMessages();
}
function hideLoader() { dom.loader.classList.remove('visible'); }

function revealQR() {
  dom.qrOutput.classList.add('visible');
  dom.qrOutput.setAttribute('aria-hidden', 'false');
  dom.emptyState.classList.add('hidden');
}
function revealEmpty() {
  dom.emptyState.classList.remove('hidden');
  dom.qrOutput.classList.remove('visible');
}

// ── Character counter ──────────────────────────────────────────
function updateCharCount() {
  dom.charCount.textContent = dom.textInput.value.length;
}

// ── Color presets ──────────────────────────────────────────────
function syncActivePreset() {
  const fg = dom.fgColor.value.toLowerCase();
  const bg = dom.bgColor.value.toLowerCase();
  document.querySelectorAll('.preset-dot').forEach((btn) =>
    btn.classList.toggle('active',
      btn.dataset.fg.toLowerCase() === fg && btn.dataset.bg.toLowerCase() === bg)
  );
}

function applyPreset(fg, bg) {
  dom.fgColor.value     = fg;
  dom.bgColor.value     = bg;
  dom.fgHex.textContent = fg;
  dom.bgHex.textContent = bg;
  syncActivePreset();
  scheduleAutoGenerate();
}

function swapColors() {
  const tmp = dom.fgColor.value;
  dom.fgColor.value     = dom.bgColor.value;
  dom.bgColor.value     = tmp;
  dom.fgHex.textContent = dom.fgColor.value;
  dom.bgHex.textContent = dom.bgColor.value;
  syncActivePreset();
  scheduleAutoGenerate();
}

// ── Logo handling ──────────────────────────────────────────────

/**
 * Load an image file as a data-URL, create and pre-load an HTMLImageElement,
 * show the preview, and auto-switch EC to H for better scan reliability.
 */
async function handleLogoFile(file) {
  const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
  if (file.size > MAX_BYTES) { showError('⚠️  Logo file is too large (max 2 MB).'); return; }
  if (!file.type.startsWith('image/')) { showError('⚠️  Please choose an image file.'); return; }

  try {
    const dataUrl = await readFileAsDataURL(file);
    await setLogo(dataUrl, file.name);
    scheduleAutoGenerate();
  } catch {
    showError('❌  Could not load the logo image.');
  }
}

/** Store logo data and pre-load the Image element. */
function setLogo(dataUrl, filename) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => {
      state.logoData  = dataUrl;
      state.logoImage = img;
      showLogoPreview(dataUrl, filename || 'logo');
      forceECHigh();
      resolve();
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

function showLogoPreview(dataUrl, filename) {
  dom.logoPreviewImg.src     = dataUrl;
  dom.logoFilename.textContent = filename.length > 28 ? filename.slice(0, 25) + '…' : filename;
  dom.logoPreview.classList.remove('hidden');
  dom.logoSizeControl.classList.remove('hidden');
  dom.logoTip.classList.remove('hidden');
  dom.logoUploadZone.classList.add('hidden');
}

function removeLogo() {
  state.logoData  = null;
  state.logoImage = null;
  dom.logoInput.value = '';
  dom.logoPreview.classList.add('hidden');
  dom.logoSizeControl.classList.add('hidden');
  dom.logoTip.classList.add('hidden');
  dom.logoUploadZone.classList.remove('hidden');

  // Restore EC level to M if we had auto-switched it
  if (state.logoECForced) {
    const mRadio = document.querySelector('input[name="ecLevel"][value="M"]');
    if (mRadio) mRadio.checked = true;
    state.logoECForced = false;
  }
  scheduleAutoGenerate();
}

/** Auto-switch error correction to H when a logo is present. */
function forceECHigh() {
  const current = getECLevel();
  if (current !== 'H') {
    const hRadio = document.querySelector('input[name="ecLevel"][value="H"]');
    if (hRadio) { hRadio.checked = true; state.logoECForced = true; }
  }
}

// ── Canvas helpers ─────────────────────────────────────────────

/** Cross-browser rounded rectangle path (falls back if ctx.roundRect is unavailable). */
function roundRectPath(ctx, x, y, w, h, r) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y,     x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x,     y + h, r);
    ctx.arcTo(x,     y + h, x,     y,     r);
    ctx.arcTo(x,     y,     x + w, y,     r);
    ctx.closePath();
  }
}

/**
 * Overlay the logo on the center of the canvas.
 * Draws a white rounded-rectangle background first so the logo is visible
 * regardless of the QR background colour.
 */
function overlayLogo(canvas, size) {
  if (!state.logoImage || !state.logoImage.complete || !state.logoImage.naturalWidth) return;

  const logoRatio = +dom.logoSizeSlider.value / 100;
  const logoW     = Math.round(size * logoRatio);
  const logoH     = Math.round(size * logoRatio);
  const logoX     = Math.round((size - logoW) / 2);
  const logoY     = Math.round((size - logoH) / 2);
  const pad       = Math.max(4, Math.round(size * 0.028));
  const radius    = Math.max(4, Math.round(size * 0.022));

  const bgX = logoX - pad,  bgY = logoY - pad;
  const bgW = logoW + pad * 2, bgH = logoH + pad * 2;

  const ctx = canvas.getContext('2d');

  // 1 — white background
  ctx.fillStyle = '#ffffff';
  roundRectPath(ctx, bgX, bgY, bgW, bgH, radius);
  ctx.fill();

  // 2 — clip logo to same shape
  ctx.save();
  roundRectPath(ctx, bgX, bgY, bgW, bgH, radius);
  ctx.clip();
  ctx.drawImage(state.logoImage, logoX, logoY, logoW, logoH);
  ctx.restore();
}

// ── QR matrix (via qrcodejs) ───────────────────────────────────
function computeMatrix(text, ecLevel) {
  const sink = document.createElement('div');
  sink.style.cssText = 'position:fixed;left:-9999px;width:1px;height:1px;visibility:hidden';
  document.body.appendChild(sink);
  try {
    const qr = new QRCode(sink, {
      text,
      width:        1,
      height:       1,
      correctLevel: QRCode.CorrectLevel[ecLevel] ?? QRCode.CorrectLevel.M,
    });
    if (!qr._oQRCode) throw new Error('Matrix not computed.');
    return qr._oQRCode;
  } finally {
    document.body.removeChild(sink);
  }
}

// ── Canvas renderer ────────────────────────────────────────────
function renderToCanvas(matrix, canvas, size, margin, fg, bg) {
  const modules    = matrix.getModuleCount();
  const totalCells = modules + margin * 2;
  const cellPx     = size / totalCells;

  canvas.width  = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = fg;
  for (let row = 0; row < modules; row++) {
    for (let col = 0; col < modules; col++) {
      if (matrix.isDark(row, col)) {
        const x = (col + margin) * cellPx;
        const y = (row + margin) * cellPx;
        const w = (col + margin + 1) * cellPx - x;
        const h = (row + margin + 1) * cellPx - y;
        ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h));
      }
    }
  }

  // Logo overlay (drawn after QR, so it sits on top)
  overlayLogo(canvas, size);
}

// ── SVG builder ────────────────────────────────────────────────
function buildSVG(matrix, margin, fg, bg) {
  const modules = matrix.getModuleCount();
  const total   = modules + margin * 2;

  const rects = [];
  for (let row = 0; row < modules; row++) {
    for (let col = 0; col < modules; col++) {
      if (matrix.isDark(row, col)) {
        rects.push(`<rect x="${col + margin}" y="${row + margin}" width="1" height="1"/>`);
      }
    }
  }

  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" `,
    `viewBox="0 0 ${total} ${total}" width="${total}" height="${total}" shape-rendering="crispEdges">`,
    `<rect width="${total}" height="${total}" fill="${bg}"/>`,
    `<g fill="${fg}">${rects.join('')}</g>`,
  ];

  // Embed logo into SVG if present
  if (state.logoData) {
    const logoRatio = +dom.logoSizeSlider.value / 100;
    const lw  = total * logoRatio;
    const lh  = total * logoRatio;
    const lx  = (total - lw) / 2;
    const ly  = (total - lh) / 2;
    const pad = total * 0.028;
    const r   = total * 0.022;
    const bx  = lx - pad, by = ly - pad;
    const bw  = lw + pad * 2, bh = lh + pad * 2;

    const f = (n) => n.toFixed(4);

    parts.push(
      `<defs>` +
      `<clipPath id="lc">` +
      `<rect x="${f(bx)}" y="${f(by)}" width="${f(bw)}" height="${f(bh)}" rx="${f(r)}"/>` +
      `</clipPath></defs>`,
      `<rect x="${f(bx)}" y="${f(by)}" width="${f(bw)}" height="${f(bh)}" rx="${f(r)}" fill="white"/>`,
      `<image href="${state.logoData}" ` +
      `x="${f(lx)}" y="${f(ly)}" width="${f(lw)}" height="${f(lh)}" ` +
      `preserveAspectRatio="xMidYMid meet" clip-path="url(#lc)"/>`,
    );
  }

  parts.push('</svg>');
  return parts.join('');
}

// ── Core: generate ─────────────────────────────────────────────
function generateQR(text) {
  if (typeof QRCode === 'undefined') {
    showError('❌  QR library not loaded — make sure qrcode.min.js is in the same folder.');
    return;
  }

  const input = (text ?? dom.textInput.value).trim();
  if (!input) { showError('⚠️  Please enter some text or a URL first.'); return; }
  if (state.isGenerating) return;

  state.isGenerating = true;
  showLoader();

  // Defer one frame so the spinner paints before synchronous work
  requestAnimationFrame(() => {
    try {
      const size    = +dom.sizeSlider.value;
      const margin  = +dom.marginSlider.value;
      const fg      = dom.fgColor.value;
      const bg      = dom.bgColor.value;
      const ecLevel = getECLevel();

      const matrix = computeMatrix(input, ecLevel);
      renderToCanvas(matrix, dom.qrCanvas, size, margin, fg, bg);
      state.svgData = buildSVG(matrix, margin, fg, bg);

      dom.qrFrame.style.background = bg;
      dom.resolution.textContent   = `${size} × ${size} px`;

      hideLoader();
      revealQR();
      showSuccess('✅  QR code generated!');
      saveSettings();
    } catch (err) {
      hideLoader();
      revealEmpty();
      showError(`❌  ${friendlyError(err)}`);
      console.error('[QRCraft]', err);
    } finally {
      state.isGenerating = false;
    }
  });
}

function friendlyError(err) {
  const m = err?.message ?? String(err);
  if (/too long|overflow/i.test(m)) return 'Input is too long. Try shortening the text.';
  return m.length > 120 ? m.slice(0, 120) + '…' : m;
}

// ── Debounced auto-generate ────────────────────────────────────
function scheduleAutoGenerate() {
  clearTimeout(state.debounceTimer);
  if (!dom.textInput.value.trim()) return;
  state.debounceTimer = setTimeout(() => generateQR(), 300);
}

// ── Downloads ──────────────────────────────────────────────────
function downloadPNG() {
  if (!dom.qrOutput.classList.contains('visible')) return;
  const a = Object.assign(document.createElement('a'), {
    download: 'qrcode.png',
    href:     dom.qrCanvas.toDataURL('image/png'),
  });
  a.click();
}

function downloadSVG() {
  if (!state.svgData) return;
  const url = URL.createObjectURL(new Blob([state.svgData], { type: 'image/svg+xml;charset=utf-8' }));
  const a   = Object.assign(document.createElement('a'), { download: 'qrcode.svg', href: url });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── Clipboard ──────────────────────────────────────────────────
async function copyToClipboard() {
  const text = dom.textInput.value.trim();
  if (!text) { showError('⚠️  Nothing to copy!'); return; }
  try {
    await navigator.clipboard.writeText(text);
    showSuccess('📋  Copied to clipboard!');
  } catch {
    dom.textInput.select();
    try   { document.execCommand('copy'); showSuccess('📋  Copied to clipboard!'); }
    catch { showError('❌  Copy failed — please copy manually.'); }
  }
}

// ── Clear ──────────────────────────────────────────────────────
function clearAll() {
  dom.textInput.value        = '';
  dom.charCount.textContent  = '0';
  dom.resolution.textContent = '';
  state.svgData              = null;
  revealEmpty();
  hideMessages();
  syncActivePreset();
  dom.textInput.focus();
}

// ── File readers ───────────────────────────────────────────────
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload  = (e) => resolve(e.target.result);
    r.onerror = () => reject(new Error('FileReader failed'));
    r.readAsDataURL(file);
  });
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload  = (e) => resolve(e.target.result);
    r.onerror = () => reject(new Error('FileReader failed'));
    r.readAsText(file, 'UTF-8');
  });
}

// ── Drag & drop — logo upload zone ────────────────────────────
function setupLogoDragDrop() {
  const zone = dom.logoUploadZone;

  zone.addEventListener('dragenter', (e) => { e.preventDefault(); e.stopPropagation(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', (e) => { e.stopPropagation(); zone.classList.remove('drag-over'); });
  zone.addEventListener('dragover',  (e) => { e.preventDefault(); e.stopPropagation(); });
  zone.addEventListener('drop', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer?.files?.[0];
    if (file) await handleLogoFile(file);
  });
}

// ── Drag & drop — main card (.txt → textarea) ──────────────────
function setupTextDragDrop() {
  let depth = 0;

  dom.mainCard.addEventListener('dragenter', (e) => {
    e.preventDefault();
    depth++;
    if (hasTxtFiles(e)) dom.dropOverlay.classList.add('active');
  });
  dom.mainCard.addEventListener('dragleave', () => {
    if (--depth <= 0) { depth = 0; dom.dropOverlay.classList.remove('active'); }
  });
  dom.mainCard.addEventListener('dragover', (e) => e.preventDefault());
  dom.mainCard.addEventListener('drop', async (e) => {
    e.preventDefault();
    depth = 0;
    dom.dropOverlay.classList.remove('active');

    // If the drop originated inside the logo zone, ignore it here
    if (e.target.closest('#logoUploadZone')) return;

    const file = e.dataTransfer?.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      // User dropped an image onto the card (not the logo zone) → treat as logo
      await handleLogoFile(file);
      return;
    }

    if (!file.type.startsWith('text/') && !file.name.endsWith('.txt')) {
      showError('⚠️  Please drop a .txt file or an image for the logo.');
      return;
    }

    try {
      const content = await readFileAsText(file);
      const trimmed = content.trim().slice(0, 2300);
      dom.textInput.value = trimmed;
      updateCharCount();
      generateQR(trimmed);
    } catch {
      showError('❌  Could not read the file.');
    }
  });
}

const hasTxtFiles = (e) =>
  Array.from(e.dataTransfer?.items ?? []).some((i) => i.kind === 'file');

// ── Event wiring ───────────────────────────────────────────────
function bindEvents() {
  // Primary
  dom.generateBtn.addEventListener('click',  () => generateQR());
  dom.clearBtn.addEventListener('click',     clearAll);
  dom.copyBtn.addEventListener('click',      copyToClipboard);
  dom.downloadPng.addEventListener('click',  downloadPNG);
  dom.downloadSvg.addEventListener('click',  downloadSVG);
  dom.darkToggle.addEventListener('click',   toggleDark);
  dom.swapColors.addEventListener('click',   swapColors);

  // Textarea
  dom.textInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generateQR(); }
  });
  dom.textInput.addEventListener('input', () => { updateCharCount(); scheduleAutoGenerate(); });

  // Sliders
  dom.sizeSlider.addEventListener('input', () => {
    dom.sizeValue.textContent = dom.sizeSlider.value;
    scheduleAutoGenerate();
  });
  dom.marginSlider.addEventListener('input', () => {
    dom.marginValue.textContent = dom.marginSlider.value;
    scheduleAutoGenerate();
  });

  // Color pickers
  dom.fgColor.addEventListener('input', () => {
    dom.fgHex.textContent = dom.fgColor.value;
    syncActivePreset();
    scheduleAutoGenerate();
  });
  dom.bgColor.addEventListener('input', () => {
    dom.bgHex.textContent = dom.bgColor.value;
    syncActivePreset();
    scheduleAutoGenerate();
  });

  // Color presets
  document.querySelectorAll('.preset-dot').forEach((btn) =>
    btn.addEventListener('click', () => applyPreset(btn.dataset.fg, btn.dataset.bg))
  );

  // EC level
  document.querySelectorAll('input[name="ecLevel"]').forEach((r) =>
    r.addEventListener('change', () => {
      // If user manually changes EC away from H while logo is present, note it
      if (state.logoImage && getECLevel() !== 'H') state.logoECForced = false;
      scheduleAutoGenerate();
    })
  );

  // Logo
  dom.logoInput.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (file) await handleLogoFile(file);
    dom.logoInput.value = ''; // reset so same file can be re-selected
  });
  dom.logoRemoveBtn.addEventListener('click', removeLogo);
  dom.logoSizeSlider.addEventListener('input', () => {
    dom.logoSizeValue.textContent = dom.logoSizeSlider.value;
    scheduleAutoGenerate();
  });
}

// ── Init ───────────────────────────────────────────────────────
function init() {
  applySettings(loadSettings());
  bindEvents();
  setupLogoDragDrop();
  setupTextDragDrop();
  dom.textInput.focus();
}

init();
