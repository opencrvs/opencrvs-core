FROM alpine:3.19

# Install required packages
RUN apk update && apk upgrade && apk add --update --no-cache bash curl coreutils mongodb-tools

WORKDIR /usr/scheduler

# Set metrics URL
ARG METRICS_URL
ENV METRICS_URL=$METRICS_URL

# Copy files
COPY packages/scheduler/jobs/*.* ./jobs/
COPY packages/scheduler/crontab ./
COPY packages/scheduler/start.sh .

# create cron.log file
RUN touch /var/log/cron.log

# Fix execute permissions
RUN find . -type f -iname "*.sh" -exec chmod +x {} \;

# Run cron on container startup
CMD ["./start.sh"]
