import { isMoveItemTypeAtOnce, isMoveItemType, ItemMove, MaterialMove } from '@gamepark/rules-api'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { GameState } from './GameState'
import { RuleId } from './RuleId'

/** The reclaimed Stone cards have just formed the new quarry. */
export const isQuarryRefill = (move: ItemMove<number, MaterialType, LocationType>) =>
  isMoveItemTypeAtOnce(MaterialType.StoneCard)(move) && move.location.type === LocationType.Quarry

/** When the last card leaves the quarry, the cursed discards form a new quarry, which is then shuffled. */
export const afterQuarryMove = (state: GameState, move: ItemMove<number, MaterialType, LocationType>): MaterialMove<number, MaterialType, LocationType, RuleId>[] => {
  if (isQuarryRefill(move)) return [state.shuffleQuarry()]
  if (isMoveItemType(MaterialType.StoneCard)(move)) return state.refillQuarryIfEmpty()
  return []
}
