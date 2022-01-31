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
  RADIO_GROUP
} from '@client/forms'
import { messages } from '@client/i18n/messages/views/correction'

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
      validate: [],
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
      validate: [],
      size: RadioSize.LARGE,
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
