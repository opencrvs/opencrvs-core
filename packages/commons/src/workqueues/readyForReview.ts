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

import { defineWorkQueue } from './WorkqueueConfig'

export const inReviewWorkqueue = defineWorkQueue({
  id: 'ready-for-review',
  title: {
    defaultMessage: 'Ready for review',
    description: 'Label for in review workqueue',
    id: 'event.workqueue.in-review.label'
  },
  columns: [
    {
      id: 'title',
      label: {
        defaultMessage: 'Title',
        description: 'This is the label for the workqueue column',
        id: 'workqueue.in-reveiw.column.title'
      }
    },
    {
      id: 'event',
      label: {
        defaultMessage: 'Event',
        description: 'This is the label for the workqueue column',
        id: 'workqueue.in-reveiw.column.event'
      }
    }
  ],
  defaultColumns: ['createdAt', 'modifiedAt']
})
