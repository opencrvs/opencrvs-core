---
name: pr-desc
description: Use when writing or updating a GitHub PR description, including when the user pastes a github.com/opencrvs PR URL to describe.
---

# PR Description

1. Get the PR from the given URL or find the one created for the current branch. Keep any existing body or template; replace only its placeholder text.
2. Draft from what this session knows. Read the diff only when the session lacks the facts.
3. Write what the comment in `.github/PULL_REQUEST_TEMPLATE.md` asks for, in as few bullets as the diff needs: a small PR gets 1–2.
4. Show the draft and wait for approval.
5. Post it, then reply with the PR URL only.

## Posting

- Pass the body from a file. An inline body breaks backticks.
- `gh pr edit` fails on this repo because of Projects (classic). Update the body through the REST API.
