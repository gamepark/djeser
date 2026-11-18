import { getEnumValues } from '@gamepark/rules-api'
import { objectiveConditions, PyramidCard } from './Pyramid'
import { StoneColor } from './StoneCard'

/** The 18 Common Objective cards, in the order of the rulebook (pages 14 to 16). */
export enum CommonObjective {
  // Type 1: values
  SumLevelII9 = 1,
  MoreOddThanEven,
  SumLevelI14,
  SumLevelI13,
  OnlyEvenLevelII,
  OnlyOddLevelII,
  AsManyEvenAsOdd,
  OnlyOddLevelI,
  OnlyEvenLevelI,
  // Type 2: colors
  ExactlyFourColors,
  ExactlyFiveColors,
  OneColorLevelI,
  OneColorLevelII,
  AtMostThreeColors,
  // Type 3: combinations
  GreenLevelsIAndII,
  BlueLevelIRedLevelII,
  TwoYellow,
  TwoSameValue
}

export const commonObjectives = getEnumValues(CommonObjective)

/** The type of a Common Objective card: 1, 2 or 3 pyramids on its back. */
export type CommonObjectiveType = 1 | 2 | 3

export const commonObjectiveTypes: CommonObjectiveType[] = [1, 2, 3]

export const getCommonObjectiveType = (objective: CommonObjective): CommonObjectiveType =>
  objective <= CommonObjective.OnlyEvenLevelI ? 1 : objective <= CommonObjective.AtMostThreeColors ? 2 : 3

/** Whether the cards of a pyramid fulfil the condition of a Common Objective card (rulebook pages 14 to 16). */
export const isCommonObjectiveMet = (objective: CommonObjective, cards: PyramidCard[]): boolean => {
  const c = objectiveConditions
  switch (objective) {
    case CommonObjective.SumLevelII9:
      return c.sumOfLevel(cards, 1, 9)
    case CommonObjective.MoreOddThanEven:
      return c.moreOddThanEven(cards)
    case CommonObjective.SumLevelI14:
      return c.sumOfLevel(cards, 0, 14)
    case CommonObjective.SumLevelI13:
      return c.sumOfLevel(cards, 0, 13)
    case CommonObjective.OnlyEvenLevelII:
      return c.onlyParity(cards, 1, true)
    case CommonObjective.OnlyOddLevelII:
      return c.onlyParity(cards, 1, false)
    case CommonObjective.AsManyEvenAsOdd:
      return c.asManyEvenAsOdd(cards)
    case CommonObjective.OnlyOddLevelI:
      return c.onlyParity(cards, 0, false)
    case CommonObjective.OnlyEvenLevelI:
      return c.onlyParity(cards, 0, true)
    case CommonObjective.ExactlyFourColors:
      return c.colors(cards) === 4
    case CommonObjective.ExactlyFiveColors:
      return c.colors(cards) === 5
    case CommonObjective.OneColorLevelI:
      return c.oneColorOnLevel(cards, 0)
    case CommonObjective.OneColorLevelII:
      return c.oneColorOnLevel(cards, 1)
    case CommonObjective.AtMostThreeColors:
      return cards.length > 0 && c.colors(cards) <= 3
    case CommonObjective.GreenLevelsIAndII:
      return c.colorsOnLevels(cards, StoneColor.Green, StoneColor.Green)
    case CommonObjective.BlueLevelIRedLevelII:
      return c.colorsOnLevels(cards, StoneColor.Blue, StoneColor.Red)
    case CommonObjective.TwoYellow:
      return c.countOfColor(cards, StoneColor.Yellow) >= 2
    case CommonObjective.TwoSameValue:
      return c.sameValue(cards)
  }
}
