import { MaterialGameSetup } from '@gamepark/rules-api'
import { DjeserOptions } from './DjeserOptions'
import { DjeserRules } from './DjeserRules'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { PlayerColor } from './PlayerColor'
import { RuleId } from './rules/RuleId'

/**
 * This class creates a new Game based on the game options
 */
export class DjeserSetup extends MaterialGameSetup<PlayerColor, MaterialType, LocationType, DjeserOptions> {
  Rules = DjeserRules

  setupMaterial(_options: DjeserOptions) {
    // TODO
  }

  start() {
    this.startPlayerTurn(RuleId.TheFirstStep, this.players[0])
  }
}
