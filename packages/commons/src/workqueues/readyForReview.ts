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

import { defineWorkqueue } from './WorkqueueConfig'

export const inReviewWorkqueue = defineWorkqueue({
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
    }
  ],
  defaultColumns: ['event', 'createdAt', 'modifiedAt']
})
