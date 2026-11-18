import { RuleId } from '@gamepark/djeser/rules/RuleId'
import { ComponentType } from 'react'
import { EndOfTurnDiscardHeader } from './EndOfTurnDiscardHeader'
import { EndOfTurnHeader } from './EndOfTurnHeader'
import { PlayerTurnHeader } from './PlayerTurnHeader'

export const Headers: Partial<Record<RuleId, ComponentType>> = {
  [RuleId.PlayerTurn]: PlayerTurnHeader,
  [RuleId.EndOfTurnDiscard]: EndOfTurnDiscardHeader,
  [RuleId.EndOfTurn]: EndOfTurnHeader
}
