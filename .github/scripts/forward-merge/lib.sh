# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

# Helpers shared by the forward-merge scripts. Sourced, not run.

# The release lines in version order, e.g. release/1.9.x release/2.0.x. They
# are read from the branches, so a new line needs no change here.
release_lines() {
  git branch -r --format='%(refname:lstrip=3)' \
    | grep -E '^release/[0-9]+\.[0-9]+\.x$' \
    | sort -V
}

# The branch a forward-merge PR comes from: release/1.9.x, release/2.0.x ->
# forward-merge/19x-into-20x. Dots are stripped to pass the branch-name check.
pr_branch_name() { # source, target
  local from="${1#release/}" to="${2#release/}"
  echo "forward-merge/${from//./}-into-${to//./}"
}

# Succeeds when branch or commit $1 already contains $2.
contains() {
  git merge-base --is-ancestor "$2" "$1"
}

# The open PR from the forward-merge branch into the target, or nothing.
open_pr_number() { # pr_branch, target
  gh pr list --repo "$GITHUB_REPOSITORY" --head "$1" --base "$2" --state open \
    --json number --jq '.[0].number // ""'
}

# Runs a command that changes something on GitHub. A dry run only prints it.
change() {
  if [ "${DRY_RUN:-false}" = "true" ]; then echo "[dry run] $*" >&2; else "$@"; fi
}

set_git_identity() {
  git config user.name "github-actions[bot]"
  git config user.email "github-actions[bot]@users.noreply.github.com"
}

# The checkout keeps no token, so git is given one only right before a push.
authenticate_git() {
  git config http.https://github.com/.extraheader \
    "AUTHORIZATION: basic $(printf 'x-access-token:%s' "$GH_TOKEN" | base64 -w0)"
}

# Pushes PR_BRANCH (set by the calling script), and explains the one refusal
# that needs a person: GITHUB_TOKEN may not push changes to .github/workflows/.
# shellcheck disable=SC2016,SC2153 # literal backticks; PR_BRANCH is the caller's
push_or_explain() { # force (true|false), the commands that redo this job's work
  local force_flag="" output
  if [ "$1" = "true" ]; then force_flag="--force"; fi
  if output=$(change git push $force_flag origin "$PR_BRANCH" 2>&1); then
    echo "$output"
    return 0
  fi
  echo "$output"
  if grep -q 'without `workflows` permission' <<< "$output"; then
    echo "::error::GitHub refused the push because the merge changes files under .github/workflows/, which the workflow's token may not do. Push $PR_BRANCH by hand (see the job summary), then re-run this workflow."
    {
      echo "### Push \`$PR_BRANCH\` by hand"
      echo
      echo "GitHub refused the push: the merge changes files under \`.github/workflows/\`, which the workflow's token may not do."
      echo
      echo '```sh'
      echo "git fetch origin"
      echo "$2"
      echo "git push $force_flag origin $PR_BRANCH"
      echo '```'
    } >> "${GITHUB_STEP_SUMMARY:-/dev/stderr}"
  fi
  return 1
}

# One Markdown bullet per file, from a JSON array of file names.
file_bullets() { # json array
  jq -r '.[] | "- `\(.)`"' <<< "$1"
}

# Prints, as JSON, what to merge into the forward-merge branch from
# SOURCE_BRANCH into one target, and whether git can do it without help.
# Prints nothing when there is nothing to do. The merges are tried with
# `git merge-tree`, so no branch changes.
plan_hop() { # target
  local target=$1 pr_branch open_pr start pending=() clean=() conflict_merging="" conflicts='[]'
  pr_branch=$(pr_branch_name "$SOURCE_BRANCH" "$target")
  open_pr=$(open_pr_number "$pr_branch" "$target")

  if git rev-parse -q --verify "origin/$pr_branch" > /dev/null \
    && { [ -n "$open_pr" ] || contains "origin/$pr_branch" "origin/$SOURCE_BRANCH"; }; then
    # An open PR, or a branch someone already prepared: build on it.
    start="origin/$pr_branch"
    if ! contains "$start" "origin/$SOURCE_BRANCH"; then pending+=("$SOURCE_BRANCH"); fi
    if ! contains "$start" "origin/$target"; then pending+=("$target"); fi
  elif contains "origin/$target" "origin/$SOURCE_BRANCH"; then
    echo "$target: nothing to merge from $SOURCE_BRANCH." >&2
    return
  elif git rev-parse -q --verify "origin/$pr_branch" > /dev/null \
    && ! contains "origin/$target" "origin/$pr_branch" \
    && ! contains "origin/$SOURCE_BRANCH" "origin/$pr_branch"; then
    # Left over from a PR closed without merging, with work on it.
    echo "::warning::$pr_branch has commits that are in neither $target nor $SOURCE_BRANCH, probably from a PR closed without merging. Delete or merge it, then re-run." >&2
    return
  else
    # A new PR: a copy of the source with the target merged in.
    start="origin/$SOURCE_BRANCH"
    pending=("$target")
  fi

  if [ ${#pending[@]} -eq 0 ]; then
    echo "$target: #$open_pr is up to date." >&2
    return
  fi

  # Try the merges in order, stopping at the first that needs help.
  local tip=$start ref out status tree files
  for ref in "${pending[@]}"; do
    out=$(mktemp)
    status=0
    git merge-tree -z --write-tree --name-only --no-messages "$tip" "origin/$ref" > "$out" || status=$?
    tree=$(head -z -n 1 "$out" | tr -d '\0')
    files=$(tail -z -n +2 "$out" | jq -Rs 'split("\u0000") | map(select(. != ""))')
    rm -f "$out"
    if [ "$status" -eq 0 ]; then
      # A local commit to try the next merge on; never pushed.
      tip=$(GIT_AUTHOR_NAME=trial GIT_AUTHOR_EMAIL=trial@localhost \
        GIT_COMMITTER_NAME=trial GIT_COMMITTER_EMAIL=trial@localhost \
        git commit-tree "$tree" -p "$tip" -p "origin/$ref" -m "trial merge of $ref")
      clean+=("$ref")
    elif [ "$status" -eq 1 ]; then
      conflict_merging=$ref
      conflicts=$files
      break
    else
      echo "::error::git merge-tree failed for $ref into $pr_branch." >&2
      return 1
    fi
  done

  echo "$target: clean merges: ${clean[*]:-none}${conflict_merging:+; $conflict_merging conflicts in: $(jq -r 'join(", ")' <<< "$conflicts")}" >&2
  jq -nc \
    --arg target "$target" --arg pr_branch "$pr_branch" --arg open_pr "$open_pr" \
    --arg start "${start#origin/}" --arg conflict_merging "$conflict_merging" \
    --arg missing "$(git rev-list --count "origin/$target..origin/$SOURCE_BRANCH")" \
    --argjson conflicts "$conflicts" \
    '{target: $target, pr_branch: $pr_branch, open_pr: $open_pr, start: $start,
      clean_merges: $ARGS.positional, conflict_merging: $conflict_merging,
      conflicts: $conflicts, missing: $missing}' \
    --args "${clean[@]}"
}
