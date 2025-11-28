ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER root
# Install envsubst and clean up apt cache
RUN apt-get update \
    && apt-get install -y --no-install-recommends gettext-base \
    && rm -rf /var/lib/apt/lists/*

USER node

## Add the wait script to the image
ADD --chown=node:node https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /app/wait
RUN chmod +x /app/wait

# Override the base log level (info).
ENV NPM_CONFIG_LOGLEVEL=warn

# Increase wait timeout from default 30sec to 90sec
# https://github.com/ufoscout/docker-compose-wait#additional-configuration-options
ENV WAIT_TIMEOUT=90


COPY --chown=node:node packages/migration /app/packages/migration

WORKDIR /app

RUN pnpm fetch --filter ./packages/migration... 
RUN pnpm install -r --offline --filter ./packages/migration...

WORKDIR /app/packages/migration
RUN pnpm build

WORKDIR /app/packages/migration

CMD ["/bin/sh", "-c", "/app/wait && pnpm start:prod"]
