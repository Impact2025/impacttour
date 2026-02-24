/**
 * Generates PWA icons as solid-color PNGs using pure Node.js (no dependencies)
 * Colors: #00E676 green on #0F172A navy background
 */
import { deflateSync } from 'zlib'
import { writeFileSync, mkdirSync } from 'fs'

// CRC32 lookup table
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[i] = c
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function makeChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crcInput = Buffer.concat([typeBytes, data])
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(crcInput))
  return Buffer.concat([len, typeBytes, data, crcBuf])
}

function createPNG(size, bgR, bgG, bgB, fgR, fgG, fgB) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

  // IHDR
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 2  // RGB
  // compression, filter, interlace = 0

  // Draw a simple navigation arrow icon
  const rows = []
  const pad = Math.round(size * 0.2)
  for (let y = 0; y < size; y++) {
    const row = [0] // filter byte
    for (let x = 0; x < size; x++) {
      // Rounded rect background
      const cx = size / 2, cy = size / 2, r = size / 2 - 1
      const dx = x - cx, dy = y - cy
      const inCircle = dx * dx + dy * dy <= r * r

      // Simple arrow/navigation shape in center
      const ix = x - pad, iy = y - pad
      const iSize = size - pad * 2
      const inShape = ix >= 0 && ix < iSize && iy >= 0 && iy < iSize &&
        // Arrow pointing up-right: triangle
        (ix + iy < iSize * 0.9) && (ix > iSize * 0.1 || iy < iSize * 0.5)

      if (!inCircle) {
        row.push(255, 255, 255) // white outside (transparent-ish)
      } else if (inShape) {
        row.push(fgR, fgG, fgB) // foreground (green)
      } else {
        row.push(bgR, bgG, bgB) // background (navy)
      }
    }
    rows.push(Buffer.from(row))
  }

  const rawData = Buffer.concat(rows)
  const compressed = deflateSync(rawData)

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync('public/icons', { recursive: true })

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
// Navy bg (#0F172A = 15,23,42), green fg (#00E676 = 0,230,118)
for (const size of sizes) {
  const png = createPNG(size, 15, 23, 42, 0, 230, 118)
  writeFileSync(`public/icons/icon-${size}.png`, png)
  console.log(`Generated public/icons/icon-${size}.png`)
}

console.log('Done!')
