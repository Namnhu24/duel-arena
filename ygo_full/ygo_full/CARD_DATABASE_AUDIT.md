# Card database audit (2026-10-16)

## Corrections in this pass
- Corrected the card passcodes used by the artwork URLs for Dragon Ravine (62265044), Yami (59197169), Mystic Mine (76375976), and Prank-Kids Rocket Ride (18514525).
- Updated the displayed text for Dragon Ravine, Yami, Mountain, and Mystic Mine to match the real card descriptions rather than inaccurate stat boosts or flavor text.
- Checked all 50 entries in `src/data/cardDatabase.ts`: every `art: cardArt(...)` value now matches the card's `id`, and no duplicate IDs were found.

## Important limitation
The project is a custom simulator, not a full official rules engine. This pass fixes verified metadata/artwork-ID mismatches and several inaccurate descriptions, but it does not claim that every card effect in the entire database is implemented to official tournament rules. In particular, effects that require timing windows, chains, target selection, banishing, or continuous field-wide restrictions need engine-level implementation and duel testing.
