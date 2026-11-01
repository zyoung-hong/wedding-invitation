# Design QA — 2026-10-16

Source visual truth: user-provided `codex-clipboard-9b9e9cd3-1c7d-4ccf-8584-e5f87b41a223.png` (1224 × 1285, eight-screen presentation board).

Implementation evidence: `../wedding-main-mobile.png`, `../wedding-story-mobile.png`, `../wedding-info-mobile.png`; comparison board: workspace `work/qa/reference-and-implementation.jpg`. Browser viewport: 393 × 852 CSS px. Browser captures include the viewport scrollbar; source board is scaled for composition comparison, not treated as a pixel-perfect phone screenshot. Additional responsive check: 320 × 740 CSS px and default desktop viewport, content constrained to 480px.

## Scope and accepted differences

The user subsequently requested additional design elements and corrected the groom's spelling to JOHYUN, then supplied the venue 제이오스티엘 in Guro. This is an enriched adaptation of the source, rather than a pixel-identical clone. Eight main sections remain. All ten supplied JPEGs are copied unchanged (SHA-256 equality checked); faces and color are not edited. The source's separate roof, bouquet, sky and map images were not supplied, so original couple photographs are used instead. No fake map is rendered: actual map links open the verified venue address. The upload panel is an explicitly requested addition within the contact section. RSVP is absent.

## Findings and comparison history

1. [P2, fixed] Hero names inherited the original `h1 span` small caption size. Replaced with inherited display typography; post-fix mobile evidence shows JOHYUN and JIYOUNG readable on one line, including the 320px check.
2. [P2, fixed] Story folio labels ran together. Added a fixed gap and prevented label shrinking. Final story capture shows distinct CHAPTER 01 and OUR STORY labels.
3. [P2, fixed] Map caption implied an embedded map. Changed to a clear instruction to open a map app. Both map links and address-copy control are visible.
4. [P3, accepted] Supplied photographs differ from the concept board's framing. Preserve the actual photographs instead of attempting generated reconstruction. Full-image lightbox is available.

## Required fidelity surfaces

- Typography: Cormorant Garamond regular/italic display text, Noto Serif KR headings, Noto Sans KR controls. Large date numeral, italic chapter titles and small editorial captions are intentional enrichment. Main names and Korean text have no visible clipping in mobile captures.
- Layout rhythm: cream paper, fine rules, asymmetric overlapping photo mounts, restrained borders; sage gallery and warm date panel separate chapters. Mobile main photo and photo viewer remain within the viewport. Larger screens retain a centered invitation column.
- Colors: cream paper, burgundy display accents, muted sage gallery. Functional text remains dark; white main-photo lettering uses a dark translucent backdrop. Faint text during scroll entrance is transitional, not the resting state.
- Image quality: supplied JPEGs are preserved byte-for-byte, full-image presentation in hero/story/gallery/lightbox; thumbnails and the directions background may use display crops. No generated assets, filters, recoloring or face edits.
- Copy/content: JOHYUN · JIYOUNG everywhere; 신조현 · 홍지영; 2027-01-31 12:00 KST. 제이오스티엘, 서울특별시 구로구 경인로 565. Missing contacts/accounts/parking remain explicit placeholders. Venue address references are in README.

## Interaction checks

- Gallery opens the original-aspect image in a modal; next photo changes and count updates; Escape closes and returns focus to the invoking photo.
- Gallery previous selection changes the main image and selected thumbnail state.
- Calendar disclosure opens.
- Navigation anchors and visible menu remain reachable at mobile width.
- Unconfigured upload stays disabled and explains its state.
- Console error log checked: no errors observed.
- Production build and file-signature test passed.

Remaining test gaps: actual music playback needs a supplied licensed audio file; actual uploads and admin authorization require the Supabase/Turnstile deployment. Live map destination and venue parking/assigned hall should be checked before sharing with guests. These are configuration/operational gaps, not claimed as verified.

## Implementation checklist

- [x] Correct groom spelling and initials.
- [x] Add requested editorial design details.
- [x] Preserve originals and exclude RSVP.
- [x] Reflect venue and map links.
- [x] Check mobile layouts and primary available interactions.
- [ ] Configure audio, contacts/accounts, private backend; verify deployed access policies.

## Latest annotation changes

User requested removal of section numbering, road-address map search, an official venue map, and consolidated directions. Removed chapter/section numerals while retaining functional gallery photo pagination. Moved the always-visible calendar next to the date information; grouped venue/address, official map, map actions, subway and parking into one location block. Kept the original hanok photograph as a standalone photograph without overlaid directions.

Map source: venue's official downloadable map, `http://www.j-ostiel.co.kr/official.php/home/info/586`; source and provenance saved in `public/location/SOURCE.txt`. Image inspected before insertion, unchanged original. The map links to its full image in a new tab for readable enlargement. Known residual: bus routes printed in the venue's image are supplied by the venue and were not individually verified; no new bus route text is asserted by the application.

Post-change browser evidence: `../wedding-location-map.png`, local `/#directions`. Verified actual map image is visible, layout stays in the centered invitation column, navigation link URLs encode `서울특별시 구로구 경인로 565`, and section numerals are absent from rendered content. Build passed. External deployment has not been updated by the agent.

final result: passed
