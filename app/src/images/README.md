# Images

All card images are cut from the publisher's print sheets by `scripts/cut-cards.mjs`.
Re-run it rather than editing a card by hand, so every card keeps the same framing.

## Sources (publisher folder `misc/sources`, not in this repo)

| Sheet | Content |
|-------|---------|
| `Djeser-50pcs Cards-front.jpg` | the 50 Stone card faces (8 × 7 grid) |
| `Djeser-50pcs Cards-back.jpg` | the Stone card back |
| `Djeser-32pcs Cards-front.jpg` | the 32 other cards: left half fronts, right half backs (mirrored) |

## Recipe

- Sheets at 261 dpi. Grid origin (116, 116), cell 934.75 × 677.9 px (50-card sheet) or 934.5 × 677.9 px
  (32-card sheet).
- The printed card is 903 × 646 px at +16 px in its cell, with the printer's red die line on its outer
  4 px. We crop 889 × 636 px at (+23, +21) to leave the die line out, then resize to **880 × 630 px**
  (88 × 63 mm at 100 px/cm).
- Lossless WebP, opaque. The cards have rounded corners: what is left of the die line in the corners is
  hidden by the card's border radius (about 3 mm) in `Material.ts`.
- Portrait cards (objectives, cursed discards) are printed lying down: faces are rotated 90°
  counter-clockwise, backs 90° clockwise.

## Layout

| Folder / file | Content |
|---------------|---------|
| `cards/stones/<color>-<value>.webp` | 50 Stone cards, colors `blue`, `yellow`, `purple`, `red`, `green`, values 0–9 (landscape) |
| `cards/stones/back.webp` | Stone card back (landscape, same orientation as the faces) |
| `cards/objectives/objective-<n>.webp` | 18 Common Objective cards, numbered in rulebook order (pages 14–16): 1–9 type 1, 10–14 type 2, 15–18 type 3 (portrait) |
| `cards/objectives/back-type-<t>.webp` | Common Objective backs, 1, 2 or 3 pyramids (portrait) |
| `cards/curses/curse-values.webp`, `curse-colors.webp` | the two cursed discard cards (portrait) |
| `cards/nile/nile-<n>.webp` | Nile cards, `n` = cost in action points = blocks on the boat (landscape) |
| `cards/first-player.webp` | First player card (landscape) |

Objective numbers:

| n | Condition | n | Condition |
|---|-----------|---|-----------|
| 1 | Sum of level II = 9 | 10 | Exactly 4 colors |
| 2 | More odd values than even values | 11 | Exactly 5 colors |
| 3 | Sum of level I = 14 | 12 | A single color on level I |
| 4 | Sum of level I = 13 | 13 | A single color on level II |
| 5 | Only even values on level II | 14 | At most 3 colors |
| 6 | Only odd values on level II | 15 | A green card on level I and on level II |
| 7 | As many even values as odd values | 16 | A blue card on level I and a red card on level II |
| 8 | Only odd values on level I | 17 | At least 2 yellow cards |
| 9 | Only even values on level I | 18 | At least 2 cards of the same value |

Not cut: the 4 double-sided player aid cards (row 8 of the 32-card sheet), replaced by the help dialogs.
