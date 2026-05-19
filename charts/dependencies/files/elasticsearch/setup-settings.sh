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

source "$(dirname "${BASH_SOURCE[0]}")/setup-helpers.sh"

echo "-------- $(date) --------"

# log 'Waiting for availability of Elasticsearch'
# wait_for_elasticsearch

# FIXME: Temporarily disabled, since it is not needed for the current setup.
# log "Updating replicas for Elasticsearch"
# ensure_settings "{\"index\":{\"number_of_replicas\":0}}"
