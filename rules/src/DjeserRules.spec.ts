import { applyAutomaticMoves, isCustomMoveType, isMoveItemType, MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { describe, expect, it } from 'vitest'
import { DjeserOptions } from './DjeserOptions'
import { DjeserRules } from './DjeserRules'
import { DjeserSetup } from './DjeserSetup'
import { CommonObjective, isCommonObjectiveMet } from './material/CommonObjective'
import { CurseType } from './material/CurseType'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { canPlace, PyramidCard } from './material/Pyramid'
import { stoneCard, StoneColor } from './material/StoneCard'
import { CustomMoveType } from './rules/CustomMoveType'
import { GameState, NILE_SIZE } from './rules/GameState'
import { RuleId } from './rules/RuleId'
import { SoloDifficulty } from './SoloDifficulty'

type Game = MaterialGame<number, MaterialType, LocationType, RuleId>
type Move = MaterialMove<number, MaterialType, LocationType, RuleId>

const { Blue, Yellow, Purple, Red, Green } = StoneColor
const card = (color: StoneColor, value: number, x: number, y: number): PyramidCard => ({ id: stoneCard(color, value), x, y })

const newGame = (options: DjeserOptions): Game => new DjeserSetup().setup(options)
const legalMoves = (game: Game) => {
  const rules = new DjeserRules(game)
  return rules.getLegalMoves(rules.getActivePlayer()!)
}
const play = (game: Game, move: Move) => applyAutomaticMoves(new DjeserRules(game), [move])
const stones = (game: Game) => new DjeserRules(game).material(MaterialType.StoneCard)
const endTurn = isCustomMoveType(CustomMoveType.EndTurn)

/** Puts the Stone card `id` at a location, whatever it was, to set up a situation. */
const put = (game: Game, id: number, location: Game['items'][number][number]['location']) => {
  game.items[MaterialType.StoneCard]!.find((item) => item.id === id)!.location = location
}

describe('Placing in a pyramid', () => {
  const base = [card(Blue, 5, 0, 0), card(Green, 3, 1, 0)]

  it('needs 2 supports whose sum or difference is the value of the card', () => {
    expect(canPlace(base, stoneCard(Red, 8), 0, 1)).toBe(true)
    expect(canPlace(base, stoneCard(Red, 2), 0, 1)).toBe(true)
    expect(canPlace(base, stoneCard(Red, 4), 0, 1)).toBe(false)
    expect(canPlace(base, stoneCard(Red, 8), 1, 1)).toBe(false)
  })

  it('accepts a difference of 0 (decision H3)', () => {
    expect(canPlace([card(Blue, 4, 1, 0), card(Green, 4, 2, 0)], stoneCard(Red, 0), 1, 1)).toBe(true)
  })

  it('can leave a space on level I', () => {
    expect(canPlace([card(Blue, 4, 0, 0)], stoneCard(Red, 0), 2, 0)).toBe(true)
  })
})

describe('Common Objective cards', () => {
  it('need at least one card on the level they look at (decision H12)', () => {
    expect(isCommonObjectiveMet(CommonObjective.OnlyEvenLevelII, [card(Blue, 2, 0, 0)])).toBe(false)
    expect(isCommonObjectiveMet(CommonObjective.OnlyEvenLevelII, [card(Blue, 2, 0, 0), card(Blue, 4, 1, 0), card(Red, 2, 0, 1)])).toBe(true)
    expect(isCommonObjectiveMet(CommonObjective.SumLevelI13, [card(Blue, 9, 0, 0), card(Red, 4, 2, 0)])).toBe(true)
  })

  it('on the whole pyramid need at least one card (decision H13)', () => {
    expect(isCommonObjectiveMet(CommonObjective.AsManyEvenAsOdd, [])).toBe(false)
    expect(isCommonObjectiveMet(CommonObjective.AtMostThreeColors, [])).toBe(false)
    expect(isCommonObjectiveMet(CommonObjective.AsManyEvenAsOdd, [card(Blue, 0, 0, 0), card(Red, 7, 1, 0)])).toBe(true)
  })

  it('check colors and values', () => {
    const pyramid = [card(Blue, 1, 0, 0), card(Yellow, 2, 1, 0), card(Purple, 3, 2, 0), card(Red, 1, 0, 1), card(Green, 5, 1, 1)]
    expect(isCommonObjectiveMet(CommonObjective.ExactlyFiveColors, pyramid)).toBe(true)
    expect(isCommonObjectiveMet(CommonObjective.BlueLevelIRedLevelII, pyramid)).toBe(true)
    expect(isCommonObjectiveMet(CommonObjective.TwoSameValue, pyramid)).toBe(true)
    expect(isCommonObjectiveMet(CommonObjective.MoreOddThanEven, pyramid)).toBe(true)
    expect(isCommonObjectiveMet(CommonObjective.TwoYellow, pyramid)).toBe(false)
  })
})

describe('A turn', () => {
  it('starts with 3 action points to collect from the Nile or the quarry, and cannot end before spending one', () => {
    const game = newGame({ players: 2 })
    const moves = legalMoves(game)
    const state = new GameState(game)
    const collectable = state.nile.getItems().filter((item) => !state.isCursed(item.id)).length
    expect(moves.length).toBe(collectable + 1)
    expect(moves.some(endTurn)).toBe(false)
  })

  it('costs the value of the Nile card next to the Stone card collected', () => {
    const game = newGame({ players: 2 })
    const first = new GameState(game).nile.getItems().find((item) => item.location.x === 3)!
    put(game, first.id, { type: LocationType.Nile, x: 3 })
    // Lift the curses so that the card can be collected
    for (const item of game.items[MaterialType.StoneCard]!.filter((item) => item.location.type === LocationType.CursedDiscard)) {
      item.location = { type: LocationType.Quarry, x: 100 + item.location.id }
    }
    const move = legalMoves(game).find((move) => isMoveItemType(MaterialType.StoneCard)(move) && stones(game).getItem(move.itemIndex).id === first.id)!
    play(game, move)
    // 3 AP spent: only the end of the turn is left
    expect(legalMoves(game).every(endTurn)).toBe(true)
  })

  it('never lets a player hold more than 4 cards', () => {
    const game = newGame({ players: 2 })
    const player = game.players[0]
    new GameState(game).quarry.limit(4).getItems().forEach((item) => (item.location = { type: LocationType.PlayerHand, player }))
    expect(legalMoves(game).some((move) => isMoveItemType(MaterialType.StoneCard)(move) && move.location.type === LocationType.PlayerHand)).toBe(false)
  })

  it('cannot collect a cursed Stone card from the Nile', () => {
    const game = newGame({ players: 2 })
    const state = new GameState(game)
    const nileCard = state.nile.getItem()!.id
    // The top of the cursed discard of the values has the value of the first Stone card of the Nile
    const curse = state.stones.location(LocationType.CursedDiscard).locationId(CurseType.Value).getItem()!
    const sameValue = state.quarry.getItems().find((item) => item.id % 10 === nileCard % 10)
    if (sameValue) {
      curse.location = { type: LocationType.Quarry, x: 200 }
      sameValue.location = { type: LocationType.CursedDiscard, id: CurseType.Value, x: 0 }
    }
    const collected = legalMoves(game)
      .filter(isMoveItemType(MaterialType.StoneCard))
      .map((move) => stones(game).getItem(move.itemIndex))
    expect(collected.some((item) => item.location.type === LocationType.Nile && item.id % 10 === nileCard % 10)).toBe(false)
  })

  it('ends with the discard of the closest Stone card of the Nile when none was collected from it (decision H6)', () => {
    const game = newGame({ players: 3 })
    const [first, second] = game.players
    play(game, legalMoves(game).find((move) => isMoveItemType(MaterialType.StoneCard)(move) && stones(game).getItem(move.itemIndex).location.type === LocationType.Quarry)!)
    play(game, legalMoves(game).find(endTurn)!)
    expect(game.rule?.id).toBe(RuleId.EndOfTurnDiscard)
    expect(game.rule?.player).toBe(first)
    const closest = new GameState(game).closestNileStone.getItem()!.id
    play(game, legalMoves(game)[0])
    const state = new GameState(game)
    expect(state.cursedCard(CurseType.Value)).toBe(closest)
    expect(state.nile.length).toBe(NILE_SIZE)
    expect(state.nile.getItems().map((item) => item.location.x).sort()).toEqual([0, 1, 2, 3, 4, 5])
    expect(game.rule).toEqual(expect.objectContaining({ id: RuleId.PlayerTurn, player: second }))
  })

  it('reshuffles the cursed discards but their top cards as soon as the quarry is empty', () => {
    const game = newGame({ players: 2 })
    const state = new GameState(game)
    const quarry = state.quarry.getItems()
    // 5 cards under the top of the cursed discard of the colors, a single card left in the quarry
    quarry.slice(0, 5).forEach((item, i) => (item.location = { type: LocationType.CursedDiscard, id: CurseType.Color, x: -5 + i }))
    quarry.slice(5, -1).forEach((item) => (item.location = { type: LocationType.Pyramid, player: 99, x: 0, y: 0 }))
    const top = state.cursedCard(CurseType.Color)
    play(game, legalMoves(game).find((move) => isMoveItemType(MaterialType.StoneCard)(move) && stones(game).getItem(move.itemIndex).location.type === LocationType.Quarry)!)
    const after = new GameState(game)
    expect(after.quarry.length).toBe(5)
    expect(after.cursedCard(CurseType.Color)).toBe(top)
    expect(after.stones.location(LocationType.CursedDiscard).length).toBe(2)
  })
})

describe('End of the game', () => {
  it('lets every player play until the first player, once a pyramid is complete', () => {
    const game = newGame({ players: 3 })
    const [first, second, third] = game.players
    const quarry = new GameState(game).quarry.getItems()
    ;[
      [0, 0],
      [1, 0],
      [2, 0],
      [0, 1],
      [1, 1],
      [0, 2]
    ].forEach(([x, y], i) => (quarry[i].location = { type: LocationType.Pyramid, player: second, x, y }))
    const turn = () => {
      play(game, legalMoves(game).find((move) => isMoveItemType(MaterialType.StoneCard)(move) && move.location.type === LocationType.PlayerHand)!)
      play(game, legalMoves(game).find(endTurn)!)
      while (game.rule?.id === RuleId.EndOfTurnDiscard) play(game, legalMoves(game)[0])
    }
    expect(game.rule?.player).toBe(first)
    turn()
    expect(game.rule?.player).toBe(second)
    turn()
    expect(game.rule?.player).toBe(third)
    turn()
    expect(game.rule).toBeUndefined()
  })

  it('scores the cards, the top card, the objectives and the hand', () => {
    const game = newGame({ players: 2, commonObjectives: false })
    const [player] = game.players
    const quarry = new GameState(game).quarry.getItems()
    quarry[0].location = { type: LocationType.Pyramid, player, x: 0, y: 0 }
    quarry[1].location = { type: LocationType.Pyramid, player, x: 1, y: 0 }
    quarry[2].location = { type: LocationType.Pyramid, player, x: 0, y: 1 }
    quarry[3].location = { type: LocationType.PlayerHand, player }
    expect(new GameState(game).playerScore(player)).toBe(3 - (quarry[3].id % 10))
    quarry[4].location = { type: LocationType.Pyramid, player, x: 0, y: 2 }
    expect(new GameState(game).playerScore(player)).toBe(4 + (quarry[4].id % 10) - (quarry[3].id % 10))
  })
})

const MAX_MOVES = 5000

/** Plays a game with random legal moves, favouring placing, then collecting, so that games end. */
const playRandomGame = (options: DjeserOptions, seed: number): Game => {
  const game = newGame(options)
  let random = seed + 1
  const pick = <T,>(list: T[]) => {
    random = (random * 1103515245 + 12345) % 2147483648
    return list[random % list.length]
  }
  let moves = 0
  while (game.rule?.id !== undefined && moves < MAX_MOVES) {
    const legal = legalMoves(game)
    expect(legal, `no legal move on rule ${game.rule.id}`).not.toHaveLength(0)
    const stoneMoves = legal.filter(isMoveItemType(MaterialType.StoneCard))
    const place = stoneMoves.filter((move) => move.location.type === LocationType.Pyramid)
    const collect = stoneMoves.filter((move) => move.location.type === LocationType.PlayerHand)
    const discardFromHand = stoneMoves.filter(
      (move) => move.location.type === LocationType.CursedDiscard && stones(game).getItem(move.itemIndex).location.type !== LocationType.Pyramid
    )
    const end = legal.filter(endTurn)
    const choice = [place, collect, discardFromHand.length && pick([0, 0, 1]) ? discardFromHand : [], end, legal].find((list) => list.length > 0)!
    play(game, pick(choice))
    moves++
    check(game)
  }
  expect(game.rule?.id, 'the game must end').toBeUndefined()
  return game
}

/** What must hold between any two moves of any game. */
const check = (game: Game) => {
  const state = new GameState(game)
  expect(state.stones.length).toBe(50)
  for (const player of game.players) expect(state.hand(player).length).toBeLessThanOrEqual(4)
  if (game.rule?.id === RuleId.PlayerTurn && game.memory[1] === undefined) expect(state.nile.length).toBe(NILE_SIZE)
}

describe('Random full games', () => {
  it.each([1, 2, 3, 4])('end with %i players', (players) => {
    for (let seed = 0; seed < 5; seed++) {
      const game = playRandomGame({ players, soloDifficulty: SoloDifficulty.VeryHard }, seed)
      const rules = new DjeserRules(game)
      for (const player of game.players) expect(Number.isFinite(rules.getScore(player))).toBe(true)
    }
  })
})

describe('Hidden information', () => {
  it.each([2, 3])('gives each of %i players a view that the moves they receive keep up to date', (players) => {
    const game = newGame({ players })
    const views = Object.fromEntries(game.players.map((player) => [player, new DjeserRules(game).getPlayerView(player)]))
    let random = 7
    for (let moves = 0; game.rule?.id !== undefined && moves < 300; moves++) {
      const legal = legalMoves(game)
      random = (random * 1103515245 + 12345) % 2147483648
      const preferred = legal.filter((move) => isMoveItemType(MaterialType.StoneCard)(move) && move.location.type !== LocationType.CursedDiscard)
      const move = (preferred.length && random % 3 ? preferred : legal)[random % (preferred.length && random % 3 ? preferred.length : legal.length)]
      const rules = new DjeserRules(game)
      applyAutomaticMoves(rules, [move], (played) => {
        for (const player of game.players) {
          new DjeserRules(views[player], { player }).play(JSON.parse(JSON.stringify(rules.getPlayerMoveView(played, player))))
        }
      })
      for (const player of game.players) {
        expect(views[player], `view of player ${player} after move ${moves}`).toEqual(new DjeserRules(game).getPlayerView(player))
      }
    }
  })
})
