import { CommonObjective, getCommonObjectiveType, isCommonObjectiveMet } from '@gamepark/djeser/material/CommonObjective'
import { LocationType } from '@gamepark/djeser/material/LocationType'
import { MaterialType } from '@gamepark/djeser/material/MaterialType'
import { GameState } from '@gamepark/djeser/rules/GameState'
import { MaterialHelpProps, usePlayerName, useRules } from '@gamepark/react-game'
import { MaterialRules } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'

/** A Common Objective card: its condition, as written on the card, and who meets it now. */
export const CommonObjectiveCardHelp = ({ item }: MaterialHelpProps<number, MaterialType, LocationType>) => {
  const { t } = useTranslation()
  const rules = useRules<MaterialRules<number, MaterialType, LocationType>>()
  if (!rules) return null
  const objective = item.id as CommonObjective | undefined
  const state = new GameState(rules.game)
  const solo = rules.players.length === 1
  const meeting = objective === undefined ? [] : rules.players.filter((player) => isCommonObjectiveMet(objective, state.pyramidCards(player)))
  const imhotep = objective !== undefined && solo && isCommonObjectiveMet(objective, state.imhotepPyramidCards)
  return (
    <>
      <h2>{t('help.objective.title', { type: objective === undefined ? 0 : getCommonObjectiveType(objective) })}</h2>
      {objective !== undefined && (
        <p>
          <strong>{t(`objective.${objective}`)}</strong>
        </p>
      )}
      <p>{t('help.objective.points')}</p>
      <p>{t('help.objective.pyramid')}</p>
      {solo && <p>{t('help.objective.solo')}</p>}
      {objective !== undefined && (
        <p>
          {meeting.length === 0 && !imhotep ? t('help.objective.met.none') : t('help.objective.met')}
          {meeting.map((player, index) => (
            <span key={player}>
              {index > 0 ? ', ' : ' '}
              <PlayerName player={player} />
            </span>
          ))}
          {imhotep && <span>{meeting.length > 0 ? ', ' : ' '}Imhotep</span>}
        </p>
      )}
    </>
  )
}

const PlayerName = ({ player }: { player: number }) => <>{usePlayerName(player)}</>
