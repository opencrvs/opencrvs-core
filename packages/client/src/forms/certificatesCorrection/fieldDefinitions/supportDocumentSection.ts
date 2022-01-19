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
  CertificateSection,
  IFormSection,
  IFormSectionGroup
} from '@client/forms'
import { messages } from '@client/i18n/messages/views/certificate'

export const correctSupportDocumentSectionGroup: IFormSectionGroup = {
  id: 'correction-documents-view-group',
  fields: [
    {
      name: 'uploadDocForLegalProof',
      type: 'DOCUMENT_UPLOADER_WITH_OPTION',
      label: {
        defaultMessage: 'Proof of legal correction documents',
        description: 'Label for list item of legal proof',
        id: 'form.field.label.proofOfLegalDocuments'
      },
      initialValue: '',
      hideHeader: true,
      hideAsterisk: true,
      validate: [],
      options: [
        {
          value: 'Affidavit',
          label: {
            defaultMessage: 'Affidavit',
            description: 'Label for select option Affidavit',
            id: 'form.field.label.docTypeAffidavitProof'
          }
        },
        {
          value: 'Court Document',
          label: {
            defaultMessage: 'Court Document',
            description: 'Label for select option Court Document',
            id: 'form.field.label.docTypeCourtDocument'
          }
        },
        {
          value: 'Other',
          label: {
            defaultMessage: 'Other',
            description: 'Label for select option Other',
            id: 'form.field.label.docTypeCorrectionOther'
          }
        }
      ]
    },
    {
      name: 'supportDocumentForCorrection',
      type: 'RADIO_GROUP',
      label: {
        defaultMessage: 'Check Supporting Document?',
        description: 'Label for form field: Correction Supporting Document',
        id: 'form.field.label.supportDocumentForCorrection'
      },
      hideHeader: true,
      hideAsterisk: true,
      required: true,
      initialValue: '',
      validate: [],
      size: RadioSize.LARGE,
      placeholder: {
        defaultMessage: 'Select',
        description: 'Placeholder text for a select',
        id: 'form.field.select.placeholder'
      },
      options: [
        {
          value: true,
          label: {
            defaultMessage:
              'I attest to seeing supporting documentation and have a copy filed at my office',
            description: 'Option for form field: Manner of death',
            id: 'form.field.label.attestToSeeCorrectionDocument'
          }
        },
        {
          value: false,
          label: {
            defaultMessage: 'No supporting documents required',
            description: 'Option for form field: Manner of death',
            id: 'form.field.label.noDocumentsRequiredForCorrection'
          }
        }
      ]
    }
  ]
}

export const correctSupportDocumentSection: IFormSection = {
  id: CertificateSection.Corrector,
  viewType: 'form',
  name: messages.printCertificate,
  title: messages.certificateCollectionTitle,
  groups: [correctSupportDocumentSectionGroup]
}
