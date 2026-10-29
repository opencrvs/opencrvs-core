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
  ClearPlan,
  DestroyPlan,
  IndexOwnership,
  selectIndicesToDelete
} from './data-plan'

/**
 * What removing a bucket actually did.
 *
 * `absent` is the idempotent case — an environment that never uploaded a
 * document never had a bucket — and is deliberately *not* spelled the same as
 * `removed`: reporting "removed bucket X" when nothing was removed is how a
 * failure gets mistaken for a success. Anything that is neither is an error and
 * throws, so the registry entry is never released over surviving data.
 */
export type BucketRemoval = 'removed' | 'absent'

/**
 * The four services an environment owns data in, plus the registry, expressed
 * as the smallest set of operations `env:destroy` and `env:clear` need from
 * them.
 *
 * This is the seam between the plan (pure, already tested) and the containers.
 * It exists so the interesting question — *which* destructive operations does a
 * given plan actually request? — can be answered by a test with a recording
 * fake, rather than by dropping real databases.
 */
export interface EnvironmentDataServices {
  /** Drop the environment's Postgres database, if it exists. */
  dropDatabase(dbName: string): void
  /** Every index Elasticsearch currently holds, so the plan can filter it. */
  listIndices(): string[]
  /** Delete one index. Called only for indices the plan positively claims. */
  deleteIndex(index: string): void
  /**
   * Remove the environment's MinIO bucket and its contents. Reports whether
   * there was one; throws if there was and it could not be removed.
   */
  removeBucket(bucket: string): BucketRemoval
  /** `FLUSHDB` against one Redis logical database. */
  flushRedisDb(db: number): void
  /** Remove the environment's registry entry, freeing its slot. */
  releaseRegistryEntry(name: string): void
  /**
   * Drop schemas inside the environment's database, leaving the database and
   * its grants. `absent` when the database does not exist yet.
   */
  dropSchemas(dbName: string, schemas: string[]): 'dropped' | 'absent'
  /** Remove every object in a bucket but keep the bucket. Throws like `removeBucket`. */
  emptyBucket(bucket: string): BucketRemoval
  /** Delete a file in the checkout. Reports whether there was one. */
  removeFile(filePath: string): boolean
}

export interface RunDestroyInput {
  plan: DestroyPlan
  services: EnvironmentDataServices
  /** Progress, for stdout. */
  out?: (message: string) => void
  /** Refusals and skip reasons, for stderr. */
  err?: (message: string) => void
}

/** What actually happened, so a caller (or a test) can assert on it. */
export interface DestroyOutcome {
  /** True when the plan carried a refusal and nothing was touched. */
  refused: boolean
  droppedDatabase?: string
  deletedIndices: string[]
  /** Set only when a bucket was actually removed, not when there was none. */
  removedBucket?: string
  flushedRedisDb?: number
  releasedRegistryEntry: boolean
  /** Process exit code: non-zero only for a refusal. */
  exitCode: number
}

/**
 * Execute a `DestroyPlan`.
 *
 * The order is deliberate and runs from most to least authoritative: the
 * database first (it holds the declarations everything else is derived from),
 * then the search indices, then the uploaded documents, then the queues, and
 * only once all of that is gone is the registry entry released. If a step
 * throws, the slot stays claimed — an environment that is half-deleted must
 * keep its slot, because a slot freed while data survives is exactly the state
 * that lets the *next* environment inherit someone else's leftovers.
 *
 * A refusal short-circuits everything: nothing is dropped, deleted, flushed or
 * released, and the exit code is non-zero.
 */
export function runDestroy(input: RunDestroyInput): DestroyOutcome {
  const { plan, services } = input
  const out = input.out ?? (() => undefined)
  const err = input.err ?? (() => undefined)

  if (plan.refusal !== undefined) {
    err(plan.refusal)

    return {
      refused: true,
      deletedIndices: [],
      releasedRegistryEntry: false,
      exitCode: 1
    }
  }

  for (const note of plan.notes) {
    err(note)
  }

  out(`Destroying environment "${plan.name}".`)

  services.dropDatabase(plan.identifiers.dbName)
  out(`  dropped database ${plan.identifiers.dbName}`)

  const indices = deleteOwnedIndices(plan, services, out, err)

  const bucketRemoval = services.removeBucket(plan.identifiers.bucket)

  out(
    bucketRemoval === 'removed'
      ? `  removed bucket ${plan.identifiers.bucket}`
      : `  no bucket ${plan.identifiers.bucket} to remove`
  )

  if (plan.redisDb !== undefined) {
    services.flushRedisDb(plan.redisDb)
    out(`  flushed Redis DB ${plan.redisDb}`)
  } else if (plan.redisSkipReason !== undefined) {
    err(plan.redisSkipReason)
  }

  if (plan.releaseRegistryEntry) {
    services.releaseRegistryEntry(plan.name)
    out(`  released slot ${plan.slot} in the registry`)
  }

  return {
    refused: false,
    droppedDatabase: plan.identifiers.dbName,
    deletedIndices: indices,
    removedBucket:
      bucketRemoval === 'removed' ? plan.identifiers.bucket : undefined,
    flushedRedisDb: plan.redisDb,
    releasedRegistryEntry: plan.releaseRegistryEntry,
    exitCode: 0
  }
}

export interface RunClearInput {
  plan: ClearPlan
  services: EnvironmentDataServices
  /** Progress, for stdout. */
  out?: (message: string) => void
  /** Skip reasons, for stderr. */
  err?: (message: string) => void
}

export interface ClearOutcome {
  deletedIndices: string[]
  /** Set only when the bucket existed. */
  emptiedBucket?: string
  removedMosipDatabase: boolean
  /** Whether the database existed, and so had its schemas dropped. */
  droppedSchemas: boolean
}

/**
 * Execute a `ClearPlan`. Nothing is refused: clearing is how the default
 * environment is ordinarily reset, and every name in the plan came from the
 * calling environment's own contract.
 */
export function runClear(input: RunClearInput): ClearOutcome {
  const { plan, services } = input
  const out = input.out ?? (() => undefined)
  const err = input.err ?? (() => undefined)

  const indices = deleteOwnedIndices(plan, services, out, err)

  const bucketRemoval = services.emptyBucket(plan.identifiers.bucket)
  out(
    bucketRemoval === 'removed'
      ? `  emptied bucket ${plan.identifiers.bucket}`
      : `  no bucket ${plan.identifiers.bucket} to empty`
  )

  const removedMosipDatabase = services.removeFile(plan.mosipDatabasePath)
  if (removedMosipDatabase) {
    out(`  removed the mosip-api token store ${plan.mosipDatabasePath}`)
  }

  const schemas = services.dropSchemas(plan.identifiers.dbName, plan.schemas)
  out(
    schemas === 'dropped'
      ? `  dropped schemas ${plan.schemas.join(', ')} in ${plan.identifiers.dbName}`
      : `  database ${plan.identifiers.dbName} does not exist yet`
  )

  return {
    deletedIndices: indices,
    emptiedBucket:
      bucketRemoval === 'removed' ? plan.identifiers.bucket : undefined,
    removedMosipDatabase,
    droppedSchemas: schemas === 'dropped'
  }
}

/**
 * Delete the indices `plan` positively claims, out of those Elasticsearch
 * reports. Never a wildcard: `events*` would sweep every named environment's
 * indices along with the default environment's. See `selectIndicesToDelete`.
 */
function deleteOwnedIndices(
  plan: IndexOwnership,
  services: EnvironmentDataServices,
  out: (message: string) => void,
  err: (message: string) => void
): string[] {
  const indices = selectIndicesToDelete(services.listIndices(), plan)

  for (const index of indices) {
    services.deleteIndex(index)
    out(`  deleted index ${index}`)
  }

  if (plan.indexSelectionSkipReason !== undefined) {
    err(plan.indexSelectionSkipReason)
  } else if (indices.length === 0) {
    out('  no Elasticsearch indices belonged to this environment')
  }

  return indices
}
