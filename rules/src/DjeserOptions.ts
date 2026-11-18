import { getEnumValues, OptionsSpecV2 } from '@gamepark/rules-api'
import { SoloDifficulty } from './SoloDifficulty'

/**
 * This is the type of object that the game receives when a new game is started.
 * An option is absent when it is not offered at that player count.
 */
export type DjeserOptions = {
  players: number
  /** 2 to 4 players: play with one Common Objective card of each type (the rulebook plays without them for a first game). */
  commonObjectives?: boolean
  /** Solo: the number of Common Objective cards the player must complete. */
  soloDifficulty?: SoloDifficulty
}

/**
 * The structure of everything a host can choose before the game starts — and nothing else.
 * Texts live in `app/public/options/<locale>.json`.
 * No player identities: the players are only numbered (decision of the publisher, 18/11/2026).
 * The options are those of the former BGA adaptation, except the empty cursed discard piles of a first game:
 * they always start with a Stone card (decisions of the publisher, 18/11/2026).
 */
export const DjeserOptionsSpecV2: OptionsSpecV2 = {
  specVersion: 2,
  players: { min: 1, max: 4 },
  options: {
    commonObjectives: { kind: 'boolean', playerCount: { min: 2 } },
    soloDifficulty: { kind: 'enum', values: getEnumValues(SoloDifficulty), playerCount: { max: 1 } }
  }
}
