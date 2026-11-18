import { CurseType } from '@gamepark/djeser/material/CurseType'
import { LocationType } from '@gamepark/djeser/material/LocationType'
import { MaterialType } from '@gamepark/djeser/material/MaterialType'
import { CustomMoveType } from '@gamepark/djeser/rules/CustomMoveType'
import { MaterialTutorial, TutorialStep } from '@gamepark/react-game'
import { isCustomMoveType, isMoveItemType, MaterialGame, MaterialMove, MoveItem } from '@gamepark/rules-api'
import { Trans } from 'react-i18next'
import { blue1, green2, green5, me, opponent, purple2, red4, TutorialSetup, yellow3 } from './TutorialSetup'

type Game = MaterialGame<number, MaterialType, LocationType>
type Move = MaterialMove<number, MaterialType, LocationType>

const components = { bold: <strong />, italic: <em /> }
const text = (key: string) => () => <Trans i18nKey={key} components={components} />

/** Around what is focused, so that the table does not zoom in too much and the popup has room. */
const margin = { top: 9, bottom: 14, left: 8, right: 8 }
const pyramidMargin = { top: 12, bottom: 2, left: 4, right: 4 }

const endTurn = isCustomMoveType(CustomMoveType.EndTurn)

/**
 * The script validated with Ludo (script-tuto.txt): 2 players, the player against Laurent, the author.
 * Turn 1 collects and places a card and shows the curses, Laurent draws from the quarry and must discard the first card of the Nile,
 * turn 2 collects 2 cards, turn 3 completes level I and explains level II, then the player finishes the game against the bot.
 */
export class Tutorial extends MaterialTutorial<number, MaterialType, LocationType> {
  version = 1
  options = { players: 2, commonObjectives: true }
  setup = new TutorialSetup()

  players = [
    { id: me },
    {
      id: opponent,
      name: 'Laurent',
      avatar: {
        topType: 'ShortHairShortWaved',
        hairColor: 'BrownDark',
        facialHairType: 'BeardMedium',
        facialHairColor: 'BrownDark',
        accessoriesType: 'Prescription02',
        clotheType: 'ShirtCrewNeck',
        clotheColor: 'Gray02',
        eyeType: 'Happy',
        eyebrowType: 'DefaultNatural',
        mouthType: 'Smile',
        skinColor: 'Light'
      }
    }
  ]

  private stone = (game: Game, id: number) => this.material(game, MaterialType.StoneCard).id(id)
  private nile = (game: Game) => this.material(game, MaterialType.StoneCard).location(LocationType.Nile)
  private quarry = (game: Game) => this.material(game, MaterialType.StoneCard).location(LocationType.Quarry)
  private pyramid = (game: Game) => this.material(game, MaterialType.StoneCard).location(LocationType.Pyramid).player(me)
  private hand = (game: Game) => this.material(game, MaterialType.StoneCard).location(LocationType.PlayerHand).player(me)
  private levelI = [0, 1, 2].map((x) => ({ type: LocationType.Pyramid, player: me, x, y: 0 }))

  /** The Stone card `id` is moved to the location type, by the active player. */
  private moveStone(id: number, type: LocationType, more: (move: MoveItem<number, MaterialType, LocationType>) => boolean = () => true) {
    return (move: Move, game: Game) =>
      isMoveItemType(MaterialType.StoneCard)(move) &&
      move.location.type === type &&
      this.material(game, MaterialType.StoneCard).getItem(move.itemIndex).id === id &&
      more(move)
  }

  private drawFromQuarry = (move: Move, game: Game) =>
    isMoveItemType(MaterialType.StoneCard)(move) && this.material(game, MaterialType.StoneCard).getItem(move.itemIndex).location.type === LocationType.Quarry

  steps: TutorialStep<number, MaterialType, LocationType>[] = [
    { popup: { text: text('tuto.welcome') } },
    { popup: { text: text('tuto.theme') } },
    {
      popup: { text: text('tuto.goal'), position: { y: 25 } },
      focus: () => ({ locations: this.levelI, margin: pyramidMargin })
    },
    {
      popup: { text: text('tuto.stones'), position: { y: 20 } },
      focus: (game) => ({ materials: [this.nile(game)], margin })
    },
    {
      popup: { text: text('tuto.quarry'), position: { y: 20 } },
      focus: (game) => ({ materials: [this.quarry(game), this.material(game, MaterialType.NileCard)], margin })
    },
    { popup: { text: text('tuto.actions') } },
    {
      popup: { text: text('tuto.collect.cost'), position: { y: 20 } },
      focus: (game) => ({ materials: [this.material(game, MaterialType.NileCard)], margin })
    },
    {
      popup: { text: text('tuto.collect.yellow3'), position: { y: 20 } },
      focus: (game) => ({ materials: [this.stone(game, yellow3)], margin }),
      move: { filter: this.moveStone(yellow3, LocationType.PlayerHand) }
    },
    {
      popup: { text: text('tuto.place.yellow3'), position: { y: 25 } },
      focus: (game) => ({ materials: [this.stone(game, yellow3)], locations: this.levelI, margin: pyramidMargin }),
      move: { filter: this.moveStone(yellow3, LocationType.Pyramid, (move) => move.location.y === 0) }
    },
    {
      popup: { text: text('tuto.green5'), position: { y: 20 } },
      focus: (game) => ({ materials: [this.stone(game, green5), this.material(game, MaterialType.NileCard).location((l) => l.x === 1)], margin })
    },
    {
      popup: { text: text('tuto.curses'), position: { y: 20 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.CursedDiscardCard), this.material(game, MaterialType.StoneCard).location(LocationType.CursedDiscard)],
        margin
      })
    },
    {
      popup: { text: text('tuto.cursed'), position: { y: 20 } },
      focus: (game) => ({ materials: [this.stone(game, purple2), this.stone(game, red4)], margin })
    },
    { popup: { text: text('tuto.end-turn') }, move: { filter: endTurn } },
    {
      popup: { text: text('tuto.nile-fill'), position: { y: 20 } },
      focus: (game) => ({ materials: [this.nile(game)], margin })
    },
    { popup: { text: text('tuto.laurent.draw') } },
    { move: { player: opponent, filter: this.drawFromQuarry } },
    { move: { player: opponent, filter: endTurn } },
    {
      popup: { text: text('tuto.laurent.discard'), position: { y: 20 } },
      focus: (game) => ({ materials: [this.stone(game, green5), this.material(game, MaterialType.CursedDiscardCard)], margin })
    },
    { move: { player: opponent, filter: this.moveStone(green5, LocationType.CursedDiscard, (move) => move.location.id === CurseType.Value) } },
    {
      popup: { text: text('tuto.collect.two'), position: { y: 20 } },
      focus: (game) => ({ materials: [this.stone(game, green2), this.stone(game, blue1)], margin }),
      move: { filter: this.moveStone(green2, LocationType.PlayerHand) }
    },
    {
      popup: { text: text('tuto.collect.two'), position: { y: 20 } },
      focus: (game) => ({ materials: [this.stone(game, blue1)], margin }),
      move: { filter: this.moveStone(blue1, LocationType.PlayerHand) }
    },
    { popup: { text: text('tuto.end-turn.2') }, move: { filter: endTurn } },
    // Laurent's second turn: a draw from the quarry, then the purple 2 is discarded in the colors pile, which leaves the curses as they are
    { move: { player: opponent, filter: this.drawFromQuarry } },
    { move: { player: opponent, filter: endTurn } },
    { move: { player: opponent, filter: this.moveStone(purple2, LocationType.CursedDiscard, (move) => move.location.id === CurseType.Color) } },
    {
      popup: { text: text('tuto.place.two'), position: { y: 25 } },
      focus: (game) => ({ materials: [this.pyramid(game), this.hand(game)], locations: this.levelI, margin: pyramidMargin }),
      move: { filter: this.moveStone(green2, LocationType.Pyramid, (move) => move.location.y === 0) }
    },
    {
      popup: { text: text('tuto.place.two'), position: { y: 25 } },
      focus: (game) => ({ materials: [this.pyramid(game), this.hand(game)], locations: this.levelI, margin: pyramidMargin }),
      move: { filter: this.moveStone(blue1, LocationType.Pyramid, (move) => move.location.y === 0) }
    },
    {
      popup: { text: text('tuto.level2'), position: { y: 25 } },
      focus: (game) => ({ materials: [this.pyramid(game)], margin: pyramidMargin })
    },
    { popup: { text: text('tuto.level2.example') } },
    { popup: { text: text('tuto.end-turn.3') }, move: { filter: endTurn } },
    {
      popup: { text: text('tuto.end-discard'), position: { y: 20 } },
      focus: (game) => ({ materials: [this.nile(game).minBy((item) => item.location.x!), this.material(game, MaterialType.CursedDiscardCard)], margin }),
      move: {}
    },
    {
      popup: { text: text('tuto.discard'), position: { y: 25 } },
      focus: (game) => ({ materials: [this.pyramid(game)], margin: pyramidMargin })
    },
    {
      popup: { text: text('tuto.objectives'), position: { y: 20 } },
      focus: (game) => ({ materials: [this.material(game, MaterialType.CommonObjectiveCard)], margin })
    },
    { popup: { text: text('tuto.end') } },
    { popup: { text: text('tuto.scoring') } },
    { popup: { text: text('tuto.go') } }
  ]
}
