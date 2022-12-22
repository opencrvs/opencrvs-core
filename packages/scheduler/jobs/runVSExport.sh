#!/bin/bash

echo 'Calling VSExport end-point in metrics...'

END_DATE=$(date +%Y-%m-%d)
YEAR=$(date +%Y)
ONE_YEAR_FROM_NOW=$(( YEAR - 1 ))
START_DATE="${ONE_YEAR_FROM_NOW}$(date +-%m-%d)"

curl "$METRICS_URL/vsExport?startDate=$START_DATE&endDate=$END_DATE"
