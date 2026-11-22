/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { LocationType } from '@gamepark/djeser/material/LocationType'
import { MaterialType } from '@gamepark/djeser/material/MaterialType'
import { PYRAMID_LEVELS } from '@gamepark/djeser/material/Pyramid'
import { getStoneColor, getStoneValue, StoneCard } from '@gamepark/djeser/material/StoneCard'
import { GameState } from '@gamepark/djeser/rules/GameState'
import { linkButtonCss, MaterialLogProps, usePlay, usePlayerName } from '@gamepark/react-game'
import { MaterialMoveBuilder, MoveItem } from '@gamepark/rules-api'
import { Trans, useTranslation } from 'react-i18next'
import { stoneImages } from '../images/Images'

type Props = MaterialLogProps<MoveItem<number, MaterialType, LocationType>>

/** The Stone card that moves, as it was before the move, with its id when the move reveals it (a card leaving a hand). */
const movedStone = ({ move, context }: Props) => {
  const item = context.game.items[MaterialType.StoneCard]![move.itemIndex]
  const id = (move.reveal?.id ?? item.id) as StoneCard | undefined
  return { item, id }
}

/** The player whose turn it is, by name. */
const useActivePlayer = ({ context }: Props) => usePlayerName(context.game.rule?.player)

/** "{player} collects the blue 7 from the Nile (2 AP)" */
export const CollectLog = (props: Props) => {
  const player = useActivePlayer(props)
  const { item, id } = movedStone(props)
  const cost = new GameState(props.context.game).nileCost(item.location.x!)
  return <Trans i18nKey="log.collect" values={{ player, cost }} components={{ card: <StoneName id={id} /> }} />
}

/** The card drawn from the quarry stays hidden to the other players: it is not named. */
export const DrawLog = (props: Props) => {
  const player = useActivePlayer(props)
  return <Trans i18nKey="log.draw" values={{ player }} />
}

/** "{player} places the blue 7 at level II of their pyramid (2 AP)", and the last round when it completes the pyramid. */
export const PlaceLog = (props: Props) => {
  const player = useActivePlayer(props)
  const { id } = movedStone(props)
  const level = props.move.location.y! + 1
  const lastRound = level === PYRAMID_LEVELS && props.context.game.players.length > 1
  return (
    <>
      <Trans i18nKey="log.place" values={{ player, level, cost: level }} components={{ card: <StoneName id={id} /> }} />
      {lastRound && (
        <>
          {' '}
          <Trans i18nKey="log.last-round" values={{ player }} />
        </>
      )}
    </>
  )
}

/** "{player} discards the blue 7 from their hand into the cursed discard pile of values (1 AP)" */
export const DiscardLog = (props: Props) => {
  const player = useActivePlayer(props)
  const { item, id } = movedStone(props)
  const fromPyramid = item.location.type === LocationType.Pyramid
  const cost = fromPyramid ? item.location.y! + 2 : 1
  return (
    <Trans
      i18nKey={fromPyramid ? 'log.discard.pyramid' : 'log.discard.hand'}
      values={{ player, cost, curse: props.move.location.id }}
      components={{ card: <StoneName id={id} /> }}
    />
  )
}

/** The card closest to the cursed discards, discarded at the end of a turn without a card collected from the Nile. */
export const NileDiscardLog = (props: Props) => {
  const player = useActivePlayer(props)
  const { id } = movedStone(props)
  return <Trans i18nKey="log.discard.nile" values={{ player, curse: props.move.location.id }} components={{ card: <StoneName id={id} /> }} />
}

/** Solo: Imhotep takes the card closest to the cursed discards for his pyramid. */
export const ImhotepLog = (props: Props) => {
  const { id } = movedStone(props)
  return <Trans i18nKey="log.imhotep" values={{ level: props.move.location.y! + 1 }} components={{ card: <StoneName id={id} /> }} />
}

export const QuarryRefillLog = () => <Trans i18nKey="log.quarry.refill" />

/** A Stone card named in an entry: its picture and its name, clicked to open its help. */
const StoneName = ({ id }: { id?: StoneCard }) => {
  const { t } = useTranslation()
  const play = usePlay()
  if (id === undefined) return null
  return (
    <button css={[linkButtonCss, nameCss]} onClick={() => play(MaterialMoveBuilder.displayMaterialHelp(MaterialType.StoneCard, { id }), { transient: true })}>
      <img src={stoneImages[id]} alt="" css={pictureCss} />
      {t('log.stone', { color: getStoneColor(id), value: getStoneValue(id) })}
    </button>
  )
}

const nameCss = css`
  background: none;
  font: inherit;
  font-weight: bold;
  color: inherit;
  padding: 0;
`

const pictureCss = css`
  height: 1.2em;
  width: auto;
  vertical-align: -0.25em;
  margin-right: 0.2em;
  border-radius: 0.1em;
`
