# Character asset generation

## 2026-10-12 perspective runner revision

The active gameplay uses runner-cycle-v2.webp (eight rear-view running poses), runner-slide-v2.webp, and track-v2.webp. Generated in built-in mode. WebP conversion preserves transparency. The game normalizes the 4×2 cycle into equal frames and draws the three lanes itself; painted scenery never determines collision positions.

## runner-cycle-v2.webp

Asset: actual game running animation sprite sheet, transparent background, landscape exactly 4 columns x 2 rows, 8 equal rectangular cells, 8 frames in reading order. Reference image is identity and outfit reference ONLY. Render the same CYE teenage boy from BEHIND, running away from viewer towards the horizon: tousled brown short hair, blue backpack, blue and white school hoodie, charcoal trousers white side stripes, white and blue trainers. Friendly polished 3D cartoon mobile game. Eight distinct successive phases of one complete alternating-leg RUN CYCLE: left contact, left recoil, left passing, left flight, right contact, right recoil, right passing, right flight. Opposite arms swing. Both feet must alternate, visible back soles during flight, recognizably running. Identical character size, head height, camera and proportions in all 8 frames. Each figure isolated centered within its equal grid cell, entire full body fits with generous padding; hips aligned at same local position; no overlapping across cells. No ground, no shadows, no glow, no scenery, no labels, no frame borders. True alpha transparency. This is a production spritesheet, NOT a character concept lineup and NOT front-facing.

## runner-slide-v2.webp

Asset: individual transparent game sprite. Reference is identity and outfit ONLY. Same brown-haired CYE schoolboy with blue backpack, blue/white hoodie, dark athletic trousers and blue-white trainers. Rear view from camera following behind him: he slides forward away from viewer, low crouched torso, one leg extended toward the distance and the other bent, backpack clearly visible, head facing away, no face toward camera. Polished colorful 3D cartoon. Full body centered, generous padding. Transparent background, no floor, shadows, glow, text or scenery.

## track-v2.webp

Edit the supplied CYE academy street into a production background plate for a rear-camera forward runner game. Preserve the cheerful polished 3D cartoon academy buildings, blue sky, clock tower, blue-and-gold crown banners, greenery, books and mathematical sculptures. Camera centered exactly on the avenue. Composition constraints: vanishing point at horizontal center and one third of image height. A VERY WIDE completely empty smooth blue-gray road widens from a narrow opening at this vanishing point to almost the entire bottom edge. Sidewalks, trees, flowers and all props must stay outside this road, at the far left and far right edges. The foreground is mostly clean empty road. No lane markings at all (game will draw exactly three lanes itself). No people, coins, cones, roadblocks, math answer tiles, cars, buses, shadows crossing center, floating elements, text overlay or UI. Wide 16:9 landscape. Continuous coherent road perspective, lively academy skyline upper third, restrained detail at bottom for readable gameplay.


Generated with the built-in image_gen tool, using the user's cover (image 1) as the identity reference. Both images requested a transparent background and are stored in public/assets/academy as WebP with alpha preserved. Originals remain under the tool's generated_images directory.

## runner.webp

Use case: identity-preserve. Asset type: transparent game character sprite for CYE Math Runner. Reference image 1 is the user's cover artwork; use only the brown-haired teenage boy as the identity and outfit reference. Create one isolated full-body character, same warm brown eyes, tousled brown hair, blue and white CYE hoodie, royal blue backpack, charcoal athletic trousers with white side stripes, blue and white sneakers. Friendly determined smile. Polished colorful 3D cartoon mobile game illustration matching the reference. Full body including both shoes in frame, compact mid-run pose facing toward the viewer with a slight three-quarter turn, one knee slightly raised, arms running, upright silhouette easy to read at 64px tall. Centered on genuinely transparent background, 8 percent padding. No ground, no cast shadow, no logo outside clothing, no numbers, no border, no extra character. This is an individual sprite, not a sheet.

## runner-slide.webp

Use case: identity-preserve. Asset type: transparent game sprite, one sliding pose. Reference image is the CYE Math Runner boy; preserve exactly his brown spiky hair, brown eyes, white hoodie with blue hood and CYE lettering, royal blue backpack, charcoal trousers with white stripes and blue-white trainers. Render the SAME friendly teenage school runner in a low feet-first slide, one leg extended to the right foreground and the other bent, torso leaning back, head low, full body visible, wide compact silhouette at least 1.7 times wider than tall. Polished colorful 3D cartoon matching reference. Genuine transparent background. No floor, no rectangle, no scenery, no shadow, no glow outside silhouette, no extra characters, no text outside hoodie. 8 percent empty padding.

## Clean gameplay environments

Files: campus-clean.webp, city-clean.webp, skybridge-clean.webp, garden-clean.webp. Each was edited in a separate built-in image_gen call, with its corresponding user-supplied environment image as the edit target. Original reference artwork remains separately available for the menu route cards.

Use case: precise-object-edit. Asset type: clean background plate for an interactive runner game. Edit target: the supplied CYE academy road illustration. Preserve the exact environment, architecture, color palette, lighting, roadside books, mathematical sculptures, CYE crown banners, trees and horizon. Remove ALL floating gold coins, pickup objects, floating answer tiles, roadblocks, cones, floating calculator panels, and other obstacles IN OR OVER the road. Reconstruct the clean unobstructed road underneath. Do not add people, vehicles, coins, gates or obstacles. Preserve roadside environmental mathematics and signage. Three clear empty lanes, white road markings, matching the original perspective. Render a polished wide 16:9 game background. This is the empty environment only; the real game will add its own objects.


