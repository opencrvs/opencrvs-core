FROM node:22.22.3-alpine AS deps
WORKDIR /usr/src/app
ENV NPM_CONFIG_LOGLEVEL=warn

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm@10.34.5

RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS runner
WORKDIR /usr/src/app
ENV NPM_CONFIG_LOGLEVEL=warn

RUN npm install -g pnpm@10.34.5
# Copy dependencies from deps stage
COPY --from=deps /usr/src/app/node_modules ./node_modules

# Copy application files
COPY package.json pnpm-lock.yaml tsconfig.json ./
COPY src ./src

EXPOSE 3040

CMD ["pnpm", "start:prod"]

