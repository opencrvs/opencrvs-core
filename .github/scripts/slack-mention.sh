#!/usr/bin/env bash
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

# Prints how to address the author of a commit in a Slack message:
# "<@U123>" when a Slack user can be found, otherwise "Name (@github-login)".
#
# Usage: slack-mention.sh <commit-sha>
# Env:   SLACK_BOT_TOKEN (needs users:read.email to resolve users),
#        GH_TOKEN and GITHUB_REPOSITORY (to resolve the GitHub login)
set -uo pipefail

SHA="${1:?usage: slack-mention.sh <commit-sha>}"

NAME="$(git log -1 --format=%an "$SHA")"
EMAIL="$(git log -1 --format=%ae "$SHA")"
LOGIN="$(gh api "repos/$GITHUB_REPOSITORY/commits/$SHA" --jq '.author.login // empty' 2>/dev/null || true)"

lookup() {
  curl -sS -G https://slack.com/api/users.lookupByEmail \
    -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
    --data-urlencode "email=$1" | jq -r 'select(.ok) | .user.id // empty'
}

ID=""
# Git commit emails are often GitHub noreply addresses, which won't match a Slack user
[ -n "$EMAIL" ] && ID="$(lookup "$EMAIL")"
if [ -z "$ID" ] && [ -n "$LOGIN" ]; then
  PUBLIC_EMAIL="$(gh api "users/$LOGIN" --jq '.email // empty' 2>/dev/null || true)"
  [ -n "$PUBLIC_EMAIL" ] && ID="$(lookup "$PUBLIC_EMAIL")"
fi

if [ -n "$ID" ]; then
  echo "<@$ID>"
else
  echo "${NAME}${LOGIN:+ (@$LOGIN)}"
fi
