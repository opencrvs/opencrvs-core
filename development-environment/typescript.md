# TypeScript toolchain

The workspace `typescript` dependency is **TypeScript 7** (native compiler).
Everything that typechecks or emits — package `build` scripts, `test:compilation`.

TypeScript 7.0 ships **no programmatic API** (it arrives in 7.1), so anything that
`import`s or `require`s the TypeScript API stays on **TypeScript 6**, installed as the
`@typescript/api` npm alias (`npm:typescript@6.0.3`).

## TypeScript 6 API consumers

| Consumer                                           | Why it needs the TS API                                            | How it gets TS 6                   |
| -------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------- |
| `@typescript-eslint/*` (via `typescript-estree`)   | type-aware lint rules parse with the TS API                        | symlink shim, see below            |
| `ts-api-utils`                                     | helper library used by typescript-eslint rules                     | symlink shim                       |
| `react-docgen-typescript`                          | Storybook docgen for `components` build-storybook                  | symlink shim                       |
| `@joshwooding/vite-plugin-react-docgen-typescript` | wires docgen into Storybook's vite build (reads `ts.JsxEmit` etc.) | symlink shim                       |
| `packages/client/src/extract-translations.ts`      | walks TS ASTs to find message descriptors                          | imports `@typescript/api` directly |
| `packages/login/src/extract-translations.ts`       | same                                                               | imports `@typescript/api` directly |

Two third-party tools additionally bundle their own private TypeScript copies and
need nothing from us: `lerna` (5.6.3) and `postcss-styled-syntax` (5.9.3, stylelint's
CSS-in-JS parser). They resolved their own nested copies before this migration too.

The symlink shim is `development-environment/link-ts6-api.js`, run from the root
`postinstall`. It places a `node_modules/<consumer>/node_modules/typescript` symlink to
`@typescript/api`, so Node resolution hands those packages TS 6 while the rest of the
workspace resolves TS 7.

## Test and script runners (no TS API involved)

- **Jest** (`auth`, `commons`, `documents`, `gateway`) transforms with `@swc/jest` —
  transpile only, no typechecking. Typechecking is the `test:compilation` step which
  runs the native compiler.
- **Vitest** (`client`, `login`, `events`) transforms with esbuild, as before.
- **Dev runners and scripts** use `tsx` (esbuild): service `start` scripts,
  `data-seeder`, `auth` token helpers, `extract-translations.sh`, migrations.
- `ts-node` and `ts-jest` are gone from the workspace.

## Migrating to TypeScript 7.1

When 7.1 lands with the API:

1. Bump `typescript`, and upgrade `typescript-eslint` to a version that supports the TS 7 API.
2. Delete `development-environment/link-ts6-api.js` and its `postinstall` hook.
3. Point `extract-translations.ts` (client + login) back at `typescript`.
4. Drop the `@typescript/api` alias from the root `package.json`.
