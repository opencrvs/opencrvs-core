/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import * as path from 'node:path'
import {
  BASE_PORTS,
  EnvironmentDescriptor,
  RegistrySnapshot,
  ServiceName,
  ServicePorts,
  ServiceUrls
} from './types'

/**
 * Highest allocatable slot. Slot 6 is invalid because the highest base port,
 * `documents` at 9050, overflows the 16-bit port range: 9050 + 6*10000 > 65535.
 */
export const MAX_SLOT = 5

/** Port distance between two adjacent slots. */
export const PORT_STRIDE = 10000

/**
 * Slot reserved for the primary (non-linked) checkout. Holding it back from
 * linked worktrees is what guarantees the primary always gets today's ports.
 */
export const PRIMARY_SLOT = 0

export { BASE_PORTS }

/** Thrown when every slot in `0..MAX_SLOT` is spoken for. */
export class SlotAllocationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SlotAllocationError'
  }
}

/** Thrown when a name cannot be turned into a usable identifier. */
export class InvalidEnvironmentNameError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidEnvironmentNameError'
  }
}

/**
 * Identifiers the primary checkout keeps, so that a developer who never
 * touches worktrees sees no change at all — no re-seed, no data migration.
 * Each is the value its service defaults to today:
 *
 * - `events`             database, from `packages/events` `EVENTS_POSTGRES_URL` devDefault
 * - `events`             index prefix, from `packages/events` `ES_INDEX_PREFIX` default
 * - `reindexing_status`  from `packages/events` `ES_REINDEXING_STATUS_INDEX` default
 * - `ocrvs`              bucket, from `packages/documents/src/minio/constants.ts`
 */
export const LEGACY_DB_NAME = 'events'
export const LEGACY_ES_PREFIX = 'events'
export const LEGACY_ES_REINDEXING_STATUS_INDEX = 'reindexing_status'
export const LEGACY_BUCKET = 'ocrvs'

/** S3/MinIO caps a bucket name at 63 characters. */
const MAX_BUCKET_LENGTH = 63

/** The ADR's bucket separator: `<name>--ocrvs`. */
const BUCKET_SUFFIX = '--ocrvs'

/**
 * Fold a raw name (usually a directory basename) into something safe to embed
 * in a Postgres database name and an Elasticsearch index prefix. `-` becomes
 * `_`, as does anything else outside `[a-z0-9_]`.
 *
 * Not used for the bucket: underscores are illegal in S3/MinIO bucket names.
 * See `bucketNameForEnvironment`.
 */
export function sanitizeEnvironmentName(raw: string): string {
  const sanitized = raw
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')

  if (sanitized === '') {
    throw new InvalidEnvironmentNameError(
      `Cannot derive an environment name from ${JSON.stringify(raw)}: ` +
        'it contains no letters or digits. Pass an explicit --env <name>.'
    )
  }

  return sanitized
}

/**
 * Fold a raw name into an S3/MinIO-legal bucket name, `<name>--ocrvs`.
 *
 * Bucket names may not contain underscores, so this is a *hyphen* fold rather
 * than the underscore fold `sanitizeEnvironmentName` applies — the two are
 * otherwise the same, which is why passing this function either a raw name or
 * an already-sanitized identifier gives the same answer.
 *
 * The result satisfies the rules that bite in practice: 3-63 characters,
 * lowercase `[a-z0-9-]` only, first and last character alphanumeric, no
 * separator run left next to the suffix. (Adjacent hyphens are legal in S3 —
 * only adjacent dots are not — so the `--ocrvs` separator is fine.)
 */
export function bucketNameForEnvironment(raw: string): string {
  const base = raw
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')

  if (base === '') {
    throw new InvalidEnvironmentNameError(
      `Cannot derive a bucket name from ${JSON.stringify(raw)}: ` +
        'it contains no letters or digits. Pass an explicit --env <name>.'
    )
  }

  const bucket = `${base}${BUCKET_SUFFIX}`

  if (bucket.length > MAX_BUCKET_LENGTH) {
    throw new InvalidEnvironmentNameError(
      `Environment name ${JSON.stringify(raw)} is too long: it yields the ` +
        `${bucket.length}-character bucket "${bucket}", over the ` +
        `${MAX_BUCKET_LENGTH}-character limit MinIO enforces. Pass a shorter ` +
        `--env <name> (at most ${MAX_BUCKET_LENGTH - BUCKET_SUFFIX.length} ` +
        'characters).'
    )
  }

  return bucket
}

/** Whether a `--env` value was given and is not blank. */
export function hasExplicitName(envOverride?: string): boolean {
  return envOverride !== undefined && envOverride.trim() !== ''
}

export interface DeriveEnvironmentNameInput {
  /** Value of `--env`, when given. Takes precedence over the directory. */
  envOverride?: string
  /** Absolute path of the worktree whose basename names the environment. */
  worktreePath: string
}

/** `--env <name>` wins; otherwise the worktree directory basename is used. */
export function deriveEnvironmentName({
  envOverride,
  worktreePath
}: DeriveEnvironmentNameInput): string {
  const raw = hasExplicitName(envOverride)
    ? (envOverride as string)
    : path.basename(path.resolve(worktreePath))

  return sanitizeEnvironmentName(raw)
}

export interface ResolveEnvironmentInput {
  /** Raw or already-sanitized name; sanitized again here, idempotently. */
  name: string
  worktreePath: string
  /**
   * Whether this checkout is the primary (non-linked) git worktree. Detected
   * in the I/O layer (see `worktree.ts`) and passed in, so this stays pure.
   */
  isPrimaryWorktree: boolean
  /**
   * True only for the primary worktree resolved *without* a `--env` override —
   * the environment a developer gets by running `pnpm dev` the way they always
   * have. It alone keeps today's `events` / `events` / `ocrvs` identifiers, so
   * an ordinary checkout never has to re-seed.
   *
   * Deliberately **not** derived from `slot === 0` inside this function:
   *
   * - The primary worktree given `--env <name>` still sits at slot 0, but
   *   asking for a named environment means asking for a separate one, so it
   *   must get the derived `events_<name>` identifiers, not the shared ones.
   * - A linked worktree could hold slot 0 (an entry recorded before slot 0 was
   *   reserved) and must never claim the shared `events` database.
   *
   * The two conditions are computed in the I/O layer (`runResolve`, which
   * knows whether `--env` was passed) and plumbed here, so this stays pure.
   */
  isDefaultEnvironment: boolean
  /** The registry as read from disk. Never mutated. */
  registry: RegistrySnapshot
  /**
   * Names whose recorded worktree directory has disappeared. Their slots are
   * treated as free; their entries (and data) are left alone.
   */
  staleNames?: string[]
}

/**
 * The single source of truth for turning an environment name into a full
 * descriptor. Pure: same inputs, same output, no I/O.
 */
export function resolveEnvironment(
  input: ResolveEnvironmentInput
): EnvironmentDescriptor {
  const name = sanitizeEnvironmentName(input.name)
  const slot = allocateSlot(name, input)
  const ports = portsForSlot(slot)

  return {
    name,
    slot,
    worktreePath: input.worktreePath,
    ...identifiersFor(input.name, name, input.isDefaultEnvironment),
    redisDb: slot,
    ports,
    urls: urlsForPorts(ports)
  }
}

function identifiersFor(
  raw: string,
  name: string,
  isDefaultEnvironment: boolean
): Pick<
  EnvironmentDescriptor,
  'dbName' | 'esPrefix' | 'esReindexingStatusIndex' | 'bucket'
> {
  if (isDefaultEnvironment) {
    return {
      dbName: LEGACY_DB_NAME,
      esPrefix: LEGACY_ES_PREFIX,
      esReindexingStatusIndex: LEGACY_ES_REINDEXING_STATUS_INDEX,
      bucket: LEGACY_BUCKET
    }
  }

  const esPrefix = `events_${name}`

  return {
    dbName: `events_${name}`,
    esPrefix,
    /*
     * Composed the way packages/events/src/storage/elasticsearch.ts composes
     * every other index name — `${ES_INDEX_PREFIX}_${suffix}` — even though
     * that file does not compose this one itself.
     */
    esReindexingStatusIndex: `${esPrefix}_${LEGACY_ES_REINDEXING_STATUS_INDEX}`,
    bucket: bucketNameForEnvironment(raw)
  }
}

export function portsForSlot(slot: number): ServicePorts {
  const ports = {} as ServicePorts

  for (const service of Object.keys(BASE_PORTS) as ServiceName[]) {
    ports[service] = BASE_PORTS[service] + slot * PORT_STRIDE
  }

  return ports
}

function urlsForPorts(ports: ServicePorts): ServiceUrls {
  // Trailing slashes mirror each consumer's current default exactly, so slot 0
  // hands the services the very strings they already use.
  return {
    client: `http://localhost:${ports.client}/`,
    login: `http://localhost:${ports.login}/`,
    gateway: `http://localhost:${ports.gateway}`,
    auth: `http://localhost:${ports.auth}`,
    countryConfig: `http://localhost:${ports.countryConfig}`,
    countryConfigInternal: `http://localhost:${ports.countryConfig}/`,
    events: `http://localhost:${ports.events}/`,
    documents: `http://localhost:${ports.documents}`
  }
}

function allocateSlot(name: string, input: ResolveEnvironmentInput): number {
  const existing = input.registry[name]

  // Stability first: a name keeps the slot it was given, so restarting an
  // environment (or re-registering a name whose worktree was deleted) always
  // lands back on the same ports and the same data.
  if (existing) {
    return existing.slot
  }

  if (input.isPrimaryWorktree) {
    return PRIMARY_SLOT
  }

  const stale = new Set(input.staleNames ?? [])
  const holders = new Map<number, string>()

  for (const [otherName, entry] of Object.entries(input.registry)) {
    if (otherName === name || stale.has(otherName)) {
      continue
    }
    if (!holders.has(entry.slot)) {
      holders.set(entry.slot, otherName)
    }
  }

  for (let slot = PRIMARY_SLOT + 1; slot <= MAX_SLOT; slot++) {
    if (!holders.has(slot)) {
      return slot
    }
  }

  throw new SlotAllocationError(slotExhaustedMessage(name, holders))
}

function slotExhaustedMessage(
  name: string,
  holders: Map<number, string>
): string {
  const occupancy = [...holders.entries()]
    .sort(([a], [b]) => a - b)
    .map(([slot, holder]) => `  slot ${slot}: ${holder}`)
    .join('\n')

  return [
    `Cannot allocate a slot for environment "${name}": every environment ` +
      `slot (0-${MAX_SLOT}) is in use.`,
    '',
    'Slot 0 is reserved for the primary (non-linked) checkout; linked',
    `worktrees use slots 1-${MAX_SLOT}. The ceiling exists because the highest`,
    `base port (documents, ${BASE_PORTS.documents}) overflows the 16-bit port`,
    `range at slot ${MAX_SLOT + 1}.`,
    '',
    'Currently allocated:',
    occupancy,
    '',
    'Free a slot with `pnpm env:destroy <name>`.'
  ].join('\n')
}
