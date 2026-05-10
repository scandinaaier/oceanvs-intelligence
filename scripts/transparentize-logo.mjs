// Convert the white square background of Oceanvslogo.png into transparency
// by flood-filling from the four corners. The white trident inside the black
// circle is isolated by the black ring, so it stays opaque white.
import sharp from 'sharp'
import { writeFileSync } from 'node:fs'

const SRC = 'public/Oceanvslogo.png'
const OUT = 'public/Oceanvslogo.png'

const WHITE_THRESHOLD = 235 // pixels with R,G,B all above this count as "white"

const img = sharp(SRC).ensureAlpha()
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })
const { width, height, channels } = info

const isWhite = (i) => data[i] >= WHITE_THRESHOLD && data[i + 1] >= WHITE_THRESHOLD && data[i + 2] >= WHITE_THRESHOLD
const setTransparent = (i) => { data[i + 3] = 0 }

const visited = new Uint8Array(width * height)
const stack = []
const seed = (x, y) => {
  if (x < 0 || y < 0 || x >= width || y >= height) return
  const idx = y * width + x
  if (visited[idx]) return
  stack.push(idx)
}

// Seed the flood fill from all four corners
seed(0, 0)
seed(width - 1, 0)
seed(0, height - 1)
seed(width - 1, height - 1)

while (stack.length) {
  const idx = stack.pop()
  if (visited[idx]) continue
  visited[idx] = 1
  const x = idx % width
  const y = (idx - x) / width
  const i = idx * channels
  if (!isWhite(i)) continue
  setTransparent(i)
  if (x > 0) stack.push(idx - 1)
  if (x < width - 1) stack.push(idx + 1)
  if (y > 0) stack.push(idx - width)
  if (y < height - 1) stack.push(idx + width)
}

await sharp(data, { raw: { width, height, channels } }).png().toFile(OUT)
console.log(`[logo] Transparentized ${OUT} (${width}×${height})`)
