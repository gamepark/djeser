import { CommonObjective } from '@gamepark/djeser/material/CommonObjective'
import { CurseType } from '@gamepark/djeser/material/CurseType'
import { LocationType } from '@gamepark/djeser/material/LocationType'
import { MaterialType } from '@gamepark/djeser/material/MaterialType'
import { NileCard } from '@gamepark/djeser/material/NileCard'
import { StoneCard } from '@gamepark/djeser/material/StoneCard'
import { css } from '@emotion/react'
import { CardDescription, ItemContext, MaterialDescription } from '@gamepark/react-game'
import { isMoveItemType, MaterialItem, MaterialMove, MaterialRules } from '@gamepark/rules-api'
import { createElement } from 'react'
import {
  curseImages,
  FirstPlayerCard,
  nileImages,
  objectiveBackImages,
  objectiveImages,
  StoneBack,
  stoneImages
} from '../images/Images'
import { cardBorderRadius, cardHeight, cardWidth } from '../locators/TableLayout'
import { CommonObjectiveCardHelp } from './help/CommonObjectiveCardHelp'
import { CursedDiscardCardHelp } from './help/CursedDiscardCardHelp'
import { FirstPlayerCardHelp } from './help/FirstPlayerCardHelp'
import { NileCardHelp } from './help/NileCardHelp'
import { StoneCardHelp } from './help/StoneCardHelp'
import { ChooseDestinationLabel } from './ChooseDestinationLabel'

type Context = ItemContext<number, MaterialType, LocationType>

/**
 * A click on a cursed discard pile, or on its cursed discard card, discards there:
 * - at the end of the turn, the Stone card of the Nile closest to the cursed discards;
 * - during the turn, the card of the hand or of the pyramid selected with a click.
 */
const isClickDiscardTo = (move: MaterialMove<number, MaterialType, LocationType>, curse: CurseType, rules: MaterialRules) => {
  if (!isMoveItemType(MaterialType.StoneCard)(move) || move.location.type !== LocationType.CursedDiscard || move.location.id !== curse) return false
  const item = rules.material(MaterialType.StoneCard).getItem(move.itemIndex)
  return item.location.type === LocationType.Nile || (isSelectable(item) && !!item.selected)
}

/** A card of a hand or of a pyramid can be selected with a click, to be placed or discarded with a click on its destination. */
const isSelectable = (item: MaterialItem<number, LocationType>) => item.location.type === LocationType.PlayerHand || item.location.type === LocationType.Pyramid

/** A card lying in landscape: Stone, Nile and first player cards. */
abstract class LandscapeCardDescription<Id> extends CardDescription<number, MaterialType, LocationType, Id> {
  width = cardWidth
  height = cardHeight
  borderRadius = cardBorderRadius
}

/** A card standing in portrait: Common Objective and cursed discard cards. */
abstract class PortraitCardDescription<Id> extends CardDescription<number, MaterialType, LocationType, Id> {
  width = cardHeight
  height = cardWidth
  borderRadius = cardBorderRadius
}

class StoneCardDescription extends LandscapeCardDescription<StoneCard> {
  images = stoneImages
  backImage = StoneBack
  help = StoneCardHelp

  /**
   * A Stone card of the Nile or the quarry can only go to the hand: a click collects it. Placing and discarding are dragged.
   * A click anywhere on the quarry draws its top card. A click on the top card of a cursed discard pile discards there (see `isClickDiscardTo`).
   */
  canShortClick(move: MaterialMove<number, MaterialType, LocationType>, context: Context) {
    const stones = context.rules.material(MaterialType.StoneCard)
    const item = stones.getItem(context.index)
    if (item.location.type === LocationType.CursedDiscard) {
      const isTop = stones.location(LocationType.CursedDiscard).locationId(item.location.id).maxBy((pile) => pile.location.x!).getIndex() === context.index
      return isTop && isClickDiscardTo(move, item.location.id as CurseType, context.rules)
    }
    if (!isMoveItemType(MaterialType.StoneCard)(move) || move.location.type !== LocationType.PlayerHand) return false
    if (move.itemIndex === context.index) return true
    return item.location.type === LocationType.Quarry && stones.getItem(move.itemIndex).location.type === LocationType.Quarry
  }

  /**
   * A card of the hand that can be placed or discarded, or a card of the pyramid that can be discarded, is selected with a click:
   * the framework selects it when it has a menu, and lets go of the other cards selected. The player then clicks a slot of the
   * pyramid (see `PyramidSlotDescription`) or a cursed discard pile.
   */
  getItemMenu(item: MaterialItem<number, LocationType>, context: Context, legalMoves: MaterialMove<number, MaterialType, LocationType>[]) {
    if (!isSelectable(item)) return undefined
    const destinations = legalMoves.filter(isMoveItemType(MaterialType.StoneCard)).filter((move) => move.itemIndex === context.index)
    const place = destinations.some((move) => move.location.type === LocationType.Pyramid)
    const discard = destinations.some((move) => move.location.type === LocationType.CursedDiscard)
    return place || discard ? createElement(ChooseDestinationLabel, { place, discard }) : undefined
  }

  getItemExtraCss(item: MaterialItem<number, LocationType>) {
    return item.selected && isSelectable(item) ? selectedCss : undefined
  }
}

const selectedCss = css`
  > * {
    box-shadow: 0 0 0.3em 0.2em white;
  }
`

class NileCardDescription extends LandscapeCardDescription<NileCard> {
  images = nileImages
  help = NileCardHelp
}

class CommonObjectiveCardDescription extends PortraitCardDescription<CommonObjective> {
  images = objectiveImages
  backImages = objectiveBackImages
  help = CommonObjectiveCardHelp
}

class CursedDiscardCardDescription extends PortraitCardDescription<CurseType> {
  images = curseImages
  help = CursedDiscardCardHelp

  canShortClick(move: MaterialMove<number, MaterialType, LocationType>, context: Context) {
    return isClickDiscardTo(move, context.rules.material(MaterialType.CursedDiscardCard).getItem<CurseType>(context.index).id, context.rules)
  }
}

class FirstPlayerCardDescription extends LandscapeCardDescription<undefined> {
  image = FirstPlayerCard
  help = FirstPlayerCardHelp
}

export const Material: Partial<Record<MaterialType, MaterialDescription>> = {
  [MaterialType.StoneCard]: new StoneCardDescription(),
  [MaterialType.NileCard]: new NileCardDescription(),
  [MaterialType.CommonObjectiveCard]: new CommonObjectiveCardDescription(),
  [MaterialType.CursedDiscardCard]: new CursedDiscardCardDescription(),
  [MaterialType.FirstPlayerCard]: new FirstPlayerCardDescription()
}
