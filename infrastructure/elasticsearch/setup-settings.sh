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

echo "-------- $(date) --------"

log 'Waiting for availability of Elasticsearch'
wait_for_elasticsearch

ensure_settings "{\"index\":{\"number_of_replicas\":0}}"