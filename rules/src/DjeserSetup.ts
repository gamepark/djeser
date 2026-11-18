import { MaterialGameSetup } from '@gamepark/rules-api'
import { sample, shuffle } from 'es-toolkit'
import { DjeserOptions } from './DjeserOptions'
import { DjeserRules } from './DjeserRules'
import { CommonObjectiveType, commonObjectives, commonObjectiveTypes, getCommonObjectiveType } from './material/CommonObjective'
import { CurseType } from './material/CurseType'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { nileCards } from './material/NileCard'
import { stoneCards } from './material/StoneCard'
import { RuleId } from './rules/RuleId'
import { SoloDifficulty } from './SoloDifficulty'

/** Number of Stone cards on the Nile. */
export const NILE_SIZE = 6

/**
 * This class creates a new Game based on the game options
 */
export class DjeserSetup extends MaterialGameSetup<number, MaterialType, LocationType, DjeserOptions> {
  Rules = DjeserRules

  setupMaterial(options: DjeserOptions) {
    this.setupQuarry()
    this.setupNile()
    this.setupCursedDiscards()
    this.setupCommonObjectives(options)
    this.setupFirstPlayer()
  }

  /** 1 - Shuffle all the Stone cards, then form a face down draw pile called the quarry. */
  setupQuarry() {
    this.material(MaterialType.StoneCard).createItems(stoneCards.map((id) => ({ id, location: { type: LocationType.Quarry } })))
    this.material(MaterialType.StoneCard).shuffle()
  }

  get quarry() {
    return this.material(MaterialType.StoneCard).location(LocationType.Quarry).deck()
  }

  /**
   * 2 - Arrange the 7 Nile cards to form the Nile.
   * 3 - Draw 6 Stone cards one by one from the quarry, then arrange them in a line below the Nile cards.
   */
  setupNile() {
    this.material(MaterialType.NileCard).createItems(nileCards.map((id) => ({ id, location: { type: LocationType.NileCardLine } })))
    for (let i = 0; i < NILE_SIZE; i++) {
      this.quarry.dealOne({ type: LocationType.Nile })
    }
  }

  /**
   * 5 - Place the 2 cursed discard cards at the beginning of the alignment.
   * A Stone card is always placed in each of them: the tip of the rulebook to leave them empty for a first game is not offered
   * (decision of the publisher, 18/11/2026). Solo: "You must place a card from the quarry in each cursed discard pile."
   */
  setupCursedDiscards() {
    const curses = [CurseType.Color, CurseType.Value]
    this.material(MaterialType.CursedDiscardCard).createItems(curses.map((id) => ({ id, location: { type: LocationType.CursedDiscardSpot, id } })))
    for (const curse of curses) {
      this.quarry.dealOne({ type: LocationType.CursedDiscard, id: curse })
    }
  }

  /**
   * 6 - Draw 3 Common Objective cards (one per type of objective) and place them face up. Return the others to the box.
   * Tip: for a first game, you can play without the Common Objective cards.
   * Solo: 1, 2 or 3 Common Objective cards of different types for an easy, hard and very hard difficulty.
   */
  setupCommonObjectives(options: DjeserOptions) {
    const objectives = this.getCommonObjectiveTypes(options).map((type) =>
      sample(commonObjectives.filter((objective) => getCommonObjectiveType(objective) === type))
    )
    this.material(MaterialType.CommonObjectiveCard).createItems(objectives.map((id) => ({ id, location: { type: LocationType.CommonObjectives } })))
  }

  getCommonObjectiveTypes(options: DjeserOptions): CommonObjectiveType[] {
    if (options.players === 1) {
      const count = options.soloDifficulty ?? SoloDifficulty.Easy
      return shuffle(commonObjectiveTypes)
        .slice(0, count)
        .sort((a, b) => a - b)
    }
    return (options.commonObjectives ?? true) ? commonObjectiveTypes : []
  }

  /** 4 - A first player is randomly chosen (the players are seated at random): they take the first player card. Not used in solo. */
  setupFirstPlayer() {
    if (this.players.length === 1) return
    this.material(MaterialType.FirstPlayerCard).createItem({ location: { type: LocationType.FirstPlayerSpot, player: this.players[0] } })
  }

  start() {
    this.startPlayerTurn(RuleId.TheFirstStep, this.players[0])
  }
}
