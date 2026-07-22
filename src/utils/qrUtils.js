// Pure QR utility functions — no React dependencies

export function computeMatrix(text, ecLevel) {
  const sink = document.createElement('div')
  sink.style.cssText = 'position:fixed;left:-9999px;width:1px;height:1px;visibility:hidden'
  document.body.appendChild(sink)
  try {
    const qr = new window.QRCode(sink, {
      text,
      width: 1,
      height: 1,
      correctLevel: window.QRCode.CorrectLevel[ecLevel] ?? window.QRCode.CorrectLevel.M,
    })
    if (!qr._oQRCode) throw new Error('Matrix not computed.')
    return qr._oQRCode
  } finally {
    document.body.removeChild(sink)
  }
}

// ── Structural module detection ───────────────────────────
// Returns true for modules that MUST stay as solid squares for reliable scanning:
//   • The three 7×7 finder patterns (top-left, top-right, bottom-left corners)
//   • The timing strips (row 6 and col 6 between the finders)
// These are the anchors every QR scanner relies on to locate and orient the code.
// Fluid style is exempt — it fills 100% of each cell and stays scannable.
function _isStructural(row, col, n) {
  if (row < 7 && col < 7)      return true  // top-left finder
  if (row < 7 && col >= n - 7) return true  // top-right finder
  if (row >= n - 7 && col < 7) return true  // bottom-left finder
  if (row === 6 || col === 6)  return true  // timing strips
  return false
}

// ── Canvas rendering ──────────────────────────────────────

export function renderToCanvas(matrix, canvas, size, margin, fg, bg, style = 'classic') {
  const modules    = matrix.getModuleCount()
  const totalCells = modules + margin * 2
  const cell       = size / totalCells

  canvas.width  = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = fg

  if (style === 'fluid') {
    // Fluid fills 100% of every cell — scannable as-is
    _drawFluidCanvas(ctx, matrix, modules, cell, margin)
  } else {
    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        if (!matrix.isDark(row, col)) continue
        const x = Math.floor((col + margin) * cell)
        const y = Math.floor((row + margin) * cell)
        const w = Math.ceil(cell)
        const h = Math.ceil(cell)
        // Structural modules are always drawn as solid squares
        const effective = (style !== 'classic' && _isStructural(row, col, modules))
          ? 'classic'
          : style
        _drawModuleCanvas(ctx, x, y, w, h, effective)
      }
    }
  }
}

function _drawModuleCanvas(ctx, x, y, w, h, style) {
  switch (style) {
    case 'dots': {
      const cx = x + w / 2, cy = y + h / 2
      const r  = Math.min(w, h) * 0.46  // slightly larger for better coverage
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'rounded': {
      const r = Math.min(w, h) * 0.28
      _roundRectPath(ctx, x, y, w, h, r)
      ctx.fill()
      break
    }
    case 'diamond': {
      const cx = x + w / 2, cy = y + h / 2
      const rx = w * 0.48, ry = h * 0.48  // slightly larger
      ctx.beginPath()
      ctx.moveTo(cx,      cy - ry)
      ctx.lineTo(cx + rx, cy)
      ctx.lineTo(cx,      cy + ry)
      ctx.lineTo(cx - rx, cy)
      ctx.closePath()
      ctx.fill()
      break
    }
    default:
      ctx.fillRect(x, y, w, h)
  }
}

// Fluid: each dark module gets corners rounded only where there is NO dark neighbour
function _drawFluidCanvas(ctx, matrix, modules, cell, margin) {
  const isDark = (r, c) =>
    r >= 0 && r < modules && c >= 0 && c < modules && matrix.isDark(r, c)
  const R = cell * 0.33

  for (let row = 0; row < modules; row++) {
    for (let col = 0; col < modules; col++) {
      if (!isDark(row, col)) continue

      const x = Math.floor((col + margin) * cell)
      const y = Math.floor((row + margin) * cell)
      const w = Math.ceil(cell)
      const h = Math.ceil(cell)

      const rTL = (!isDark(row - 1, col) && !isDark(row, col - 1)) ? R : 0
      const rTR = (!isDark(row - 1, col) && !isDark(row, col + 1)) ? R : 0
      const rBR = (!isDark(row + 1, col) && !isDark(row, col + 1)) ? R : 0
      const rBL = (!isDark(row + 1, col) && !isDark(row, col - 1)) ? R : 0

      _fluidRectPath(ctx, x, y, w, h, rTL, rTR, rBR, rBL)
      ctx.fill()
    }
  }
}

function _fluidRectPath(ctx, x, y, w, h, rTL, rTR, rBR, rBL) {
  ctx.beginPath()
  ctx.moveTo(x + rTL, y)
  ctx.lineTo(x + w - rTR, y)
  if (rTR) ctx.arcTo(x + w, y,     x + w, y + rTR,    rTR)
  ctx.lineTo(x + w, y + h - rBR)
  if (rBR) ctx.arcTo(x + w, y + h, x + w - rBR, y + h, rBR)
  ctx.lineTo(x + rBL, y + h)
  if (rBL) ctx.arcTo(x,     y + h, x,     y + h - rBL, rBL)
  ctx.lineTo(x, y + rTL)
  if (rTL) ctx.arcTo(x,     y,     x + rTL, y,          rTL)
  ctx.closePath()
}

function _roundRectPath(ctx, x, y, w, h, r) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r)
  } else {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + w, y,     x + w, y + h, r)
    ctx.arcTo(x + w, y + h, x,     y + h, r)
    ctx.arcTo(x,     y + h, x,     y,     r)
    ctx.arcTo(x,     y,     x + w, y,     r)
    ctx.closePath()
  }
}

// ── Logo overlay ──────────────────────────────────────────

export function overlayLogo(canvas, size, logoImage, logoSizePct) {
  if (!logoImage || !logoImage.complete || !logoImage.naturalWidth) return

  const ratio  = logoSizePct / 100
  const logoW  = Math.round(size * ratio)
  const logoH  = Math.round(size * ratio)
  const logoX  = Math.round((size - logoW) / 2)
  const logoY  = Math.round((size - logoH) / 2)
  const pad    = Math.max(4, Math.round(size * 0.028))
  const radius = Math.max(4, Math.round(size * 0.022))

  const bx = logoX - pad, by = logoY - pad
  const bw = logoW + pad * 2, bh = logoH + pad * 2

  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  _roundRectPath(ctx, bx, by, bw, bh, radius)
  ctx.fill()

  ctx.save()
  _roundRectPath(ctx, bx, by, bw, bh, radius)
  ctx.clip()
  ctx.drawImage(logoImage, logoX, logoY, logoW, logoH)
  ctx.restore()
}

// ── SVG export ────────────────────────────────────────────

export function buildSVG(matrix, margin, fg, bg, logoData, logoSizePct, style = 'classic') {
  const modules = matrix.getModuleCount()
  const total   = modules + margin * 2
  const f4      = n => n.toFixed(4)

  const shapeRendering = (style === 'classic') ? ' shape-rendering="crispEdges"' : ''
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" `,
    `viewBox="0 0 ${total} ${total}" width="${total}" height="${total}"${shapeRendering}>`,
    `<rect width="${total}" height="${total}" fill="${bg}"/>`,
  ]

  // Structural modules always render as crisp squares in every non-classic style
  const structuralRects = []

  if (style === 'classic') {
    const rects = []
    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        if (matrix.isDark(row, col))
          rects.push(`<rect x="${col + margin}" y="${row + margin}" width="1" height="1"/>`)
      }
    }
    parts.push(`<g fill="${fg}" shape-rendering="crispEdges">${rects.join('')}</g>`)

  } else if (style === 'fluid') {
    // Fluid fills 100% of every cell — scannable as-is, no structural override needed
    const isDark = (r, c) =>
      r >= 0 && r < modules && c >= 0 && c < modules && matrix.isDark(r, c)
    const R = 0.33
    const svgPaths = []

    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        if (!isDark(row, col)) continue
        const x = col + margin, y = row + margin
        const rTL = (!isDark(row-1,col) && !isDark(row,col-1)) ? R : 0
        const rTR = (!isDark(row-1,col) && !isDark(row,col+1)) ? R : 0
        const rBR = (!isDark(row+1,col) && !isDark(row,col+1)) ? R : 0
        const rBL = (!isDark(row+1,col) && !isDark(row,col-1)) ? R : 0
        svgPaths.push(_fluidSVGPath(x, y, 1, 1, rTL, rTR, rBR, rBL, f4))
      }
    }
    parts.push(`<g fill="${fg}">${svgPaths.join('')}</g>`)

  } else if (style === 'dots') {
    const circles = []
    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        if (!matrix.isDark(row, col)) continue
        if (_isStructural(row, col, modules)) {
          structuralRects.push(`<rect x="${col+margin}" y="${row+margin}" width="1" height="1"/>`)
        } else {
          const cx = col + margin + 0.5, cy = row + margin + 0.5
          circles.push(`<circle cx="${f4(cx)}" cy="${f4(cy)}" r="0.46"/>`)
        }
      }
    }
    parts.push(`<g fill="${fg}" shape-rendering="crispEdges">${structuralRects.join('')}</g>`)
    parts.push(`<g fill="${fg}">${circles.join('')}</g>`)

  } else if (style === 'diamond') {
    const polys = []
    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        if (!matrix.isDark(row, col)) continue
        if (_isStructural(row, col, modules)) {
          structuralRects.push(`<rect x="${col+margin}" y="${row+margin}" width="1" height="1"/>`)
        } else {
          const cx = col + margin + 0.5, cy = row + margin + 0.5, d = 0.48
          polys.push(
            `<polygon points="${f4(cx)},${f4(cy-d)} ${f4(cx+d)},${f4(cy)} ${f4(cx)},${f4(cy+d)} ${f4(cx-d)},${f4(cy)}"/>`
          )
        }
      }
    }
    parts.push(`<g fill="${fg}" shape-rendering="crispEdges">${structuralRects.join('')}</g>`)
    parts.push(`<g fill="${fg}">${polys.join('')}</g>`)

  } else if (style === 'rounded') {
    const rects = []
    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        if (!matrix.isDark(row, col)) continue
        if (_isStructural(row, col, modules)) {
          structuralRects.push(`<rect x="${col+margin}" y="${row+margin}" width="1" height="1"/>`)
        } else {
          rects.push(`<rect x="${col+margin}" y="${row+margin}" width="1" height="1" rx="0.28" ry="0.28"/>`)
        }
      }
    }
    parts.push(`<g fill="${fg}" shape-rendering="crispEdges">${structuralRects.join('')}</g>`)
    parts.push(`<g fill="${fg}">${rects.join('')}</g>`)
  }

  // Logo overlay
  if (logoData && logoSizePct) {
    const ratio = logoSizePct / 100
    const lw    = total * ratio, lh = total * ratio
    const lx    = (total - lw) / 2, ly = (total - lh) / 2
    const pad   = total * 0.028, r  = total * 0.022
    const bx    = lx - pad, by = ly - pad
    const bw    = lw + pad * 2, bh = lh + pad * 2

    parts.push(
      `<defs><clipPath id="lc"><rect x="${f4(bx)}" y="${f4(by)}" width="${f4(bw)}" height="${f4(bh)}" rx="${f4(r)}"/></clipPath></defs>`,
      `<rect x="${f4(bx)}" y="${f4(by)}" width="${f4(bw)}" height="${f4(bh)}" rx="${f4(r)}" fill="white"/>`,
      `<image href="${logoData}" x="${f4(lx)}" y="${f4(ly)}" width="${f4(lw)}" height="${f4(lh)}" preserveAspectRatio="xMidYMid meet" clip-path="url(#lc)"/>`,
    )
  }

  parts.push('</svg>')
  return parts.join('')
}

function _fluidSVGPath(x, y, w, h, rTL, rTR, rBR, rBL, f) {
  let d = `M${f(x+rTL)},${f(y)}`
  d += ` L${f(x+w-rTR)},${f(y)}`
  if (rTR) d += ` A${f(rTR)},${f(rTR)} 0 0 1 ${f(x+w)},${f(y+rTR)}`
  d += ` L${f(x+w)},${f(y+h-rBR)}`
  if (rBR) d += ` A${f(rBR)},${f(rBR)} 0 0 1 ${f(x+w-rBR)},${f(y+h)}`
  d += ` L${f(x+rBL)},${f(y+h)}`
  if (rBL) d += ` A${f(rBL)},${f(rBL)} 0 0 1 ${f(x)},${f(y+h-rBL)}`
  d += ` L${f(x)},${f(y+rTL)}`
  if (rTL) d += ` A${f(rTL)},${f(rTL)} 0 0 1 ${f(x+rTL)},${f(y)}`
  d += ' Z'
  return `<path d="${d}"/>`
}
