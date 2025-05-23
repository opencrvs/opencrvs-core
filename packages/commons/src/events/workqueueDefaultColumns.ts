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

import { event } from './event'
import { WorkqueueColumn } from './WorkqueueColumnConfig'

export const defaultWorkqueueColumns: WorkqueueColumn[] = [
  {
    label: {
      defaultMessage: 'Title',
      description: 'This is the label for the workqueue column',
      id: 'workqueue.in-reveiw.column.title'
    },
    value: event.field('title')
  },
  {
    label: {
      defaultMessage: 'Event',
      description: 'This is the label for the workqueue column',
      id: 'workqueue.default.column.event'
    },
    value: event.field('type')
  },
  {
    label: {
      defaultMessage: 'Last updated',
      description: 'This is the label for the workqueue column',
      id: 'workqueue.default.column.modifiedAt'
    },
    value: event.field('updatedAt')
  }
]
