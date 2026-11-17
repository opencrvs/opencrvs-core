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
  FieldType,
  field,
  window,
  FieldConfig,
  ConditionalType,
  never
} from '@opencrvs/toolkit/events'
import { PAPER_CREDENTIAL_HANDLER_URL } from './routes'

/**
 * These fields will be included in print certificate action form as hidden. The credential will be minted before printing.
 */
export const printBirthCredentialActionFields = [
  {
    id: 'verifiable-credential-creation-http-request',
    type: FieldType.HTTP,
    label: {
      defaultMessage: 'Create verifiable credential',
      description: 'Label for the field that creates the verifiable credential',
      id: 'event.birth.action.certificate.form.section.collectPayment.createCredential.label'
    },
    configuration: {
      url: PAPER_CREDENTIAL_HANDLER_URL,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: { pathname: window().location.get('pathname') },
      timeout: 10000
    },
    conditionals: [
      {
        type: ConditionalType.DISPLAY_ON_REVIEW,
        conditional: never()
      }
    ]
  },
  {
    id: 'verifiable-credential',
    type: FieldType.ALPHA_HIDDEN,
    parent: field('verifiable-credential-creation-http-request'),
    label: {
      defaultMessage: 'Verifiable credential URL',
      description:
        'This field stores the verifiable credential URL returned from the issuer after creation',
      id: 'event.birth.action.certificate.form.section.collectPayment.verifiableCredentialUrl.label'
    },
    value: field('verifiable-credential-creation-http-request').get(
      'data.credential_qr'
    ),
    conditionals: [
      {
        type: ConditionalType.DISPLAY_ON_REVIEW,
        conditional: never()
      }
    ]
  }
] satisfies FieldConfig[]
