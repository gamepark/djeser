import { useRules } from '@gamepark/react-game'
import { MaterialRules } from '@gamepark/rules-api'
import { Trans } from 'react-i18next'

export const EndOfTurnHeader = () => {
  const rules = useRules<MaterialRules>()!
  return <Trans i18nKey={rules.players.length === 1 ? 'header.end-of-turn.solo' : 'header.end-of-turn'} />
}
