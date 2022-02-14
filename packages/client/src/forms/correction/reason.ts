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

export enum CorrectionReason {
  CLERICAL_ERROR = 'CLERICAL_ERROR',
  MATERIAL_ERROR = 'MATERIAL_ERROR',
  MATERIAL_OMISSION = 'MATERIAL_OMISSION',
  JUDICIAL_ORDER = 'JUDICIAL_ORDER',
  OTHER = 'OTHER'
}

export const correctRecordReasonSectionGroup: IFormSectionGroup = {
  id: 'recordCorrection',
  title: messages.whatWasTheReasonForCorrection,
  error: messages.reasonForChangeError,
  fields: [
    {
      name: 'type',
      type: RADIO_GROUP_WITH_NESTED_FIELDS,
      size: RadioSize.LARGE,
      label: messages.whatWasTheReasonForCorrection,
      required: true,
      hideHeader: true,
      initialValue: '',
      validate: [],
      options: [
        {
          value: CorrectionReason.CLERICAL_ERROR,
          label: messages.clericalError
        },
        {
          value: CorrectionReason.MATERIAL_ERROR,
          label: messages.materialError
        },
        {
          value: CorrectionReason.MATERIAL_OMISSION,
          label: messages.materialOmission
        },
        {
          value: CorrectionReason.JUDICIAL_ORDER,
          label: messages.judicialOrder
        },
        {
          value: CorrectionReason.OTHER,
          label: formMessages.otherOption
        }
      ],
      nestedFields: {
        OTHER: [
          {
            name: 'reasonForChange',
            type: 'TEXT',
            label: {
              defaultMessage: 'Reason for change',
              id: 'form.field.label.reasonForChange',
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

export const correctReasonSection: IFormSection = {
  id: CorrectionSection.Reason,
  viewType: 'form',
  name: messages.name,
  title: messages.title,
  groups: [correctRecordReasonSectionGroup]
}
