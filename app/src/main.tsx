import { DjeserOptionsSpecV2 } from '@gamepark/djeser/DjeserOptions'
import { DjeserRules } from '@gamepark/djeser/DjeserRules'
import { DjeserSetup } from '@gamepark/djeser/DjeserSetup'
import { GameProvider } from '@gamepark/react-game'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { gameAnimations } from './animations/GameAnimations'
import { App } from './App'
import { Locators } from './locators/Locators'
import { Material } from './material/Material'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameProvider
      game="djeser"
      Rules={DjeserRules}
      optionsSpec={DjeserOptionsSpecV2}
      GameSetup={DjeserSetup}
      material={Material}
      locators={Locators}
      animations={gameAnimations}
    >
      <App />
    </GameProvider>
  </StrictMode>
)
