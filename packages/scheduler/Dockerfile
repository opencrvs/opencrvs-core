FROM alpine:3.15

# Install required packages
RUN apk add --update --no-cache bash curl

WORKDIR /usr/scheduler

# Set metrics URL
ARG METRICS_URL
ENV METRICS_URL=$METRICS_URL

# Copy files
COPY packages/scheduler/jobs/*.* ./jobs/
COPY packages/scheduler/cronTabFiles/VSExportCrontab ./
COPY packages/scheduler/start.sh .

# create cron.log file
RUN touch /var/log/cron.log

# Fix execute permissions
RUN find . -type f -iname "*.sh" -exec chmod +x {} \;

# Run cron on container startup
CMD ["./start.sh"]