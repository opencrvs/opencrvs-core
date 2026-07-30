FROM node:22.22.3-alpine AS deps
# The pnpm version is pinned by the packageManager field in package.json
RUN corepack enable pnpm

WORKDIR /usr/src/app
ENV NPM_CONFIG_LOGLEVEL=warn

# Install dependencies
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS runner
# The pnpm version is pinned by the packageManager field in package.json
RUN corepack enable pnpm

WORKDIR /usr/src/app
ENV NPM_CONFIG_LOGLEVEL=warn

# Copy dependencies from deps stage
COPY --from=deps /usr/src/app/node_modules ./node_modules

# Copy application files
COPY package.json pnpm-lock.yaml tsconfig.json ./
COPY src ./src

EXPOSE 3040

CMD ["pnpm", "start:prod"]

