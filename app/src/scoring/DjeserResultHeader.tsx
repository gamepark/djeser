import { DjeserRules } from '@gamepark/djeser/DjeserRules'
import { GameState } from '@gamepark/djeser/rules/GameState'
import { useResultText, useRules } from '@gamepark/react-game'
import { useTranslation } from 'react-i18next'

/**
 * The result of the game. With several players, the platform's text says who wins. In solo, the player wins only by completing every
 * Common Objective card and beating Imhotep: the text says which, with both scores.
 */
export const DjeserResultHeader = () => {
  const { t } = useTranslation()
  const rules = useRules<DjeserRules>()
  const resultText = useResultText()
  if (!rules || rules.players.length !== 1) return <>{resultText}</>
  const player = rules.players[0]
  const state = new GameState(rules.game)
  const values = { score: state.playerScore(player), imhotep: state.imhotepScore }
  if (state.isSoloWon(player)) return <>{t('result.solo.won', values)}</>
  const objectivesMissed = state.objectivesMet(state.pyramidCards(player)).length < state.objectives.length
  return <>{t(objectivesMissed ? 'result.solo.objectives' : 'result.solo.lost', values)}</>
}
