---
name: release-prep
description: Entry point for preparing an OpenCRVS core release — lists the release-prep tasks and gathers what changed in the release. Run as /release-prep <version>.
argument-hint: <version, e.g. 2.1>
disable-model-invocation: true
---

# Release prep

Checklist of release-prep tasks for core `$ARGUMENTS`, and the shared way every task finds out what changed. Each task is its own skill so it can be run on its own.

## 1. Gather the changes (every task starts here)

```bash
.claude/skills/release-prep/scripts/list-release-changes.sh <version> [--base <ref>] [--head <ref>] [--out <dir>]
```

Pass `--out` pointing into the session scratchpad. The script fetches tags, resolves the range and writes the files below. It prints a summary, so read that before opening anything.

| Output | What it's for |
| --- | --- |
| `changelog.md` | **Primary source.** The `## <version>` section of `CHANGELOG.md` at the head ref. Every task works through this section heading by heading. |
| `commits.txt` | `<sha> <#pr> <title>` for each first-parent commit. Use it to find changes the changelog missed; look up details with `gh pr view <n> --repo opencrvs/opencrvs-core`. |
| `packages.txt`, `new-packages.txt` | Where the change volume is. A new package (e.g. moved in from another repo) usually means a whole docs area needs checking. |
| `signals/<topic>.txt` | Changed files grouped by docs-relevant topic (env/deploy, scopes, event config, toolkit, events API, countryconfig contract, integrations, …). |
| `env-vars.txt` | Env var names added or removed across `environment.ts`, compose files and Helm values. Every removal is a probable upgrade-guide item. |

Range defaults: base is the previous minor's `.0` tag (2.1 → `v2.0.0`), head is `origin/release/<version>.0` if that branch exists and `origin/develop` otherwise. Before the release branch is cut, confirm with the user that develop is the right head.

The changelog is written by hand and is the release's intended story. Treat a gap between it and the commits as a finding to report, not something to silently fill in.

## 2. Tasks

| Skill | Does |
| --- | --- |
| `/release-docs-sync <version>` | Makes `v<version>.0/` in `opencrvs/documentation` reflect what the release ships |

Add new release-prep tasks as sibling skills named `release-<task>`. Each one runs the script above in its first step instead of re-deriving the range, and gets a row in this table.

## Ground rules for all release-prep tasks

- Skills live on `develop` and run from a `develop` checkout. The release is read through git refs (`git show <head>:<path>`, `git diff <fork> <head>`), never by checking out the release branch.
- Anything that leaves the machine (pushes, PRs, GitBook changes) is for the user to do. `git push` is denied in `.claude/settings.json` on purpose: finish with a ready branch and a summary.
- Report what you could not verify. Don't guess at behaviour. Read the code at the head ref, or ask.
