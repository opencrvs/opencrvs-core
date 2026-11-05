---
name: pr-desc
description: Use when the user asks to write, update, or amend a GitHub PR description, or pastes a github.com/opencrvs PR URL asking to describe the work.
---

# PR Description

1. Get the PR (URL, or `gh pr view` on the current branch). Keep any existing body or template; replace only its placeholder text.
2. Draft from what this session knows. Read the diff only if the session lacks the facts.
3. Write as few bullets as the diff needs: a small PR gets 1–2. For a bug fix, the first bullet states the root cause. Follow the "GitHub text" rules in CLAUDE.md.
4. Show the draft and wait for approval.
5. Post from a file: `gh api repos/<owner>/<repo>/pulls/<n> -X PATCH -f body="$(cat <file>)"`. Do not use `gh pr edit` (it fails on "Projects (classic)") or an inline body (it breaks backticks).
6. Reply with the PR URL only.
