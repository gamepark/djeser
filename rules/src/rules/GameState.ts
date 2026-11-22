import { MaterialGame, MaterialItem, MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import { CommonObjective, isCommonObjectiveMet } from '../material/CommonObjective'
import { CurseType } from '../material/CurseType'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { nileCards } from '../material/NileCard'
import { IMHOTEP_PYRAMID_LEVELS, PYRAMID_LEVELS, PyramidCard, pyramidSlots, pyramidValue } from '../material/Pyramid'
import { getStoneColor, getStoneValue, StoneCard } from '../material/StoneCard'
import { RuleId } from './RuleId'

/** Number of Stone cards on the Nile at the start of a turn. */
export const NILE_SIZE = 6
/** "Each Common Objective card whose condition is met adds 3 Prestige points." */
const OBJECTIVE_POINTS = 3

type Game = MaterialGame<number, MaterialType, LocationType, RuleId>

const toPyramidCard = (item: MaterialItem<number, LocationType>): PyramidCard => ({ id: item.id, x: item.location.x!, y: item.location.y! })

/** What the rules need to know about the state of the game: curses, pyramids, the Nile and the quarry, the scores. */
export class GameState extends MaterialRulesPart<number, MaterialType, LocationType, RuleId> {
  constructor(game: Game) {
    super(game)
  }

  get stones() {
    return this.material(MaterialType.StoneCard)
  }

  get quarry() {
    return this.stones.location(LocationType.Quarry)
  }

  get nile() {
    return this.stones.location(LocationType.Nile)
  }

  /** The Stone card on the Nile closest to the cursed discards. */
  get closestNileStone() {
    return this.nile.minBy((item) => item.location.x!)
  }

  /** The cost to collect the Stone card at this position of the Nile, written on the Nile card above it. */
  nileCost(x: number) {
    return nileCards[x]
  }

  /** The quarry is under the 7th Nile card: drawing from it costs 3 action points (decision H1). */
  get quarryCost() {
    return nileCards[nileCards.length - 1]
  }

  // ------------------------------------------------------------------ curses

  /** The visible card of a cursed discard pile: the top one. */
  cursedCard(curse: CurseType): StoneCard | undefined {
    return this.stones.location(LocationType.CursedDiscard).locationId(curse).maxBy((item) => item.location.x!).getItem()?.id
  }

  /** "No Stone card of the same value (cursed discard of the values) or of the same color (of the colors) can be placed or collected from the Nile." */
  isCursed(card: StoneCard) {
    const value = this.cursedCard(CurseType.Value)
    const color = this.cursedCard(CurseType.Color)
    return (value !== undefined && getStoneValue(value) === getStoneValue(card)) || (color !== undefined && getStoneColor(color) === getStoneColor(card))
  }

  // ------------------------------------------------------------------ pyramids and hands

  hand(player: number) {
    return this.stones.location(LocationType.PlayerHand).player(player)
  }

  pyramid(player: number) {
    return this.stones.location(LocationType.Pyramid).player(player)
  }

  pyramidCards(player: number) {
    return this.pyramid(player).getItems().map(toPyramidCard)
  }

  get imhotepPyramid() {
    return this.stones.location(LocationType.ImhotepPyramid)
  }

  get imhotepPyramidCards() {
    return this.imhotepPyramid.getItems().map(toPyramidCard)
  }

  /** "Imhotep's pyramid is built level by level", left to right (decision H14). */
  get nextImhotepSlot() {
    return pyramidSlots(IMHOTEP_PYRAMID_LEVELS)[this.imhotepPyramid.length]
  }

  /** A player's pyramid is complete once a card is placed at level III: it rests on all the other cards. */
  isPyramidComplete(player: number) {
    return this.pyramidCards(player).some((card) => card.y === PYRAMID_LEVELS - 1)
  }

  // ------------------------------------------------------------------ quarry

  /**
   * "When there are no more Stone cards in the quarry, remove all the cards from the cursed discard piles except the top card of
   * each pile, which remains active. Shuffle them and form a new quarry, face down." Done as soon as the quarry is empty
   * (decision of the publisher, 18/11/2026, instead of H8). The shuffle follows the move (see `QuarryRefill`).
   */
  refillQuarryIfEmpty(): MaterialMove<number, MaterialType, LocationType, RuleId>[] {
    return this.quarry.length > 0 ? [] : this.reclaimDiscards()
  }

  /** Every card of the cursed discard piles but their top card goes back to the quarry: nothing if there is none. */
  reclaimDiscards(): MaterialMove<number, MaterialType, LocationType, RuleId>[] {
    const discards = this.stones.location(LocationType.CursedDiscard)
    const tops = [CurseType.Value, CurseType.Color].map((curse) => discards.locationId(curse).maxBy((item) => item.location.x!).getIndex())
    const reclaimed = discards.index((index) => !tops.includes(index))
    if (reclaimed.length === 0) return []
    return [reclaimed.moveItemsAtOnce({ type: LocationType.Quarry })]
  }

  shuffleQuarry() {
    return this.quarry.shuffle()
  }

  // ------------------------------------------------------------------ scores

  get objectives(): CommonObjective[] {
    return this.material(MaterialType.CommonObjectiveCard).getItems<CommonObjective>().map((item) => item.id)
  }

  objectivesMet(cards: PyramidCard[]) {
    return this.objectives.filter((objective) => isCommonObjectiveMet(objective, cards))
  }

  /**
   * "Each Stone card placed in the pyramid earns 1 Prestige point. Add the value of the Stone card at level III.
   * Subtract the total value of the Stone cards still in hand. Each Common Objective card met adds 3 Prestige points."
   */
  playerScore(player: number) {
    const { pyramid, top, objectives, hand } = this.playerScoreDetail(player)
    return pyramid + top + objectives - hand
  }

  /** The points of a player, as the rulebook adds them up: the end of game table shows them line by line. */
  playerScoreDetail(player: number) {
    const cards = this.pyramidCards(player)
    const top = cards.find((card) => card.y === PYRAMID_LEVELS - 1)
    return {
      pyramid: cards.length,
      top: top ? getStoneValue(top.id) : 0,
      objectives: OBJECTIVE_POINTS * this.objectivesMet(cards).length,
      hand: this.hand(player)
        .getItems<StoneCard>()
        .reduce((total, item) => total + getStoneValue(item.id), 0)
    }
  }

  /** "Imhotep earns 1 point for each card placed in his pyramid, plus the value of the Stone card at level IV, then the Common Objective cards met." */
  get imhotepScore() {
    const { pyramid, top, objectives } = this.imhotepScoreDetail
    return pyramid + top + objectives
  }

  /** The points of Imhotep, as the rulebook adds them up: the end of game table shows them line by line. */
  get imhotepScoreDetail() {
    const cards = this.imhotepPyramidCards
    const top = cards.find((card) => card.y === IMHOTEP_PYRAMID_LEVELS - 1)
    return {
      pyramid: cards.length,
      top: top ? getStoneValue(top.id) : 0,
      objectives: OBJECTIVE_POINTS * this.objectivesMet(cards).length
    }
  }

  /**
   * Solo: "If you choose a difficulty mode, you must complete all the Common Objective cards; otherwise, you lose."
   * Then you must beat Imhotep. "In case of a tie, add the total value of the cards in each pyramid": a remaining tie is shared (decision H10).
   */
  isSoloWon(player: number) {
    const cards = this.pyramidCards(player)
    if (this.objectivesMet(cards).length < this.objectives.length) return false
    const score = this.playerScore(player)
    const imhotep = this.imhotepScore
    if (score !== imhotep) return score > imhotep
    return pyramidValue(cards) >= pyramidValue(this.imhotepPyramidCards)
  }
}
