# Multiple local development environments on shared dependencies

## Status

accepted

## Context

Developers (and coding agents working in git worktrees) need to run several
isolated OpenCRVS stacks on one machine at once — one per branch/worktree — so
that parallel work does not clobber a shared database or fight over ports.
Running N full sets of dependencies (Postgres, Elasticsearch, Redis, MinIO) per
environment is too heavy. The production e2e setup
(`opencrvs/e2e`) already solves the analogous problem in Kubernetes: many
feature environments in one cluster, each a namespace, all sharing a single
dependency instance with logical isolation inside each datastore. This ADR
adapts that model to local host-based development (`pnpm dev`).

## Decision

**One shared dependency singleton; N per-environment sets of host node
processes.** Isolation is logical, inside each shared datastore, keyed off an
environment `name`.

### Identity and addressing

- An **environment** is identified by a `name` — the sanitized basename of the
  git worktree directory. `--env <name>` overrides. The **primary** (non-linked)
  checkout maps to **slot 0**, preserving today's behaviour exactly.
- A machine-level **registry** (`~/.local/state/opencrvs/envs.json`) maps
  `name → slot`, allocating the lowest free slot. Slots ≥ 6 are refused.
- Host ports are derived: `port = base + slot * 10000`. Slot 0 leaves every port
  at its current value. The highest base port (`documents`, `9050`) caps the
  scheme at slot 5 (`9050 + 6*10000` overflows the 16-bit port range), giving
  **6 concurrent environments (slots 0–5)**.

**Correction (found while rebasing onto the MOSIP integration):** one stride no
longer fits every service. `packages/mosip-mock` and `packages/esignet-mock`
base at `20240` and `20260`, where a 10000-port stride overflows at slot 5. The
choice was between lowering the ceiling to slot 4 for everyone — paying an
environment for two dev-only mocks — and giving those two a stride of their
own. They get a 100-port stride (`PORT_STRIDES` in
`packages/dev-cli/src/types.ts`), which lands both blocks in the empty gap
between the default stride's slot-1 and slot-2 bands. The ceiling and the count
above are unchanged. The gap argument is not left to inspection:
`resolver.test.ts` walks every (service, slot) pair and asserts that no two
share a port, none exceeds 65535, and none collides with the dependency
singleton.

### Per-environment isolation (all injected as env vars by `dev.sh`)

| Dependency    | Isolation knob                      | Value                                                             |
| ------------- | ----------------------------------- | ----------------------------------------------------------------- |
| Postgres      | one database, shared schemas within | `events_<name>` via `EVENTS_POSTGRES_URL` + `TARGET_DB`           |
| Elasticsearch | index prefix                        | `ES_INDEX_PREFIX=events_<name>`                                   |
| Elasticsearch | reindexing-status index             | `ES_REINDEXING_STATUS_INDEX=events_<name>_reindexing_status`      |
| MinIO         | bucket                              | `MINIO_BUCKET=<name>--ocrvs`                                      |
| Redis         | logical DB index                    | `REDIS_DB=<slot>` (0–15)                                          |
| SQLite        | one file per environment            | `SQLITE_DATABASE_PATH=<worktree>/data/sqlite/mosip-api-<name>.db` |

- Elasticsearch isolation is **almost** just the index prefix: `packages/events`
  derives every index name it uses from `ES_INDEX_PREFIX`, and that's the only
  Elasticsearch-backed service in this codebase — the legacy search service a
  second, `ocrvs`-named index once belonged to is gone (nothing remains under
  `packages/search` but a stale `node_modules`). **Correction (found during
  implementation):** there is one exception.
  `getReindexingStatusIndexName()` in `packages/events/src/storage/elasticsearch.ts`
  returns `env.ES_REINDEXING_STATUS_INDEX` verbatim (default `reindexing_status`)
  rather than composing from the prefix, so the prefix alone would leave every
  environment sharing one reindexing-status index. It is already env-driven, so
  no service code changed — the resolver simply emits it per environment.

### Two deliberate departures from the tables above

Both were decided during implementation, where a literal reading of this ADR
would have produced a broken or backward-incompatible stack:

1. **The MinIO bucket keeps hyphens.** The `-` → `_` fold that makes a name safe
   as a Postgres identifier produces an _invalid_ S3/MinIO bucket name —
   underscores are not permitted. So `dbName` and `esPrefix` fold to `_`, while
   the bucket folds to `-`: worktree `feature-a` yields database
   `events_feature_a` but bucket `feature-a--ocrvs`. This matches the literal
   `<name>--ocrvs` in the table above.
2. **The default environment keeps today's identifiers.** The table's uniform
   `events_<name>` would silently move the primary checkout onto a new empty
   database, contradicting the spec's first user story ("exactly today's ports
   and the `events` database"). So the primary (non-linked) worktree **with no
   `--env` override** resolves to `events` / `events` / `ocrvs` / Redis `0` —
   byte-for-byte today's behaviour, no re-seed. Every _named_ environment
   (`--env <name>`, or any linked worktree) gets the derived identifiers. The
   trigger is deliberately "is the default environment", not `slot === 0`, so
   that `--env foo` in the primary checkout still gets its own data.

- Postgres uses **one database per environment** holding the `app`, `analytics`,
  and `reference_data` schemas (they are schemas, not separate databases).
  Postgres **roles are shared** across environments and provisioned
  idempotently (create-or-alter); isolation is the database boundary, not the
  role.
- **JWT signing keys are per environment**; each generates its own on first
  `pnpm dev`. This was originally specified as machine-wide sharing, but
  `.secrets/*` is gitignored and every service resolves its key as
  `../../.secrets/*.pem` — relative to _its own_ worktree root — so a linked
  worktree necessarily gets its own pair. Confirmed as intended rather than
  papered over: each environment is internally consistent (its auth signs, its
  gateway and events verify) and nothing cross-environment needs a shared key.
  Environments cannot clobber each other's keys: `dev:secrets:gen` writes the
  relative path `.secrets/private-key.pem`, and `dev.sh` has already `cd`'d to
  its own worktree root, so each pair lands in its own directory. Separately,
  `ensure_secrets` generates only when the pair is missing, which keeps an
  environment's keys stable across its own restarts — the previous code
  regenerated on every run, rotating the keypair out from under an open browser
  session or a pinned external countryconfig.

  One consequence to know: a countryconfig running **outside** these worktrees
  and pinned to one checkout's `public-key.pem` will reject tokens minted by
  another environment's auth. Point such a server at the environment it serves,
  or use the bundled testland countryconfig, which resolves the key from its
  own worktree automatically.

### Dependency lifecycle

- Dependencies run as a **detached singleton** under docker compose project
  `-p opencrvs-deps`, backed by **docker named volumes** (not repo-relative bind
  mounts). Every `pnpm dev` runs an idempotent `up -d`; no environment ever
  stops them. Teardown is explicit (`deps:down`, or `down -v` to wipe).
- `dev.sh`'s `docker stop $(docker ps -aq)` sweep and fixed-port preflight are
  removed — both are hostile to running more than one stack.

### Provisioning and cleanup

- Per-environment Postgres provisioning lives as an **idempotent command in the
  `migration` package** (reusable by CI): guarded `CREATE DATABASE events_<name>`
  - shared roles, then migrations. `testland`'s `setup-analytics` /
    `setup-reference-data` receive `TARGET_DB=events_<name>`. Elasticsearch indices
    and the MinIO bucket are auto-created by services on boot.
- `env:destroy <name>` drops the database, ES indices, bucket, and runs
  `FLUSHDB` on the slot's Redis index, then frees the slot. Lazy GC frees slots
  whose worktree directory no longer exists but **never silently drops data** —
  it only warns. Because data is keyed by `name`, slot reuse never touches
  another environment's data, and re-registering an old `name` resurfaces its
  data.

### Code that must change from hardcoded to env-driven

- `packages/events` listen port `5555` → `EVENTS_PORT`.
- `packages/client` and `packages/login` vite `--port` args.
- `packages/client/vite.config.ts`: `server.proxy` targets (gateway `:7070`,
  countryconfig `:3040`), the `loginRedirectPlugin` target (`:3020`), and
  `server.port` — read from `process.env` (exported by `dev.sh`).
- docker compose project / container names (currently `-p opencrvs`, and an
  explicit `container_name: postgres`).

**Correction (found during implementation):** the list above is the service
code, but it is not all of it. The repository's *developer* scripts hardcode
the same ports, and from a linked worktree they act on the primary
environment's stack while looking like they acted on yours — which is worse
than failing. They are made env-aware the same way, by sourcing
`development-environment/environment.sh`:

- `pnpm db:clear:all`, `pnpm seed:dev`, `pnpm reindex` — each takes `--env
<name>` and prints the identifiers it is about to act on.
- `pnpm debug <service>` (`debug-service-in-chrome.sh`) — its fixed
  `service:port` table becomes `AUTH_PORT`, `EVENTS_PORT`, `GATEWAY_PORT`,
  `COUNTRY_CONFIG_PORT`, `DOCUMENTS_PORT`. **The inspector port is deliberately
  *not* per-environment.** `SIGUSR1` opens Node's inspector on its own default
  `9229`, which is not derived from this contract, so only one environment can
  be attached at a time; the script says so rather than pretending otherwise.
  Making it per-environment would mean threading `--inspect-port` through
  `NODE_OPTIONS`, which several package `start` scripts *assign* rather than
  append, so an exported value is clobbered — a change to a shared mechanism
  for a workflow that is inherently one-window-one-target.
- `pnpm open` — was two fixed tabs (components storybook on `6060`, login on
  `3020`); becomes the calling environment's client and nothing else.

**Correction (found while rebasing onto the MOSIP integration):** the MOSIP
integration added three services to the `pnpm dev` sweep — `mosip-api`, plus the
`mosip-mock` and `esignet-mock` stand-ins for an external MOSIP deployment — and
they needed three kinds of work these tables did not cover:

- **A named port knob each.** All three read the bare `PORT`, and the contract's
  `PORT` is the gateway's compatibility alias (see below), so under `pnpm dev`
  all three would have tried to bind the gateway's port — in *every*
  environment, slot 0 included. They now read `MOSIP_API_PORT`,
  `MOSIP_MOCK_PORT` and `ESIGNET_MOCK_PORT`. The alias stays the gateway's
  alone; anything else wanting a port from this contract asks for it by name.
- **Composed endpoints, not just origins.** Unlike the core services, these
  packages (and `packages/testland`) read whole endpoints — `.../websub/hub`,
  `.../oauth/token` — from single env vars, so slot-shifting the ports is not
  enough on its own. The paths are composed in `env-contract.ts` alongside them,
  which is also what lets a real MOSIP deployment be pointed at by overriding
  the same variables.
- **A per-environment SQLite file.** `mosip-api` keeps a record-only token per
  MOSIP transaction in SQLite. It is the only piece of an environment's data
  that lives in the checkout rather than in a shared datastore, so it is cleared
  by `pnpm db:clear:all` and dies with the worktree — `pnpm env:destroy`, which
  cleans the shared datastores, does not touch it.

**Correction (found during implementation):** the contract grew three keys this
ADR did not anticipate, for services that are addressed but not started by
`pnpm dev` (see ADR-0004): `METABASE_PORT`, `CLIENT_STORYBOOK_PORT` and
`EVENTS_MIGRATOR_URL`. `METABASE_PORT` and `CLIENT_STORYBOOK_PORT` obey the same
`base + slot * 10000` arithmetic as every other port, so a developer starting
one of those by hand still gets their own environment's. `EVENTS_MIGRATOR_URL`
is not a port at all: it is the `events_migrator` connection to this
environment's database, split from `EVENTS_POSTGRES_URL` because the migration
runner and the application meant two different things by that one name. All
three live in `packages/dev-cli/src/env-contract.ts` with the rest.

## Considered alternatives

- **Hostname routing** (local Traefik/Caddy, `<env>.localhost`) — mirrors e2e
  1:1 and yields clean URLs, but adds a proxy in the dev loop and vite
  host-header/HMR friction. Rejected: for worktree dev, a computed port block is
  simpler and touches nothing in the request path.
- **N full dependency instances per environment** — trivially isolated but too
  resource-heavy. This is the thing the ADR exists to avoid.
- **Per-environment Postgres roles / JWT keys** (as e2e does) — necessary in
  Kubernetes because of secret-copying and `auth_mode: auto`, but pure overhead
  on a single trusted local machine.

## Consequences

- Hard cap of 6 concurrent environments from the `slot * 10000` scheme. Raising
  it means a denser port layout or hostname routing.
- The dev client is **not** purely runtime-configured: in dev, API routing goes
  through the vite proxy (build-time `process.env`). Login navigation is
  same-origin (`/login`), redirected by the vite `loginRedirectPlugin` to the
  env-driven login port — `window.config.LOGIN_URL` is unset by default and
  not part of this contract.
- Switching dependency storage from bind mounts to named volumes orphans any
  existing `./data` directory once; environments re-seed.
