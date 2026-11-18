import { LocationType } from '@gamepark/djeser/material/LocationType'
import { MaterialType } from '@gamepark/djeser/material/MaterialType'
import { LocationDescription } from '@gamepark/react-game'
import { HandCount } from './HandCount'
import { handCountHeight, handCountWidth } from './TableLayout'

/** The hand of another player is only shown as the number of cards in it, out of 4. */
export class HandCountDescription extends LocationDescription<number, MaterialType, LocationType> {
  width = handCountWidth
  height = handCountHeight
  content = HandCount
}
