import { isShuffleItemType, ItemMove, MaterialMove, PlayerTurnRule } from '@gamepark/rules-api'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { IMHOTEP_PYRAMID_LEVELS, pyramidSize } from '../material/Pyramid'
import { GameState, NILE_SIZE } from './GameState'
import { isQuarryRefill } from './QuarryRefill'
import { RuleId } from './RuleId'

type Move = MaterialMove<number, MaterialType, LocationType, RuleId>

/**
 * The end of a turn, without any decision:
 * 1. Solo: Imhotep takes the Stone card of the Nile closest to the cursed discards (after the end of turn discard, decision H15)
 *    and places it in his pyramid, level by level, left to right, ignoring the curses and the values (decision H14).
 * 2. "All Stone cards in the Nile slip toward the position closest to the cursed discard piles. The now-empty spaces are filled by
 *    drawing new cards from the quarry." When the quarry runs out, the cursed discards form a new quarry, shuffled, and the
 *    dealing goes on after the shuffle.
 * 3. The next turn, or the end of the game.
 */
export class EndOfTurnRule extends PlayerTurnRule<number, MaterialType, LocationType, RuleId> {
  get table() {
    return new GameState(this.game)
  }

  onRuleStart(): Move[] {
    const state = this.table
    const moves: Move[] = []
    let nile = state.nile
    if (this.game.players.length === 1) {
      const closest = state.closestNileStone
      moves.push(closest.moveItem({ type: LocationType.ImhotepPyramid, ...state.nextImhotepSlot }))
      nile = nile.index((index) => index !== closest.getIndex())
    }
    nile
      .sort((item) => item.location.x!)
      .getIndexes()
      .forEach((index, x) => {
        if (state.stones.getItem(index).location.x !== x) {
          moves.push(state.stones.index(index).moveItem({ type: LocationType.Nile, x }))
        }
      })
    const missing = NILE_SIZE - nile.length
    const available = state.quarry.length
    moves.push(...state.quarry.deck().deal({ type: LocationType.Nile }, Math.min(missing, available)))
    // The moves are computed before they are played: Imhotep's card is not in his pyramid yet
    const imhotepCards = state.imhotepPyramid.length + (this.game.players.length === 1 ? 1 : 0)
    if (missing < available) {
      moves.push(this.nextTurn(imhotepCards))
    } else {
      const reclaim = state.reclaimDiscards()
      moves.push(...(reclaim.length > 0 ? reclaim : [this.nextTurn(imhotepCards)]))
    }
    return moves
  }

  afterItemMove(move: ItemMove<number, MaterialType, LocationType>): Move[] {
    const state = this.table
    if (isQuarryRefill(move)) return [state.shuffleQuarry()]
    if (isShuffleItemType(MaterialType.StoneCard)(move)) {
      const missing = NILE_SIZE - state.nile.length
      return [...state.quarry.deck().deal({ type: LocationType.Nile }, Math.min(missing, state.quarry.length)), this.nextTurn(state.imhotepPyramid.length)]
    }
    return []
  }

  /**
   * "When a player places a Stone card at level III of their pyramid, they trigger the end of the game. Each player will take one more
   * turn until it returns to the first player (the first player does not take a final turn)."
   * Solo: the game ends at the end of the turn in which either pyramid is completed (decision H16).
   */
  nextTurn(imhotepCards: number): Move {
    const state = this.table
    if (this.game.players.length === 1) {
      return state.isPyramidComplete(this.player) || imhotepCards === pyramidSize(IMHOTEP_PYRAMID_LEVELS) ? this.endGame() : this.startPlayerTurn(RuleId.PlayerTurn, this.player)
    }
    const next = this.nextPlayer
    const triggered = this.game.players.some((player) => state.isPyramidComplete(player))
    return triggered && next === this.game.players[0] ? this.endGame() : this.startPlayerTurn(RuleId.PlayerTurn, next)
  }
}
