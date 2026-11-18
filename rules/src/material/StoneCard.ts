import { getEnumValues } from '@gamepark/rules-api'

/** The 5 colors of the Stone cards, with their symbol. */
export enum StoneColor {
  Blue = 1, // Ankh
  Yellow, // Eye of Horus
  Purple, // Cup
  Red, // Cat
  Green // Scarab
}

export const stoneColors = getEnumValues(StoneColor)

/** A Stone card id holds its color and its value: 10 × color + value (47 is the red 7). */
export type StoneCard = number

export const stoneCard = (color: StoneColor, value: number): StoneCard => color * 10 + value
export const getStoneColor = (card: StoneCard): StoneColor => Math.floor(card / 10)
export const getStoneValue = (card: StoneCard): number => card % 10

/** One card per color and value: 5 colors × values 0 to 9. */
export const stoneCards: StoneCard[] = stoneColors.flatMap((color) => Array.from({ length: 10 }, (_, value) => stoneCard(color, value)))
