import { applyAutomaticMoves, MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { DjeserOptions } from '../../DjeserOptions'
import { DjeserRules } from '../../DjeserRules'
import { DjeserSetup } from '../../DjeserSetup'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { RuleId } from '../../rules/RuleId'
import { BotSettings, chooseMoves, defaultBotSettings } from '../DjeserAI'

type Game = MaterialGame<number, MaterialType, LocationType, RuleId>
type Move = MaterialMove<number, MaterialType, LocationType, RuleId>

/** A contender of the arena: given the game and its player, the moves it plays now. */
export type Contender = { name: string; play: (game: Game, player: number, random: () => number) => Move[] }

export const bot = (name = 'bot', settings: Partial<BotSettings> = {}): Contender => ({
  name,
  play: (game, player) => chooseMoves(game, player, { ...defaultBotSettings, ...settings })
})

export const greedy: Contender = bot('greedy', { search: 'greedy' })

export const random: Contender = {
  name: 'random',
  play: (game, player, rand) => {
    const legal = new DjeserRules(game).getLegalMoves(player)
    return [legal[Math.floor(rand() * legal.length)]]
  }
}

/** A seeded random number generator, so that each deal can be replayed. */
export const seeded = (seed: number) => {
  let state = seed * 2654435761 + 1
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648
    return state / 2147483648
  }
}

/** Runs `action` with `Math.random` replaced by a seeded generator: the setup deals the same cards for the same seed. */
export const withSeed = <T>(seed: number, action: () => T): T => {
  const original = Math.random
  Math.random = seeded(seed)
  try {
    return action()
  } finally {
    Math.random = original
  }
}

const MAX_TURNS = 400

/** Plays one game: seats[i] plays the i-th player. Returns the final scores, by seat. */
export const playGame = (options: DjeserOptions, seats: Contender[], seed: number): number[] => {
  const game: Game = withSeed(seed, () => new DjeserSetup().setup(options))
  const rand = seeded(seed + 1000)
  for (let turn = 0; game.rule?.id !== undefined && turn < MAX_TURNS * 4; turn++) {
    const rules = new DjeserRules(game)
    const player = rules.getActivePlayer()!
    const contender = seats[game.players.indexOf(player)]
    for (const move of withSeed(seed + turn, () => contender.play(JSON.parse(JSON.stringify(game)), player, rand))) {
      if (game.rule?.player !== player) break
      withSeed(seed * 7 + turn, () => applyAutomaticMoves(new DjeserRules(game), [move]))
    }
  }
  if (game.rule?.id !== undefined) throw new Error(`Game ${seed} did not end`)
  const rules = new DjeserRules(game)
  return game.players.map((player) => rules.getScore(player))
}

export type Duel = { a: string; b: string; games: number; winsA: number; winsB: number; meanGap: number; interval: number }

/**
 * Paired games between 2 contenders at `players` players: each deal is played once with A in every even seat, once in every odd seat.
 * The gap is the mean score of A minus the mean score of B, with its 95 % interval.
 */
export const duel = (a: Contender, b: Contender, players: number, deals: number, options: Partial<DjeserOptions> = {}): Duel => {
  const gaps: number[] = []
  let winsA = 0
  let winsB = 0
  for (let deal = 0; deal < deals; deal++) {
    for (const aFirst of [true, false]) {
      const seats = Array.from({ length: players }, (_, i) => ((i % 2 === 0) === aFirst ? a : b))
      const scores = playGame({ players, ...options }, seats, deal + 1)
      const mean = (c: Contender) => {
        const own = scores.filter((_, i) => seats[i] === c)
        return own.reduce((x, y) => x + y, 0) / own.length
      }
      gaps.push(mean(a) - mean(b))
      const best = Math.max(...scores)
      const winners = new Set(seats.filter((_, i) => scores[i] === best))
      if (winners.size === 1) {
        if (winners.has(a)) winsA++
        else winsB++
      }
    }
  }
  const meanGap = gaps.reduce((x, y) => x + y, 0) / gaps.length
  const variance = gaps.reduce((x, y) => x + (y - meanGap) ** 2, 0) / Math.max(1, gaps.length - 1)
  return { a: a.name, b: b.name, games: gaps.length, winsA, winsB, meanGap, interval: 1.96 * Math.sqrt(variance / gaps.length) }
}

/** Solo: the mean score (0 when lost) and the share of games won, for a difficulty. */
export const soloRun = (contender: Contender, deals: number, options: Partial<DjeserOptions> = {}) => {
  const scores = Array.from({ length: deals }, (_, deal) => playGame({ players: 1, ...options }, [contender], deal + 1)[0])
  return { name: contender.name, games: deals, won: scores.filter((score) => score > 0).length, mean: scores.reduce((x, y) => x + y, 0) / deals }
}
