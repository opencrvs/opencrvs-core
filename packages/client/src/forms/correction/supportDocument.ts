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
import {
  CorrectionSection,
  IFormSection,
  IFormSectionGroup,
  RADIO_GROUP
} from '@client/forms'
import { messages } from '@client/i18n/messages/views/correction'
import { fieldValueSectionExchangeTransformer } from '@client/forms/register/mappings/mutation'

export const supportingDocumentsSectionGroup: IFormSectionGroup = {
  id: 'correctionDocumentsViewGroup',
  fields: [
    {
      name: 'uploadDocForLegalProof',
      type: 'DOCUMENT_UPLOADER_WITH_OPTION',
      label: messages.proofOfLegalDocuments,
      initialValue: '',
      hideHeader: true,
      hideAsterisk: true,
      mapping: {
        mutation: fieldValueSectionExchangeTransformer('correction', 'data')
      },
      validator: [],
      options: [
        {
          value: 'Affidavit',
          label: messages.docTypeAffidavitProof
        },
        {
          value: 'Court Document',
          label: messages.docTypeCourtDocument
        },
        {
          value: 'Other',
          label: messages.docTypeOther
        }
      ]
    },
    {
      name: 'supportDocumentRequiredForCorrection',
      type: RADIO_GROUP,
      label: messages.supportDocumentForCorrection,
      hideHeader: true,
      hideAsterisk: true,
      required: true,
      initialValue: '',
      validator: [],
      placeholder: messages.selectPlaceholder,
      options: [
        {
          value: true,
          label: messages.attestToSeeCorrectionDocument
        },
        {
          value: false,
          label: messages.noDocumentsRequiredForCorrection
        }
      ]
    }
  ]
}

export const supportingDocumentsSection: IFormSection = {
  id: CorrectionSection.SupportingDocuments,
  viewType: 'form',
  name: messages.name,
  title: messages.title,
  groups: [supportingDocumentsSectionGroup]
}
