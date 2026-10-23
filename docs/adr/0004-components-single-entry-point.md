# One entry point for `@opencrvs/components`

Consumers import components from the package root, `@opencrvs/components`. The only other
entry points are two named groups that cannot join the root because their names clash with it:
`@opencrvs/components/icons` (the legacy SVG icons) and `@opencrvs/components/legacy` (the
deprecated `buttons/`). The package's `exports` map lists exactly these three. Inside `src/`,
every top-level folder is a module whose `index.ts` is its public surface, and the root
`index.ts` re-exports every folder.

Before this, a consumer's import path mirrored the file layout: `@opencrvs/components/lib/Button`,
`…/Button/Button`, `…/DocumentViewer/components/PanViewer`, served by a `./lib/*` wildcard plus
26 explicit file paths. The `lib/` prefix named a build output and outlived it. A file couldn't
move without breaking consumers, and each module had two equivalent import paths.

## Considered options

- **One subpath per folder** (`./*` → `./src/*/index.ts`). Rejected: the folder name becomes the
  interface, so renaming a folder is a breaking change. Names may also repeat across folders,
  which is how the library ended up with two different `Button`s. Its supposed advantage, loading
  fewer modules in dev, doesn't hold: client and login already import the root, so both load
  the whole library on their first page.
- **Keep both styles.** Rejected: two ways to import the same thing, with no reason to choose
  one over the other.

## Consequences

- Export names must be unique across the whole package. An `export *` collision fails
  compilation with TS2308, so a clash shows up when it's introduced. Rename it; don't add a
  subpath.
- `"sideEffects": false` lets the bundler drop components a page doesn't use, even though
  every import goes through one barrel. A module that does something when imported (global
  styles, registration) breaks that assumption and has to be listed under `sideEffects`.
- Inside the package, folders import each other relatively and through the folder's index:
  `'../Button'`, not `'../Button/Button.styles'`, never `'..'` from a top-level folder, and
  never `@opencrvs/components`. Going through the root index creates import cycles.
- Guarded in `packages/components`. `pnpm lint` runs `check-public-surface.mjs` (exact
  `exports`, `sideEffects`, every folder has an `index.ts` and is reachable from the root or a
  group, no loose files in `src/`) and the import rules in `eslint.config.js`. Consumers that
  use a subpath fail TypeScript resolution, the vite build, and `import/no-unresolved`.
- The groups are temporary. When `buttons/` is deleted and the legacy icons are renamed or
  removed, fold them into the root and drop the entries.
