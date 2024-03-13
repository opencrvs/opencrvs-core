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
import { CHECKBOX_GROUP, TEXTAREA, IFormField } from '@client/forms'
import { messages } from '@client/i18n/messages/views/reject'

export interface IRejectRegistrationForm {
  fields: IFormField[]
}
export const rejectRegistration: IRejectRegistrationForm = {
  fields: [
    {
      name: 'rejectionCommentForHealthWorker',
      type: TEXTAREA,
      label: messages.rejectionCommentForHealthWorkerLabel,
      initialValue: '',
      required: true,
      hideAsterisk: true,
      hideHeader: true,
      validator: [],
      maxLength: 500,
      ignoreMediaQuery: true,
      ignoreBottomMargin: true
    },
    {
      name: 'rejectionReason',
      type: CHECKBOX_GROUP,
      label: messages.rejectionReason,
      hideHeader: true,
      hideAsterisk: true,
      initialValue: [],
      validator: [],
      ignoreBottomMargin: true,
      options: [
        {
          value: 'duplicate',
          label: messages.markAsDuplicate
        }
      ]
    }
  ]
}
