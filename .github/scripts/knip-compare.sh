#!/usr/bin/env bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

# Fails when the branch has more unused exports than its base, as reported by
# knip. The lint-knip CI job and `pnpm knip:compare` both run this. knip is
# not a dependency; pinning it here keeps CI and local runs on one version.
#
#   knip-compare.sh <base-dir> <pr-dir>   compare two installed checkouts (CI)
#   knip-compare.sh [base-ref]            compare HEAD with its merge-base with
#                                         base-ref (default origin/develop)

set -euo pipefail

KNIP=knip@6.40.0

report() {
  (cd "$1" && pnpm --silent dlx "$KNIP" --tags=-knipignore --no-exit-code --exports --reporter=markdown) |
    sed -E 's/ +/ /g' | sed -E 's/:[0-9]+:[0-9]+//'
}

total() {
  sed -nE 's/^## [A-Za-z ]+ \(([0-9]+)\)$/\1/p' "$1" | awk '{ sum += $1 } END { print sum + 0 }'
}

if [ $# -eq 2 ]; then
  base_dir=$1
  pr_dir=$2
else
  pr_dir=$(git rev-parse --show-toplevel)
  base_commit=$(git merge-base HEAD "${1:-origin/develop}")
  base_dir=$(mktemp -d)
  trap 'git -C "$pr_dir" worktree remove --force "$base_dir"' EXIT
  git -C "$pr_dir" worktree add --quiet --detach "$base_dir" "$base_commit"
  (cd "$base_dir" && pnpm install --frozen-lockfile --ignore-scripts --prefer-offline --silent)
fi

reports=$(mktemp -d)
report "$base_dir" > "$reports/base.md"
report "$pr_dir" > "$reports/pr.md"
base_total=$(total "$reports/base.md")
pr_total=$(total "$reports/pr.md")
echo "Unused exports: $base_total on base, $pr_total on this branch."

if [ "$pr_total" -le "$base_total" ]; then
  exit 0
fi

summary="${GITHUB_STEP_SUMMARY:-/dev/stdout}"
{
  echo "## ⚠️ Total issues have increased in the PR branch."
  echo "Differences:"
  echo '```diff'
  diff "$reports/base.md" "$reports/pr.md" || true
  echo '```'
} >> "$summary"
exit 1
