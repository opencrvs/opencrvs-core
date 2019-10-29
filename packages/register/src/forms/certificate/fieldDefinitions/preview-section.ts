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
import {
  ViewType,
  PDF_DOCUMENT_VIEWER,
  IFormSection,
  CertificateSection
} from '@register/forms'
import { messages } from '@register/i18n/messages/views/certificate'

export const certificatePreview: IFormSection = {
  id: CertificateSection.CertificatePreview,
  viewType: 'form' as ViewType,
  name: messages.preview,
  title: messages.preview,
  groups: [
    {
      id: 'certificate-preview-view-group',
      fields: [
        {
          name: 'certificate',
          type: PDF_DOCUMENT_VIEWER,
          label: messages.noLabel,
          initialValue: '',
          validate: []
        }
      ]
    }
  ]
}
