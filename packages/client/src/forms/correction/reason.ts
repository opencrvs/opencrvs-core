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
  RADIO_GROUP_WITH_NESTED_FIELDS,
  TEXTAREA
} from '@client/forms'
import { formMessages } from '@client/i18n/messages/form'
import { messages } from '@client/i18n/messages/views/correction'
import { fieldValueSectionExchangeTransformer } from '@client/forms/register/mappings/mutation'
import { required as requiredValidation } from '@opencrvs/client/src/utils/validate'
import { validationMessages } from '@client/i18n/messages'

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
      validator: [],
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
            name: 'otherReason',
            type: 'TEXT',
            label: messages.reasonForChange,
            required: true,
            initialValue: '',
            validator: [
              requiredValidation(validationMessages.requiredReasonForCorrection)
            ],
            mapping: {}
          }
        ]
      },
      mapping: {
        mutation: fieldValueSectionExchangeTransformer('correction', 'reason')
      }
    },
    {
      name: 'additionalComment',
      type: TEXTAREA,
      label: messages.additionalComment,
      initialValue: '',
      validator: [],
      required: false,
      maxLength: 500,
      mapping: {
        mutation: fieldValueSectionExchangeTransformer('correction', 'note')
      }
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
