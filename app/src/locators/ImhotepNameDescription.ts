import { css } from '@emotion/react'
import { LocationType } from '@gamepark/djeser/material/LocationType'
import { MaterialType } from '@gamepark/djeser/material/MaterialType'
import { LocationDescription } from '@gamepark/react-game'
import { ImhotepName } from './ImhotepName'
import { imhotepNameHeight, imhotepNameWidth } from './TableLayout'

/** Imhotep's name above his pyramid: a label only, clicks go through. */
export class ImhotepNameDescription extends LocationDescription<number, MaterialType, LocationType> {
  width = imhotepNameWidth
  height = imhotepNameHeight
  extraCss = css`
    pointer-events: none;
  `
  content = ImhotepName
}
