import { LocationType } from '@gamepark/djeser/material/LocationType'
import { MaterialType } from '@gamepark/djeser/material/MaterialType'
import { isQuarryRefill } from '@gamepark/djeser/rules/QuarryRefill'
import { RuleId } from '@gamepark/djeser/rules/RuleId'
import { LogDescription, MoveComponentContext, MovePlayedLogDescription } from '@gamepark/react-game'
import { isMoveItemType, MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { CollectLog, DiscardLog, DrawLog, ImhotepLog, NileDiscardLog, PlaceLog, QuarryRefillLog } from './StoneLogs'

type Game = MaterialGame<number, MaterialType, LocationType, RuleId>
type Move = MaterialMove<number, MaterialType, LocationType, RuleId>
type Context = MoveComponentContext<Move, number, Game>

/**
 * What the journal writes down, move by move: every action of a player, with the Stone card and its cost in action points, the
 * card discarded from the Nile at the end of a turn, the card Imhotep takes in solo and the quarry formed again from the discards.
 * Each entry is read off the move and off the state it was played on: the Nile sliding and filling again says nothing, the next
 * turn shows it.
 */
export class DjeserHistory implements LogDescription<Move, number, Game> {
  getMovePlayedLogDescription(move: Move, context: Context): MovePlayedLogDescription | undefined {
    const game = context.game
    const player = game.rule?.player
    if (!isMoveItemType(MaterialType.StoneCard)(move)) return undefined
    if (isQuarryRefill(move)) return { Component: QuarryRefillLog }
    const from = game.items[MaterialType.StoneCard]?.[move.itemIndex]?.location.type
    switch (game.rule?.id) {
      case RuleId.PlayerTurn:
        switch (move.location.type) {
          case LocationType.PlayerHand:
            return { Component: from === LocationType.Quarry ? DrawLog : CollectLog, player }
          case LocationType.Pyramid:
            return { Component: PlaceLog, player }
          case LocationType.CursedDiscard:
            return { Component: DiscardLog, player }
        }
        return undefined
      case RuleId.EndOfTurnDiscard:
        return { Component: NileDiscardLog, player }
      case RuleId.EndOfTurn:
        return move.location.type === LocationType.ImhotepPyramid ? { Component: ImhotepLog } : undefined
    }
    return undefined
  }
}
