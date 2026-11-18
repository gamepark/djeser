import { CustomMoveType } from '@gamepark/djeser/rules/CustomMoveType'
import { Memory } from '@gamepark/djeser/rules/Memory'
import { ACTION_POINTS } from '@gamepark/djeser/rules/PlayerTurnRule'
import { PlayMoveButton, useLegalMove, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { isCustomMoveType, MaterialRules } from '@gamepark/rules-api'
import { Trans } from 'react-i18next'

/** After the last action point, the turn ends by itself after 10 seconds, so that the player can still undo. */
const AUTO_END_TURN = 10

export const PlayerTurnHeader = () => {
  const rules = useRules<MaterialRules>()!
  const me = usePlayerId()
  const activePlayer = rules.getActivePlayer()
  const player = usePlayerName(activePlayer)
  const endTurn = useLegalMove(isCustomMoveType(CustomMoveType.EndTurn))
  const ap = ACTION_POINTS - (rules.remind<number>(Memory.ActionPointsSpent) ?? 0)
  if (activePlayer !== me) {
    return <Trans i18nKey="header.turn.player" values={{ player, ap }} />
  }
  const end = <PlayMoveButton move={endTurn} auto={ap === 0 ? AUTO_END_TURN : undefined} />
  if (ap === ACTION_POINTS) {
    return endTurn ? <Trans i18nKey="header.turn.you.blocked" components={{ end }} /> : <Trans i18nKey="header.turn.you.start" />
  }
  return <Trans i18nKey={ap === 0 ? 'header.turn.you.done' : 'header.turn.you'} values={{ ap }} components={{ end }} />
}
