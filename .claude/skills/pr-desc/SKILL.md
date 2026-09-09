---
name: pr-desc
description: Use when the user asks to write, update, or amend a GitHub PR description — e.g. "update the PR desc", "post it", "ready a draft first", or pastes a github.com/opencrvs PR URL asking to describe the work.
---

# PR Description (draft → approve → post)

Produce a short PR description from what was done this session, show it as a draft, and post only after explicit approval — even if the user just says "update the PR desc."

## Workflow

1. **Target**: use the URL if given, else `gh pr view --json number,title,body,url` on the current branch. If adding to an existing description, fetch and preserve it — append, never replace unasked.
2. **Draft from session knowledge** — don't re-read the diff or re-explore code unless the session genuinely lacks the facts.
3. **Shape**: bullet points only, never prose paragraphs. One sentence per bullet — if a bullet needs a second sentence, either cut it or split it into its own bullet. Under ~8 bullets total, cut before you pad:
   - **Root cause** (bug fix only, mandatory): one bullet, what was actually wrong — not the symptom. Omit entirely for features.
   - **Change**: 1–3 bullets, what changed, at the level a reviewer needs to follow the diff.
   - **Design decisions**: 0–2 bullets, only if a real tradeoff or replaced approach happened — never manufactured to fill space.
   - **Tests**: one bullet.
   - Style: `-` bullets, inline code in single backticks, no headings deeper than bold labels, no "Closes #NNNN", no meta-narration, no restating the title as a bullet.
4. **Show the draft, stop, wait for approval.** Revise until approved.
5. **Post via body file**: `gh api repos/<owner>/<repo>/pulls/<number> -X PATCH -f body="$(cat <file>)"`.
6. **Confirm with the PR URL.** Nothing else.

## Common mistakes

- Inlining the body with `--body "..."`/`-f body="..."` typed directly mangles backticks — always source it from a file.
- Replacing an existing description instead of preserving it when asked to "add."
- Re-reading the diff to reconstruct what's already known this session.
- Padding a feature PR with a manufactured root-cause or design-decisions section.
- Jumping straight to "Fix" in a bug-fix PR without explaining what was wrong.
- Writing prose paragraphs instead of bullets, or multi-sentence bullets — split or cut instead.
- Trying `gh pr edit --body-file` first — it errors on "Projects (classic)" every time on this repo; go straight to `gh api ... -X PATCH`.
