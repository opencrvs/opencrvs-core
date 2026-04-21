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

import * as z from 'zod/v4'
import { TranslationConfig } from './TranslationConfig'
import { EventMetadataKeysArray } from './EventMetadata'

export const WorkqueueColumnKeysArray = [
  ...EventMetadataKeysArray,
  'title',
  'outbox'
] as const
export const WorkqueueColumnKeys = z.enum(WorkqueueColumnKeysArray)
export type WorkqueueColumnKeys = z.infer<typeof WorkqueueColumnKeys>

export const WorkqueueColumnValue = z.object({
  $event: WorkqueueColumnKeys
})
export type WorkqueueColumnValue = z.infer<typeof WorkqueueColumnValue>

/**
 * Configuration for column header and value of cell of workqueue.
 */
export const WorkqueueColumn = z.object({
  label: TranslationConfig,
  value: WorkqueueColumnValue
})
export type WorkqueueColumn = z.infer<typeof WorkqueueColumn>
export type WorkqueueColumnInput = z.infer<typeof WorkqueueColumn>

export function defineWorkqueuesColumns(
  workqueueColumns: WorkqueueColumnInput[]
) {
  return workqueueColumns.map((workqueueColumn) =>
    WorkqueueColumn.parse(workqueueColumn)
  )
}
