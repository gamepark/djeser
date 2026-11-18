import { css } from '@emotion/react'
import { useTranslation } from 'react-i18next'

export const ImhotepName = () => {
  const { t } = useTranslation()
  return <div css={nameCss}>{t('imhotep')}</div>
}

const nameCss = css`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.4em;
  font-weight: bold;
  letter-spacing: 0.05em;
  text-shadow: 0 0 0.2em black, 0 0 0.4em black;
`
