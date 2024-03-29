FROM alpine:3.9@sha256:414e0518bb9228d35e4cd5165567fb91d26c6a214e9c95899e1e056fcd349011

# Install required packages
RUN apk update && apk upgrade && apk add --update --no-cache bash curl coreutils mongodb mongodb-tools

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
