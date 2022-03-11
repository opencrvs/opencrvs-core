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
import { IFormField, RADIO_GROUP, TEXTAREA } from '@client/forms'
import { messages } from '@client/i18n/messages/views/sysAdmin'
import { RadioSize } from '@opencrvs/components/lib/forms'
import { conditionals } from '@client/forms/register/fieldDefinitions/register'

export interface IUserAuditForm {
  fields: IFormField[]
}

export const userAuditForm: IUserAuditForm = {
  fields: [
    {
      name: 'reason',
      type: RADIO_GROUP,
      required: true,
      validate: [],
      initialValue: '',
      label: messages.auditReason,
      size: RadioSize.LARGE,
      conditionals: [conditionals.isAuditActionDeactivate],
      options: [
        { label: messages.deactivateReasonNotEmployee, value: 'TERMINATED' },
        {
          label: messages.deactivateReasonInvestigated,
          value: 'SUSPICIOUS'
        },
        { label: messages.auditReasonOther, value: 'OTHER' }
      ]
    },
    {
      name: 'reason',
      type: RADIO_GROUP,
      required: true,
      validate: [],
      initialValue: '',
      label: messages.auditReason,
      size: RadioSize.LARGE,
      conditionals: [conditionals.isAuditActionReactivate],
      options: [
        {
          label: messages.reactivateReasonReturnedToRole,
          value: 'ROLE_REGAINED'
        },
        {
          label: messages.reactivateReasonNoLongerInvestigated,
          value: 'NOT_SUSPICIOUS'
        },
        { label: messages.auditReasonOther, value: 'OTHER' }
      ]
    },
    {
      name: 'comment',
      type: TEXTAREA,
      label: messages.comments,
      initialValue: '',
      validate: [],
      required: false,
      conditionals: [conditionals.userAuditReasonSpecified]
    },
    {
      name: 'comment',
      type: TEXTAREA,
      label: messages.comments,
      initialValue: '',
      validate: [],
      required: true,
      conditionals: [conditionals.userAuditReasonOther]
    }
  ]
}
