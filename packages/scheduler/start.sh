#!/bin/bash

CRON_DIR="./cronTabFiles"

# Iterate through CRON_DIR files
for file in $CRON_DIR/*; do
    echo "Loading crontab file: $file"
    crontab $file
done

# Start cron
echo "Starting cron..."

crond -f
