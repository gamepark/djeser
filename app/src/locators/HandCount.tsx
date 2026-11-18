import { css } from '@emotion/react'
import { faHand } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { LocationType } from '@gamepark/djeser/material/LocationType'
import { MaterialType } from '@gamepark/djeser/material/MaterialType'
import { HAND_LIMIT } from '@gamepark/djeser/material/PlayerHand'
import { useRules } from '@gamepark/react-game'
import { Location, MaterialRules } from '@gamepark/rules-api'

/** The number of cards in the hand of a player, out of 4. */
export const HandCount = ({ location }: { location: Location }) => {
  const rules = useRules<MaterialRules<number, MaterialType, LocationType>>()
  const count = rules?.material(MaterialType.StoneCard).location(LocationType.PlayerHand).player(location.player).length ?? 0
  return (
    <div css={countCss}>
      <FontAwesomeIcon icon={faHand} /> {count}/{HAND_LIMIT}
    </div>
  )
}

const countCss = css`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3em;
  border-radius: 0.4em;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 1.4em;
  font-weight: bold;
`
