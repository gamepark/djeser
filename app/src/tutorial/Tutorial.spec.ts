import { chooseMoves } from '@gamepark/djeser/ai/DjeserAI'
import { DjeserRules } from '@gamepark/djeser/DjeserRules'
import { LocationType } from '@gamepark/djeser/material/LocationType'
import { MaterialType } from '@gamepark/djeser/material/MaterialType'
import { applyAutomaticMoves, LocalMoveType, MaterialGame, MaterialMove, MoveKind } from '@gamepark/rules-api'
import { describe, expect, it, vi } from 'vitest'
import { wrapRulesWithTutorial } from '@gamepark/react-game/dist/components/tutorial/TutorialRulesWrapper'
import { Tutorial } from './Tutorial'
import { me, opponent } from './TutorialSetup'

type Game = MaterialGame<number, MaterialType, LocationType>

// react-game needs a browser: the tutorial only needs its base class, which does not
vi.mock('@gamepark/react-game', async () => ({
  ...(await import('@gamepark/react-game/dist/components/tutorial/MaterialTutorial'))
}))

const tutorial = new Tutorial()
wrapRulesWithTutorial(tutorial, DjeserRules)

/** Plays the script: popups are closed, each move step plays its first allowed move. Then the game is finished by the bot. */
const playTutorial = () => {
  const [game] = tutorial.setupTutorial() as [Game, unknown]
  const reached: number[] = []
  for (let i = 0; i < 2000 && game.rule; i++) {
    const rules = new DjeserRules(game)
    const step = game.tutorial!.step
    if (step < tutorial.steps.length) {
      reached.push(step)
      const player = tutorial.steps[step].move?.player ?? me
      // Close a popup by going to the next step, never by the close button that only hides it
      const legal = rules.getLegalMoves(player).filter((move: MaterialMove) => !(move.kind === MoveKind.LocalMove && move.type !== LocalMoveType.SetTutorialStep))
      expect(legal, `no move for step ${step}`).not.toHaveLength(0)
      applyAutomaticMoves(rules, [legal.find((move: MaterialMove) => move.kind !== MoveKind.LocalMove) ?? legal[0]])
    } else {
      const player = rules.getActivePlayer()!
      for (const move of chooseMoves(game, player)) if (game.rule?.player === player) applyAutomaticMoves(new DjeserRules(game), [move])
    }
  }
  return { game, reached }
}

describe('Tutorial', () => {
  it('goes through every step, then the game ends', () => {
    const { game, reached } = playTutorial()
    expect(new Set(reached).size).toBe(tutorial.steps.length)
    expect(game.rule).toBeUndefined()
  })

  it('gives Laurent the red 7 from the quarry', () => {
    const [game] = tutorial.setupTutorial() as [Game, unknown]
    const quarry = game.items[MaterialType.StoneCard]!.filter((item) => item.location.type === LocationType.Quarry)
    const order = quarry.sort((a, b) => b.location.x! - a.location.x!).map((item) => item.id)
    expect(order[1]).toBe(47)
    expect(game.players).toEqual([me, opponent])
  })
})
