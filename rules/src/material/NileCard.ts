/** A Nile card id is the cost, in action points, to collect the Stone card next to it (the number of blocks on the boat). */
export type NileCard = 1 | 2 | 3

/** The Nile, from the cursed discards to the quarry: the quarry is under the 7th card (cost 3). */
export const nileCards: NileCard[] = [1, 2, 2, 3, 3, 3, 3]
