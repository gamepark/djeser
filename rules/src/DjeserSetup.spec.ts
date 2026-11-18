import { describe, expect, it } from 'vitest'
import { DjeserOptions } from './DjeserOptions'
import { DjeserRules } from './DjeserRules'
import { DjeserSetup, NILE_SIZE } from './DjeserSetup'
import { getCommonObjectiveType } from './material/CommonObjective'
import { CurseType } from './material/CurseType'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { stoneCards } from './material/StoneCard'
import { SoloDifficulty } from './SoloDifficulty'

const setup = (options: DjeserOptions) => new DjeserRules(new DjeserSetup().setup(options))

describe('Setup', () => {
  it('has 50 different Stone cards', () => {
    expect(new Set(stoneCards).size).toBe(50)
  })

  it.each([1, 2, 3, 4])('lays the Nile, 6 Stone cards next to it and the quarry, with %i players', (players) => {
    const rules = setup({ players })
    expect(rules.material(MaterialType.NileCard).getItems().map((card) => card.id)).toEqual([1, 2, 2, 3, 3, 3, 3])
    expect(
      rules
        .material(MaterialType.StoneCard)
        .location(LocationType.Nile)
        .getItems()
        .map((card) => card.location.x)
        .sort()
    ).toEqual([0, 1, 2, 3, 4, 5])
    expect(rules.material(MaterialType.StoneCard).location(LocationType.Quarry).length).toBe(50 - NILE_SIZE - 2)
    expect(rules.material(MaterialType.StoneCard).location(LocationType.PlayerHand).length).toBe(0)
  })

  it.each([1, 2, 3, 4])('places a Stone card in each cursed discard pile, with %i players', (players) => {
    const rules = setup({ players })
    for (const curse of [CurseType.Value, CurseType.Color]) {
      expect(rules.material(MaterialType.CursedDiscardCard).location(LocationType.CursedDiscardSpot).id(curse).length).toBe(1)
      expect(rules.material(MaterialType.StoneCard).location(LocationType.CursedDiscard).locationId(curse).length).toBe(1)
    }
  })

  it('draws one Common Objective card of each type, unless the option plays without them', () => {
    const rules = setup({ players: 2, commonObjectives: true })
    const types = rules.material(MaterialType.CommonObjectiveCard).getItems().map((card) => getCommonObjectiveType(card.id))
    expect(types).toEqual([1, 2, 3])
    expect(setup({ players: 2, commonObjectives: false }).material(MaterialType.CommonObjectiveCard).length).toBe(0)
  })

  it.each([SoloDifficulty.Discovery, SoloDifficulty.Easy, SoloDifficulty.Hard, SoloDifficulty.VeryHard])(
    'draws as many Common Objective cards of different types as the solo difficulty %i',
    (soloDifficulty) => {
      const rules = setup({ players: 1, soloDifficulty })
      const types = rules.material(MaterialType.CommonObjectiveCard).getItems().map((card) => getCommonObjectiveType(card.id))
      expect(types.length).toBe(soloDifficulty)
      expect(new Set(types).size).toBe(soloDifficulty)
    }
  )

  it('gives the first player card to the first player, except in solo', () => {
    const rules = setup({ players: 4 })
    expect(rules.material(MaterialType.FirstPlayerCard).getItem()?.location).toEqual({ type: LocationType.FirstPlayerSpot, player: rules.players[0] })
    expect(rules.getActivePlayer()).toBe(rules.players[0])
    expect(setup({ players: 1 }).material(MaterialType.FirstPlayerCard).length).toBe(0)
  })

  it('hides the quarry from everyone', () => {
    const rules = setup({ players: 2 })
    const view = new DjeserRules(rules.getPlayerView(rules.players[0]))
    expect(view.material(MaterialType.StoneCard).location(LocationType.Quarry).getItems().every((card) => card.id === undefined)).toBe(true)
    expect(view.material(MaterialType.StoneCard).location(LocationType.Nile).getItems().every((card) => card.id !== undefined)).toBe(true)
  })
})
