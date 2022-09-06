FROM alpine:3.15

# Install required packages
RUN apk add --update --no-cache bash

WORKDIR /usr/scheduler

# Copy files
COPY jobs/*.* ./jobs/
COPY cronTabFiles/declarationReportCrontab ./
COPY start.sh .

# create cron.log file
RUN touch /var/log/cron.log

# Fix line endings && execute permissions
RUN find . -type f -iname "*.sh" -exec chmod +x {} \;

# Run cron on container startup
CMD ["./start.sh"]