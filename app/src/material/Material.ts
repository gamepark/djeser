import { CommonObjective } from '@gamepark/djeser/material/CommonObjective'
import { CurseType } from '@gamepark/djeser/material/CurseType'
import { LocationType } from '@gamepark/djeser/material/LocationType'
import { MaterialType } from '@gamepark/djeser/material/MaterialType'
import { NileCard } from '@gamepark/djeser/material/NileCard'
import { StoneCard } from '@gamepark/djeser/material/StoneCard'
import { CardDescription, ItemContext, MaterialDescription } from '@gamepark/react-game'
import { isMoveItemType, MaterialMove } from '@gamepark/rules-api'
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

  /**
   * A Stone card of the Nile or the quarry can only go to the hand: a click collects it. Placing and discarding are dragged.
   * A click anywhere on the quarry draws its top card.
   */
  canShortClick(move: MaterialMove<number, MaterialType, LocationType>, context: ItemContext<number, MaterialType, LocationType>) {
    if (!isMoveItemType(MaterialType.StoneCard)(move) || move.location.type !== LocationType.PlayerHand) return false
    if (move.itemIndex === context.index) return true
    const stones = context.rules.material(MaterialType.StoneCard)
    return stones.getItem(context.index).location.type === LocationType.Quarry && stones.getItem(move.itemIndex).location.type === LocationType.Quarry
  }
}

class NileCardDescription extends LandscapeCardDescription<NileCard> {
  images = nileImages
}

class CommonObjectiveCardDescription extends PortraitCardDescription<CommonObjective> {
  images = objectiveImages
  backImages = objectiveBackImages
}

class CursedDiscardCardDescription extends PortraitCardDescription<CurseType> {
  images = curseImages
}

class FirstPlayerCardDescription extends LandscapeCardDescription<undefined> {
  image = FirstPlayerCard
}

export const Material: Partial<Record<MaterialType, MaterialDescription>> = {
  [MaterialType.StoneCard]: new StoneCardDescription(),
  [MaterialType.NileCard]: new NileCardDescription(),
  [MaterialType.CommonObjectiveCard]: new CommonObjectiveCardDescription(),
  [MaterialType.CursedDiscardCard]: new CursedDiscardCardDescription(),
  [MaterialType.FirstPlayerCard]: new FirstPlayerCardDescription()
}
