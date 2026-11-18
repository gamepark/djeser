import { CurseType } from '@gamepark/djeser/material/CurseType'
import { LocationType } from '@gamepark/djeser/material/LocationType'
import { MaterialType } from '@gamepark/djeser/material/MaterialType'
import { getStoneColor, getStoneValue } from '@gamepark/djeser/material/StoneCard'
import { GameState } from '@gamepark/djeser/rules/GameState'
import { MaterialHelpProps, useRules } from '@gamepark/react-game'
import { MaterialRules } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'

/** A cursed discard card: what its pile curses, and the curse in force. */
export const CursedDiscardCardHelp = ({ item }: MaterialHelpProps<number, MaterialType, LocationType>) => {
  const { t } = useTranslation()
  const rules = useRules<MaterialRules<number, MaterialType, LocationType>>()
  if (!rules) return null
  const curse = item.id as CurseType
  const state = new GameState(rules.game)
  const top = state.cursedCard(curse)
  const count = state.stones.location(LocationType.CursedDiscard).locationId(curse).length
  return (
    <>
      <h2>{t(curse === CurseType.Value ? 'help.curse.value.title' : 'help.curse.color.title')}</h2>
      <p>{t('help.curse.pile', { count })}</p>
      {top !== undefined && (
        <p>
          <strong>
            {t(curse === CurseType.Value ? 'help.stone.curse.value' : 'help.stone.curse.color', { color: getStoneColor(top), value: getStoneValue(top) })}
          </strong>
        </p>
      )}
      <p>{t(curse === CurseType.Value ? 'help.curse.value.rule' : 'help.curse.color.rule')}</p>
      <p>{t('help.curse.top')}</p>
      <p>{t('help.curse.quarry')}</p>
      <p>{t('help.curse.discard')}</p>
    </>
  )
}
