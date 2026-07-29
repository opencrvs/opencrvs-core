#!/bin/bash

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
