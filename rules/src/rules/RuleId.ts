export enum RuleId {
  /** The active player spends up to 3 action points to collect, place or discard Stone cards. */
  PlayerTurn = 1,
  /** The active player did not collect a Stone card from the Nile: they discard the closest one in the cursed discard pile of their choice. */
  EndOfTurnDiscard,
  /** Automatic: Imhotep takes a Stone card in solo, the Nile slides and is filled again, then the next turn or the end of the game. */
  EndOfTurn
}
