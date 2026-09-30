---
name: release-docs-sync
description: Make the v<version>.0 directory of the opencrvs/documentation repo reflect what an OpenCRVS core release ships — find missing and outdated pages, draft the edits on a branch. Run as /release-docs-sync <version> [path-to-documentation-checkout].
argument-hint: <version, e.g. 2.1> [path to documentation checkout]
disable-model-invocation: true
---

# Release docs sync

Bring `opencrvs/documentation` → `v<version>.0/` in line with core `<version>`. Arguments: `$ARGUMENTS`.

The output is a branch in the documentation checkout with the edits and a findings report. The user reviews, pushes and opens the PR.

## 1. Set up both sides

**Core changes.** Run the release-prep script (see `.claude/skills/release-prep/SKILL.md`) with `--out` in the scratchpad:

```bash
.claude/skills/release-prep/scripts/list-release-changes.sh <version> --out <scratchpad>/release-<version>
```

**Documentation checkout.** Use the path argument if one was given. Otherwise use `../documentation` next to this repo (and confirm it with the user). If neither exists, ask.

```bash
git -C <docs> status --short            # must be clean — stop and ask if not
git -C <docs> fetch origin
git -C <docs> switch -c release-docs-<version> origin/master
ls <docs>/v<version>.0/SUMMARY.md       # target directory must exist
```

Local checkouts are often months behind GitBook, so always branch from a freshly fetched `origin/master`. If `fetch` fails (e.g. in a sandbox), say so and ask the user to fetch. Don't work on a stale tree. If `v<version>.0/` does not exist, stop: someone creates the version space in GitBook first.

Read `v<version>.0/SUMMARY.md`. It is the table of contents and the map of what exists.

## 2. Build the change → page worklist

Go through `changelog.md` one entry at a time. For each entry:

1. Find the page(s) that should mention it in the documentation repository.
2. Read those pages at the branch head. Grep the whole `v<version>.0/` tree too, because removed things (env vars, scopes, endpoints, `validUntil`, MongoDB, token exchange, …) tend to linger on pages you wouldn't expect.
3. Classify: **covered** (docs already accurate), **outdated** (docs describe the old behaviour), **missing** (nothing describes it), or **n/a** (internal change, bug fix with no documented behaviour, test/CI).

Then check the other outputs for things the changelog didn't mention:

- `env-vars.txt`: every **removed** var should be absent from the docs. Every **added** var that operators set should be documented where its neighbours are.
- `new-packages.txt` and `signals/*`: a topic with heavy churn but no changelog entry is worth a look at the relevant page. Report it as a question if unsure.
- `commits.txt`: only for tracing an entry back to its PR (`gh pr view <n> --repo opencrvs/opencrvs-core`) when the changelog is too terse to write docs from.

Always check the release-level pages, whatever the changelog says: `releases/release-notes.md`, `technical/guides/version-upgrades.md`, `implementation/your-opencrvs-project/version-upgrades.md`.

For a large release, split the worklist by area (the sections of the docs map) and give each area to a subagent. Each one gets its changelog entries, its signal files and its docs pages, and returns classifications with page paths and quotes of the outdated text. It does not edit. Do the edits yourself so voice and cross-links stay consistent.

**Show the worklist to the user and wait** before editing. Group it by page, most important first: upgrade/breaking changes, then configuration and APIs, then everything else. The user may already know some items are handled elsewhere, or out of scope for this pass.

## 3. Edit

Keep to how the docs repo works. GitBook syncs this repo in both directions:

- Match the neighbouring pages' voice and GitBook blocks (`{% hint %}`, `{% tabs %}`, `{% content-ref %}` …). Copy the syntax from an existing page, don't write it from memory.
- A new page needs an entry in `v<version>.0/SUMMARY.md` at the right depth, or GitBook won't show it.
- Images go in `v<version>.0/.gitbook/assets/`. Never rename or move existing files there.
- Edit only `v<version>.0/`. Older version directories are frozen, and `v2.0.0-*` variants are drafts/backups.
- The API reference pages are GitBook-hosted OpenAPI specs referenced from `SUMMARY.md` (e.g. `spec: events-v20`). They can't be updated from git. If the release changed the events or countryconfig API, list "update the OpenAPI spec in GitBook" as a manual follow-up.
- Write docs for someone operating or configuring OpenCRVS. Say what changed and what they must do, with the concrete names (env var, scope, config key). Leave out internal implementation detail and PR/issue numbers, except in release notes.

Commit in logical chunks (per area, or per page for big rewrites) with messages like `docs(v2.1.0): document record.action.accept/reject scopes`.

## 4. Hand back

Finish with:

- The branch name and `git -C <docs> log --oneline origin/master..HEAD`.
- A table of every changelog entry → status (covered / updated / added / n/a / **needs input**) → page.
- Manual follow-ups: OpenAPI specs in GitBook, screenshots that need re-capturing, questions for feature owners.
- The command for the user to run when ready: `git -C <docs> push -u origin release-docs-<version>`, then `gh pr create --repo opencrvs/documentation`.
