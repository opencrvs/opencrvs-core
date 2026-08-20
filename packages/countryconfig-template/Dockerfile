FROM node:22.22.3-alpine AS deps
# The pnpm version is pinned by the packageManager field in package.json
RUN corepack enable pnpm

WORKDIR /usr/src/app
ENV NPM_CONFIG_LOGLEVEL=warn

# Install dependencies. .pnpmfile.cjs too: the lockfile records its checksum,
# so a frozen install without it fails on ERR_PNPM_LOCKFILE_CONFIG_MISMATCH.
COPY package.json pnpm-lock.yaml .pnpmfile.cjs ./

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

