export enum LocationType {
  /** The face-down draw pile of Stone cards. */
  Quarry = 1,
  /** The 7 Nile cards, x = 0 (next to the cursed discards) to 6 (above the quarry). */
  NileCardLine,
  /** The Stone cards on the Nile, x = 0 (closest to the cursed discards) to 5. */
  Nile,
  /** The 2 cards that mark the cursed discard piles, id = CurseType. */
  CursedDiscardSpot,
  /** The Stone cards discarded in a cursed discard pile, id = CurseType, the top card has the highest x. */
  CursedDiscard,
  /** The Common Objective cards in play. */
  CommonObjectives,
  /** The first player card, in front of the first player. */
  FirstPlayerSpot,
  PlayerHand,
  /** A player's pyramid: y = level (0 for level I), x = position in the level from the left. */
  Pyramid,
  /** Imhotep's pyramid, in the solo mode: same coordinates, 4 levels. */
  ImhotepPyramid
}
