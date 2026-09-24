# Claude issue → PR automation

Assign an issue to the Claude bot user and Claude takes it from a *Ready to build*
card to an open PR, then posts to Slack once the PR's checks are green.

It runs as **three workflows**, split so the human-approval gate and the
"wait for CI" gate each get their own trigger (a single Actions run cannot pause
for a human, nor block for hours waiting on checks):

| Phase | Workflow | Trigger | What it does |
| --- | --- | --- | --- |
| A — Triage & plan | `claude-issue-triage.yml` | issue **assigned** to the bot user | Moves the card to *In development*, investigates, posts an implementation plan as an issue comment, then labels the issue `ready-to-build` **or** `needs-refinement` (and stops). Writes no code. |
| B — Implement | `claude-issue-implement.yml` | label **`claude:approved`** added (a human's go-ahead) | Implements the plan, runs `pnpm` checks locally, opens a PR (`Closes #<n>`), moves the card to *In review*. |
| C — PR outcome | `claude-pr-notify.yml` | a Claude PR's **check suite completes** | **All green** → posts the PR link to `#opencrvs-developers` (once). **Only the flaky e2e check failed** → re-runs the feature-environment deploy up to `E2E_MAX_ATTEMPTS` times for the commit before giving up. **A non-e2e check failed, or e2e failed after its reruns** → labels the PR `claude:fix-needed` (hands to phase D). |
| D — Self-heal | `claude-pr-selfheal.yml` | label **`claude:fix-needed`** added by phase C | Reads the failing check logs, pushes a fix, lets CI re-run. Bounded to `FIX_MAX_ATTEMPTS`; after that it labels `claude:needs-human`, comments, and pings Slack. |

### Flaky e2e handling

The e2e suite runs in the separate `opencrvs/e2e` repo and surfaces on core PRs as
the **`Deploy PR to feature environment / listen-e2e`** check, which is sometimes
flaky. Phase C distinguishes a flaky e2e failure from a real one:

- If the **only** failing check is `listen-e2e`, it re-dispatches
  `deploy-to-feature-environment.yml` (via its `workflow_dispatch` `pr_number`
  input), which re-runs the whole build + e2e. It repeats until the e2e has run
  `E2E_MAX_ATTEMPTS` times **for that commit** (default 3 = original + 2 reruns),
  then treats it as real.
- If **any other** check fails, that's deterministic — it goes straight to phase D
  without wasting reruns.

The attempt count is derived from the feature-env workflow's own run history for
the PR head SHA, so it **self-resets** when a new commit is pushed. Tune the count
via the `E2E_MAX_ATTEMPTS` env in `claude-pr-notify.yml` and, if your board renames
the check, the `E2E_JOB` / `DEPLOY_WORKFLOW` envs there.

The human gate is deliberate: Claude proposes a plan (A), a person reviews it and
adds `claude:approved` to start implementation (B). Nothing auto-merges.

## One-time setup

Most of this already exists in `opencrvs-core`; the checklist calls out what's new.

1. **Claude GitHub App** — already installed (used by `claude.yml`). ✅
2. **`CLAUDE_CODE_OAUTH_TOKEN`** secret — already present. ✅ Regenerate with
   `claude setup-token` when it expires.
3. **Bot user** — create/choose a machine GitHub account (e.g. `opencrvs-claude`),
   give it write access to `opencrvs-core`, and make it assignable (org member or
   repo collaborator). Set its login as `BOT_ASSIGNEE` below.
4. **`CLAUDE_BOT_TOKEN`** secret — a **fine-grained PAT from the bot account** with:
   - Repository (`opencrvs-core`): **Contents** RW, **Pull requests** RW, **Issues** RW, **Actions** RW (Actions is needed to re-dispatch the feature-env deploy for flaky-e2e reruns and to read failing run logs in phase D)
   - Organization: **Projects** RW (needed to move the sprint-board card)

   This token is passed to the action as `github_token` in A and B. Using a PAT
   (not the default `GITHUB_TOKEN`) is **required** so that the PR Claude opens
   actually triggers CI — PRs created by `GITHUB_TOKEN` are suppressed from
   triggering other workflows, which would strand phase C.
5. **`SLACK_WEBHOOK_URL`** secret — a Slack incoming webhook that posts to
   `#opencrvs-developers`. (Alternatively use a bot token + `slackapi/slack-github-action`.)
6. **Labels** — create: `claude:planning`, `ready-to-build`, `needs-refinement`,
   `claude:approved`, `claude:building`, `claude:pr-open`, `claude:notified`,
   `claude:checks-failed`, `claude:fix-needed`, `claude:fix-attempt-1`,
   `claude:fix-attempt-2`, `claude:needs-human`.
7. **Project board** — note the org Project's *Status* field options. Claude resolves
   the item and option IDs at runtime via `gh`, so you don't hard-code them, but the
   option **names** must match what the prompts use: `In development`, `In review`.

### Placeholders to replace in the workflow files

- `BOT_ASSIGNEE` → the bot account login (e.g. `opencrvs-claude`)
- Status names (`In development`, `In review`) if your board uses different labels

## Slack message template

Phase C posts using the template below. **Replace this block with your final copy**
(the workflow reads `SLACK_MESSAGE` — keep the `{{PLACEHOLDERS}}`):

```
:rocket: *Claude opened a PR and it's green*
*Issue:* {{ISSUE_TITLE}} (#{{ISSUE_NUMBER}})
*PR:* {{PR_URL}}
All checks passed — ready for review.
```

## Guardrails

- **No auto-merge.** PRs are review-gated as normal.
- **Conservative gate.** Phase A errs toward `needs-refinement` when anything is
  ambiguous or needs product/design input.
- **Cost/time caps** via `--max-turns` and `timeout-minutes`.
- **Restricted tools.** Each phase allow-lists only the tools it needs.
- **Single repo.** Cross-repo changes (e.g. `documentation`) are out of scope for
  now; add a multi-repo token + checkout later.

## Self-heal (phase D)

On a *real* failure, phase C labels the PR `claude:fix-needed` and phase D takes
over: it reads the failing check logs, pushes a fix, and lets CI re-run. It is
bounded by `claude:fix-attempt-N` labels (default max 2, via `FIX_MAX_ATTEMPTS`);
after that it labels `claude:needs-human`, comments, and pings Slack.

If you'd rather keep genuine failures human-only, delete `claude-pr-selfheal.yml` —
phase C still re-runs flaky e2e and still labels/pings, it just won't push fixes.

## Testing safely

Try this in a throwaway repo or a sandbox project board first. Actions can't be
dry-run locally, and these workflows have write permissions and post to Slack.
