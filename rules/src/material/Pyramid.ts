import { getStoneColor, getStoneValue, StoneCard, StoneColor } from './StoneCard'

/** A Stone card in a pyramid: y = level (0 for level I, the base), x = position in the level from the left. */
export type PyramidCard = { id: StoneCard; x: number; y: number }

/** A player's pyramid has 3 levels (3, 2 and 1 cards). */
export const PYRAMID_LEVELS = 3
/** Imhotep's pyramid has 4 levels (4, 3, 2 and 1 cards). */
export const IMHOTEP_PYRAMID_LEVELS = 4

/** The positions of a pyramid, level by level from the base, left to right. */
export const pyramidSlots = (levels: number) =>
  Array.from({ length: levels }, (_, y) => Array.from({ length: levels - y }, (_, x) => ({ x, y }))).flat()

export const pyramidSize = (levels: number) => pyramidSlots(levels).length

export const cardAt = (cards: PyramidCard[], x: number, y: number) => cards.find((card) => card.x === x && card.y === y)

/**
 * "From level II, the card can only be placed if it rests on two cards of the lower level, its supports,
 * and if its value equals either the sum or the difference of the values of its 2 supports."
 * A difference can be 0 (decision H3). Level I has 3 positions: a space can be left between 2 cards.
 */
export const canPlace = (cards: PyramidCard[], card: StoneCard, x: number, y: number) => {
  if (cardAt(cards, x, y)) return false
  if (y === 0) return true
  const left = cardAt(cards, x, y - 1)
  const right = cardAt(cards, x + 1, y - 1)
  if (!left || !right) return false
  const a = getStoneValue(left.id)
  const b = getStoneValue(right.id)
  const value = getStoneValue(card)
  return value === a + b || value === Math.abs(a - b)
}

/** A card supports the cards above it, on its left and on its right. */
export const isSupporting = (cards: PyramidCard[], card: PyramidCard) =>
  cardAt(cards, card.x - 1, card.y + 1) !== undefined || cardAt(cards, card.x, card.y + 1) !== undefined

const level = (cards: PyramidCard[], y: number) => cards.filter((card) => card.y === y)
const values = (cards: PyramidCard[]) => cards.map((card) => getStoneValue(card.id))
const sum = (cards: PyramidCard[]) => values(cards).reduce((a, b) => a + b, 0)
const isEven = (value: number) => value % 2 === 0
const colorCount = (cards: PyramidCard[]) => new Set(cards.map((card) => getStoneColor(card.id))).size
const hasColor = (cards: PyramidCard[], color: StoneColor) => cards.some((card) => getStoneColor(card.id) === color)

/** The sum of the values of the cards of a pyramid, the tie-breaker (decision H10). */
export const pyramidValue = (cards: PyramidCard[]) => sum(cards)

/**
 * Conditions of the Common Objective cards. They only look at the pyramid, not at the hand (decision H11).
 * A condition on a level needs at least one card on that level, but not a complete level (decision H12),
 * and a condition on the whole pyramid needs at least one card (decision H13). 0 is even.
 * Imhotep's pyramid is checked the same way, level I being its base of 4 cards (decision H17).
 */
export const objectiveConditions = {
  sumOfLevel: (cards: PyramidCard[], y: number, total: number) => level(cards, y).length > 0 && sum(level(cards, y)) === total,
  onlyParity: (cards: PyramidCard[], y: number, even: boolean) =>
    level(cards, y).length > 0 && values(level(cards, y)).every((value) => isEven(value) === even),
  moreOddThanEven: (cards: PyramidCard[]) => values(cards).filter((value) => !isEven(value)).length > values(cards).filter(isEven).length,
  asManyEvenAsOdd: (cards: PyramidCard[]) => cards.length > 0 && values(cards).filter(isEven).length * 2 === cards.length,
  colors: (cards: PyramidCard[]) => colorCount(cards),
  oneColorOnLevel: (cards: PyramidCard[], y: number) => level(cards, y).length > 0 && colorCount(level(cards, y)) === 1,
  colorsOnLevels: (cards: PyramidCard[], levelI: StoneColor, levelII: StoneColor) => hasColor(level(cards, 0), levelI) && hasColor(level(cards, 1), levelII),
  countOfColor: (cards: PyramidCard[], color: StoneColor) => cards.filter((card) => getStoneColor(card.id) === color).length,
  sameValue: (cards: PyramidCard[]) => new Set(values(cards)).size < cards.length
}
