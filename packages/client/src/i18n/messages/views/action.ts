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

const messagesToDefine = {
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
  archiveRecord: {
    defaultMessage: 'Archive Record',
    description: 'Label for archive record button in dropdown menu',
    id: 'action.archive'
  },
  reinstateRecord: {
    defaultMessage: 'Reinstate Record',
    description: 'Label for reinstate record button in dropdown menu',
    id: 'action.reinstate'
  },
  reviewCorrection: {
    defaultMessage: 'Review correction request',
    description: 'Label for review correction request button in dropdown menu',
    id: 'action.review.correction'
  },
  reviewDeclaration: {
    defaultMessage:
      'Review {isDuplicate, select, true{potential duplicate} other{declaration}}',
    description: 'Label for review record button in dropdown menu',
    id: 'action.review.declaration'
  },
  updateDeclaration: {
    defaultMessage: 'Update declaration',
    description: 'Label for update record button in dropdown menu',
    id: 'action.update'
  },
  printDeclaration: {
    defaultMessage: 'Print certified copy',
    description: 'Label for print certified copy in dropdown menu',
    id: 'action.print'
  },
  issueCertificate: {
    defaultMessage: 'Issue certificate',
    description: 'Label for issue certificate in dropdown menu',
    id: 'action.issue'
  }
}
export const messages = defineMessages(messagesToDefine)
