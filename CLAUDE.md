## Running tasks

- Run every task via `nx run`, or `lerna run` (lerna is an nx front-end). Tasks have dependencies which nx resolves, see `nx.json`.
- Root scripts (typecheck, lint, test) run across all packages via lerna.

```bash
pnpm typecheck                             # or lint / test
nx run @opencrvs/gateway:test              # one package, dependencies resolved
lerna run test --scope @opencrvs/gateway   # equivalent
```

## Agent skills

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
