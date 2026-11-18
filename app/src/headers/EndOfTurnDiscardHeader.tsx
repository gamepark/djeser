import { CurseType } from '@gamepark/djeser/material/CurseType'
import { LocationType } from '@gamepark/djeser/material/LocationType'
import { MaterialType } from '@gamepark/djeser/material/MaterialType'
import { PlayMoveButton, useLegalMove, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { isMoveItemType, MaterialMove, MaterialRules } from '@gamepark/rules-api'
import { Trans } from 'react-i18next'

const discardIn = (curse: CurseType) => (move: MaterialMove) =>
  isMoveItemType(MaterialType.StoneCard)(move) && move.location.type === LocationType.CursedDiscard && move.location.id === curse

export const EndOfTurnDiscardHeader = () => {
  const rules = useRules<MaterialRules>()!
  const me = usePlayerId()
  const activePlayer = rules.getActivePlayer()
  const player = usePlayerName(activePlayer)
  const values = useLegalMove(discardIn(CurseType.Value))
  const colors = useLegalMove(discardIn(CurseType.Color))
  if (activePlayer !== me) {
    return <Trans i18nKey="header.discard.player" values={{ player }} />
  }
  return <Trans i18nKey="header.discard.you" components={{ values: <PlayMoveButton move={values} />, colors: <PlayMoveButton move={colors} /> }} />
}
