# Card database and duel logic audit (2026-10-16)

## Fixes in this pass
- Fixed the CPU battle resolver to respect `indestructibleByBattle` for defense battles, attack battles, and equal-ATK battles. This covers Marshmallon when attacked by CPU-controlled monsters as well as other battle-protected monsters.
- Implemented the Prank-Kids Dropsies Graveyard effect in the simulator: gain 1000 LP and Special Summon the first legal Prank-Kids monster found in hand (otherwise Deck) to an open Monster Zone in Defense Position. This is an automatic-selection simplification because the current UI does not provide a card-choice prompt for this trigger.
- Kept card artwork URLs derived from each card's passcode and the existing fallback from full card image to cropped artwork.

## Important limitation
The database is a hand-maintained subset, and this application is a custom simulator rather than a full official Yu-Gi-Oh! rules engine. These changes do not verify every card's official metadata or implement every effect with tournament-accurate timing, chain handling, target selection, costs, and restrictions. The YGOPRODeck API guide documents the card data fields and image URLs used as a reference: https://ygoprodeck.com/api-guide/ . Images are loaded from the remote image host, so an image host/network failure can still prevent artwork from appearing.
