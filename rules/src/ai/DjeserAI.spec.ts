import { describe, expect, it } from 'vitest'
import { DjeserRules } from '../DjeserRules'
import { DjeserSetup } from '../DjeserSetup'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { SoloDifficulty } from '../SoloDifficulty'
import { bot, duel, greedy, playGame, random, soloRun, withSeed } from './arena/Arena'
import { chooseMoves } from './DjeserAI'

describe('Bot', { timeout: 120_000 }, () => {
  it.each([1, 2, 3, 4])('plays whole games with %i players', (players) => {
    const scores = playGame({ players, soloDifficulty: SoloDifficulty.Easy }, Array(players).fill(bot()), 1)
    expect(scores).toHaveLength(players)
  })

  it('decides a turn in less than a second at 4 players', () => {
    const game = withSeed(3, () => new DjeserSetup().setup({ players: 4 }))
    const start = performance.now()
    chooseMoves(game, game.players[0])
    expect(performance.now() - start).toBeLessThan(1000)
  })

  it('never reads the quarry nor the hands of the other players', () => {
    const game = withSeed(5, () => new DjeserSetup().setup({ players: 3 }))
    const [me, other] = game.players
    const quarry = game.items[MaterialType.StoneCard]!.filter((item) => item.location.type === LocationType.Quarry)
    // Give the other player 2 hidden cards, then shuffle the hidden cards among themselves
    quarry.slice(0, 2).forEach((item) => (item.location = { type: LocationType.PlayerHand, player: other }))
    const decision = JSON.stringify(chooseMoves(game, me))
    const hidden = game.items[MaterialType.StoneCard]!.filter(
      (item) => item.location.type === LocationType.Quarry || (item.location.type === LocationType.PlayerHand && item.location.player === other)
    )
    const ids = hidden.map((item) => item.id).reverse()
    hidden.forEach((item, i) => (item.id = ids[i]))
    expect(JSON.stringify(chooseMoves(game, me))).toBe(decision)
    expect(new DjeserRules(game).getLegalMoves(me).length).toBeGreaterThan(0)
  })

  it('beats random play', () => {
    const result = duel(bot(), random, 2, 4)
    expect(result.meanGap - result.interval).toBeGreaterThan(0)
  })

  it('beats a one-action-ahead bot', () => {
    const result = duel(bot(), greedy, 2, 4)
    expect(result.meanGap).toBeGreaterThan(0)
  })

  // Imhotep often scores 15 to 22: the bot wins about half of the Discovery games, rarely with objectives (arena, 18/11/2026)
  it('wins some solo games in Discovery', () => {
    expect(soloRun(bot(), 6, { soloDifficulty: SoloDifficulty.Discovery }).won).toBeGreaterThan(0)
  })
})
