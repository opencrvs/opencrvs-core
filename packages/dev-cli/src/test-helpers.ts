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
import { DestroyPlan, EnvironmentDiscovery, planDestroy } from './data-plan'
import { createEnvironmentLocator } from './locator'
import { Registry } from './registry'
import { RegistrySnapshot } from './types'

export interface PlanForTestInput {
  name: string
  snapshot: RegistrySnapshot
  /** Whether the entry's recorded worktree is the primary checkout. */
  registeredWorktreeIsPrimary?: boolean
  force?: boolean
  /** Defaults to discovery that ran and found nothing beyond the registry. */
  discovery?: EnvironmentDiscovery
}

/** Locate `name` the way `env:destroy` does, then plan its destruction. */
export function planForTest(input: PlanForTestInput): DestroyPlan {
  const environment = createEnvironmentLocator({
    // `locate` only reads.
    registry: { read: () => input.snapshot } as Registry,
    inspectWorktree: (worktreePath) => ({
      path: worktreePath ?? '/',
      isPrimary: input.registeredWorktreeIsPrimary === true
    })
  }).locate(input.name)

  return planDestroy({
    environment,
    snapshot: input.snapshot,
    force: input.force,
    discovery: input.discovery ?? { names: [] }
  })
}
