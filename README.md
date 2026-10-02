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
npm run test:leaderboard
```

## Shared leaderboard (Cloudflare Pages + D1)

Global scores are stored in D1; the old pre-filled Netlify rankings are gone. Local scores remain on each browser's device. Each browser has one persistent random ID, and only its best run appears globally. Student names are display-only aliases; do not enter real names. This is a casual classroom leaderboard, not a cheat-proof exam record: a modified client can submit invented scores.

To make the shared leaderboard live:

1. Create a free Cloudflare Pages project for this repository (build command `npm run build`, output directory `dist`), or deploy `dist` with Wrangler. The `functions/api/scores.js` Pages Function supplies `/api/scores`.
2. Create a D1 database called `cye-math-runner-scores` in Cloudflare. Apply `migrations/0001_scores.sql` to it, for example with `npx wrangler d1 execute cye-math-runner-scores --remote --file=migrations/0001_scores.sql`.
3. In the Pages project's **Settings → Bindings**, add a **D1 database** binding named exactly `DB`, select that database, and redeploy. The binding must also be set for Preview if preview deployments should use the API. For a separate preview database, apply the same schema there.
4. Verify `https://YOUR-PAGES-SITE/api/scores` returns `{ "success": true, "scores": [] }` before students play. The first completed endless/sprint run with a positive score will appear there. Failed uploads stay in local scores, but are not shown as global ranks.

`npm run dev` serves the game without D1 and intentionally reports the global board as unavailable. For a full local D1 test, use [Cloudflare's Pages local development workflow](https://developers.cloudflare.com/pages/functions/bindings/) with a local D1 binding and the schema above. The `_routes.json` limits Functions invocations to `/api/*`, keeping static asset requests outside the Functions quota.

For physical touch and rotation checks, use [the device QA checklist](docs/mobile-qa.md).

## Tech
- Phaser 3.90.0
- Vite

## Target
- Form 5 KSSM Mathematics
