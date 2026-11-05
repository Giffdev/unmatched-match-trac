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

### Image provenance

The image-only follow-up on **2026-10-22** adds
`src/assets/images/Yukon_1900.webp`, bundled using the existing map-image import
pattern. Source: [The Unmatched Club's published Yukon 1900 image](https://img.unmatched.club/maps/y2s7RNI0dMCdxd47wSHBZ.webp),
linked by the map page's public image metadata. It is **1337 × 742 pixels**
(423,724 bytes). The downloaded bytes are unchanged: no crop, retouching,
inpainting, upscaling, or edits to map spaces, connections, labels, or credits.
The image has no white arrow. Visual comparison against the user's reference
confirms the railroad artwork, zone layout, numbered starts, and Yukon label
of the correct variant, not the original Yukon.

The user supplied [this Reddit preview](https://preview.redd.it/yukon-1900-v0-su9bup2qo0lf1.jpeg?width=1080&crop=smart&auto=webp&s=b95c7e9b365ae8ae2f7dec0434b1d4292d6f13db)
and authorized it as a fallback. Its [original upload](https://i.redd.it/su9bup2qo0lf1.jpeg)
is 4052 × 2388 pixels but has the same white arrow overlapping the lower map
edge. The published clean Club image was chosen instead; the Reddit image
is not bundled. A bounded search did not identify a suitable clean standalone
manufacturer/retailer alternative (the retailer above uses a combined product
image). The selected source is publicly accessible, **not a claim of an open
license or explicit permission from the artwork's rights holder**; rights remain
with their respective owners.

Only `yukon-1900` references the new asset. The original `yukon` continues to
use its unchanged `Yukon.webp` asset.

## Unmatched: Hellboy — historical 2026-10-22 evidence gap

The following describes the initial omission, not the current catalog. The
separately reviewed metadata release subsequently added all four heroes and
both competitive maps. The artwork follow-up below leaves those verified
hero stats, sidekicks, IDs, ownership links, and classification unchanged.

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

### Hellboy artwork and board inspection — 2026-11-05

The user explicitly supplied these public image URLs for ingestion. They are
bundled unchanged in `src/assets/images/`, matching the current imports in
`src/lib/data.ts` (the `heroes/` and `maps/` subfolders are not the active
catalog convention). Public availability and the user's request are not an
open-license claim; artwork rights and printed credits remain with their owners.

All source paths below use the prefix
`https://yptpnirqgfmxphjvsdjz.supabase.co/storage/v1/object/public/`.

| Catalog entry | Source path | Local filename |
| --- | --- | --- |
| Hellboy | `heroes/card-covers/Wb_nEZD6OoYNLOM_WJ1iY.webp` | `Hellboy.webp` |
| Abe Sapien | `heroes/card-covers/x8CYT3_seLwXQkp0RMYIF.webp` | `Abe_Sapien.webp` |
| Liz Sherman | `heroes/card-covers/7uiosJNm872H4_jlo0NmL.webp` | `Liz_Sherman.webp` |
| Baba Yaga | `heroes/card-covers/ps2imoKmDk-7cqiDhtR0R.webp` | `Baba_Yaga.webp` |
| B.P.R.D. HQ | `maps/wtRlpRTNKejW48QZA7cYe.webp` | `BPRD_HQ.webp` |
| Pandemonium | `maps/uPBhswD6t81rJ3so8_kxp.webp` | `Pandemonium.webp` |

Hero identities were matched against each linked hero page's `cardBackImage`
metadata and visually confirmed using the printed names and distinct red
horned face, aquatic face, flame silhouette, and witch/cemetery designs.
These are **illustrated card backs, not character-stat scans**. Each is
375 × 523 pixels. The full originals are retained; existing centered
`object-cover` hero portraits and square thumbnails crop them at render time.
No hero-specific image styling or UI redesign is introduced.

Both boards are 2006 × 1299 pixels. The downloaded originals preserve every
board edge, space, split-color circle, connection, label, and credit. The
existing map detail and enlarged map views preserve the intrinsic aspect
ratio; small popularity thumbnails continue using the existing square crop.
The low-resolution reference photo was not ingested.

Counts were verified visually on the full-resolution supplied boards, not
inferred from rooms or search summaries:

- **B.P.R.D. HQ: 9 zones, 32 spaces.** Zone colors/patterns are dark blue,
  pale gray, olive, green, brown, red, pink, ochre, and beige. The upper rooms
  contain 4 + 2 + 5 = 11 circles, the hallway band has 7, and the two lower
  bands have 7 each: 11 + 7 + 7 + 7 = 32. In particular, pale gray and brown
  occur in split circles and must not be omitted or counted as extra spaces.
- **Pandemonium: 8 zones, 32 spaces.** Colors/patterns are pale blue, purple,
  brown, beige, yellow, orange, slate blue, and red. A left-to-right inventory
  gives 7 pale-blue/purple left-edge circles, 6 upper brown/yellow circles,
  5 lower beige/split circles, 6 central slate/yellow/orange circles, and
  8 right-edge orange/red circles: 7 + 6 + 5 + 6 + 8 = 32. Split and
  three-color circles each count once as a space and belong to every
  represented color. Zigzag connections are not spaces or extra zones.

These observations support the previously unverified catalog totals; only
now are optional `zones` and `spaces` populated. No gameplay reference text,
terrain rules, or speculative ability text is added.
