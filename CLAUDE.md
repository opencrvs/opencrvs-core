## Running tasks

- Run every task via `nx run`, or `lerna run` (lerna is an nx front-end). Tasks have dependencies which nx resolves, see `nx.json`.
- Root scripts (typecheck, lint, test) run across all packages via lerna.

```bash
pnpm typecheck                             # or lint / test
nx run @opencrvs/gateway:test              # one package, dependencies resolved
lerna run test --scope @opencrvs/gateway   # equivalent
```

## GitHub text

Write all GitHub text (PRs, issues, comments, commits) for a human reader. Use ASD-STE100 (Simplified Technical English) as the base:

- Use short sentences, active voice, and common words. Put one topic in each sentence.
- Keep the subject near its verb. If a sentence needs nested clauses, split it.
- Keep small words that help the reader: "the file that the script reads", not "the file the script reads". Do not make text shorter by dropping them.
- Use plain verbs for code: "isFile() catches the error and returns `false`", not "isFile() swallows that".
- Do not stack three or more nouns. Write "the error in validation of the event config", not "event config validation error". Known names such as `EventConfig` are fine.
- Do not use nouns as verbs. Write "open a PR for this", not "PR this". Common verbs such as "log", "test" and "merge" are fine.
- Use the common phrase, not the clever or rare one. Do not use metaphors or dash asides.

## Agent skills

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
