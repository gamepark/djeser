/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import {
  FailuresDialog,
  FullscreenDialog,
  LiveLogContainer,
  LoadingScreen,
  MaterialGameSounds,
  MaterialHeader,
  MaterialImageLoader,
  Menu,
  useGame
} from '@gamepark/react-game'
import { MaterialGame } from '@gamepark/rules-api'
import { useEffect, useState } from 'react'
import { GameDisplay } from './GameDisplay'
import { Headers } from './headers/Headers'

export function App() {
  const game = useGame<MaterialGame>()
  const [isJustDisplayed, setJustDisplayed] = useState(true)
  const [isImagesLoading, setImagesLoading] = useState(true)
  useEffect(() => {
    setTimeout(() => setJustDisplayed(false), process.env.NODE_ENV === 'development' ? 0 : 2000)
  }, [])
  const loading = !game || isJustDisplayed || isImagesLoading
  return (
    <>
      {!!game && <GameDisplay />}
      <LoadingScreen display={loading} />
      <MaterialHeader rulesStepsHeaders={Headers} loading={loading} />
      {!loading && <LiveLogContainer css={liveLogCss} />}
      <MaterialImageLoader onImagesLoad={() => setImagesLoading(false)} />
      <MaterialGameSounds />
      <Menu resultDialogDelay={3000} />
      <FailuresDialog />
      <FullscreenDialog />
    </>
  )
}

/** The last moves, in the empty corner under the cursed discards: they fade away, and never catch a click meant for the table. */
const liveLogCss = css`
  position: absolute;
  bottom: 1em;
  left: 4em;
  width: 30em;
  pointer-events: none;
`
