import {
  CompetitiveScore,
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
import { pyramidValue } from './material/Pyramid'
import { EndOfTurnDiscardRule } from './rules/EndOfTurnDiscardRule'
import { EndOfTurnRule } from './rules/EndOfTurnRule'
import { GameState } from './rules/GameState'
import { PlayerTurnRule } from './rules/PlayerTurnRule'
import { RuleId } from './rules/RuleId'

type Game = MaterialGame<number, MaterialType, LocationType, RuleId>
type Move = MaterialMove<number, MaterialType, LocationType, RuleId>

/**
 * This class implements the rules of the board game.
 * It must follow Game Park "Rules" API so that the Game Park server can enforce the rules.
 */
export class DjeserRules
  extends SecretMaterialRules<number, MaterialType, LocationType, RuleId>
  implements TimeLimit<Game, Move, number>, CompetitiveScore<Game, Move, number>
{
  rules = {
    [RuleId.PlayerTurn]: PlayerTurnRule,
    [RuleId.EndOfTurnDiscard]: EndOfTurnDiscardRule,
    [RuleId.EndOfTurn]: EndOfTurnRule
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

  /** The main decision of a turn, then about 10 seconds to choose a cursed discard pile at the end of the turn. */
  giveTime(): number {
    return this.game.rule?.id === RuleId.EndOfTurnDiscard ? 10 : 45
  }

  /**
   * The Prestige points. In solo, the player scores their points only if they win, 0 otherwise
   * (decision of the publisher, 18/11/2026).
   */
  getScore(player: number) {
    const state = new GameState(this.game)
    if (this.game.players.length === 1 && !state.isSoloWon(player)) return 0
    return state.playerScore(player)
  }

  /** "In case of a tie, the player with the highest sum of the values of their Stone cards wins": the cards of the pyramid only (decision H10). */
  getTieBreaker(tieBreaker: number, player: number) {
    if (tieBreaker !== 1) return undefined
    return pyramidValue(new GameState(this.game).pyramidCards(player))
  }
}
