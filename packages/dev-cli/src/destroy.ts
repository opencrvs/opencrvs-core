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
import {
  deriveEnvironmentName,
  LEGACY_DB_NAME,
  resolveEnvironment,
  sanitizeEnvironmentName
} from './resolver'
import { EnvironmentDescriptor, RegistryEntry, RegistrySnapshot } from './types'

/** The four things an environment owns outside its own worktree. */
export type EnvironmentIdentifiers = Pick<
  EnvironmentDescriptor,
  'dbName' | 'esPrefix' | 'esReindexingStatusIndex' | 'bucket'
>

/**
 * Environments found by asking the datastores what exists, rather than by
 * reading the registry.
 *
 * The registry is the source of truth for *slots*; it is emphatically not a
 * record of what exists. An entry disappears whenever `env:destroy` releases
 * one, whenever `~/.local/state/opencrvs/envs.json` is lost or a second user
 * account is used, and it never existed for a database restored from a
 * colleague's dump — while the data itself lives on in the shared docker
 * volumes. Deleting indices on the registry alone therefore sweeps up
 * environments it has simply never heard of.
 */
export interface EnvironmentDiscovery {
  /** Environment names discovered from a datastore. */
  names: string[]
  /**
   * Set when discovery could not run. Index deletion is skipped entirely in
   * that case: deleting under an incomplete picture is unrecoverable, and
   * skipping is not.
   */
  failure?: string
}

/** `events_<name>` databases, the durable record that an environment exists. */
const DATABASE_PREFIX = `${LEGACY_DB_NAME}_`

/**
 * Turn `SELECT datname FROM pg_database` output into environment names.
 *
 * Postgres is the useful source because a database is the one artefact every
 * environment has — `pnpm dev` provisions it before anything else — and its
 * name maps back to the environment name exactly, by construction
 * (`dbName = events_<name>`). The live index list is deliberately *not* used
 * for the same purpose: `events_feature_a_v2_birth` is equally consistent with
 * an environment `feature_a` holding index `v2_birth` and an environment
 * `feature_a_v2` holding `birth`, and guessing the longer one would stop an
 * environment from ever clearing its own indices.
 */
export function environmentNamesFromDatabases(databases: string[]): string[] {
  const names = new Set<string>()

  for (const database of databases) {
    const trimmed = database.trim()

    if (!trimmed.startsWith(DATABASE_PREFIX)) {
      continue
    }

    try {
      names.add(sanitizeEnvironmentName(trimmed.slice(DATABASE_PREFIX.length)))
    } catch {
      // Not a name this resolver could ever have produced; not an environment.
    }
  }

  return [...names]
}

export interface PlanDestroyInput {
  /** Raw or already-sanitized name; the two spellings plan identically. */
  name: string
  /** The registry as read from disk. Never mutated. */
  snapshot: RegistrySnapshot
  /**
   * Whether the registry entry's worktree is the primary (non-linked) git
   * checkout. Detected in the I/O layer (see `worktree.ts`) and passed in, so
   * this stays pure. Needed because the default environment can only be told
   * apart from an ordinary one by where it lives.
   */
  registeredWorktreeIsPrimary?: boolean
  /** Required to destroy the default environment's shared data. */
  force?: boolean
  /**
   * Environments that exist outside the registry. Required, not optional, so
   * that no call site can quietly treat the registry as a complete list of
   * what exists — that assumption is what makes index deletion dangerous.
   */
  discovery: EnvironmentDiscovery
}

/**
 * A description of what destroying an environment would delete. Pure data: no
 * client is opened, nothing is deleted, and nothing here depends on a service
 * being reachable. The I/O layer executes it; the tests can assert on it.
 */
export interface DestroyPlan {
  /** Sanitized name; keys all per-environment data. */
  name: string
  /** Whether the registry knows this name. */
  registered: boolean
  /** Recorded slot. Unknown for a name the registry has never seen. */
  slot?: number
  isDefaultEnvironment: boolean
  identifiers: EnvironmentIdentifiers
  /**
   * Elasticsearch prefixes belonging to *other* registered environments.
   * Carried so index selection can tell `events_feature_a` apart from
   * `events_feature_a_2` — see `selectIndicesToDelete`.
   */
  otherEsPrefixes: string[]
  /** Redis logical DB to flush. Absent when flushing would not be safe. */
  redisDb?: number
  /** Why Redis is being left alone, when it is. */
  redisSkipReason?: string
  /**
   * Why no index may be deleted, when it could not be established which
   * environments own what. Everything else in the plan still stands.
   */
  indexSelectionSkipReason?: string
  /** Whether there is a registry entry to remove afterwards. */
  releaseRegistryEntry: boolean
  /** Non-fatal remarks worth printing before acting. */
  notes: string[]
  /**
   * Set when the plan must not be executed at all. The caller prints it and
   * exits; every operation in the plan is already switched off.
   */
  refusal?: string
}

/**
 * Work out everything `env:destroy <name>` would remove, without removing it.
 *
 * The plan is keyed on the *name*, never on the slot: slots are recycled, so
 * the environment now sitting at slot 1 may well not be the one being
 * destroyed. Only Redis — whose logical DB index *is* the slot — needs the
 * registry at all, which is why an unregistered name can still have its
 * database, indices and bucket cleaned up.
 */
export function planDestroy(input: PlanDestroyInput): DestroyPlan {
  const name = sanitizeEnvironmentName(input.name)
  const entry: RegistryEntry | undefined = input.snapshot[name]
  const registered = entry !== undefined

  const isDefaultEnvironment = isDefault(name, entry, input)
  const identifiers = identifiersFor(
    input.name,
    input.snapshot,
    isDefaultEnvironment
  )

  const notes: string[] = []

  if (!registered) {
    notes.push(
      `Environment "${name}" is not in the registry, so there is no entry to ` +
        'release. Its database, indices and bucket are still derived from the ' +
        'name and will be removed.'
    )
  }

  const refusal =
    isDefaultEnvironment && input.force !== true
      ? refusalMessage(name, identifiers)
      : undefined

  const redis = planRedis({
    name,
    entry,
    isDefaultEnvironment,
    refused: refusal !== undefined
  })

  return {
    name,
    registered,
    slot: entry?.slot,
    isDefaultEnvironment,
    identifiers,
    otherEsPrefixes: otherEsPrefixes(
      name,
      input.snapshot,
      input.discovery.names
    ),
    indexSelectionSkipReason: indexSelectionSkipReason(name, input.discovery),
    redisDb: redis.db,
    redisSkipReason: redis.skipReason,
    releaseRegistryEntry: registered && refusal === undefined,
    notes,
    refusal
  }
}

/**
 * The default environment is the one an ordinary checkout gets from `pnpm dev`
 * with no `--env`: the primary worktree, named after its own directory. It is
 * the only environment holding the unprefixed `events` / `ocrvs` data, so it
 * is the only one worth refusing to destroy.
 *
 * Slot 0 alone does not identify it. The primary checkout given `--env
 * side-quest` also sits at slot 0 but owns separate, derived data, and a
 * linked worktree may hold slot 0 from before slot 0 was reserved. Hence both
 * conditions: the entry's worktree is the primary checkout *and* the name is
 * the one that worktree's directory derives.
 */
function isDefault(
  name: string,
  entry: RegistryEntry | undefined,
  input: PlanDestroyInput
): boolean {
  if (entry === undefined || input.registeredWorktreeIsPrimary !== true) {
    return false
  }

  return derivedName(entry.worktreePath) === name
}

/** The name a worktree directory derives, or nothing if it derives none. */
function derivedName(worktreePath: string): string | undefined {
  try {
    return deriveEnvironmentName({ worktreePath })
  } catch {
    return undefined
  }
}

/**
 * Identifiers come from `resolveEnvironment` rather than being recomposed
 * here, so destroy can never drift from what resolve created — one derivation,
 * one source of truth.
 *
 * Only the identifier fields of the descriptor are used. The slot it would
 * allocate is irrelevant (destroy reads the recorded slot straight from the
 * registry), so the call is made as if this were the primary worktree: that
 * short-circuits slot allocation and keeps an unregistered name from failing
 * with `SlotAllocationError` just because the registry happens to be full.
 */
function identifiersFor(
  rawName: string,
  registry: RegistrySnapshot,
  isDefaultEnvironment: boolean
): EnvironmentIdentifiers {
  const descriptor = resolveEnvironment({
    name: rawName,
    worktreePath: '',
    isPrimaryWorktree: true,
    isDefaultEnvironment,
    registry
  })

  return {
    dbName: descriptor.dbName,
    esPrefix: descriptor.esPrefix,
    esReindexingStatusIndex: descriptor.esReindexingStatusIndex,
    bucket: descriptor.bucket
  }
}

/**
 * Every other registered environment's index prefix, derived the named way.
 * An entry that is itself the default environment really owns the unprefixed
 * `events` indices, but claiming `events_<its name>` on its behalf is
 * harmless: it can only ever exclude indices from deletion, never add any.
 */
export function otherEsPrefixes(
  name: string,
  registry: RegistrySnapshot,
  discoveredNames: string[] = []
): string[] {
  const others = new Set(
    [...Object.keys(registry), ...discoveredNames].filter(
      (other) => sanitizeEnvironmentNameOrSelf(other) !== name
    )
  )

  return [...others].map(
    (other) =>
      identifiersFor(other, registry, /* isDefaultEnvironment */ false).esPrefix
  )
}

function sanitizeEnvironmentNameOrSelf(name: string): string {
  try {
    return sanitizeEnvironmentName(name)
  } catch {
    return name
  }
}

/**
 * Refuse to select any index when the set of other environments is unknown.
 *
 * Deleting under an incomplete picture is the one irreversible mistake here —
 * it is exactly how one environment's search data disappears with another's —
 * while skipping leaves indices behind that a later run removes. So the
 * asymmetry is deliberate: when in doubt, delete nothing.
 */
export function indexSelectionSkipReason(
  name: string,
  discovery: EnvironmentDiscovery
): string | undefined {
  if (discovery.failure === undefined) {
    return undefined
  }

  return (
    `Could not establish which other environments exist (${discovery.failure}), ` +
    `so which Elasticsearch indices belong to "${name}" is not knowable and ` +
    'no index was deleted. The database, bucket and Redis DB are named ' +
    'exactly and were handled normally. Re-run once Postgres is reachable.'
  )
}

interface RedisPlan {
  db?: number
  skipReason?: string
}

/**
 * Flushing a Redis DB is irreversible and the DB index is just a number, so
 * every case where the right number is not certain skips the flush instead of
 * guessing.
 */
function planRedis({
  name,
  entry,
  isDefaultEnvironment,
  refused
}: {
  name: string
  entry: RegistryEntry | undefined
  isDefaultEnvironment: boolean
  refused: boolean
}): RedisPlan {
  if (refused) {
    return {
      db: undefined,
      skipReason: `Nothing is flushed: destroying "${name}" was refused.`
    }
  }

  if (entry === undefined) {
    return {
      db: undefined,
      skipReason:
        `The Redis logical DB of an environment is its slot, which is only ` +
        `recorded in the registry. "${name}" is not in the registry, so no ` +
        'DB is flushed.'
    }
  }

  /*
   * A named environment living in the primary checkout sits at slot 0 but does
   * not own DB 0 — the default environment does. Flushing it would wipe the
   * ordinary checkout's queues, so it is skipped rather than shared.
   */
  if (entry.slot === 0 && !isDefaultEnvironment) {
    return {
      db: undefined,
      skipReason:
        `Redis DB 0 belongs to the default environment, not to "${name}", ` +
        'even though both sit at slot 0. No DB is flushed.'
    }
  }

  return { db: entry.slot, skipReason: undefined }
}

function refusalMessage(
  name: string,
  identifiers: EnvironmentIdentifiers
): string {
  return (
    `Refusing to destroy the default environment "${name}" without --force. ` +
    'It owns the shared data every ordinary checkout uses: the ' +
    `"${identifiers.dbName}" database, the "${identifiers.esPrefix}" ` +
    `Elasticsearch indices, the "${identifiers.esReindexingStatusIndex}" ` +
    `index and the "${identifiers.bucket}" bucket. Re-run with --force if ` +
    'that is really what you want.'
  )
}

/**
 * What index selection needs to know about an environment: its own prefix and
 * reindexing-status index, and every other environment's prefix. A
 * `DestroyPlan` satisfies it; so does the clear path (see `clear.ts`), which is
 * why the rule below is written once and shared rather than reimplemented.
 */
export interface IndexOwnership {
  identifiers: Pick<
    EnvironmentIdentifiers,
    'esPrefix' | 'esReindexingStatusIndex'
  >
  otherEsPrefixes: string[]
  /** When set, the operation is refused and nothing is selected. */
  refusal?: string
  /** When set, ownership is not fully known and nothing may be selected. */
  indexSelectionSkipReason?: string
}

/**
 * Pick, out of the indices Elasticsearch actually reports, the ones belonging
 * to the environment being destroyed.
 *
 * A plain `startsWith` is wrong and dangerous here, because one environment's
 * prefix can be a prefix of another's: `events` (the default environment) is a
 * prefix of `events_feature_a`, and `events_feature_a` is a prefix of
 * `events_feature_a_2`. Naively destroying the default environment would take
 * every named environment's data with it.
 *
 * So an index is awarded to the *longest* prefix that claims it, out of this
 * environment's and every other registered environment's, and is deleted only
 * when this environment wins. An index no prefix claims is left alone: this
 * only ever deletes data it can positively attribute.
 *
 * The set of "every other environment" must therefore be complete, which the
 * registry alone is not: see `EnvironmentDiscovery`. When completeness cannot
 * be established, `indexSelectionSkipReason` is set and nothing is selected.
 */
export function selectIndicesToDelete(
  indices: string[],
  plan: IndexOwnership
): string[] {
  if (
    plan.refusal !== undefined ||
    plan.indexSelectionSkipReason !== undefined
  ) {
    return []
  }

  const own = plan.identifiers.esPrefix

  return indices.filter((index) => {
    // Carried separately because the default environment's reindexing-status
    // index (`reindexing_status`) sits outside its own `events` prefix.
    if (index === plan.identifiers.esReindexingStatusIndex) {
      return true
    }

    if (!claims(own, index)) {
      return false
    }

    return !plan.otherEsPrefixes.some(
      (other) => other.length > own.length && claims(other, index)
    )
  })
}

/** Whether `prefix` names the index itself or is a `prefix_`-separated part. */
function claims(prefix: string, index: string): boolean {
  return index === prefix || index.startsWith(`${prefix}_`)
}
