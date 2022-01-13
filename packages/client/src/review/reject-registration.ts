/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { CHECKBOX_GROUP, TEXTAREA, IFormField } from '@client/forms'
import { messages } from '@client/i18n/messages/views/reject'

export interface IRejectRegistrationForm {
  fields: IFormField[]
}
export const rejectRegistration: IRejectRegistrationForm = {
  fields: [
    {
      name: 'rejectionReason',
      type: CHECKBOX_GROUP,
      label: messages.rejectionReason,
      required: true,
      initialValue: [],
      validate: [],
      options: [
        {
          value: 'duplicate',
          label: messages.rejectionReasonDuplicate
        },
        {
          value: 'misspelling',
          label: messages.rejectionReasonMisspelling
        },
        {
          value: 'missing_supporting_doc',
          label: messages.rejectionReasonMissingSupportingDoc
        },
        {
          value: 'other',
          label: messages.rejectionReasonOther
        }
      ]
    },
    {
      name: 'rejectionCommentForHealthWorker',
      type: TEXTAREA,
      label: messages.rejectionCommentForHealthWorkerLabel,
      initialValue: '',
      validate: [],
      required: true,
      maxLength: 500
    }
  ]
}
