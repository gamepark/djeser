import { LocationType } from '@gamepark/djeser/material/LocationType'
import { MaterialType } from '@gamepark/djeser/material/MaterialType'
import { DeckLocator, ItemContext, ListLocator, Locator, MaterialContext } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { HandCountDescription } from './HandCountDescription'
import {
  curseCardSpot,
  cursedDiscardSpot,
  firstPlayerSpot,
  handCountSpot,
  imhotepPyramidSpot,
  myHandGap,
  myHandSpot,
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

/**
 * The hand of the player who looks at the table is shown left of the pyramids.
 * The other hands are only a count of cards: their cards are not displayed, except while they move.
 */
class PlayerHandLocator extends ListLocator<number, MaterialType, LocationType> {
  locationDescription = new HandCountDescription()

  getLocations(context: Context) {
    return context.rules.players.filter((player) => player !== context.player).map((player) => ({ type: LocationType.PlayerHand, player }))
  }

  getCoordinates(location: Loc, context: Context) {
    return location.player === context.player ? myHandSpot(context.rules) : handCountSpot(context.rules, location.player!, context.player)
  }

  getGap(location: Loc, context: Context) {
    return { x: location.player === context.player ? myHandGap(context.rules) : 0 }
  }

  hide(item: MaterialItem<number, LocationType>, context: ItemContext<number, MaterialType, LocationType>) {
    return item.location.player !== context.player
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
