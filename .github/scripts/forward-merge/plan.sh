# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

# Works out, for each line newer than the source, what to merge into its
# forward-merge branch, and whether git can do it without help. Changes no
# branch: the merges are tried with `git merge-tree`.
#
# Writes to $GITHUB_OUTPUT: source, reviewers, hops and conflicted (JSON).
#
# Run it locally from an up-to-date clone (git fetch origin) with gh logged in:
#   GITHUB_OUTPUT=/dev/stdout GITHUB_REPOSITORY=opencrvs/opencrvs-core \
#   GITHUB_EVENT_NAME=workflow_dispatch GITHUB_ACTOR=me REQUESTED_LINE=1.9.x \
#     bash .github/scripts/forward-merge/plan.sh
set -euo pipefail
source "$(dirname "$0")/lib.sh"

# --- the source line and the lines after it ----------------------------------

lines=$(release_lines)
SOURCE_BRANCH="release/${REQUESTED_LINE#release/}"
if ! grep -qx "$SOURCE_BRANCH" <<< "$lines"; then
  echo "::error::'$REQUESTED_LINE' is not a release line. Release lines: $(paste -sd, <<< "$lines")"
  exit 1
fi
targets=$(awk -v s="$SOURCE_BRANCH" 'found { print } $0 == s { found = 1 }' <<< "$lines"; echo develop)
echo "$SOURCE_BRANCH -> $(paste -sd' ' <<< "$targets")"

# --- who to ask for review ---------------------------------------------------

# A manual run: whoever started it. A push: the authors of the PRs whose
# commits it added. Forward-merge PRs are skipped, so merging one asks the
# authors of the feature PRs it carried.
if [ "$GITHUB_EVENT_NAME" = "workflow_dispatch" ]; then
  reviewers="$GITHUB_ACTOR"
else
  if [ -n "${BEFORE:-}" ] && git cat-file -e "$BEFORE^{commit}" 2> /dev/null; then
    commits=$(git rev-list --no-merges "$BEFORE..$GITHUB_SHA")
  else
    commits="$GITHUB_SHA"
  fi
  reviewers=$(for commit in $commits; do
    gh api "repos/$GITHUB_REPOSITORY/commits/$commit/pulls" \
      --jq '.[] | select(.merged_at != null and (.head.ref | startswith("forward-merge/") | not)) | .user.login'
  done | grep -v '\[bot\]$' | sort -u | paste -sd, || true)
fi
echo "Reviewers: ${reviewers:-none}"

# --- one hop per newer line --------------------------------------------------

hops=$(for target in $targets; do plan_hop "$target"; done | jq -sc .)

{
  echo "source=$SOURCE_BRANCH"
  echo "reviewers=$reviewers"
  echo "hops=$hops"
  echo "conflicted=$(jq -c 'map(select(.conflict_merging != ""))' <<< "$hops")"
} >> "$GITHUB_OUTPUT"
