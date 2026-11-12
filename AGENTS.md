# AGENTS

## Overview

This repository contains the **SnowballR frontend**: a SvelteKit + TypeScript application that talks to the
backend over gRPC-Web. UI is built on shadcn/ui (Svelte port) and Tailwind CSS v4. Tests are split into unit
(Vitest), integration (Vitest + Svelte Testing Library), and end-to-end (Playwright against the mock backend).
Prefer referencing the wiki and existing docs over restating them here. If you must summarize, keep it short
and point to the canonical page.

### SnowballR repositories

- Organization: https://github.com/SE-UUlm
- SnowballR (umbrella repo): https://github.com/SE-UUlm/snowballr
- SnowballR API: https://github.com/SE-UUlm/snowballr-api
- SnowballR Backend: https://github.com/SE-UUlm/snowballr-backend
- SnowballR Frontend: https://github.com/SE-UUlm/snowballr-frontend
- SnowballR CI: https://github.com/SE-UUlm/snowballr-ci
- SnowballR Mock Backend: https://github.com/SE-UUlm/snowballr-mock-backend
- SnowballR Backend (legacy): https://github.com/SE-UUlm/snowballr-backend-old

### Canonical documentation and what each covers

- README.md — quick start (Docker), env vars, source-build pointer
- wiki/Home.md — wiki entry page
- wiki/Getting-Started.md — Docker quick start, env vars, building from source, dev server, production preview
- wiki/Contributing.md — project layout; component conventions (composites vs primitives, shadcn/ui); skeletons;
  loading state on actions; user context (`getUserContext`, `triggerCurrentUserRefresh`); release procedure
- wiki/Testing.md — unit / integration / e2e conventions, test data, mock API helpers, Playwright fixtures and POMs

## Structure

```
.
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── composites/         # our components
│   │   │   └── primitives/         # shadcn/ui (Svelte port) components
│   │   ├── model/                  # frontend models and helpers around the API types
│   │   ├── current-user/           # user cache + refresh trigger
│   │   ├── custom-context/         # user context, etc.
│   │   ├── grpc-api.ts             # gRPC-Web client wiring
│   │   ├── schemas.ts, resource.svelte.ts, ...
│   │   └── ...
│   ├── routes/                     # SvelteKit pages and layouts (+page.svelte / +layout.ts)
│   ├── app.css, app.d.ts, app.html
├── static/                         # static assets served by SvelteKit
├── tests/
│   ├── unit/                       # Vitest unit tests
│   ├── integration/                # Vitest + @testing-library/svelte (mirrors src/lib/components)
│   ├── e2e/                        # Playwright (uses utils/fixtures and Page Object Models)
│   ├── visual/                     # Playwright visual regression tests + PNG baselines
│   ├── example-data.ts             # static example fixtures
│   ├── model-builder.ts            # preferred way to build test data
│   └── setupTest.ts
├── scripts/                        # CI/dev helpers (run-playwright.js, ...)
├── wiki/                           # canonical documentation
├── .github/workflows/              # build, code_quality_checks, docker, e2e_tests, git_conventions, wiki
├── compose.yaml                    # standalone frontend
├── Dockerfile                      # production image
├── svelte.config.js, vite.config.ts, vitest-setup.ts, playwright.config.ts, playwright.visual.config.ts
├── tsconfig.json, eslint.config.js, tailwind.config.js
├── components.json                 # shadcn-svelte config
├── markdownlint.json
├── .nvmrc                          # Node version (single source of truth for CI + Dockerfile)
└── package.json
```

## Where to look

| Task                                  | Location                                                                      | Notes                                                                                              |
| ------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Project overview                      | README.md                                                                     | High-level pointers, env-var table.                                                                |
| Local setup / Docker                  | wiki/Getting-Started.md                                                       |                                                                                                    |
| Project layout                        | wiki/Contributing.md#project-layout                                           | Source of truth.                                                                                   |
| Supported screen sizes                | wiki/Contributing.md#supported-screen-sizes                                   | `md` (768px) and up only.                                                                          |
| New component conventions             | wiki/Contributing.md#creating-a-new-component                                 | composites vs primitives, PascalCase, props, docs.                                                 |
| Loading / skeletons / loading buttons | wiki/Contributing.md#skeletons, wiki/Contributing.md#loading-state-on-actions | Use `Skeleton`, `LoadingButton`.                                                                   |
| User context                          | wiki/Contributing.md#user-context                                             | `getUserContext`, `triggerCurrentUserRefresh`, root `+layout.ts`/`+layout.svelte`.                 |
| Testing conventions                   | wiki/Testing.md                                                               | when-then naming; `describe` grouping; `mockApiCall` / `mockFailedApiCall`.                        |
| End-to-end tests                      | wiki/Testing.md#end-to-end-tests                                              | Playwright; shared/isolated fixtures; Page Object Models (`*-page-model.ts`, `*-dialog-model.ts`). |
| gRPC client wiring                    | src/lib/grpc-api.ts                                                           | Backend service used in components.                                                                |
| Generated API types/client            | `snowballr-api` npm package                                                   | Import per proto module, e.g. `snowballr-api/project`, `snowballr-api/main.client`.                |
| Routes                                | src/routes/                                                                   | SvelteKit page/layout files.                                                                       |
| Components (ours)                     | src/lib/components/composites/                                                | PascalCase Svelte files.                                                                           |
| shadcn-svelte primitives              | src/lib/components/primitives/                                                | Configured via `components.json`.                                                                  |
| E2E shared fixture                    | tests/e2e/utils/fixtures/shared-fixture.ts                                    | One mock backend per worker.                                                                       |
| E2E isolated fixture                  | tests/e2e/utils/fixtures/isolated-fixture.ts                                  | One mock backend per test.                                                                         |
| Visual regression tests               | wiki/Testing.md#visual-regression-tests                                       | Browser runs in the Playwright Docker image; baselines via update script.                          |
| Example POM                           | tests/e2e/homepage/create-project-dialog-model.ts                             | Reference for `*-dialog-model.ts` style.                                                           |
| Test data helpers                     | tests/example-data.ts, tests/model-builder.ts                                 | Prefer the model builder; example data may change.                                                 |
| Docker image                          | Dockerfile                                                                    | Production image (published to ghcr.io).                                                           |
| CI workflows                          | .github/workflows                                                             | build, code_quality_checks, docker, e2e_tests, git_conventions, wiki.                              |
| E2E sharding                          | .github/workflows/e2e_tests.yml                                               | Uses `vars.TESTS_PER_SHARD` to shard the matrix.                                                   |
| Release procedure (canonical)         | https://github.com/SE-UUlm/snowballr/wiki/Contributing                        | Single source of truth for SnowballR releases.                                                     |

## Architecture and patterns

- **Stack:** SvelteKit 2 + Svelte 5 (runes: `$props`, `$derived`, ...), TypeScript, Tailwind v4 + shadcn-svelte
  primitives. Build with Vite; production preview with `@sveltejs/adapter-node`.
- **Transport:** gRPC-Web via `@protobuf-ts/grpcweb-transport`. The browser talks to a gRPC-Web proxy that
  forwards to the backend (proxy is provided by the umbrella `snowballr` repo).
- **User context flow:** root `+layout.ts` resolves the current user (cached → fetched → redirect on
  unauthenticated), injects it via `+layout.svelte` into context. Components consume with
  `getUserContext()` wrapped in `$derived`. After mutating user data, call `triggerCurrentUserRefresh()`.
  See wiki/Contributing.md#user-context for the full diagram.
- **Components:** New components live under `src/lib/components/composites/` (PascalCase Svelte files);
  shadcn primitives under `src/lib/components/primitives/`. Helper TS files use kebab-case.
- **HTML attribute passthrough:** Use `WithElementRef<HTMLButtonAttributes>` (or the appropriate
  `HTMLAttributes<...>`) on the `Props` type, then spread `...restProps` onto the root element and merge
  classes with `cn(...)` (wiki/Contributing.md).
- **Screen sizes:** Only screens from the `md` breakpoint (768px) upwards are supported; don't design or test for
  smaller ones (wiki/Contributing.md#supported-screen-sizes).
- **Loading UX:** Use the shadcn `Skeleton` for async data with `{#await}`; use `LoadingButton` for actions
  (disable while loading, show spinner, fixed width, success/error toast).

## Boundaries

- Always do: prefer wiki references for process guidance; keep changes focused to the requested scope; follow
  the component / testing conventions in wiki/Contributing.md and wiki/Testing.md.
- Ask first: bumping the `snowballr-api` dependency (changes the generated client); changes to gRPC transport
  config (`grpc-api.ts`); changes to the root layout's auth/user-fetch logic; changes to `compose.yaml`,
  Dockerfile, or e2e sharding strategy; changes to the license-check allowlist in `package.json` (`license-check`).
- Never do: commit secrets / real API base URLs to `.env`; copy or vendor the generated API client into `src/`
  (import it from the `snowballr-api` package instead); commit `build/`, `node_modules/`,
  `e2e-report/`, `test-results/`, or `coverage/`; introduce `null`/`undefined` user checks downstream of the
  root layout (the context invariant guarantees a valid user — wiki/Contributing.md).

## Commands (run from repo root)

### Install / dev / build

- Install: `npm install`
- Dev server: `npm run dev` (opens browser via `--open`)
- Build: `npm run build`
- Production preview: `npm run preview` (or `npm run prod` = build + preview)
- Type check: `npm run check` (or `npm run check:watch`)

### Lint / format

- Format: `npm run format` (Prettier)
- Lint: `npm run lint` (Prettier check + ESLint)
- Auto-fix lint: `npm run lint:fix`
- Markdown lint: `npm run lint-md`
- License check: `npm run license-check` (allowlist defined in `package.json`)

### Tests

- All tests: `npm run test` (no-e2e + e2e)
- Unit: `npm run test:unit` (UI: `npm run test:unit:ui`)
- Integration: `npm run test:integration` (UI: `npm run test:integration:ui`)
- E2E: `npm run test:e2e`
- E2E (fast — only changed vs `develop`): `npm run test:e2e:fast`
- E2E report: `npm run test:e2e:show-report`
- Visual regression: `npm run test:visual` (update baselines: `npm run test:visual:update`, report:
  `npm run test:visual:show-report`)
- Coverage report: `npm run show-coverage` (or `npm run test:and-open-coverage`)
- Vitest only (no e2e): `npm run test:no-e2e`

### Docker

- Default (standalone): `docker compose up`

## Style, checks, and tests

- **Style:** Prettier (configured via the standard ESLint/Prettier setup; run `npm run format`). Svelte 5 runes
  syntax (`$props`, `$derived`, ...). Markdown follows `markdownlint.json`.
- **Checks:** ESLint (`eslint.config.js`), `svelte-check` for TS, Prettier check, license check.
- **Testing conventions (wiki/Testing.md):**
  - `test("When ..., then ...", () => { ... })` and group with `describe(...)`.
  - Prefer `model-builder.ts` over static example data.
  - Integration test files mirror the component path under `tests/integration/`.
  - E2E: use `shared-fixture.ts` or `isolated-fixture.ts` (not `@playwright/test`'s `test` directly), use
    POMs (`*-page-model.ts`, `*-dialog-model.ts`, ...), simulate every user click rather than batching.
  - Visual: use `tests/visual/utils/visual-fixture.ts` (not the model builder); write baselines only via
    `npm run test:visual:update`, which renders in the same Docker image as CI.

Example integration test naming:

```ts
test("When the button is clicked, then the text should change", async () => {
    // ...
});
```

## Issues

- Use `.github/ISSUE_TEMPLATE` (when present) to pick the right template.

## PRs

- Use `.github/pull_request_template.md` (when present) for required sections.

## Git and CI conventions

- PRs to `develop` must keep a linear history (`.github/workflows/git_conventions.yml`, using snowballr-ci's
  `ensure-linear-history@v1`). Rebase onto `develop` before requesting review.
- CI runs build, code quality checks (license, lint, type check), Docker build/publish, sharded E2E tests, and
  wiki lint/publish. Use merge commits when merging an approved PR.

## Conventional commits

Commit messages follow Conventional Commits with a short type prefix and optional scope. Common types in this
repo include: feat, fix, refactor, test, docs, chore, ci. Use lowercase types and keep the subject imperative
and concise.
