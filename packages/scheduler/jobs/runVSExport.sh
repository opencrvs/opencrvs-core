#!/bin/bash

echo 'Calling VSExport end-point in metrics...'

PREVIOUS_DAY=$(date -d 'yesterday' '+%Y-%m-%d')

curl "$METRICS_URL/vsExport?startDate=$PREVIOUS_DAY&endDate=$PREVIOUS_DAY&isScheduler=true"