ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

WORKDIR /app/packages/mosip-mock
COPY --chown=node:node packages/mosip-mock/*.json /app/packages/mosip-mock/
RUN pnpm install --frozen-lockfile

# src/mock-identities.json is a symlink into packages/mosip-api/docs. The build
# context is the repository root, so the target has to be copied for the
# symlink to resolve inside the image.
COPY --chown=node:node packages/mosip-api/docs/mock-identities.json /app/packages/mosip-api/docs/mock-identities.json
COPY --chown=node:node packages/mosip-mock /app/packages/mosip-mock

EXPOSE 20240

CMD [ "pnpm", "start:prod" ]
