import { getEnumValues } from '@gamepark/rules-api'

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
