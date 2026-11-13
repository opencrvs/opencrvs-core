# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

# The steps around Claude Code in the resolve-conflicts job:
#   start   starts the conflicting merge in the forward-merge branch, leaving
#           the conflicts for Claude, and saves the target's Claude settings
#   finish  checks that every conflict is resolved, then commits and pushes,
#           and reports on the PR either way
#
# Needs SOURCE_BRANCH, TARGET_BRANCH, PR_BRANCH and MERGING (the branch being
# merged in). `finish` also reads CONFLICTS (JSON) and RESOLUTION_FILE.
set -euo pipefail
source "$(dirname "$0")/lib.sh"

pr_comment() { # body
  local pr_number
  pr_number=$(open_pr_number "$PR_BRANCH" "$TARGET_BRANCH")
  if [ -n "$pr_number" ]; then
    gh pr comment "$pr_number" --repo "$GITHUB_REPOSITORY" --body "$1"
  fi
}

start() {
  set_git_identity

  # Claude gets the target's project settings: during the merge, the copy in
  # the working tree can hold conflict markers and fail to parse.
  git show "origin/$TARGET_BRANCH:.claude/settings.json" > "$RUNNER_TEMP/claude-settings.json" 2> /dev/null \
    || echo '{}' > "$RUNNER_TEMP/claude-settings.json"

  git checkout -B "$PR_BRANCH" "origin/$PR_BRANCH"
  # Someone may have merged it by hand while the job waited for approval.
  if contains HEAD "origin/$MERGING"; then
    echo "$PR_BRANCH already has $MERGING."
    echo "needed=false" >> "$GITHUB_OUTPUT"
    return
  fi
  echo "needed=true" >> "$GITHUB_OUTPUT"

  local conflicted_files='[]'
  if ! git merge --no-edit -m "Merge $MERGING into $PR_BRANCH" "origin/$MERGING"; then
    conflicted_files=$(git diff -z --name-only --diff-filter=U | jq -Rsc 'split("\u0000") | map(select(. != ""))')
  fi
  echo "conflicts=$conflicted_files" >> "$GITHUB_OUTPUT"
}

# shellcheck disable=SC2153 # CONFLICTS comes from the workflow
finish() {
  local redo="git checkout -B $PR_BRANCH origin/$PR_BRANCH"$'\n'"git merge origin/$MERGING  # resolve, commit"

  if [ "$CONFLICTS" != '[]' ]; then
    # Claude must have staged every file and left no conflict markers.
    local unresolved=false file
    if [ -n "$(git diff --name-only --diff-filter=U)" ]; then unresolved=true; fi
    while IFS= read -r -d '' file; do
      if [ -f "$file" ] && grep -qE '^(<<<<<<<|>>>>>>>)( |$)' -- "$file"; then unresolved=true; fi
    done < <(jq -j '.[] + "\u0000"' <<< "$CONFLICTS")

    if [ "$unresolved" = true ]; then
      git merge --abort
      echo "::warning::Claude Code did not resolve every conflict with $MERGING."
      pr_comment "Claude Code could not resolve the conflicts with \`$MERGING\`. Resolve them by hand with the commands in the description."
      return
    fi
  fi

  # A merge that git finished alone (the branches moved) is already committed.
  if git rev-parse -q --verify MERGE_HEAD > /dev/null; then
    git commit --no-edit
  fi
  authenticate_git
  push_or_explain false "$redo"

  if [ "$CONFLICTS" = '[]' ]; then
    pr_comment "\`$MERGING\` now merges in without conflicts, so Claude Code was not needed."
    return
  fi

  local notes
  notes=$(cat "$RESOLUTION_FILE" 2> /dev/null || echo "Claude left no notes.")
  pr_comment "**Claude Code resolved the conflicts with \`$MERGING\`.** Check its resolution before merging.

<details><summary>Claude's notes</summary>

$notes
</details>"
}

case "${1:-}" in
  start) start ;;
  finish) finish ;;
  *)
    echo "Usage: $0 start|finish" >&2
    exit 2
    ;;
esac
