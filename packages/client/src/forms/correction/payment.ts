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
import { RadioSize } from '@opencrvs/components/lib/Radio'
import {
  CorrectionSection,
  IFormSection,
  IFormSectionGroup,
  RADIO_GROUP_WITH_NESTED_FIELDS
} from '@client/forms'
import { messages } from '@client/i18n/messages/views/correction'

export const correctionFeesPayment: IFormSectionGroup = {
  id: 'correctionFeesPayment',
  fields: [
    {
      name: 'correctionFees',
      type: RADIO_GROUP_WITH_NESTED_FIELDS,
      size: RadioSize.LARGE,
      label: messages.correctionSummaryFeesRequired,
      hideAsterisk: true,
      required: true,
      initialValue: '',
      validator: [],
      options: [
        {
          value: 'REQUIRED',
          label: messages.correctionSummaryFeesRequiredPositive
        },
        {
          value: 'NOT_REQUIRED',
          label: messages.correctionSummaryFeesRequiredNegative
        }
      ],
      nestedFields: {
        REQUIRED: [
          {
            name: 'totalFees',
            type: 'NUMBER',
            label: {
              defaultMessage: '',
              id: 'form.field.label.totalFees',
              description: 'Label for input Reason for Change'
            },
            required: true,
            initialValue: '',
            validator: [],
            mapping: {}
          },
          {
            name: 'proofOfPayment',
            type: 'SIMPLE_DOCUMENT_UPLOADER',
            label: messages.correctionSummaryProofOfPayment,
            description: messages.correctionSummaryProofOfPayment,
            required: true,
            initialValue: '',
            validator: [],
            mapping: {}
          }
        ]
      }
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
