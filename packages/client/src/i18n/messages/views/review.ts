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
import { defineMessages } from 'react-intl'

const messagesToDefine = {
  hideLabel: {
    defaultMessage: 'Hide',
    description: 'Button to hide section',
    id: 'form.field.hideLabel'
  },

  signatureInputDescription: {
    defaultMessage:
      'By signing this document with an electronic signature, I agree that such signature will be valid as handwritten signatures to the extent allowed by the laws of Farajaland.',
    description: 'Description acknowledging the correctness of the declaration',
    id: 'review.signature.input.description'
  },
  signatureOpenSignatureInput: {
    defaultMessage: 'Sign',
    description: 'Label for button that opens the signature input',
    id: 'review.signature.open'
  },
  signatureDelete: {
    defaultMessage: 'Delete',
    description: 'Label for button that deletes signature',
    id: 'review.signature.delete'
  },
  supportingDocuments: {
    defaultMessage: 'Supporting documents',
    description: 'Section heading title for supporting documents',
    id: 'review.inputs.supportingDocuments'
  },
  zeroDocumentsTextForAnySection: {
    defaultMessage: 'No supporting documents',
    description: 'Zero documents text',
    id: 'review.documents.zeroDocumentsTextForAnySection'
  },
  govtName: {
    id: 'review.header.title.govtName',
    defaultMessage: 'Government of the peoples republic of Bangladesh',
    description: 'Header title that shows bgd govt name'
  },
  clear: {
    defaultMessage: 'Clear',
    description: 'Label for button that clear signature input',
    id: 'review.signature.clear'
  },
}

export const messages = defineMessages(messagesToDefine)
