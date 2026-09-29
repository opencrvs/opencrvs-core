---
name: compile-lint-check
description: Run TypeScript compilation and lint checks for an OpenCRVS package after modifying or adding files under packages/{package_name}. Invoke immediately after edits, not just at session end.
allowed-tools: Bash
---

Get `{package_name}` from the edited file's path under `packages/`, then run:

```bash
nx run @opencrvs/{package_name}:test:compilation
nx run @opencrvs/{package_name}:lint
```

Confirm the exact scope via `packages/{package_name}/package.json`'s `"name"` field if unsure. Fall back to `cd packages/{package_name} && npx tsc --noEmit` if `test:compilation` isn't defined; skip lint if `lint` isn't defined.

Report 0 errors as clean; otherwise show the failing lines, suggest a fix, and re-run.
