import { css } from '@emotion/react'
import { LocationType } from '@gamepark/djeser/material/LocationType'
import { MaterialType } from '@gamepark/djeser/material/MaterialType'
import { DeckLocator, DropAreaDescription, ItemContext, ListLocator, Locator, MaterialContext } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { GameState } from '@gamepark/djeser/rules/GameState'
import { HandCountDescription } from './HandCountDescription'
import {
  cardBorderRadius,
  cardHeight,
  cardWidth,
  curseCardSpot,
  cursedNileShift,
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

  /** The Stone cards that cannot be collected because they are cursed are shifted down. */
  getItemCoordinates(item: MaterialItem<number, LocationType>, context: ItemContext<number, MaterialType, LocationType>) {
    const { x, y } = nileStoneSpot(item.location.x ?? 0)
    const cursed = new GameState(context.rules.game).isCursed(item.id)
    return { x, y: cursed ? y + cursedNileShift : y }
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

/** A slot of a pyramid is the size of a card: it lights up when a card can be placed there, and the tutorial can focus it. */
const pyramidSlotDescription = new DropAreaDescription<number, MaterialType, LocationType>({
  width: cardWidth,
  height: cardHeight,
  borderRadius: cardBorderRadius,
  extraCss: css`
    border: 0.1em dashed rgba(255, 255, 255, 0.8);
  `
})

class PyramidLocator extends Locator<number, MaterialType, LocationType> {
  locationDescription = pyramidSlotDescription

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
