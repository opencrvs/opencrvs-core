# Forward merges between release lines

A fix made on a release line must also reach the newer release lines and `develop`. The forward-merge workflow does this one line at a time.

- Workflow: `.github/workflows/forward-merge-release-lines.yml` (**Release - Forward-merge release lines**)
- Scripts: `.github/scripts/forward-merge/`. You can also run them locally.

## The chain

Each `release/X.Y.x` branch is a release line. The workflow sorts the lines by version, and `develop` comes after the newest line. For example:

```
release/2.0.x → release/2.1.x → develop
```

1. A push to a release line starts the workflow. A merged PR is also a push.
2. The workflow opens a PR from that line into the next line. `ocrvs-bot` is the author. The branch is `forward-merge/<from>-into-<to>`, for example `forward-merge/20x-into-21x`.
3. When someone merges that PR, the next line gets a push. The workflow then opens the PR into the line after it.
4. When the PR into `develop` is merged, every newer line has the change.

There is only one PR for each pair of lines. If more commits land on the source line while the PR is open, the workflow merges them into the same PR and adds a comment.

The chain stops at a PR that nobody merges. Do not leave these PRs open longer than necessary.

## Reviewing a forward-merge PR

The workflow asks the authors of the original PRs to review. For a manual run, it asks the person who ran it. If your change is in the PR, review it.

- **Merge with "Create a merge commit".** A squash or a rebase removes the link to the source line. The next run then offers the same commits again.
- **Check that CI passes.** A change can merge without conflicts and still break the newer line, for example when a type or an API changed between the lines.
- **Keep the target line's versions.** The `package.json` and Helm chart versions of the target line must not change. The source line's CHANGELOG entries go under the target line's topmost section.

## Conflicts

When git cannot merge alone, the PR lists the files that conflict. Then:

1. A member of the `developers` team approves the **Resolve conflicts** job in the `forward-merge-claude` environment. The PR has a link to the run.
2. Claude Code resolves the conflicts. It keeps the target line's code and behaviour, and it applies each change from the source line to the target line's code. It leaves out a change that does not apply.
3. The workflow pushes the result and adds Claude's notes to the PR as a comment.

Claude edits only the files that conflict. Read its notes, and fix by hand what CI finds.

If the target line must not get the changes, reject the job and close the PR. Claude then spends no tokens. If Claude cannot resolve the conflicts, the PR comment gives the commands to resolve them by hand.

## Where to make a fix

Make a fix on the **oldest supported release line that has the bug**. Do not make it on `develop` and then copy it back. The chain carries the fix to the newer lines.

Never merge `develop` or a newer line into an older line.

## Security fixes

Forward-merge PRs are public. If a security fix lands on one line, anyone can read it while the newer lines are still vulnerable. Do not use the chain to deliver a security fix during an embargo.

Do the work in the private fork of the GitHub security advisory:

1. **Bring the chain up to date first.** Merge or close the open forward-merge PRs. If you skip this step, the fix branches also carry unrelated commits.
2. **Fix the oldest affected line.** Make the fix on a branch from that line.
3. **Merge the fix forward.** For each newer line, make a branch from that line and merge the previous fix branch into it. Do not cherry-pick. A merge keeps the same commits on every line.
4. **Run the tests locally.** CI does not run in advisory private forks.
5. **When the embargo ends, merge all the advisory PRs at the same time.**

After the release, the chain runs as usual. Every line already has the fix commits, so the forward-merge PRs have nothing to resolve for the fix.

## Running the workflow by hand

Go to **Actions → Release - Forward-merge release lines → Run workflow**:

- `from`: the line to start from, for example `2.0.x`.
- `dry_run`: report what the workflow would push and open, but change nothing.

To see the plan locally, fetch first (`git fetch origin`) and log in with `gh`:

```sh
GITHUB_OUTPUT=/dev/stdout GITHUB_REPOSITORY=opencrvs/opencrvs-core \
GITHUB_EVENT_NAME=workflow_dispatch GITHUB_ACTOR=me REQUESTED_LINE=2.0.x \
  bash .github/scripts/forward-merge/plan.sh
```

## The bot token

The workflow pushes and opens PRs with `ocrvs-bot`'s fine-grained token, which is in the repository secret `CORE_FORWARD_MERGE_TOKEN`. The token has access to `opencrvs-core` only: contents, pull requests and workflows.

The token expires. Renew it before the expiry date. Without the token, the workflow uses `GITHUB_TOKEN`, and then:

- CI does not start on the forward-merge PRs until someone pushes to them.
- GitHub refuses a push that changes `.github/workflows/`. The run summary then gives the commands to push by hand.

## Problems

- **The workflow warns that `forward-merge/...` has commits that are in neither line.** A PR was closed without a merge, and its branch still exists. Delete the branch or merge it, then run the workflow again.
- **A forward-merge PR offers commits that the target already has.** Someone squashed or rebased an earlier forward-merge PR. Merge this PR with a merge commit to repair the link.
- **A release line has ended.** Delete its `release/X.Y.x` branch. The line then leaves the chain. No change to the workflow is necessary.
