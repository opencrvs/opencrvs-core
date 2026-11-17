# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

# Makes the merges that git can do alone for one hop from plan.sh, pushes the
# forward-merge branch, and opens its PR or comments on the open one. When a
# merge conflicts, the PR asks for approval of the resolve-conflicts job.
#
# Run it locally with DRY_RUN=true to see what it would push and open:
#   DRY_RUN=true GITHUB_REPOSITORY=opencrvs/opencrvs-core SOURCE_BRANCH=release/1.9.x \
#   HOP='<one entry of plan.sh hops>' bash .github/scripts/forward-merge/open-pr.sh
set -euo pipefail
source "$(dirname "$0")/lib.sh"

RUN_URL="${GITHUB_SERVER_URL:-https://github.com}/$GITHUB_REPOSITORY/actions/runs/${GITHUB_RUN_ID:-local}"
hop=$HOP
target=$(jq -r .target <<< "$hop")
PR_BRANCH=$(jq -r .pr_branch <<< "$hop")

# Pushes seconds apart start two runs whose plans both saw no PR. This job
# runs after the other run's job for the same hop, so look again, and build
# on the PR if that run opened it.
replanned=false
if [ -z "$(jq -r .open_pr <<< "$hop")" ] && [ -n "$(open_pr_number "$PR_BRANCH" "$target")" ]; then
  echo "Another run opened the PR after this run's plan; planning again."
  hop=$(plan_hop "$target")
  replanned=true
  if [ -z "$hop" ]; then exit 0; fi
fi

open_pr=$(jq -r .open_pr <<< "$hop")
start=$(jq -r .start <<< "$hop")
conflict_merging=$(jq -r .conflict_merging <<< "$hop")
conflicts=$(jq -c .conflicts <<< "$hop")
missing=$(jq -r .missing <<< "$hop")
mapfile -t clean_merges < <(jq -r '.clean_merges[]' <<< "$hop")

set_git_identity
git checkout -B "$PR_BRANCH" "origin/$start"
redo="git checkout -B $PR_BRANCH origin/$start"
for ref in "${clean_merges[@]}"; do
  git merge --no-edit -m "Merge $ref into $PR_BRANCH" "origin/$ref"
  redo+=$'\n'"git merge origin/$ref"
done

# Push when something changed: a merge, or a new branch made from the source.
if [ ${#clean_merges[@]} -gt 0 ] || [ "$start" != "$PR_BRANCH" ]; then
  authenticate_git
  # Replacing a leftover branch needs force; plan.sh checked nothing is lost.
  push_or_explain "$([ "$start" != "$PR_BRANCH" ] && echo true || echo false)" "$redo"
fi

if [ -z "$conflict_merging" ]; then
  # shellcheck disable=SC2016 # literal Markdown backticks
  status="Merged $(printf '`%s` ' "${clean_merges[@]}")without conflicts."
else
  if [ "$replanned" = true ]; then
    next="Re-run the forward-merge workflow from \`$SOURCE_BRANCH\` so a reviewer can approve Claude Code resolving them."
  else
    next="Claude Code resolves them once a reviewer approves the \`resolve-conflicts\` job in [this run]($RUN_URL). If \`$target\` shouldn't get these changes, reject it and close this PR; no Claude tokens are spent."
  fi
  status="**Merging \`$conflict_merging\` conflicts in these files:**

$(file_bullets "$conflicts")

$next

To resolve by hand instead:
\`\`\`sh
git fetch origin
git checkout -B $PR_BRANCH origin/$PR_BRANCH
git merge origin/$conflict_merging
# resolve, commit
git push origin $PR_BRANCH
\`\`\`"
fi

request_review() { # PR number or URL
  if [ -n "$REVIEWERS" ]; then
    change gh pr edit "$1" --repo "$GITHUB_REPOSITORY" --add-reviewer "$REVIEWERS" \
      || echo "::warning::Could not request review from $REVIEWERS on $1."
  fi
}

if [ -n "$open_pr" ]; then
  change gh pr comment "$open_pr" --repo "$GITHUB_REPOSITORY" --body "\`$SOURCE_BRANCH\` has new commits. $status"
  request_review "$open_pr"
  exit 0
fi

pr_body="Carries $missing commits from \`$SOURCE_BRANCH\` that \`$target\` doesn't have yet.

$status

Before merging:

- [ ] The merge keeps \`$target\`'s behaviour and applies each \`$SOURCE_BRANCH\` change where it belongs.
- [ ] package.json files keep \`$target\`'s version.
- [ ] CHANGELOG.md: the \`$SOURCE_BRANCH\` entries that apply to \`$target\` are under its own version.
- [ ] Merge with **Create a merge commit**. Squash or rebase drops the link to \`$SOURCE_BRANCH\`, so the next run offers the same commits again.

New commits on \`$SOURCE_BRANCH\` are merged into this branch while the PR is open.

Opened by the forward-merge workflow ([run]($RUN_URL)). CI starts once someone pushes to this branch."

if [ "${DRY_RUN:-false}" = "true" ]; then
  printf '[dry run] PR %s -> %s, reviewers: %s\n\n%s\n' "$PR_BRANCH" "$target" "${REVIEWERS:-none}" "$pr_body"
  exit 0
fi
pr_url=$(gh pr create --repo "$GITHUB_REPOSITORY" --base "$target" --head "$PR_BRANCH" \
  --title "chore: merge $SOURCE_BRANCH into $target" --body "$pr_body")
echo "Opened $pr_url" | tee -a "$GITHUB_STEP_SUMMARY"
request_review "$pr_url"
