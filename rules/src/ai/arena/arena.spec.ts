import { describe, it } from 'vitest'
import { SoloDifficulty } from '../../SoloDifficulty'
import { bot, duel, greedy, random, soloRun } from './Arena'

/**
 * The arena: measures the bot on many games. Too long for the usual test run, it only runs with ARENA=1:
 *   ARENA=1 corepack yarn vitest --run src/ai/arena --reporter=verbose
 * Settings to compare can be given as JSON: ARENA_SETTINGS='{"handRisk":0.5}'
 */
const enabled = process.env.ARENA === '1'
const deals = Number(process.env.ARENA_DEALS ?? 20)
const challenger = bot('challenger', JSON.parse(process.env.ARENA_SETTINGS ?? '{}'))

describe.skipIf(!enabled)('Arena', { timeout: 3_600_000 }, () => {
  it.each([2, 3, 4])('%i players', (players) => {
    for (const opponent of [random, greedy, bot()]) {
      if (opponent.name === 'bot' && !process.env.ARENA_SETTINGS) continue
      const result = duel(challenger, opponent, players, deals)
      console.log(
        `${players}P ${result.a} vs ${result.b}: ${result.games} games, wins ${result.winsA}-${result.winsB}, gap ${result.meanGap.toFixed(2)} ±${result.interval.toFixed(2)}`
      )
    }
  })

  it.each([SoloDifficulty.Discovery, SoloDifficulty.Easy, SoloDifficulty.Hard, SoloDifficulty.VeryHard])('solo difficulty %i', (soloDifficulty) => {
    const result = soloRun(challenger, deals * 2, { soloDifficulty })
    console.log(`solo ${soloDifficulty}: won ${result.won}/${result.games}, mean score ${result.mean.toFixed(1)}`)
  })
})
