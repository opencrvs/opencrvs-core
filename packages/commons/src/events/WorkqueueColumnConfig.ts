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

import { z } from 'zod'
import { TranslationConfig } from './TranslationConfig'
import { EventMetadataParameter } from './EventMetadata'

/**
 * Configuration for column header and value of cell of workqueue.
 */
export const WorkqueueColumn = z.object({
  label: TranslationConfig,
  value: EventMetadataParameter
})
export type WorkqueueColumn = z.infer<typeof WorkqueueColumn>
export type WorkqueueColumnInput = z.infer<typeof WorkqueueColumn>

export function defineWorkqueueColumns(
  workqueueColumns: WorkqueueColumnInput[]
) {
  return workqueueColumns.map((workqueueColumn) =>
    WorkqueueColumn.parse(workqueueColumn)
  )
}
