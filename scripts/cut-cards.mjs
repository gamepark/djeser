// Cuts the card images from the publisher sheets (see app/src/images/README.md).
// sharp is not a project dependency: copy this file into a scratch folder, run `npm i sharp@0.33.5` there, then
//   node cut-cards.mjs <publisher sources folder> <repo>/app/src/images
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
const [src, dst] = process.argv.slice(2)
const W = 880, H = 630 // 88 x 63 mm at 100 px/cm
const grids = { // origin, cell size; the printed card is 903 x 646 px at +16 px in its cell, with the red die line on its outer 4 px: crop 889 x 636 at (+23, +21)
  s50: { x0: 116, y0: 116, cw: 934.75, ch: 677.9 },
  s32: { x0: 116, y0: 116, cw: 934.5, ch: 677.9 }
}
const sheets = {
  stones: path.join(src, 'Djeser-50pcs Cards-front.jpg'),
  stoneBack: path.join(src, 'Djeser-50pcs Cards-back.jpg'),
  others: path.join(src, 'Djeser-32pcs Cards-front.jpg')
}
const buffers = {}
const sheet = async k => buffers[k] ??= await sharp(sheets[k], { limitInputPixels: false }).toBuffer()
let total = 0
async function cut(k, grid, row, col, out, rotate = 0) {
  const g = grids[grid]
  let img = sharp(await sheet(k)).extract({ left: Math.round(g.x0 + (col - 1) * g.cw + 23), top: Math.round(g.y0 + (row - 1) * g.ch + 21), width: 889, height: 636 })
    .resize(W, H, { fit: 'fill' })
  if (rotate) img = sharp(await img.toBuffer()).rotate(rotate)
  const file = path.join(dst, out)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  await img.webp({ lossless: true, effort: 6 }).toFile(file)
  total += fs.statSync(file).size
}

// Stone cards: position (row, col) of each value/colour on the 50-card sheet
const stoneGrid = [
  ['1 green', '1 blue', '1 yellow', '0 purple', '0 red', '0 green', '0 blue', '0 yellow'],
  ['3 yellow', '2 purple', '2 red', '2 green', '2 blue', '2 yellow', '1 purple', '1 red'],
  ['4 red', '4 green', '4 blue', '4 yellow', '3 purple', '3 red', '3 green', '3 blue'],
  ['6 blue', '6 yellow', '5 purple', '5 red', '5 green', '5 blue', '5 yellow', '4 purple'],
  ['7 purple', '7 red', '7 green', '7 blue', '7 yellow', '6 purple', '6 red', '6 green'],
  ['9 green', '9 blue', '9 yellow', '8 purple', '8 red', '8 green', '8 blue', '8 yellow'],
  [null, null, null, null, null, null, '9 purple', '9 red']
]
for (const [r, line] of stoneGrid.entries()) for (const [c, card] of line.entries()) {
  if (!card) continue
  const [value, color] = card.split(' ')
  await cut('stones', 's50', r + 1, c + 1, `cards/stones/${color}-${value}.webp`)
}
await cut('stoneBack', 's50', 1, 1, 'cards/stones/back.webp')

// Common objectives (portrait, printed lying down): faces rotated counter-clockwise, backs clockwise
const objectives = ['1:4', '2:1', '1:3', '1:2', '1:1', '2:4', '3:4', '2:2', '2:3', '3:2', '3:3', '3:1', '4:4', '4:3', '4:2', '4:1', '5:4', '5:3']
for (const [i, rc] of objectives.entries()) {
  const [r, c] = rc.split(':').map(Number)
  await cut('others', 's32', r, c, `cards/objectives/objective-${i + 1}.webp`, -90)
}
for (const [type, rc] of [[1, '1:5'], [2, '3:7'], [3, '4:8']]) {
  const [r, c] = rc.split(':').map(Number)
  await cut('others', 's32', r, c, `cards/objectives/back-type-${type}.webp`, 90)
}
// Cursed discard cards (portrait, faces rotated counter-clockwise)
await cut('others', 's32', 5, 1, 'cards/curses/curse-values.webp', -90)
await cut('others', 's32', 6, 4, 'cards/curses/curse-colors.webp', -90)
// Nile cards (landscape, same on both sides): value = number of blocks on the boat
await cut('others', 's32', 6, 3, 'cards/nile/nile-1.webp')
await cut('others', 's32', 6, 1, 'cards/nile/nile-2.webp')
await cut('others', 's32', 7, 1, 'cards/nile/nile-3.webp')
// First player card (landscape)
await cut('others', 's32', 5, 2, 'cards/first-player.webp')
console.log('total', (total / 1024 / 1024).toFixed(1), 'MB')
