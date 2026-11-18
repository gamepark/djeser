import { CommonObjective } from '@gamepark/djeser/material/CommonObjective'
import { CurseType } from '@gamepark/djeser/material/CurseType'
import { LocationType } from '@gamepark/djeser/material/LocationType'
import { MaterialType } from '@gamepark/djeser/material/MaterialType'
import { NileCard } from '@gamepark/djeser/material/NileCard'
import { StoneCard } from '@gamepark/djeser/material/StoneCard'
import { CardDescription, MaterialDescription } from '@gamepark/react-game'
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
