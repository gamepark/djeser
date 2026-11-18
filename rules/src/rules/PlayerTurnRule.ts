import { CustomMove, isMoveItemType, ItemMove, Location, MaterialItem, MaterialMove, PlayerTurnRule as BasePlayerTurnRule } from '@gamepark/rules-api'
import { CurseType } from '../material/CurseType'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { HAND_LIMIT } from '../material/PlayerHand'
import { StoneCard } from '../material/StoneCard'
import { canPlace, isSupporting, PYRAMID_LEVELS, pyramidSlots } from '../material/Pyramid'
import { CustomMoveType } from './CustomMoveType'
import { GameState, NILE_SIZE } from './GameState'
import { Memory } from './Memory'
import { RuleId } from './RuleId'
import { afterQuarryMove } from './QuarryRefill'

/** "The active player has 3 action points (AP) that they can spend all or part of." */
export const ACTION_POINTS = 3

type Move = MaterialMove<number, MaterialType, LocationType, RuleId>
type Item = MaterialItem<number, LocationType>

/**
 * The 3 actions, each of them a move of a Stone card:
 * - collect a Stone card from the Nile (1, 2 or 3 AP) or from the quarry (3 AP, decision H1) into the hand, up to 4 cards;
 * - place a Stone card of the hand in the pyramid (1 AP at level I, 2 at level II, 3 at level III);
 * - discard a Stone card of the hand (1 AP) or of the pyramid that supports no card (2 AP at level I, 3 at level II, never at level III,
 *   decision H2) in the cursed discard pile of their choice.
 * A cursed card can be neither collected from the Nile nor placed. A card already placed that becomes cursed stays (decision H7).
 * The turn ends when the player decides so, after spending at least 1 AP, or at once if no action is possible (decision H4).
 */
export class PlayerTurnRule extends BasePlayerTurnRule<number, MaterialType, LocationType, RuleId> {
  get table() {
    return new GameState(this.game)
  }

  get spent(): number {
    return this.remind(Memory.ActionPointsSpent) ?? 0
  }

  get actionPoints() {
    return ACTION_POINTS - this.spent
  }

  getPlayerMoves(): Move[] {
    const moves = [...this.collectMoves, ...this.placeMoves, ...this.discardMoves]
    if (this.spent > 0 || moves.length === 0) {
      moves.push(this.customMove(CustomMoveType.EndTurn))
    }
    return moves
  }

  get collectMoves(): Move[] {
    const state = this.table
    if (state.hand(this.player).length >= HAND_LIMIT) return []
    const hand = { type: LocationType.PlayerHand, player: this.player }
    const moves: Move[] = state.nile
      .filter<StoneCard>((item) => state.nileCost(item.location.x!) <= this.actionPoints && !state.isCursed(item.id))
      .moveItems(hand)
    // A card drawn face down from the quarry can be kept even if it is cursed
    if (state.quarryCost <= this.actionPoints && state.quarry.length > 0) {
      moves.push(state.quarry.maxBy((item) => item.location.x!).moveItem(hand))
    }
    return moves
  }

  get placeMoves(): Move[] {
    const state = this.table
    const cards = state.pyramidCards(this.player)
    const slots = pyramidSlots(PYRAMID_LEVELS).filter(({ y }) => y + 1 <= this.actionPoints)
    return state
      .hand(this.player)
      .filter<StoneCard>((item) => !state.isCursed(item.id))
      .getIndexes()
      .flatMap((index) => {
        const card = state.stones.index(index)
        const id = card.getItem()!.id
        return slots
          .filter(({ x, y }) => canPlace(cards, id, x, y))
          .map(({ x, y }) => card.moveItem({ type: LocationType.Pyramid, player: this.player, x, y }))
      })
  }

  get discardMoves(): Move[] {
    const state = this.table
    const cards = state.pyramidCards(this.player)
    const fromHand = this.actionPoints >= 1 ? state.hand(this.player) : state.stones.index([])
    const fromPyramid = state
      .pyramid(this.player)
      .filter<StoneCard>(
        (item) => item.location.y! < PYRAMID_LEVELS - 1 && discardCost(item) <= this.actionPoints && !isSupporting(cards, { id: item.id, x: item.location.x!, y: item.location.y! })
      )
    return [CurseType.Value, CurseType.Color].flatMap((curse) => [
      ...fromHand.moveItems({ type: LocationType.CursedDiscard, id: curse }),
      ...fromPyramid.moveItems({ type: LocationType.CursedDiscard, id: curse })
    ])
  }

  beforeItemMove(move: ItemMove<number, MaterialType, LocationType>) {
    if (isMoveItemType(MaterialType.StoneCard)(move)) {
      const item = this.material(MaterialType.StoneCard).getItem(move.itemIndex)
      const cost = actionCost(item, move.location, this.table)
      this.memorize<number>(Memory.ActionPointsSpent, (spent) => (spent ?? 0) + cost)
    }
    return []
  }

  afterItemMove(move: ItemMove<number, MaterialType, LocationType>) {
    return afterQuarryMove(this.table, move)
  }

  onCustomMove(move: CustomMove) {
    if (move.type !== CustomMoveType.EndTurn) return []
    // "If the active player has not collected any visible Stone card from the Nile, they must discard the Stone card closest to the cursed discards."
    const collectedFromNile = this.table.nile.length < NILE_SIZE
    return [collectedFromNile || this.table.nile.length === 0 ? this.startRule(RuleId.EndOfTurn) : this.startRule(RuleId.EndOfTurnDiscard)]
  }

  onRuleEnd() {
    this.forget(Memory.ActionPointsSpent)
    return []
  }
}

/** Discarding from the pyramid: 2 AP at level I, 3 AP at level II. */
const discardCost = (item: Item) => item.location.y! + 2

/** The cost of the move of a Stone card from where it is to the location, as the player's action. */
const actionCost = (item: Item, destination: Partial<Location<number, LocationType>>, state: GameState) => {
  switch (destination.type) {
    case LocationType.PlayerHand:
      return item.location.type === LocationType.Nile ? state.nileCost(item.location.x!) : state.quarryCost
    case LocationType.Pyramid:
      return destination.y! + 1
    case LocationType.CursedDiscard:
      return item.location.type === LocationType.PlayerHand ? 1 : discardCost(item)
    default:
      return 0
  }
}
