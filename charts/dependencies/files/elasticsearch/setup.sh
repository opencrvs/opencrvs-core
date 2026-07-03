#!/usr/bin/env bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

set -eu
set -o pipefail

if ! command -v curl >/dev/null 2>&1 && ! apk add --no-cache curl; then
  echo "[ERROR] Missing utility: curl" >&2
  echo "[ERROR] Automatic installation failed. Ensure the container can access its package repositories, or include the required package in the base image for air-gapped deployments." >&2
  exit 1
fi

bash "$(dirname "${BASH_SOURCE[0]}")/setup-users.sh"
bash "$(dirname "${BASH_SOURCE[0]}")/setup-settings.sh"
