import { RuleId } from '@gamepark/djeser/rules/RuleId'
import { ComponentType } from 'react'
import { TemporaryHeader } from './TemporaryHeader'

export const Headers: Partial<Record<RuleId, ComponentType>> = {
  [RuleId.PlayerTurn]: TemporaryHeader,
  [RuleId.EndOfTurnDiscard]: TemporaryHeader,
  [RuleId.EndOfTurn]: TemporaryHeader
}
