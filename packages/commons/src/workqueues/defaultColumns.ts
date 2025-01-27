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

import { TranslationConfig } from '../events/TranslationConfig'
import { z } from 'zod'

export const WorkQueueColumnConfig = z.object({
  id: z.string(),
  label: TranslationConfig
})

export const defaultColumns = {
  event: {
    id: 'event',
    label: {
      defaultMessage: 'Event',
      description: 'This is the label for the workqueue column',
      id: 'workqueue.default.column.event'
    }
  },
  status: {
    id: 'status',
    label: {
      defaultMessage: 'Status',
      description: 'This is the label for the workqueue column',
      id: 'workqueue.default.column.status'
    }
  },
  createdAt: {
    id: 'createdAt',
    label: {
      defaultMessage: 'Created',
      description: 'This is the label for the workqueue column',
      id: 'workqueue.default.column.createdAt'
    }
  },

  modifiedAt: {
    id: 'modifiedAt',
    label: {
      defaultMessage: 'Modified',
      description: 'This is the label for the workqueue column',
      id: 'workqueue.default.column.modifiedAt'
    }
  }
} as const

export const DefaultColumnKeys = z.enum(
  Object.keys(defaultColumns) as [string, ...string[]]
)
