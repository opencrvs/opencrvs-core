<!--
This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.

OpenCRVS is also distributed under the terms of the Civil Registration
& Healthcare Disclaimer located at http://opencrvs.org/license.

Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
-->

# Risk classification of pull requests

The Claude review gives each pull request a risk level: `low`, `medium` or `high`. The level tells how strict the review must be. The `claude-review` workflow adds the label `risk: <level>` to the PR.

The level comes from the diff. The PR description and the commit messages do not lower it.

## How to choose the level

- Read the whole diff, and the code around it when you need to know what it changes.
- Find each criterion below that the diff matches. The highest match gives the level.
- If the diff matches no criterion, the level is `medium`.
- If you cannot decide between two levels, choose the higher level.
- Generated files, such as lock files, snapshots and generated types, do not make a PR `low` or `high` alone. Use the change that caused them.

### High

A change is `high` when an error in it can expose personal data, damage records, give access to the wrong users, or stop a deployed country from working. It is `high` when it touches one of these:

- Authentication, authorization, scopes, jurisdiction checks, tokens, request signing, secrets or cryptography.
- A migration, the database schema, the search index mappings, or code that deletes or rewrites stored records.
- The rules of the record lifecycle: which actions are allowed, the changes that an action makes, the status of a record, deduplication, or registration numbers.
- The contract with the country config: the exports of `@opencrvs/toolkit`, the format of the event config, scopes, a changed default, a renamed or removed translation key, or a breaking change in a public API.
- Personal data in logs, error messages, notifications, URLs, or requests to other systems such as MOSIP.
- `charts/`, `.github/workflows/`, `.github/scripts/`, a Dockerfile, or a major version of a runtime dependency.
- Shared code in `packages/commons` that changes the behaviour of more than one service.

### Medium

A change is `medium` when it changes the behaviour of the system, but it matches no `high` criterion. Examples:

- A new feature or a bug fix in one package.
- A change to a database query that does not change the stored data.
- A refactor that moves or changes runtime code.
- A minor version of a runtime dependency.

### Low

A change is `low` when it cannot change the behaviour of a deployed system. Only these changes are `low`:

- Documentation and code comments.
- Tests, test fixtures and Storybook stories, with no change to the code that they test.
- The text or the style of the UI, with no change to the logic.
- Development scripts and tools that do not run in a deployment.
- A patch version of a dependency, or a development dependency.

## What the level changes

| Level    | The Claude review                                | A person                                                                           |
| -------- | ------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `low`    | Does the normal review.                          | Any maintainer can approve the PR.                                                 |
| `medium` | Does the normal review.                          | A maintainer reads the code before approving.                                      |
| `high`   | Does the normal review and the high-risk review. | A maintainer who knows the area approves the PR after the Claude review is posted. |

Merge a `high` refactor at the start of the work on a release, as `CONTRIBUTING.md` tells.

## The high-risk review

Do this review only for a `high` PR, after the normal review. Check each item against the diff, and report each problem as an inline comment:

- Authorization: each new or changed path checks the scope and the jurisdiction of the user. No path skips the check.
- Stored data: the records that deployed countries have now still parse, index and show correctly. A migration is safe to run again, and it works on a large database.
- Country config: a country config that worked before the change still works. If it does not, the PR tells what the country must change.
- Failure: a partial failure, a retry or a timeout does not leave a record in a broken state. The error is visible to the person who can fix it.
- Personal data: no personal data, token or secret goes into a log, an error message or a URL.
- Rollback: a deployment of the previous version still works with the data that this version writes.
