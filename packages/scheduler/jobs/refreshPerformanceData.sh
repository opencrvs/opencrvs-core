#!/bin/bash

if [[ ( -z "${QA_ENV}" || "${QA_ENV}" != true ) && "${NODE_ENV}" == "production" ]]; then
  echo 'Calling metabase data refresh end-point in metrics...'
  curl "$METRICS_URL/refreshPerformanceData"
else
  echo 'Skipping metabase data refresh...'
fi