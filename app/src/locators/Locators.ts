import { css } from '@emotion/react'
import { LocationType } from '@gamepark/djeser/material/LocationType'
import { MaterialType } from '@gamepark/djeser/material/MaterialType'
import { DeckLocator, DropAreaDescription, ItemContext, ListLocator, LocationContext, Locator, MaterialContext } from '@gamepark/react-game'
import { isMoveItemType, Location, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { GameState } from '@gamepark/djeser/rules/GameState'
import { PlayerTurnRule } from '@gamepark/djeser/rules/PlayerTurnRule'
import { RuleId } from '@gamepark/djeser/rules/RuleId'
import { PYRAMID_LEVELS, pyramidSlots } from '@gamepark/djeser/material/Pyramid'
import { cardHoverTransform } from './CardHover'
import { HandCountDescription } from './HandCountDescription'
import { ImhotepNameDescription } from './ImhotepNameDescription'
import {
  cardBorderRadius,
  cardHeight,
  cardWidth,
  curseCardSpot,
  cursedNileShift,
  cursedDiscardSpot,
  firstPlayerSpot,
  handCountSpot,
  imhotepNameSpot,
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

  getHoverTransform(item: MaterialItem<number, LocationType>, context: ItemContext<number, MaterialType, LocationType>) {
    return cardHoverTransform(item, context)
  }
}

class CursedDiscardSpotLocator extends Locator<number, MaterialType, LocationType> {
  getCoordinates(location: Loc) {
    return curseCardSpot(location.id)
  }

  getHoverTransform(item: MaterialItem<number, LocationType>, context: ItemContext<number, MaterialType, LocationType>) {
    return cardHoverTransform(item, context)
  }
}

class CursedDiscardLocator extends DeckLocator<number, MaterialType, LocationType> {
  getCoordinates(location: Loc) {
    return cursedDiscardSpot(location.id)
  }

  getHoverTransform(item: MaterialItem<number, LocationType>, context: ItemContext<number, MaterialType, LocationType>) {
    return cardHoverTransform(item, context)
  }
}

class CommonObjectivesLocator extends ListLocator<number, MaterialType, LocationType> {
  coordinates = objectivesSpot
  gap = { x: objectivesGap }

  getHoverTransform(item: MaterialItem<number, LocationType>, context: ItemContext<number, MaterialType, LocationType>) {
    return cardHoverTransform(item, context)
  }
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

  getHoverTransform(item: MaterialItem<number, LocationType>, context: ItemContext<number, MaterialType, LocationType>) {
    return cardHoverTransform(item, context)
  }
}

/** The card of the player's hand selected with a click, to be placed in the pyramid with a click on a slot. */
const selectedHandCard = (context: Context) =>
  context.rules.material(MaterialType.StoneCard).location(LocationType.PlayerHand).player(context.player).selected()

/** The slots of the player's pyramid where the card of the hand selected with a click can be placed. */
const selectedCardSlots = (context: Context): Loc[] => {
  if (context.player === undefined || context.rules.game.rule?.id !== RuleId.PlayerTurn || context.rules.getActivePlayer() !== context.player) return []
  const selected = selectedHandCard(context).getIndexes()
  if (selected.length !== 1) return []
  return new PlayerTurnRule(context.rules.game).placeMoves
    .filter(isMoveItemType(MaterialType.StoneCard))
    .filter((move) => move.itemIndex === selected[0])
    .map((move) => move.location as Loc)
}

/** The free slots of the player's pyramid that a card could fill: the free slots of level I, and above 2 cards that would support it. */
const openSlots = (context: Context): Loc[] => {
  if (context.player === undefined || !context.rules.players.includes(context.player)) return []
  const cards = context.rules.material(MaterialType.StoneCard).location(LocationType.Pyramid).player(context.player).getItems()
  const taken = (x: number, y: number) => cards.some((card) => card.location.x === x && card.location.y === y)
  return pyramidSlots(PYRAMID_LEVELS)
    .filter(({ x, y }) => !taken(x, y) && (y === 0 || (taken(x, y - 1) && taken(x + 1, y - 1))))
    .map(({ x, y }) => ({ type: LocationType.Pyramid, player: context.player, x, y }))
}

const faintSlotCss = css`
  border: 0.05em solid rgba(255, 255, 255, 0.3);
`

const openSlotCss = css`
  border: 0.1em dashed rgba(255, 255, 255, 0.8);
`

/**
 * A slot of a pyramid is the size of a card. The free slots of the player's pyramid are always outlined faintly, so that they
 * see where it stands; a slot stands out when the card dragged or selected can go there, and the tutorial can focus it.
 * Once a card of the hand is selected, a click on a slot places it there.
 */
class PyramidSlotDescription extends DropAreaDescription<number, MaterialType, LocationType> {
  width = cardWidth
  height = cardHeight
  borderRadius = cardBorderRadius

  getExtraCss(location: Loc, context: LocationContext<number, MaterialType, LocationType>) {
    const open = context.canDrop || selectedCardSlots(context).some((slot) => slot.x === location.x && slot.y === location.y)
    return open ? openSlotCss : faintSlotCss
  }

  /** A click places the selected card, or the only card that can go there: the framework plays the click only when one move matches. */
  canShortClick(move: MaterialMove<number, MaterialType, LocationType>, location: Loc, context: Context) {
    if (!this.isMoveToLocation(move, location, context) || !isMoveItemType(MaterialType.StoneCard)(move)) return false
    const selected = selectedHandCard(context).getIndexes()
    return !selected.length || selected.includes(move.itemIndex)
  }
}

class PyramidLocator extends Locator<number, MaterialType, LocationType> {
  locationDescription = new PyramidSlotDescription()

  /** The free slots of the player's pyramid are always shown; while a card is dragged, the framework adds the drop areas. */
  getLocations(context: Context) {
    return openSlots(context)
  }

  getCoordinates(location: Loc, context: Context) {
    return playerPyramidSpot(context.rules, location.player!, context.player, location.x ?? 0, location.y ?? 0)
  }

  getHoverTransform(item: MaterialItem<number, LocationType>, context: ItemContext<number, MaterialType, LocationType>) {
    return cardHoverTransform(item, context)
  }
}

/** Imhotep's pyramid, in solo. The location without coordinates is his name, above the top of the pyramid. */
class ImhotepPyramidLocator extends Locator<number, MaterialType, LocationType> {
  locationDescription = new ImhotepNameDescription()

  getLocations(context: Context) {
    return context.rules.players.length === 1 ? [{ type: LocationType.ImhotepPyramid }] : []
  }

  getCoordinates(location: Loc, context: Context) {
    if (location.x === undefined) return imhotepNameSpot(context.rules)
    return imhotepPyramidSpot(context.rules, location.x, location.y ?? 0)
  }

  getHoverTransform(item: MaterialItem<number, LocationType>, context: ItemContext<number, MaterialType, LocationType>) {
    return cardHoverTransform(item, context)
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
