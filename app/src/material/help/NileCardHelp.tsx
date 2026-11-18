import { LocationType } from '@gamepark/djeser/material/LocationType'
import { MaterialType } from '@gamepark/djeser/material/MaterialType'
import { MaterialHelpProps } from '@gamepark/react-game'
import { useTranslation } from 'react-i18next'

/** A Nile card: the cost to collect the Stone card next to it, and the quarry under the last one. */
export const NileCardHelp = ({ item }: MaterialHelpProps<number, MaterialType, LocationType>) => {
  const { t } = useTranslation()
  return (
    <>
      <h2>{t('help.nile.title')}</h2>
      <p>{t('help.nile.cost', { cost: item.id })}</p>
      {item.location?.x === 6 && <p>{t('help.nile.quarry')}</p>}
      <p>{t('help.nile.gaps')}</p>
      <p>{t('help.nile.fill')}</p>
    </>
  )
}
