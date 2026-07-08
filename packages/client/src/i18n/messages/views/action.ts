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
import { defineMessages } from 'react-intl'

export const messages = defineMessages({
  action: {
    defaultMessage: 'Action',
    description: 'Label for action button in dropdown menu',
    id: 'action.action'
  },
  assignedTo: {
    defaultMessage: 'Assigned to {name} at {officeName}',
    description: 'Label for assignee',
    id: 'action.assignee'
  },
  noActionsAvailable: {
    defaultMessage: 'No actions available',
    description: 'No actions available message',
    id: 'action.noActionsAvailable'
  },
  view: {
    defaultMessage: 'View {recordOrDeclaration}',
    description: 'Label for view button in dropdown menu',
    id: 'action.view'
  },
  correctRecord: {
    defaultMessage: 'Correct Record',
    description: 'Label for correct record button in dropdown menu',
    id: 'action.correct'
  },
})
