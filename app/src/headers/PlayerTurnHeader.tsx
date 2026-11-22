import { LocationType } from '@gamepark/djeser/material/LocationType'
import { MaterialType } from '@gamepark/djeser/material/MaterialType'
import { CustomMoveType } from '@gamepark/djeser/rules/CustomMoveType'
import { Memory } from '@gamepark/djeser/rules/Memory'
import { ACTION_POINTS } from '@gamepark/djeser/rules/PlayerTurnRule'
import { PlayMoveButton, useLegalMove, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { isCustomMoveType, isMoveItemType, MaterialMove, MaterialRules } from '@gamepark/rules-api'
import { Trans, useTranslation } from 'react-i18next'

/** After the last action point, the turn ends by itself after 10 seconds, so that the player can still undo. */
const AUTO_END_TURN = 10

const moveStoneTo = (type: LocationType) => (move: MaterialMove) => isMoveItemType(MaterialType.StoneCard)(move) && move.location.type === type

export const PlayerTurnHeader = () => {
  const { t } = useTranslation()
  const rules = useRules<MaterialRules>()!
  const me = usePlayerId()
  const activePlayer = rules.getActivePlayer()
  const player = usePlayerName(activePlayer)
  const endTurn = useLegalMove(isCustomMoveType(CustomMoveType.EndTurn))
  // The legal moves are those the tutorial allows: the header only names the actions the player can do now
  const collect = useLegalMove(moveStoneTo(LocationType.PlayerHand))
  const place = useLegalMove(moveStoneTo(LocationType.Pyramid))
  const discard = useLegalMove(moveStoneTo(LocationType.CursedDiscard))
  const ap = ACTION_POINTS - (rules.remind<number>(Memory.ActionPointsSpent) ?? 0)
  if (activePlayer !== me) {
    return <Trans i18nKey="header.turn.player" values={{ player, ap }} />
  }
  const end = <PlayMoveButton move={endTurn} auto={ap === 0 ? AUTO_END_TURN : undefined} />
  const allowed = [collect && 'collect', place && 'place', discard && 'discard'].filter(Boolean)
  if (allowed.length === 0) {
    if (ap === 0) return <Trans i18nKey="header.turn.you.done" components={{ end }} />
    return <Trans i18nKey={ap === ACTION_POINTS ? 'header.turn.you.blocked' : 'header.turn.you.end'} values={{ ap }} components={{ end }} />
  }
  const actions = t(`header.actions.${allowed.join('-')}`)
  if (ap === ACTION_POINTS) return <Trans i18nKey="header.turn.you.start" values={{ actions }} />
  // The tutorial does not always allow to end the turn: then the header does not offer it
  return <Trans i18nKey={endTurn ? 'header.turn.you' : 'header.turn.you.left'} values={{ ap, actions }} components={{ end }} />
}
