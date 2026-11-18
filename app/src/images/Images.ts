import { CommonObjective, commonObjectives, getCommonObjectiveType } from '@gamepark/djeser/material/CommonObjective'
import { CurseType } from '@gamepark/djeser/material/CurseType'
import { NileCard } from '@gamepark/djeser/material/NileCard'
import { StoneCard, stoneCard, StoneColor } from '@gamepark/djeser/material/StoneCard'
import FirstPlayerCard from './cards/first-player.webp'
import CurseColors from './cards/curses/curse-colors.webp'
import CurseValues from './cards/curses/curse-values.webp'
import Nile1 from './cards/nile/nile-1.webp'
import Nile2 from './cards/nile/nile-2.webp'
import Nile3 from './cards/nile/nile-3.webp'
import StoneBack from './cards/stones/back.webp'

export { FirstPlayerCard, StoneBack }

type Files = Record<string, string>
const glob = (files: Files) => (name: string) => {
  const url = Object.entries(files).find(([path]) => path.endsWith(`/${name}.webp`))?.[1]
  if (!url) throw new Error(`Missing image ${name}`)
  return url
}

const stoneFile = glob(import.meta.glob<string>('./cards/stones/*.webp', { eager: true, import: 'default' }))
const objectiveFile = glob(import.meta.glob<string>('./cards/objectives/*.webp', { eager: true, import: 'default' }))

const colorNames: Record<StoneColor, string> = {
  [StoneColor.Blue]: 'blue',
  [StoneColor.Yellow]: 'yellow',
  [StoneColor.Purple]: 'purple',
  [StoneColor.Red]: 'red',
  [StoneColor.Green]: 'green'
}

/** `cards/stones/<color>-<value>.webp` */
export const stoneImages = Object.fromEntries(
  Object.entries(colorNames).flatMap(([color, name]) =>
    Array.from({ length: 10 }, (_, value) => [stoneCard(Number(color), value), stoneFile(`${name}-${value}`)])
  )
) as Record<StoneCard, string>

export const nileImages: Record<NileCard, string> = { 1: Nile1, 2: Nile2, 3: Nile3 }

export const curseImages: Record<CurseType, string> = {
  [CurseType.Value]: CurseValues,
  [CurseType.Color]: CurseColors
}

/** `cards/objectives/objective-<n>.webp`, numbered like the enum */
export const objectiveImages = Object.fromEntries(commonObjectives.map((objective) => [objective, objectiveFile(`objective-${objective}`)])) as Record<
  CommonObjective,
  string
>

/** The back of a Common Objective card shows its type: `cards/objectives/back-type-<t>.webp` */
export const objectiveBackImages = Object.fromEntries(
  commonObjectives.map((objective) => [objective, objectiveFile(`back-type-${getCommonObjectiveType(objective)}`)])
) as Record<CommonObjective, string>
