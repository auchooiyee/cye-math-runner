# CYE MATH RUNNER — SPM FINAL RUN

An endless runner with KSSM Form 5 Mathematics.

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Validate

```bash
npm run validate
npm run test:content
npm run test:matrix
npm run test:pacing
npm run test:track
npm run test:leaderboard
```

## Deployment and shared leaderboard (Netlify + Cloudflare D1)

Global scores are stored in D1; the old pre-filled Netlify rankings are gone. Local scores remain on each browser's device. Each browser has one persistent random ID, and only its best run appears globally. Student names are display-only aliases; do not enter real names. This is a casual classroom leaderboard, not a cheat-proof exam record: a modified client can submit invented scores.

Netlify serves the game from `dist`. Its `/api/*` proxy routes requests to [the Cloudflare leaderboard Worker](https://cye-math-runner-api.a-chooiyee.workers.dev/api/scores), which binds the existing `cye-math-runner-scores` D1 database as `DB`. The Worker reuses `functions/api/scores.js`, so score validation and best-score rules have one implementation. Database and account IDs in `wrangler.jsonc` are identifiers, not credentials; CLI login credentials stay outside the repository.

To release an update from the repository root:

```bash
node --test scripts/test-*.js
npm run validate
npm run build
npx wrangler d1 migrations apply DB --remote
npx wrangler deploy
npx netlify-cli deploy --prod --dir=dist
```

The Netlify CLI must be linked to the existing game site. GitHub-connected builds can also publish frontend commits automatically. After deployment, verify `/api/scores` on the Netlify site returns JSON with `success: true`, and check the game menu. Failed score uploads stay in local scores and are not shown as global ranks.

`npm run dev` serves the game without D1 and intentionally reports the global board as unavailable. For backend development, use `npx wrangler dev`; the Worker uses the configured local D1 binding. Apply the schema locally with `npx wrangler d1 migrations apply DB --local`. The shared handlers also remain compatible with Cloudflare Pages Functions.

For physical touch and rotation checks, use [the device QA checklist](docs/mobile-qa.md).

## Tech
- Phaser 3.90.0
- Vite

## Target
- Form 5 KSSM Mathematics

## CYE Academy visual redesign

The Academy Run uses the supplied blue-and-gold academy artwork, a matching brown-haired student runner, four scenic locations across eight curriculum chapters, and friendly Crown training guardians. Open **Meet the Academy** on the main menu for the character story and route guide. The menu supports EN/BM and responsive desktop/mobile layouts.

- [人物与世界观设定（中文）](docs/人物与世界观设定.md)
- [Generated character asset prompts](docs/asset-prompts.md)
- Artwork lives in `public/assets/academy/`; originals remain outside the repository.
- Curriculum IDs, questions, scoring and progression are retained. Road objects now use perspective depth and crossing-plane collision checks; jumping and sliding keep their existing controls.
- Gameplay now uses a rear-view eight-frame running cycle and one coherent three-lane academy avenue. The four original scenic locations remain in the route guide; current chapter changes update the road accent and location label.

## Stationary learning checkpoints

Questions stop the runner, road, physics, controls, and gameplay effect timers. Select one of four answers, or enter a signed matrix value using the on-screen number keypad. Each question starts with 60 seconds; **+30s · Add Time** can be used repeatedly, including after the clock reaches zero. The clock continues when the browser tab is hidden. At zero the question stays open and the run stays paused: add more time or choose **Review Answer** to record a timeout and see the method. Guardian questions follow the same rules.

Correct answers, mistakes, and timeouts display a worked explanation in a responsive cream, blue, and gold academy card. Running resumes only after **Continue Run**. The sprint clock pauses during questions and explanation reading. Shield penalties retain the existing mode rules; Chapter Practice does not lose shields.
