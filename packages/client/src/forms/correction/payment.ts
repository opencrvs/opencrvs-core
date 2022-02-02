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
import { RadioSize } from '@opencrvs/components/lib/forms'
import {
  CorrectionSection,
  IFormSection,
  IFormSectionGroup,
  RADIO_GROUP_WITH_NESTED_FIELDS,
  TEXTAREA
} from '@client/forms'
import { formMessages } from '@client/i18n/messages/form'
import { messages } from '@client/i18n/messages/views/correction'

export const correctionFeesPayment: IFormSectionGroup = {
  id: 'correctionFeesPayment',
  title: messages.whatWasTheReasonForCorrection,
  error: messages.reasonForChangeError,
  fields: [
    {
      name: 'fees',
      type: RADIO_GROUP_WITH_NESTED_FIELDS,
      size: RadioSize.LARGE,
      label: messages.whatWasTheReasonForCorrection,
      required: true,
      hideHeader: true,
      initialValue: '',
      validate: [],
      options: [
        { value: 'REQUIRED', label: messages.clericalError },
        { value: 'NOT_REQUIRED', label: messages.materialError }
      ],
      nestedFields: {
        NOT_REQUIRED: [
          {
            name: 'totalFees',
            type: 'TEXT',
            label: {
              defaultMessage: 'Total ($)',
              id: 'form.field.label.totalFees',
              description: 'Label for input Reason for Change'
            },
            required: true,
            initialValue: '',
            validate: [],
            mapping: {}
          },
          {
            name: 'proofOfPayment',
            type: 'LINK',
            label: {
              defaultMessage: 'Proof of payment',
              id: 'form.field.label.proofOfPayment',
              description: 'Label for input Reason for Change'
            },
            required: true,
            initialValue: '',
            validate: [],
            mapping: {}
          }
        ]
      }
    },
    {
      name: 'additionalComment',
      type: TEXTAREA,
      label: messages.additionalComment,
      initialValue: '',
      validate: [],
      required: false,
      maxLength: 500
    }
  ]
}

export const correctionFeesPaymentSection: IFormSection = {
  id: CorrectionSection.CorrectionFeesPayment,
  viewType: 'form',
  name: messages.name,
  title: messages.title,
  groups: [correctionFeesPayment]
}
