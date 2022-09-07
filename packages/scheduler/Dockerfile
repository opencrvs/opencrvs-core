FROM alpine:3.15

# Install required packages
RUN apk add --update --no-cache bash curl

WORKDIR /usr/scheduler

# Copy files
COPY jobs/*.* ./jobs/
COPY cronTabFiles/VSExportCrontab ./
COPY start.sh .

# create cron.log file
RUN touch /var/log/cron.log

# Fix execute permissions
RUN find . -type f -iname "*.sh" -exec chmod +x {} \;

# Run cron on container startup
CMD ["./start.sh"]