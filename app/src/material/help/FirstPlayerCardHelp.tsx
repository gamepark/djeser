import { LocationType } from '@gamepark/djeser/material/LocationType'
import { MaterialType } from '@gamepark/djeser/material/MaterialType'
import { MaterialHelpProps, usePlayerId, usePlayerName } from '@gamepark/react-game'
import { useTranslation } from 'react-i18next'

export const FirstPlayerCardHelp = ({ item }: MaterialHelpProps<number, MaterialType, LocationType>) => {
  const { t } = useTranslation()
  const me = usePlayerId<number>()
  const player = usePlayerName(item.location?.player)
  return (
    <>
      <h2>{t('help.first-player.title')}</h2>
      <p>{item.location?.player === me ? t('help.first-player.you') : t('help.first-player', { player })}</p>
      <p>{t('help.first-player.end')}</p>
    </>
  )
}
