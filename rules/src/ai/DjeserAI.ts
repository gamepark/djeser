import { isCustomMoveType, isMoveItemType, MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { DjeserRules } from '../DjeserRules'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { canPlace, IMHOTEP_PYRAMID_LEVELS, PYRAMID_LEVELS, pyramidSize, pyramidSlots } from '../material/Pyramid'
import { getStoneValue, StoneCard } from '../material/StoneCard'
import { CustomMoveType } from '../rules/CustomMoveType'
import { GameState } from '../rules/GameState'
import { RuleId } from '../rules/RuleId'

type Game = MaterialGame<number, MaterialType, LocationType, RuleId>
type Move = MaterialMove<number, MaterialType, LocationType, RuleId>

/** Every behaviour of the bot is a setting, so that the arena can compare two of them on the same deals. */
export type BotSettings = {
  /** Search the whole turn (up to 3 actions), or only the best next action. */
  search: 'turn' | 'greedy'
  /** Chance that an empty slot of the pyramid is filled by the end of the game: level I, and a slot of level II or III without its supports. */
  slotChance: [number, number]
  /** Chance that a slot whose 2 supports are placed is filled: a base, plus for each Stone card still in play with a fitting value, up to a maximum. */
  fitBase: number
  fitPerCard: number
  fitMax: number
  /** Points lost for each action point spent: prefer the shortest turn among equal ones. */
  actionCost: number
  /** Chance that a card in hand that fits an empty slot is placed there. */
  handPlaced: number
  /** Share of the value of the cards in hand counted as a loss at the start of the game; it grows to 1 as the end nears. */
  handRisk: number
  /** Share of the best value reachable at level III counted before a fitting card is in hand. */
  topPotential: number
  /** Points of a Common Objective card met. In solo, all of them must be met to win. */
  objective: number
  soloObjective: number
  /** Solo: how many of the turns left before Imhotep completes his pyramid an empty slot needs to be filled. */
  soloTurnsPerSlot: number
}

export const defaultBotSettings: BotSettings = {
  search: 'turn',
  slotChance: [0.7, 0.3],
  fitBase: 0.15,
  fitPerCard: 0.08,
  fitMax: 0.9,
  actionCost: 0.02,
  handPlaced: 0.9,
  handRisk: 0.3,
  topPotential: 0.5,
  objective: 3,
  soloObjective: 8,
  soloTurnsPerSlot: 1.5
}

/** The value expected from a Stone card nobody has seen yet (drawn from the quarry during the search). */
const UNKNOWN_VALUE = 4.5

const copy = (game: Game): Game => JSON.parse(JSON.stringify(game))
const endTurn = isCustomMoveType(CustomMoveType.EndTurn)
const isQuarryDraw = (game: Game, move: Move) =>
  isMoveItemType(MaterialType.StoneCard)(move) && game.items[MaterialType.StoneCard]![move.itemIndex].location.type === LocationType.Quarry

/**
 * A forecast of the final score of the player, in Prestige points, from what they can see.
 * `unknown` are the indexes of the Stone cards in hand that the player has not seen yet (drawn from the quarry during the search).
 */
export const evaluate = (game: Game, player: number, settings: BotSettings = defaultBotSettings, unknown: number[] = []): number => {
  const state = new GameState(game)
  const cards = state.pyramidCards(player)
  const solo = game.players.length === 1
  const top = cards.find((card) => card.y === PYRAMID_LEVELS - 1)
  let score = cards.length + (top ? getStoneValue(top.id) : 0)
  const objectivePoints = solo ? settings.soloObjective : settings.objective
  const ending = game.players.some((p) => state.isPyramidComplete(p))
  score -= settings.actionCost * ((game.memory[1] as number | undefined) ?? 0)

  // The end nears as the most advanced pyramid grows: the cards left in hand will then cost their full value
  const progress =
    Math.max(...game.players.map((p) => state.pyramid(p).length), solo ? (state.imhotepPyramid.length * 6) / 10 : 0) / pyramidSize(PYRAMID_LEVELS)
  const risk = ending ? 1 : settings.handRisk + (1 - settings.handRisk) * progress

  // Cards in hand: the unknown ones (drawn from the quarry during the search), and the known ones that are not cursed
  const hand = state.hand(player).getIndexes()
  const unknownCount = hand.filter((index) => unknown.includes(index)).length
  const known = hand.filter((index) => !unknown.includes(index)).map((index) => state.stones.getItem<StoneCard>(index).id)
  score -= UNKNOWN_VALUE * risk * unknownCount
  if (ending) return score + objectivePoints * state.objectivesMet(cards).length - known.reduce((total, id) => total + getStoneValue(id), 0)

  // Each empty slot, from the base up, takes the best card of the hand that fits it now, which will be placed on the next turn.
  // Otherwise it may still be filled before the end of the game: a slot on 2 supports needs a card of a fitting value.
  const left = [...known]
  const inPlay = valuesInPlay(state)
  const planned = [...cards]
  // Solo: Imhotep places a card at the end of each turn, and the game ends when his 10 cards are placed
  const emptySlots = pyramidSize(PYRAMID_LEVELS) - cards.length
  const time = solo
    ? Math.min(1, (pyramidSize(IMHOTEP_PYRAMID_LEVELS) - state.imhotepPyramid.length) / Math.max(1, emptySlots * settings.soloTurnsPerSlot))
    : 1
  for (const { x, y } of pyramidSlots(PYRAMID_LEVELS)) {
    if (cards.some((card) => card.x === x && card.y === y)) continue
    const fits = left.filter((id) => !state.isCursed(id) && canPlace(planned, id, x, y))
    if (fits.length > 0) {
      // At level III the highest card; below, the card that costs most to keep in hand
      const id = fits.reduce((a, b) => (getStoneValue(b) > getStoneValue(a) ? b : a))
      left.splice(left.indexOf(id), 1)
      planned.push({ id, x, y })
      score += settings.handPlaced * Math.max(time, 0.5) * (1 + (y === PYRAMID_LEVELS - 1 ? getStoneValue(id) : 0))
      continue
    }
    if (y === 0) {
      score += settings.slotChance[0] * time
      continue
    }
    const l = planned.find((card) => card.x === x && card.y === y - 1)
    const r = planned.find((card) => card.x === x + 1 && card.y === y - 1)
    if (!l || !r) {
      score += settings.slotChance[1] * time
      continue
    }
    const fitting = fittingValues(getStoneValue(l.id), getStoneValue(r.id))
    const chance = Math.min(settings.fitMax, settings.fitBase + settings.fitPerCard * fitting.reduce((count, value) => count + inPlay[value], 0))
    // At level III, a card with the highest fitting value
    score += chance * time * (1 + (y === PYRAMID_LEVELS - 1 ? settings.topPotential * Math.max(...fitting) : 0))
  }
  // The cards of the hand that fit no slot cost their value at the end of the game
  score -= left.reduce((total, id) => total + getStoneValue(id), 0) * risk
  // The objectives are judged on the pyramid once the cards of the hand are placed: keeping an objective by never finishing is no plan
  score += objectivePoints * state.objectivesMet(planned).length
  return score
}

/** The values a card may have to rest on 2 supports: their sum, if it is a value, and their difference. */
const fittingValues = (a: number, b: number) => [...new Set([a + b, Math.abs(a - b)].filter((value) => value <= 9))]

/**
 * How many Stone cards of each value the player may still get: in their hand, on the Nile, or never seen (the quarry and the hands
 * of the others). The cards of the pyramids and of the cursed discards are out.
 */
const valuesInPlay = (state: GameState) => {
  const counts: number[] = Array(10).fill(5)
  const out = [LocationType.Pyramid, LocationType.ImhotepPyramid, LocationType.CursedDiscard]
  for (const item of state.stones.location(({ type }) => out.includes(type)).getItems<StoneCard>()) counts[getStoneValue(item.id)]--
  return counts
}

type Leaf = { moves: Move[]; value: number }

/**
 * The best sequence of actions for the turn of the player: every sequence is played on a copy of the rules and evaluated
 * when the player could end their turn. A draw from the quarry ends the sequence: the player then decides again, knowing the card.
 */
const searchTurn = (game: Game, player: number, settings: BotSettings): Leaf => {
  let best: Leaf = { moves: [], value: -Infinity }
  const seen = new Set<string>()
  const visit = (current: Game, moves: Move[], unknown: number[]) => {
    const key = JSON.stringify(current.items[MaterialType.StoneCard]!.map((item) => item.location)) + current.memory[1]
    if (seen.has(key)) return
    seen.add(key)
    const rules = new DjeserRules(current)
    const legal = rules.getLegalMoves(player)
    const canEnd = legal.some(endTurn)
    if (canEnd) {
      const value = evaluate(current, player, settings, unknown)
      if (value > best.value) best = { moves: [...moves, legal.find(endTurn)!], value }
    }
    if (unknown.length > 0 || (settings.search === 'greedy' && moves.length > 0)) return
    for (const move of legal) {
      if (endTurn(move)) continue
      const next = copy(current)
      const drawn = isQuarryDraw(next, move) ? [(move as { itemIndex: number }).itemIndex] : []
      new DjeserRules(next).play(move)
      visit(next, [...moves, move], drawn)
    }
  }
  visit(copy(game), [], [])
  return best
}

/** The cursed discard pile where the closest Stone card of the Nile hurts the player least. */
const chooseEndOfTurnDiscard = (game: Game, player: number, settings: BotSettings): Move => {
  const legal = new DjeserRules(game).getLegalMoves(player)
  let best: Leaf = { moves: [legal[0]], value: -Infinity }
  for (const move of legal) {
    const next = copy(game)
    new DjeserRules(next).play(move)
    const value = evaluate(next, player, settings)
    if (value > best.value) best = { moves: [move], value }
  }
  return best.moves[0]
}

/** The moves the bot plays now: its whole turn, or up to a draw from the quarry, after which it decides again. */
export const chooseMoves = (game: Game, player: number, settings: BotSettings = defaultBotSettings): Move[] => {
  if (game.rule?.id === RuleId.EndOfTurnDiscard) return [chooseEndOfTurnDiscard(game, player, settings)]
  const { moves } = searchTurn(game, player, settings)
  const draw = moves.findIndex((move) => isQuarryDraw(game, move))
  return draw === -1 ? moves : moves.slice(0, draw + 1)
}

/** The bot of the tutorial and of `game.bot()`. It reads only what its player can see. */
export const DjeserAI = (game: Game, player: number): Promise<Move[]> => Promise.resolve(chooseMoves(game, player))
