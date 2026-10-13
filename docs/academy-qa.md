# Academy redesign checks — 2026-10-11

- Production build: passed (`npm run build`).
- Existing automated tests: 17 passed, 0 failed (`node --test scripts/test-*.js`).
- Question validation: 3,625 / 3,625 passed; question data unchanged.
- Diff whitespace check: passed.
- Browser inspection at 1280×800 and 390×844: home menu, EN/BM toggle, character dialog and all eight route cards.
- Gameplay smoke check: entered endless/easy, exercised lane controls, jump, slide and pause/resume; inspected the enlarged runner and clean campus background.
- Boss training smoke check: chapter 8 loads Crown Mentor, its new arena label, friendly terminal artwork and the original modelling question UI.
- Saved screenshots: `academy-desktop.jpg`, `academy-gameplay.jpg`, `academy-guardian.jpg`.
- Local dev server has no Cloudflare D1 binding. Global score upload is therefore unavailable, as documented in the existing README; no live leaderboard verification was performed.
- Superseded by the 2026-10-12 revision below.
- Changes remain local; no GitHub push or deployment performed.

## Perspective runner revision — 2026-10-12

- Eight rear-facing run-cycle frames replace the static front-facing runner. Separate slide artwork and a ground shadow follow the physical runner.
- Road markings, lane centres, coins, obstacles and gates share one projection. All object motion uses road depth, with collision on crossing the runner plane.
- New geometry and gate tests: 8 passed. Existing 17 tests also passed; 3,625 question validations passed. Production build passed.
- Manual browser checks at 390×844 and 1280×800 confirmed rear-view running, perspective coin rows, lane movement, and collected-coin score increments. Screenshots: track-v2-mobile.jpg and track-v2-desktop.jpg.
- Browser follow-up verified jump lift, return to the running cycle, low sliding pose, three perspective answer doors, and successful gate passage followed by the next question. Saved gate view: track-v2-gates.jpg. No browser console errors were captured.
- Calculation countdown now advances only through the running scene update, so manual pause freezes it. Crossing detection retains an unchecked gate even across a slow frame.
- One illustrated avenue currently serves all chapters; chapter labels and kerb accents change. The four illustrated districts remain in the route guide.
- Local development still has no D1 leaderboard binding; score uploads remain unavailable locally.
- No push or deployment performed.

## Stationary answer cards — 2026-10-12

- The moving answer gates are replaced by a native dialog, shared by desktop, mobile, and guardians. Blue and gold headings, cream question cards, selectable options, a visible countdown, and a worked explanation match the academy artwork.
- Runner, road, physics, movement input, tween motion, effect timers, and the sprint timer stop while reading and answering. Continue resumes gameplay.
- Every question has a 60-second wall-clock deadline. Leaving the tab cannot extend it; late answers become timeouts and repeated submissions cannot record twice.
- Automated tests: 29 passed, including deadline boundaries, stalled-frame timeout, all four options, repeated clicks, fresh sessions, and signed matrix input. Production build and diff whitespace checks passed.
- Browser checks at 390×844 and 1280×800: correct answer, selection/confirmation, explanation, Continue Run, and next question. A real 60-second timeout showed the explanation while the background distance stayed at 598m throughout the measured interval.
- Matrix guardian: verified correct and incorrect negative values, six total attempts / five correct, completed challenge, results (5/6), Play Again, and a fresh 60-second question. No captured browser console errors.
- Screenshots: checkpoint-mobile.jpg, checkpoint-desktop.jpg, checkpoint-timeout.jpg, checkpoint-matrix-feedback.jpg.
- Guardian presentations now use stationary teaching cards with remaining challenge segments; the old neon attack screens and phase motion are superseded.
- Local changes only; no GitHub push or deployment.


## Unified academy screens, keypad and time extensions — 2026-10-13

- The loading card is present in the initial HTML and its stylesheet loads before the game module. It uses the academy road, crown, blue/gold colours and cream card.
- All screen sizes now use the same responsive menu shell: game modes, Easy/Normal/Hard, chapter/guardian selection, tutorial, mastery, progress report, leaderboard and results. Pause and nickname cards share the palette too. Removed the unused canvas pause menu and duplicate desktop HUD during pause.
- Numeric questions offer digits 0–9, a minus/plus toggle and delete. Clicking to enter -6, deleting to a lone minus (confirmation disabled), toggling back to +6, and a correct -3 answer were verified in the browser.
- Every question starts at 60 seconds. Add Time adds 30 seconds without a usage limit. At zero, no score is recorded automatically: choose Add Time or Review Answer. This supersedes the previous hard-timeout behaviour described above.
- Browser checks: consecutive extensions (113 seconds shown), a real zero-second state, extending from zero back to 30 seconds, preserved numeric input, correct negative scoring, explicit Review Answer and a fresh 60-second next question. Ordinary multiple-choice questions preserve their selected answer across extensions; distance remained 298m, then resumed after Continue Run.
- Layout checks at 390×844 and 1280×800 covered keypad, multiple choice, difficulty, tutorial, mastery, progress, leaderboard, pause and results.
- Automated checks: all 33 tests passed, including repeated extensions, expiry/review, session reset, invalid and signed keypad input. Production build passed. Global leaderboard remains unavailable on the local development server because it has no D1 binding.
- Screenshots: academy-difficulty-v3.jpg, academy-keypad-v3.jpg, academy-time-extension-v3.jpg.
- Local changes only; no push or deployment.
