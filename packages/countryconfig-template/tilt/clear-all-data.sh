#!/bin/bash

# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at https://mozilla.org/MPL/2.0/.
#
# OpenCRVS is also distributed under the terms of the Civil Registration
# & Healthcare Disclaimer located at http://opencrvs.org/license.
#
# Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.

echo "Running data cleanup"

jobs=(
  "data-cleanup"
  'postgres-on-deploy'
  'data-migration'
  'data-migration-analytics'
  'data-seed'
  'elasticsearch-reindex'
)

for job in "${jobs[@]}"; do
    kubectl delete job $job -n opencrvs-dev --ignore-not-found
    if [ "$job" == "data-seed" ]; then
      kubectl delete pod -lapp=events -n opencrvs-dev
    fi
    tilt trigger $job
    sleep 10
    kubectl wait --for=condition=complete --timeout=300s job/$job -n opencrvs-dev
    echo "======================== Job $job completed ==============================="
    kubectl logs job/$job -n opencrvs-dev
done

echo "Cleanup was successful"
