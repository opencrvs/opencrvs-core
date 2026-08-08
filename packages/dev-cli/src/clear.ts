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
  EnvironmentDiscovery,
  indexSelectionSkipReason,
  otherEsPrefixes,
  selectIndicesToDelete
} from './destroy'
import { RegistrySnapshot } from './types'

/**
 * The part of an environment's contract that decides which Elasticsearch
 * indices belong to it. Always taken from a contract that has already been
 * derived — an exported `ES_INDEX_PREFIX` or a `lookupEnvironment` descriptor —
 * never recomposed from the name here.
 */
export interface EnvironmentIndexIdentity {
  /** Sanitized environment name, as `OPENCRVS_ENV_NAME`. */
  name: string
  esPrefix: string
  esReindexingStatusIndex: string
}

/**
 * Read an already-loaded contract out of a process environment.
 *
 * `development-environment/environment.sh` exports the whole contract before
 * running anything, so a command invoked from inside a loaded environment can
 * read the values that environment actually uses instead of re-deriving them —
 * which matters because `--env` is not recoverable after the fact: an
 * environment named after the primary worktree's own directory is the *default*
 * environment, while the same name passed as `--env` asks for a separate one.
 *
 * Returns `undefined` unless every part is present, so a partially-set
 * environment never produces a half-guessed target.
 */
export function indexIdentityFromEnvironment(
  env: NodeJS.ProcessEnv
): EnvironmentIndexIdentity | undefined {
  const name = env.OPENCRVS_ENV_NAME
  const esPrefix = env.ES_INDEX_PREFIX
  const esReindexingStatusIndex = env.ES_REINDEXING_STATUS_INDEX

  if (!name || !esPrefix || !esReindexingStatusIndex) {
    return undefined
  }

  return { name, esPrefix, esReindexingStatusIndex }
}

/**
 * Pick, out of the indices Elasticsearch actually reports, the ones this
 * environment owns.
 *
 * Delegates to `selectIndicesToDelete` — the same longest-prefix-wins rule
 * `env:destroy` uses — rather than matching prefixes here. A plain
 * `startsWith` would make clearing the default environment (`events`) sweep
 * every named environment's indices (`events_feature_a...`) along with it,
 * which is precisely the data loss this command exists to avoid.
 *
 * The other environments come from the registry *and* from `discovery`, whose
 * whole point is that the registry does not know about every environment that
 * exists. If discovery failed, nothing is selected — see
 * `EnvironmentDiscovery`.
 */
export function selectEnvironmentIndices(
  indices: string[],
  identity: EnvironmentIndexIdentity,
  snapshot: RegistrySnapshot,
  discovery: EnvironmentDiscovery
): string[] {
  return selectIndicesToDelete(indices, {
    identifiers: {
      esPrefix: identity.esPrefix,
      esReindexingStatusIndex: identity.esReindexingStatusIndex
    },
    otherEsPrefixes: otherEsPrefixes(identity.name, snapshot, discovery.names),
    indexSelectionSkipReason: indexSelectionSkipReason(identity.name, discovery)
  })
}
