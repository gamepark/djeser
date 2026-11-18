import { RuleId } from '@gamepark/djeser/rules/RuleId'
import { useRules } from '@gamepark/react-game'
import { MaterialRules } from '@gamepark/rules-api'

/** Shows the id of the rule until the real headers are written (step 7 of the adaptation). */
export const TemporaryHeader = () => {
  const rules = useRules<MaterialRules>()
  const ruleId = rules?.game.rule?.id
  return <>{ruleId !== undefined ? RuleId[ruleId] : ''}</>
}
