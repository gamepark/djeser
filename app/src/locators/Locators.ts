import { LocationType } from '@gamepark/djeser/material/LocationType'
import { MaterialType } from '@gamepark/djeser/material/MaterialType'
import { DeckLocator, ListLocator, Locator, MaterialContext } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import {
  curseCardSpot,
  cursedDiscardSpot,
  firstPlayerSpot,
  handGap,
  handSpot,
  imhotepPyramidSpot,
  nileCardSpot,
  nileStoneSpot,
  objectivesGap,
  objectivesSpot,
  playerPyramidSpot,
  quarrySpot
} from './TableLayout'

type Context = MaterialContext<number, MaterialType, LocationType>
type Loc = Location<number, LocationType>

/** The quarry, upright like in the rulebook. */
class QuarryLocator extends DeckLocator<number, MaterialType, LocationType> {
  coordinates = quarrySpot
  rotateZ = 90
}

class NileCardLineLocator extends Locator<number, MaterialType, LocationType> {
  getCoordinates(location: Loc) {
    return nileCardSpot(location.x ?? 0)
  }
}

class NileLocator extends Locator<number, MaterialType, LocationType> {
  getCoordinates(location: Loc) {
    return nileStoneSpot(location.x ?? 0)
  }
}

class CursedDiscardSpotLocator extends Locator<number, MaterialType, LocationType> {
  getCoordinates(location: Loc) {
    return curseCardSpot(location.id)
  }
}

class CursedDiscardLocator extends DeckLocator<number, MaterialType, LocationType> {
  getCoordinates(location: Loc) {
    return cursedDiscardSpot(location.id)
  }
}

class CommonObjectivesLocator extends ListLocator<number, MaterialType, LocationType> {
  coordinates = objectivesSpot
  gap = { x: objectivesGap }
}

class FirstPlayerSpotLocator extends Locator<number, MaterialType, LocationType> {
  getCoordinates(location: Loc, context: Context) {
    return firstPlayerSpot(context.rules, location.player!, context.player)
  }
}

class PlayerHandLocator extends ListLocator<number, MaterialType, LocationType> {
  gap = { x: handGap }

  getCoordinates(location: Loc, context: Context) {
    return handSpot(context.rules, location.player!, context.player)
  }
}

class PyramidLocator extends Locator<number, MaterialType, LocationType> {
  getCoordinates(location: Loc, context: Context) {
    return playerPyramidSpot(context.rules, location.player!, context.player, location.x ?? 0, location.y ?? 0)
  }
}

class ImhotepPyramidLocator extends Locator<number, MaterialType, LocationType> {
  getCoordinates(location: Loc, context: Context) {
    return imhotepPyramidSpot(context.rules, location.x ?? 0, location.y ?? 0)
  }
}

export const Locators: Partial<Record<LocationType, Locator<number, MaterialType, LocationType>>> = {
  [LocationType.Quarry]: new QuarryLocator(),
  [LocationType.NileCardLine]: new NileCardLineLocator(),
  [LocationType.Nile]: new NileLocator(),
  [LocationType.CursedDiscardSpot]: new CursedDiscardSpotLocator(),
  [LocationType.CursedDiscard]: new CursedDiscardLocator(),
  [LocationType.CommonObjectives]: new CommonObjectivesLocator(),
  [LocationType.FirstPlayerSpot]: new FirstPlayerSpotLocator(),
  [LocationType.PlayerHand]: new PlayerHandLocator(),
  [LocationType.Pyramid]: new PyramidLocator(),
  [LocationType.ImhotepPyramid]: new ImhotepPyramidLocator()
}
