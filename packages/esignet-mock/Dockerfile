ARG  BRANCH=develop
FROM ghcr.io/opencrvs/ocrvs-base:${BRANCH}

USER node

WORKDIR /app/packages/esignet-mock
COPY --chown=node:node packages/esignet-mock/*.json /app/packages/esignet-mock/
RUN pnpm install --frozen-lockfile

# src/mock-identities.json is a symlink into packages/mosip-api/docs. The build
# context is the repository root, so the target has to be copied for the
# symlink to resolve inside the image.
COPY --chown=node:node packages/mosip-api/docs/mock-identities.json /app/packages/mosip-api/docs/mock-identities.json
COPY --chown=node:node packages/esignet-mock /app/packages/esignet-mock

EXPOSE 20260

CMD [ "pnpm", "start:prod" ]
