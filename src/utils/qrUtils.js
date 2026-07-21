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

export function renderToCanvas(matrix, canvas, size, margin, fg, bg) {
  const modules    = matrix.getModuleCount()
  const totalCells = modules + margin * 2
  const cellPx     = size / totalCells

  canvas.width  = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = bg
  ctx.fillRect(0, 0, size, size)

  ctx.fillStyle = fg
  for (let row = 0; row < modules; row++) {
    for (let col = 0; col < modules; col++) {
      if (matrix.isDark(row, col)) {
        const x = (col + margin) * cellPx
        const y = (row + margin) * cellPx
        const w = (col + margin + 1) * cellPx - x
        const h = (row + margin + 1) * cellPx - y
        ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h))
      }
    }
  }
}

function roundRectPath(ctx, x, y, w, h, r) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, r)
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
  roundRectPath(ctx, bx, by, bw, bh, radius)
  ctx.fill()

  ctx.save()
  roundRectPath(ctx, bx, by, bw, bh, radius)
  ctx.clip()
  ctx.drawImage(logoImage, logoX, logoY, logoW, logoH)
  ctx.restore()
}

export function buildSVG(matrix, margin, fg, bg, logoData, logoSizePct) {
  const modules = matrix.getModuleCount()
  const total   = modules + margin * 2

  const rects = []
  for (let row = 0; row < modules; row++) {
    for (let col = 0; col < modules; col++) {
      if (matrix.isDark(row, col)) {
        rects.push(`<rect x="${col + margin}" y="${row + margin}" width="1" height="1"/>`)
      }
    }
  }

  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" `,
    `viewBox="0 0 ${total} ${total}" width="${total}" height="${total}" shape-rendering="crispEdges">`,
    `<rect width="${total}" height="${total}" fill="${bg}"/>`,
    `<g fill="${fg}">${rects.join('')}</g>`,
  ]

  if (logoData && logoSizePct) {
    const f = (n) => n.toFixed(4)
    const ratio = logoSizePct / 100
    const lw    = total * ratio
    const lh    = total * ratio
    const lx    = (total - lw) / 2
    const ly    = (total - lh) / 2
    const pad   = total * 0.028
    const r     = total * 0.022
    const bx    = lx - pad, by = ly - pad
    const bw    = lw + pad * 2, bh = lh + pad * 2

    parts.push(
      `<defs><clipPath id="lc"><rect x="${f(bx)}" y="${f(by)}" width="${f(bw)}" height="${f(bh)}" rx="${f(r)}"/></clipPath></defs>`,
      `<rect x="${f(bx)}" y="${f(by)}" width="${f(bw)}" height="${f(bh)}" rx="${f(r)}" fill="white"/>`,
      `<image href="${logoData}" x="${f(lx)}" y="${f(ly)}" width="${f(lw)}" height="${f(lh)}" preserveAspectRatio="xMidYMid meet" clip-path="url(#lc)"/>`,
    )
  }

  parts.push('</svg>')
  return parts.join('')
}
