# The System

A Solo Leveling inspired, local-first training, nutrition, and recovery app. Built with React 19, TypeScript, Vite, Tailwind CSS v4, Lucide, CSS motion, and native Web Audio. Fonts ship locally.

## Develop

Requires Node.js 22.12+ (Node 24 used for validation).

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

The production output is `dist/`. Serve it over HTTPS with a fallback to `index.html`. The manifest and service worker enable standalone installation and cached offline access after a successful online visit. No deployment service or database is configured.

## Hunter accounts

| Hunter ID | Password | Display name |
| --- | --- | --- |
| `abhinav` | `hunter_password_1` | Abhinav |
| `hunter_02` | `hunter_password_2` | Ashutosh |
| `hunter_03` | `hunter_password_3` | Hunter 03 |

First login opens the four-step Awakening calibration. Sessions persist until explicit logout, including across tabs and browser restarts. Each hunter's state uses `the_system_user_<username>_state`; the session uses `the_system_session`.

**These are local profiles, not secure server accounts.** The credentials are public and the browser controls its own session/storage. Do not deploy this as secure multi-user authentication or a medical record system. Stored profiles and exported backups are unencrypted. Use a private device and keep backups private.

`src/lib/storage.ts` exposes `CloudSyncAdapter`, `configureCloudSync`, `pullCloudState`, and `pushCloudState`. A real integration must authenticate users on the server, authorize account access (for example Supabase RLS), handle conflicts, and provide secure credential reset. Never trust the local username/token as cloud authorization. Local storage is the default; no cloud connection is claimed.

## Included workflows

- Calibration with metric/imperial conversion, experience, self-reported posture/skin concerns, editable routines, and initial nutrition estimates.
- Sticky cobalt HUD with locally served Inter typography, E–S ranks, XP, daily streak multipliers, and three spendable attribute points per level.
- Daily quest/habit creation, editing, removal and completion reversal. Guide buttons open static anatomical diagrams with labeled start/contraction positions, movement paths, orange target muscles and form cues. Expand opens a large lightbox with 100–300% zoom. Custom routines accept an optional HTTP(S) Guide Image URL; missing or unavailable images fall back to built-in diagrams or labeled target anatomy. Image URLs persist in backups; remotely hosted images require network access.
- Seven completed consecutive days trigger a 20% repetition increase (capped at 100; larger custom targets never decrease). Evolution applies on next-day rollover.
- Local-midnight/focus rollover, history, and randomized repetition/hold/XP consequences. Penalties never stack while unresolved. Holds count only visible active ticks and require explicit completion. An XP recovery option avoids forced exercise.
- Recovery day is a one-click, two-way toggle. Planned recovery preserves the existing streak without awarding a new day or XP; cancelling restores normal training requirements. The original training plan resumes the next day.
- Calories, protein, carbohydrates, fats and water; eight vegetarian quick-log staples, custom food presets, and meal editing/deletion.
- Versioned JSON export/import, size/type/range/account validation, restore preview and confirmation, and a consistency archive.
- CSS-only blue/violet rank aura and staggered entrance transitions respect reduced-motion preferences. Keyboard navigation, nested focus-managed native dialogs and responsive touch controls.

Nutrition values are starting estimates, not prescriptions. Training is adjustable; recovery matters. Posture and grooming routines are habit guidance, not diagnoses or promises to change facial structure. Adolescents receive no calorie-deficit plan.

## Architecture and recovery

`src/lib` owns state contracts, validation, persistence, session access, game rules and sound. `src/data` contains the regimen and food library. Independent `src/components` modules implement the UI. No backend, external audio, telemetry or remote image dependency is required.

`docs/PROGRESS.md` tracks implementation phases. After interruption, inspect `git status` and the checkpoint; preserve local work. Existing cloud skill checkouts stay under `/workspace/skills`, with project-local links excluded from Git. `AGENTS.md` records how those environment skills apply.

## Verification

`npm test` runs the Vitest engine, calibration and integrity suites. `npm run build` type-checks then builds production assets.

Browser integration tests live in `e2e/`:

```sh
npx playwright install chromium
npx playwright test
```

The Playwright runner starts or reuses the development server automatically. `TEST_URL` selects a different server; `BROWSER_EXECUTABLE` can point to an existing Chromium installation. This environment's standard browser CDN was blocked, so validation used an npm-distributed Chromium binary outside the repository. Browser artifacts are ignored. Set `TEST_PWA=1` with a production `TEST_URL` to include the offline service-worker scenario.

Validated: 94 unit tests, all seven Chromium browser scenarios, and the production build. Browser coverage includes diagrams, nested zoom, image fallback/persistence, recovery toggling, mobile and offline use. iOS installation and physical mobile devices were not tested.
