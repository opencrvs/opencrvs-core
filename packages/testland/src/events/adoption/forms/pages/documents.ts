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
  DocumentMimeType,
  defineFormPage,
  FieldType,
  ImageMimeType,
  PageTypes
} from '@opencrvs/toolkit/events'

export const documents = defineFormPage({
  id: 'documents',
  type: PageTypes.enum.FORM,
  title: {
    defaultMessage: 'Upload supporting documents',
    description: 'Form section title for documents',
    id: 'form.section.documents.title'
  },
  fields: [
    {
      id: 'documents.courtOrderCopy',
      type: FieldType.FILE,
      required: true,
      uncorrectable: true,
      configuration: {
        maxFileSize: 5 * 1024 * 1024,
        acceptedFileTypes: [
          ImageMimeType.enum['image/jpeg'],
          ImageMimeType.enum['image/png'],
          ImageMimeType.enum['image/jpg'],
          DocumentMimeType.enum['application/pdf']
        ],
        fileName: {
          defaultMessage: 'Adoption court order',
          description: 'This is the label for the file name',
          id: 'form.field.label.courtOrderCopy.fileName'
        }
      },
      label: {
        defaultMessage: 'Supporting document — court order copy',
        description: 'This is the label for the field',
        id: 'event.adoption.action.declare.form.section.documents.field.courtOrderCopy.label'
      }
    }
  ]
})
