import { css } from '@emotion/react'
import { useTranslation } from 'react-i18next'
import { cardHeight } from '../locators/TableLayout'

const fontSize = 0.5

type Props = { place: boolean; discard: boolean; cursed: boolean }

/**
 * Shown under a card of the hand selected with a click: the player then clicks a slot of their pyramid or a cursed discard pile.
 * A cursed card says first why it cannot be placed.
 */
export const ChooseDestinationLabel = ({ place, discard, cursed }: Props) => {
  const { t } = useTranslation()
  const key = place && discard ? 'card.choose-slot-or-discard' : place ? 'card.choose-slot' : 'card.choose-discard'
  return (
    <div css={label}>
      {cursed && <div>{t('card.cursed')}</div>}
      <div>{t(key)}</div>
    </div>
  )
}

const label = css`
  position: absolute;
  /* The menu is anchored at the centre of the card: the label goes just under it */
  left: 0;
  top: ${(cardHeight / 2 + 0.2) / fontSize}em;
  transform: translateX(-50%);
  padding: 0.2em 0.5em;
  border-radius: 0.4em;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: ${fontSize}em;
  white-space: nowrap;
  text-align: center;
  pointer-events: none;
`
