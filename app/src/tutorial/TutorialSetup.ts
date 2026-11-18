import { DjeserOptions } from '@gamepark/djeser/DjeserOptions'
import { DjeserSetup } from '@gamepark/djeser/DjeserSetup'
import { CommonObjective } from '@gamepark/djeser/material/CommonObjective'
import { CurseType } from '@gamepark/djeser/material/CurseType'
import { LocationType } from '@gamepark/djeser/material/LocationType'
import { MaterialType } from '@gamepark/djeser/material/MaterialType'
import { StoneColor, stoneCard } from '@gamepark/djeser/material/StoneCard'

export const me = 1
export const opponent = 2

const { Blue, Yellow, Purple, Red, Green } = StoneColor

/** The Stone cards the script names. */
export const yellow3 = stoneCard(Yellow, 3)
export const green5 = stoneCard(Green, 5)
export const green2 = stoneCard(Green, 2)
export const blue1 = stoneCard(Blue, 1)
export const purple2 = stoneCard(Purple, 2)
export const red4 = stoneCard(Red, 4)
/** Drawn by Laurent from the quarry on his first turn. */
const red7 = stoneCard(Red, 7)

/**
 * The Nile at the start, from the cursed discards: the yellow 3 is collected on turn 1; the green 5 (2 AP) is out of reach with the last AP,
 * then discarded by Laurent at the end of his turn; then the green 2 (1 AP) and the blue 1 (2 AP) are collected on turn 2.
 * The purple 2 and the red 4 are cursed by the top cards of the discard piles.
 */
const nile = [yellow3, green5, green2, blue1, purple2, red4]
const cursed = { [CurseType.Color]: stoneCard(Purple, 8), [CurseType.Value]: stoneCard(Blue, 4) }

/** The Common Objective cards of the script, one of each type. */
const objectives = [CommonObjective.AsManyEvenAsOdd, CommonObjective.AtMostThreeColors, CommonObjective.TwoYellow]

/** The start of the script is fixed, the rest of the quarry is shuffled. */
export class TutorialSetup extends DjeserSetup {
  setupMaterial(options: DjeserOptions) {
    super.setupMaterial(options)
    const stones = () => this.material(MaterialType.StoneCard)
    // Everything back to the quarry, shuffled, then the cards of the script where they belong
    stones().moveItemsAtOnce({ type: LocationType.Quarry })
    stones().shuffle()
    nile.forEach((id, x) => stones().id(id).moveItem({ type: LocationType.Nile, x }))
    for (const [curse, id] of Object.entries(cursed)) stones().id(id).moveItem({ type: LocationType.CursedDiscard, id: Number(curse) })
    // The quarry is dealt from its top: one random card for the Nile at the end of turn 1, then the red 7 drawn by Laurent
    const quarry = () => stones().location(LocationType.Quarry)
    const top = quarry()
      .id((id: number) => id !== red7)
      .maxBy((item) => item.location.x!)
      .getItem()!.id
    stones().id(red7).moveItem({ type: LocationType.Quarry })
    stones().id(top).moveItem({ type: LocationType.Quarry })
  }

  setupCommonObjectives() {
    this.material(MaterialType.CommonObjectiveCard).createItems(objectives.map((id) => ({ id, location: { type: LocationType.CommonObjectives } })))
  }
}
