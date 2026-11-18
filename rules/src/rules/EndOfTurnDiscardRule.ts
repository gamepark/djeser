import { ItemMove, PlayerTurnRule } from '@gamepark/rules-api'
import { CurseType } from '../material/CurseType'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { GameState } from './GameState'
import { RuleId } from './RuleId'

/**
 * "If the active player has not collected any visible Stone card from the Nile, they must discard the Stone card closest to the
 * cursed discard piles, either in the cursed discard pile of values or in the cursed discard pile of colors (at the active player's choice)."
 * This applies even if the player drew from the quarry (decision H6).
 */
export class EndOfTurnDiscardRule extends PlayerTurnRule<number, MaterialType, LocationType, RuleId> {
  getPlayerMoves() {
    const closest = new GameState(this.game).closestNileStone
    return [CurseType.Value, CurseType.Color].map((curse) => closest.moveItem({ type: LocationType.CursedDiscard, id: curse }))
  }

  afterItemMove(_move: ItemMove<number, MaterialType, LocationType>) {
    return [this.startRule(RuleId.EndOfTurn)]
  }
}
