# Issue tracker: Local Markdown

Issues, specs, and maps for this repo live as Markdown files in `.scratch/`; skills and humans author prose directly in Markdown.

Load the `local-issue-tracker` skill for structured issue operations and its CLI invocation.

Use the CLI for:
- issue creation
- triage
- blockers
- claims
- releases
- resolution
- queries
- validation

Use ordinary Markdown edits for:
- specs
- maps
- descriptions
- questions
- acceptance criteria
- answers
- comments
- decision pointers

## Layout

- Effort: `.scratch/<effort>/`
- Spec: `.scratch/<effort>/spec.md`
- Map: `.scratch/<effort>/map.md`
- Issue: `.scratch/<effort>/issues/<NN>-<slug>.md`
- Stable issue identity: `<effort>/<number>`

The CLI accepts stable identities and resolves current issue paths.

## Managed metadata

Canonical issues carry the skill-management marker and separate triage and lifecycle fields:

```markdown
# Launch agent windows

<!-- Issue metadata: manage with the local-issue-tracker skill. -->
Triage: ready-for-agent
State: open
Type: task
Blocked by: 01, 03

## What to build
...
```
- `Triage:` uses the role strings in `triage-labels.md`.
- `Type:` is optional and records `research`, `prototype`, `grilling`, or `task`.
- The CLI owns the contiguous metadata block; direct editing remains available for recovery.

## Wayfinding operations

Author Notes, Decisions-so-far, and Fog directly in `.scratch/<effort>/map.md`. To resolve a child issue, author `## Answer`, resolve through the CLI, then append the context pointer to the map directly.

## Migration

A maintainer starts migration explicitly through the CLI. Read-only commands identify legacy `Status:` files; setup and adoption leave existing efforts unchanged.
