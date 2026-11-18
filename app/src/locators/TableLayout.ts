import { CurseType } from '@gamepark/djeser/material/CurseType'
import { LocationType } from '@gamepark/djeser/material/LocationType'
import { MaterialType } from '@gamepark/djeser/material/MaterialType'
import { MaterialRules, XYCoordinates } from '@gamepark/rules-api'

/**
 * The whole table, in centimetres, at the scale of the real cards (88 × 63 mm).
 *
 * At the top, the shared area, laid out like the setup of the rulebook (page 3), from left to right:
 * the 2 cursed discard cards, each with its pile under it, then the Nile (the 7 Nile cards, with the Stone cards
 * under them and the quarry under the 7th), then the Common Objective cards.
 * Under it, the pyramids of the players in rows of 2, starting with the player who looks at the table, with the
 * first player card in the free corner left of level III (decision of the publisher, 18/11/2026).
 * In solo, Imhotep's pyramid takes the second seat.
 * The player who looks at the table has their hand in the free space left of the pyramids, away from their pyramid;
 * the other hands are only a count of cards, in the free corner right of level III (decisions of the publisher, 18/11/2026).
 * Nothing is ever rotated except the quarry, shown upright like in the rulebook.
 */

/** A Stone card, Nile card or first player card, lying in landscape. */
export const cardWidth = 8.8
export const cardHeight = 6.3
export const cardBorderRadius = 0.3

/** Space between two cards side by side, and between two areas of the table. */
const cardGap = 0.2
const areaGap = 2
const cardPitch = cardWidth + cardGap

type Rules = MaterialRules<number, MaterialType, LocationType>

// ------------------------------------------------------------------ shared area, at the top

const curseBlockWidth = 2 * cardWidth + 0.4
const nileWidth = 7 * cardWidth + 6 * cardGap
const objectivePitch = cardHeight + 0.4
const objectivesWidth = 3 * cardHeight + 2 * 0.4
const sharedWidth = curseBlockWidth + 1.5 + nileWidth + 1.5 + objectivesWidth
const sharedLeft = -sharedWidth / 2
const sharedHeight = cardWidth + 0.3 + cardHeight

/** The cursed discard cards (portrait), the colors one first, the values one next to the Nile. */
const curseX = (curse: CurseType) => sharedLeft + cardWidth / 2 + (curse === CurseType.Color ? 0 : cardWidth + 0.4)
export const curseCardSpot = (curse: CurseType): XYCoordinates => ({ x: curseX(curse), y: cardWidth / 2 })
/** Each cursed discard pile is under its card. */
export const cursedDiscardSpot = (curse: CurseType): XYCoordinates => ({ x: curseX(curse), y: cardWidth + 0.3 + cardHeight / 2 })

/** Column of the Nile: 0 next to the cursed discards, 6 above the quarry. */
const nileX = (x: number) => sharedLeft + curseBlockWidth + 1.5 + cardWidth / 2 + x * cardPitch
export const nileCardSpot = (x: number): XYCoordinates => ({ x: nileX(x), y: cardHeight / 2 })
export const nileStoneSpot = (x: number): XYCoordinates => ({ x: nileX(x), y: cardHeight + 0.3 + cardHeight / 2 })
/** The quarry is under the 7th Nile card, upright (rotated a quarter turn). */
export const quarrySpot: XYCoordinates = { x: nileX(6), y: cardHeight + 0.3 + cardWidth / 2 }

/** The Common Objective cards (portrait), right of the Nile. */
export const objectivesSpot: XYCoordinates = { x: sharedLeft + sharedWidth - objectivesWidth + cardHeight / 2, y: cardWidth / 2 }
export const objectivesGap = objectivePitch

// ------------------------------------------------------------------ players, under the shared area

const playersTop = sharedHeight + areaGap
/** A pyramid of 3 levels. */
const playerAreaWidth = 3 * cardWidth + 2 * cardGap
const levelPitch = cardHeight + cardGap
const pyramidHeight = (levels: number) => levels * levelPitch - cardGap
/** Imhotep's pyramid has 4 levels (4, 3, 2 and 1 cards). */
const imhotepAreaWidth = 4 * cardWidth + 3 * cardGap
/** The players are in rows of 2 (decision of the publisher, 18/11/2026). */
const seatsPerRow = 2

/** The seat of a player: 0 for the player who looks at the table (or the first player for a spectator), then in turn order. */
export const getSeat = (rules: Rules, player: number, me?: number) => {
  const players = rules.players
  const first = me === undefined ? 0 : Math.max(0, players.indexOf(me))
  return (players.indexOf(player) - first + players.length) % players.length
}

const isSolo = (rules: Rules) => rules.players.length === 1
const rowCount = (rules: Rules) => Math.ceil(rules.players.length / seatsPerRow)
/** A row of players is as tall as a pyramid of 3 levels, or as Imhotep's in solo. */
const rowHeight = (rules: Rules) => pyramidHeight(isSolo(rules) ? 4 : 3)

/** The width of the widest row of players: in solo, the player and Imhotep. */
const playersWidth = (rules: Rules) => {
  if (isSolo(rules)) return playerAreaWidth + areaGap + imhotepAreaWidth
  const seats = Math.min(rules.players.length, seatsPerRow)
  return seats * playerAreaWidth + (seats - 1) * areaGap
}

/** Center and top of the area of the player at this seat. A row with a single player is centered. */
const seatSpot = (rules: Rules, seat: number): XYCoordinates => {
  const row = Math.floor(seat / seatsPerRow)
  const top = playersTop + row * (rowHeight(rules) + areaGap)
  if (isSolo(rules)) return { x: -playersWidth(rules) / 2 + playerAreaWidth / 2, y: top }
  const seatsInRow = Math.min(seatsPerRow, rules.players.length - row * seatsPerRow)
  return { x: ((seat % seatsPerRow) - (seatsInRow - 1) / 2) * (playerAreaWidth + areaGap), y: top }
}

/** A card of a pyramid of `levels` levels: y = level (0 for the base), x = position in the level from the left. */
const pyramidSpot = (area: XYCoordinates, levels: number, x: number, y: number): XYCoordinates => ({
  x: area.x + (x - (levels - y - 1) / 2) * cardPitch,
  y: area.y + (levels - 1 - y) * levelPitch + cardHeight / 2
})

const playerArea = (rules: Rules, player: number, me?: number) => seatSpot(rules, getSeat(rules, player, me))

export const playerPyramidSpot = (rules: Rules, player: number, me: number | undefined, x: number, y: number) =>
  pyramidSpot(playerArea(rules, player, me), 3, x, y)

/** In solo, Imhotep's pyramid is right of the player's area. */
export const imhotepPyramidSpot = (rules: Rules, x: number, y: number) =>
  pyramidSpot({ x: playersWidth(rules) / 2 - imhotepAreaWidth / 2, y: playersTop }, 4, x, y)

/** The free corners left and right of level III of a player's pyramid. */
const levelIIICorner = (rules: Rules, player: number, me: number | undefined, side: -1 | 1): XYCoordinates => {
  const top = playerPyramidSpot(rules, player, me, 0, 2)
  return { x: top.x + side * cardPitch, y: top.y }
}

/** The first player card, in the free corner left of level III. */
export const firstPlayerSpot = (rules: Rules, player: number, me?: number) => levelIIICorner(rules, player, me, -1)

/** The count of cards in the hand of another player, in the free corner right of level III. */
export const handCountSpot = (rules: Rules, player: number, me?: number) => levelIIICorner(rules, player, me, 1)
export const handCountWidth = cardWidth
export const handCountHeight = 2.5

/** The free space left of the players, under the cursed discards. */
const handZone = (rules: Rules) => {
  const left = sharedLeft
  const right = -playersWidth(rules) / 2 - areaGap
  return { left, right, width: right - left }
}

/** The hand of the player who looks at the table: up to 4 cards side by side, overlapping if needed, left of the pyramids. */
export const myHandGap = (rules: Rules) => Math.min(cardPitch, (handZone(rules).width - cardWidth) / 3)
export const myHandSpot = (rules: Rules): XYCoordinates => ({
  x: handZone(rules).left + cardWidth / 2,
  y: playersTop + cardHeight / 2
})

/** The table, as small as possible, with a margin of 2 mm. */
export const tableBoundaries = (rules: Rules) => {
  const halfWidth = Math.max(sharedWidth, playersWidth(rules)) / 2 + 0.2
  const rows = rowCount(rules)
  return { xMin: -halfWidth, xMax: halfWidth, yMin: -0.2, yMax: playersTop + rows * rowHeight(rules) + (rows - 1) * areaGap + 0.2 }
}
