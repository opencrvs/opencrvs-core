## Running tasks

- Run every task via `nx run`, or `lerna run` (lerna is an nx front-end). Tasks have dependencies which nx resolves, see `nx.json`.
- Root scripts (typecheck, lint, test) run across all packages via lerna.

```bash
pnpm typecheck                                    # or lint / test
nx run @opencrvs/gateway:test                     # one package, dependencies resolved
lerna run test --scope @opencrvs/gateway          # equivalent
nx run @opencrvs/events:test -- src/router/user   # trailing args reach vitest
nx run @opencrvs/events:test:compilation          # typecheck one package
```

- `test`, `test:compilation` and `lint` all depend on `^build`, so nx rebuilds changed dependencies first. Calling `vitest` or `tsc` yourself instead runs against whatever `build/` already holds, which is usually stale: the phantom failures that follow read exactly like real ones, and cost a debug loop before the artifact is suspected. `.claude/hooks/nx-task-guard.sh` blocks those calls.
- `packages/countryconfig-template` is deliberately outside `pnpm-workspace.yaml`, so nx has no project for it — run its own `pnpm test` / `pnpm test:compilation` from that directory.

## Agent skills

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
