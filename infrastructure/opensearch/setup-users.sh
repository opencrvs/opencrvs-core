#!/usr/bin/env bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
# graphic logo are (registered/a) trademark(s) of Plan International.

set -eu
set -o pipefail

source "$(dirname "${BASH_SOURCE[0]}")/setup-helpers.sh"


# --------------------------------------------------------
# Users declarations
# All new users should be added to this list

declare -A users_passwords
users_passwords=(
  [$SEARCH_OPENSEARCH_USERNAME]="${SEARCH_OPENSEARCH_PASSWORD:-}"
  [beats_system]="${METRICBEAT_ELASTIC_PASSWORD:-}"
  [apm_system]="${APM_ELASTIC_PASSWORD:-}"
  [$OPENSEARCH_DASHBOARDS_USERNAME]="${OPENSEARCH_DASHBOARDS_PASSWORD:-}"
)

# -------------------------------------
# Role assignations for users
# If you are adding a new user, remember to assign a role. You can use search_user as a template.
declare -A users_roles
users_roles=(
  [$SEARCH_OPENSEARCH_USERNAME]='search_user'
  [$OPENSEARCH_DASHBOARDS_USERNAME]='opensearch_dashboards_admin_user'
)

# --------------------------------------------------------
# Roles declarations

declare -A roles_files
roles_files=(
  [search_user]='search_user.json'
  [opensearch_dashboards_admin_user]='opensearch_dashboards_user.json'
)

# --------------------------------------------------------


echo "-------- $(date) --------"

log 'Waiting for availability of Opensearch'
wait_for_opensearch
sublog 'Opensearch is running'

for role in "${!roles_files[@]}"; do
  log "Role '$role'"

  declare body_file
  body_file="$(dirname "${BASH_SOURCE[0]}")/roles/${roles_files[$role]:-}"
  if [[ ! -f "${body_file:-}" ]]; then
    sublog "No role body found at '${body_file}', skipping"
    continue
  fi

  sublog 'Creating/updating'
  ensure_role "$role" "$(<"${body_file}")"
done

for user in "${!users_passwords[@]}"; do
  log "User '$user'"
  if [[ -z "${users_passwords[$user]:-}" ]]; then
    sublog 'No password defined, skipping'
    continue
  fi

  declare -i user_exists=0
  user_exists="$(check_user_exists "$user")"

  if ((user_exists)); then
    sublog 'User exists, updating user'

    if [[ -z "${users_roles[$user]:-}" ]]; then
      update_user "$user" "${users_passwords[$user]}"
    else
      update_user "$user" "${users_passwords[$user]}" "${users_roles[$user]}"
    fi
  else
    if [[ -z "${users_roles[$user]:-}" ]]; then
      err '  No role defined, skipping creation'
      continue
    fi

    sublog 'User does not exist, creating'
    create_user "$user" "${users_passwords[$user]}" "${users_roles[$user]}"
  fi
done
