import { CurseType } from '@gamepark/djeser/material/CurseType'
import { LocationType } from '@gamepark/djeser/material/LocationType'
import { MaterialType } from '@gamepark/djeser/material/MaterialType'
import { getStoneColor, getStoneValue, StoneCard } from '@gamepark/djeser/material/StoneCard'
import { GameState } from '@gamepark/djeser/rules/GameState'
import { MaterialHelpProps, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { MaterialRules } from '@gamepark/rules-api'
import { Trans, useTranslation } from 'react-i18next'

/** A Stone card: its color and value when they are known, then what can be done with it where it stands. */
export const StoneCardHelp = ({ item }: MaterialHelpProps<number, MaterialType, LocationType>) => {
  const { t } = useTranslation()
  const rules = useRules<MaterialRules<number, MaterialType, LocationType>>()
  const me = usePlayerId<number>()
  const owner = usePlayerName(item.location?.player)
  if (!rules || !item.location) return null
  const state = new GameState(rules.game)
  const { type, player, x = 0, y = 0, id } = item.location
  const card = item.id as StoneCard | undefined
  const cursed = card !== undefined && state.isCursed(card)
  const mine = player !== undefined && player === me
  return (
    <>
      <h2>{card === undefined ? t('help.stone') : t('help.stone.title', { color: getStoneColor(card), value: getStoneValue(card) })}</h2>
      {card !== undefined && <p>{t('help.stone.symbol', { color: getStoneColor(card) })}</p>}
      {type === LocationType.Quarry && (
        <>
          <p>{t('help.quarry', { count: state.quarry.length })}</p>
          <p>{t('help.quarry.draw')}</p>
          <p>{t('help.quarry.depleted')}</p>
        </>
      )}
      {type === LocationType.Nile && (
        <>
          <p>{t('help.stone.nile', { cost: state.nileCost(x) })}</p>
          {cursed && (
            <p>
              <strong>{t('help.stone.cursed.collect')}</strong>
            </p>
          )}
        </>
      )}
      {type === LocationType.PlayerHand && (
        <>
          <p>{mine ? t('help.stone.hand.you') : t('help.stone.hand', { player: owner })}</p>
          {mine && (
            <>
              <p>
                <Trans i18nKey="help.stone.place" components={{ strong: <strong /> }} />
              </p>
              {cursed && (
                <p>
                  <strong>{t('help.stone.cursed.place')}</strong>
                </p>
              )}
              <p>{t('help.stone.discard.hand')}</p>
            </>
          )}
          <p>{t('help.stone.hand.end')}</p>
        </>
      )}
      {type === LocationType.Pyramid && (
        <>
          <p>{mine ? t('help.stone.pyramid.you', { level: y + 1 }) : t('help.stone.pyramid', { player: owner, level: y + 1 })}</p>
          <p>{t(y === 2 ? 'help.stone.pyramid.top' : 'help.stone.discard.pyramid')}</p>
        </>
      )}
      {type === LocationType.ImhotepPyramid && <p>{t('help.stone.imhotep', { level: y + 1 })}</p>}
      {type === LocationType.CursedDiscard && card !== undefined && (
        <p>
          {state.cursedCard(id) === card
            ? t(id === CurseType.Value ? 'help.stone.curse.value' : 'help.stone.curse.color', { color: getStoneColor(card), value: getStoneValue(card) })
            : t('help.stone.curse.covered')}
        </p>
      )}
    </>
  )
}
