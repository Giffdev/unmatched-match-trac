# Catalog source notes

Verified on **2026-10-22**. Catalog records live in `src/lib/data.ts`.

## Yukon 1900

- [The user's linked map page](https://www.the-unmatched.club/maps/yukon-1900)
  identifies the map as **Yukon 1900**, not Yukon 1910. Its rendered map details
  report **2 players**, **7 zones**, and **31 spaces**. These are the source of
  the new record's name and numeric fields.
- [Mint Singles' neoprene battlefield listing](https://www.mintsingles.com/product/unmatched-neoprene-battle-maps-sherwood-t-wrecks/)
  identifies the double-sided **Sherwood Forest / Yukon 1900** neoprene mat,
  describes these as two-player battlefields, and distinguishes Yukon as having
  a “new twist” relative to the vaulted Robin Hood / Bigfoot battlefields.
  This establishes a separate accessory variant, not a rename of the original
  board. No unsupported terrain rules or exact connection changes are claimed.
- `Neoprene Battlefields: Sherwood Forest / Yukon 1900` is the app's collection
  label for that accessory, not a new hero set. Only the newly requested Yukon
  variant is added; the unchanged Sherwood Forest map is not duplicated.

The additive ID is `yukon-1900`. The existing `yukon` record, image, and
`Robin Hood vs Bigfoot` collection link are unchanged. Owning the original set
does **not** automatically mark the accessory as owned. Both maps remain
available for two-player match selection and unrestricted randomization; the
accessory's own collection checkbox controls collection-only randomization.
There are no saved-match or owned-set migrations.

### Image research

No new artwork was downloaded or committed, and the original Yukon's image is
not reused for the variant. The Club page has a variant image, but no reuse
permission was established. The [publisher's current battlefield mat listing](https://restorationgames.com/shop/unmatched-battlefield-mat/)
did not expose a Yukon 1900 image; the retailer above shows a combined
multi-battlefield product image rather than a suitable standalone map.
The [publisher's BackerKit accessory campaign](https://www.backerkit.com/c/projects/restoration-games/unmatched-storage-and-accessories)
was access-blocked during verification. Consequently `imageUrl` is omitted
rather than substituting unrelated, unlicensed, or original-Yukon artwork.
The existing map-image dialog supports this with “No image available.”

## Unmatched: Hellboy — deliberately not added

The [publisher's official product page](https://restorationgames.com/shop/unmatched-hellboy/)
confirms the official set and these four heroes:

| Hero | Required gameplay evidence still missing |
| --- | --- |
| Hellboy | Starting health, movement, verified attack type, ability, sidekick presence/details |
| Abe Sapien | Starting health, movement, verified attack type, ability, sidekick presence/details |
| Liz Sherman | Starting health, movement, verified attack type, ability, sidekick presence/details |
| Baba Yaga | Starting health, movement, verified attack type, ability, sidekick presence/details |

The publisher's page establishes identities, not those gameplay fields. The
Club's [set page](https://www.the-unmatched.club/sets/hellboy) and individual
[Hellboy](https://www.the-unmatched.club/heroes/hellboy),
[Abe Sapien](https://www.the-unmatched.club/heroes/abe-sapien),
[Liz Sherman](https://www.the-unmatched.club/heroes/liz-sherman), and
[Baba Yaga](https://www.the-unmatched.club/heroes/baba-yaga) pages displayed
missing health/movement and abilities, with no cards available. Their public
page data contains zero health/movement and unnamed sidekick placeholders;
the displayed “Melee” values are therefore not sufficient gameplay evidence.
The Club's release notice is also stale relative to this verification date.

[UmDb's official-deck catalog](https://unmatched.cards/umdb/decks) had no
Hellboy-set records. A [BGG rulebook listing](https://boardgamegeek.com/filepage/331568/unmatched-hellboy-set-rulebook)
was found but access-blocked, so its contents could not be verified. Fan-made
Hellboy decks and search-result summaries are not evidence for official stats.

**All four hero records and the empty Hellboy collection entry are omitted.**
This is a source-evidence limitation, not a claim that the set is unreleased.
Add heroes only after official character cards/rules or a trustworthy complete
transcription establishes their gameplay details; do not insert zeros,
invent abilities, or infer that missing sidekick data means no sidekicks.
