import {
  FillGapStrategy,
  hideItemId,
  hideItemIdToOthers,
  MaterialGame,
  MaterialMove,
  PositiveSequenceStrategy,
  SecretMaterialRules,
  TimeLimit
} from '@gamepark/rules-api'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { RuleId } from './rules/RuleId'
import { TheFirstStepRule } from './rules/TheFirstStepRule'

/**
 * This class implements the rules of the board game.
 * It must follow Game Park "Rules" API so that the Game Park server can enforce the rules.
 */
export class DjeserRules
  extends SecretMaterialRules<number, MaterialType, LocationType, RuleId>
  implements TimeLimit<MaterialGame<number, MaterialType, LocationType, RuleId>, MaterialMove<number, MaterialType, LocationType, RuleId>, number>
{
  rules = {
    [RuleId.TheFirstStep]: TheFirstStepRule
  }

  locationsStrategies = {
    [MaterialType.StoneCard]: {
      [LocationType.Quarry]: new PositiveSequenceStrategy(),
      // A Stone card collected from the Nile leaves a gap until the end of the turn
      [LocationType.Nile]: new FillGapStrategy(),
      [LocationType.CursedDiscard]: new PositiveSequenceStrategy(),
      [LocationType.PlayerHand]: new PositiveSequenceStrategy()
    },
    [MaterialType.NileCard]: {
      [LocationType.NileCardLine]: new PositiveSequenceStrategy()
    },
    [MaterialType.CommonObjectiveCard]: {
      [LocationType.CommonObjectives]: new PositiveSequenceStrategy()
    }
  }

  /** The quarry is face down, and each player's hand is hidden from the others. */
  hidingStrategies = {
    [MaterialType.StoneCard]: {
      [LocationType.Quarry]: hideItemId,
      [LocationType.PlayerHand]: hideItemIdToOthers
    }
  }

  giveTime(): number {
    return 60
  }
}
