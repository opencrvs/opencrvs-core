
#!/bin/bash

# Select the crontab file based on the environment
CRON_FILE="VSExportCrontab"

echo "Loading crontab file: $CRON_FILE"

# Load the crontab file
crontab $CRON_FILE

# Start cron
echo "Starting cron..."

crond -f
