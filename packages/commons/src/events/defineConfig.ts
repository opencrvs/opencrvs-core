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

import { EventConfig, EventConfigInput } from './EventConfig'
import { findPageFields, resolveFieldLabels } from './utils'

/**
 * Builds a validated configuration for an event
 * @param config - Event specific configuration
 */
export const defineConfig = (config: EventConfigInput) => {
  const input = EventConfig.parse(config)

  const pageFields = findPageFields(input).map(({ id, label }) => ({
    id,
    label
  }))

  return EventConfig.parse({
    ...input,
    workqueues: input.workqueues.map((workqueue) =>
      resolveFieldLabels({
        config: workqueue,
        pageFields
      })
    )
  })
}
