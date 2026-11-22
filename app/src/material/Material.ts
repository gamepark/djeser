import { CommonObjective } from '@gamepark/djeser/material/CommonObjective'
import { CurseType } from '@gamepark/djeser/material/CurseType'
import { LocationType } from '@gamepark/djeser/material/LocationType'
import { MaterialType } from '@gamepark/djeser/material/MaterialType'
import { NileCard } from '@gamepark/djeser/material/NileCard'
import { StoneCard } from '@gamepark/djeser/material/StoneCard'
import { CardDescription, ItemContext, MaterialDescription } from '@gamepark/react-game'
import { isMoveItemType, MaterialMove, MaterialRules } from '@gamepark/rules-api'
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

type Context = ItemContext<number, MaterialType, LocationType>

/**
 * The end of turn discard: the Stone card closest to the cursed discards leaves the Nile for the pile of this curse.
 * A click on the pile, or on its cursed discard card, plays it.
 */
const isNileDiscardTo = (move: MaterialMove<number, MaterialType, LocationType>, curse: CurseType, rules: MaterialRules) =>
  isMoveItemType(MaterialType.StoneCard)(move) &&
  move.location.type === LocationType.CursedDiscard &&
  move.location.id === curse &&
  rules.material(MaterialType.StoneCard).getItem(move.itemIndex).location.type === LocationType.Nile

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
   * A click anywhere on the quarry draws its top card. A click on the top card of a cursed discard pile discards the first Stone of the Nile there.
   */
  canShortClick(move: MaterialMove<number, MaterialType, LocationType>, context: Context) {
    const stones = context.rules.material(MaterialType.StoneCard)
    const item = stones.getItem(context.index)
    if (item.location.type === LocationType.CursedDiscard) {
      const isTop = stones.location(LocationType.CursedDiscard).locationId(item.location.id).maxBy((pile) => pile.location.x!).getIndex() === context.index
      return isTop && isNileDiscardTo(move, item.location.id as CurseType, context.rules)
    }
    if (!isMoveItemType(MaterialType.StoneCard)(move) || move.location.type !== LocationType.PlayerHand) return false
    if (move.itemIndex === context.index) return true
    return item.location.type === LocationType.Quarry && stones.getItem(move.itemIndex).location.type === LocationType.Quarry
  }
}

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
    return isNileDiscardTo(move, context.rules.material(MaterialType.CursedDiscardCard).getItem<CurseType>(context.index).id, context.rules)
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
