import { DjeserRules } from '@gamepark/djeser/DjeserRules'
import { pyramidValue } from '@gamepark/djeser/material/Pyramid'
import { GameState } from '@gamepark/djeser/rules/GameState'
import { ScoringDescription } from '@gamepark/react-game'
import { Trans } from 'react-i18next'
import { DjeserResultHeader } from './DjeserResultHeader'

enum ScoringKey {
  Pyramid = 1,
  Top,
  Objectives,
  Hand,
  Total,
  TieBreaker,
  ImhotepPyramid,
  ImhotepTop,
  ImhotepObjectives,
  Imhotep
}

const labels: Record<ScoringKey, string> = {
  [ScoringKey.Pyramid]: 'scoring.pyramid',
  [ScoringKey.Top]: 'scoring.top',
  [ScoringKey.Objectives]: 'scoring.objectives',
  [ScoringKey.Hand]: 'scoring.hand',
  [ScoringKey.Total]: 'scoring.total',
  [ScoringKey.TieBreaker]: 'scoring.tie-breaker',
  [ScoringKey.ImhotepPyramid]: 'scoring.imhotep.pyramid',
  [ScoringKey.ImhotepTop]: 'scoring.imhotep.top',
  [ScoringKey.ImhotepObjectives]: 'scoring.imhotep.objectives',
  [ScoringKey.Imhotep]: 'scoring.imhotep'
}

const boldKeys = [ScoringKey.Total, ScoringKey.Imhotep]

/** Some players have the same total: the total value of their pyramid decides. */
const hasTie = (rules: DjeserRules) => {
  const state = new GameState(rules.game)
  const totals = rules.players.map((player) => state.playerScore(player))
  return new Set(totals).size < totals.length
}

/**
 * The end of game table, line by line as the rulebook adds up the Prestige points: 1 point per card of the pyramid, the value of
 * the card of level III, 3 points per Common Objective met, minus the value of the cards left in hand. The tie-breaker shows only
 * when it is needed; in solo, Imhotep's points follow, line by line too. Everything is computed from the state.
 */
export class DjeserScoring implements ScoringDescription<number, DjeserRules, ScoringKey> {
  ResultHeader = DjeserResultHeader

  getScoringKeys(rules: DjeserRules) {
    const keys = [ScoringKey.Pyramid, ScoringKey.Top, ScoringKey.Objectives, ScoringKey.Hand, ScoringKey.Total]
    if (rules.players.length === 1) keys.push(ScoringKey.ImhotepPyramid, ScoringKey.ImhotepTop, ScoringKey.ImhotepObjectives, ScoringKey.Imhotep)
    else if (hasTie(rules)) keys.push(ScoringKey.TieBreaker)
    return keys
  }

  getScoringHeader(key: ScoringKey) {
    const label = <Trans i18nKey={labels[key]} />
    return boldKeys.includes(key) ? <strong>{label}</strong> : label
  }

  getScoringPlayerData(key: ScoringKey, player: number, rules: DjeserRules) {
    const state = new GameState(rules.game)
    const detail = state.playerScoreDetail(player)
    switch (key) {
      case ScoringKey.Pyramid:
        return detail.pyramid
      case ScoringKey.Top:
        return detail.top
      case ScoringKey.Objectives:
        return detail.objectives
      case ScoringKey.Hand:
        return detail.hand ? -detail.hand : 0
      case ScoringKey.Total:
        return <strong>{state.playerScore(player)}</strong>
      case ScoringKey.TieBreaker:
        return pyramidValue(state.pyramidCards(player))
      case ScoringKey.ImhotepPyramid:
        return state.imhotepScoreDetail.pyramid
      case ScoringKey.ImhotepTop:
        return state.imhotepScoreDetail.top
      case ScoringKey.ImhotepObjectives:
        return state.imhotepScoreDetail.objectives
      case ScoringKey.Imhotep:
        return <strong>{state.imhotepScore}</strong>
    }
  }
}
