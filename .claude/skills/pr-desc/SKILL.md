---
name: pr-desc
description: Use when the user asks to write, update, or amend a GitHub PR description — e.g. "update the PR desc", "post it", "ready a draft first", or pastes a github.com/opencrvs PR URL asking to describe the work.
---

# PR Description (draft → approve → post)

Produce a short PR description from what was done this session, show it as a draft, and post only after explicit approval — even if the user just says "update the PR desc."

## Workflow

1. **Target**: use the URL if given, else `gh pr view --json number,title,body,url` on the current branch. If adding to an existing description, fetch and preserve it — append, never replace unasked.
2. **Draft from session knowledge** — don't re-read the diff or re-explore code unless the session genuinely lacks the facts.
3. **Shape** (under ~15 lines, cut before you pad):
   - **Bug fix**: root cause (1–2 sentences, what was actually wrong) + what changed. Mandatory — don't skip to the fix.
   - **Feature**: no root cause; lead with what it does, and why only if genuinely non-obvious.
   - **Design decisions**: only if a real tradeoff or replaced approach happened — never manufactured.
   - **Tests**: one line.
   - Style: plain sentences, inline code in single backticks, no headings deeper than bold labels, no "Closes #NNNN", no meta-narration.
4. **Show the draft, stop, wait for approval.** Revise until approved.
5. **Post via body file**: `gh pr edit <number> --body-file <file>` — inlining with `--body "..."` mangles backticks.
6. **Confirm with the PR URL.** Nothing else.

## Common mistakes

- `--body "..."` inline mangles backticks — always use `--body-file`.
- Replacing an existing description instead of preserving it when asked to "add."
- Re-reading the diff to reconstruct what's already known this session.
- Padding a feature PR with a manufactured root-cause or design-decisions section.
- Jumping straight to "Fix" in a bug-fix PR without explaining what was wrong.
