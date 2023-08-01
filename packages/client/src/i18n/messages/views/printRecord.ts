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
import { defineMessage } from 'react-intl'

const messagesToDefine = {
  warningDeclarationDetails: {
    id: 'print.declaration.warning.declarationDetails',
    defaultMessage: 'To be completed by office',
    description: 'Warning text that shows before declaration details'
  },
  civilRegistrationCentre: {
    id: 'print.declaration.header.title',
    defineMessage: 'Civil Registration Centre',
    description: 'Print record header message'
  },
  informantAttestation: {
    id: 'print.declaration.informantAttestation',
    defaultMessage: 'I attest to having received this death declaration',
    description: 'Text for declaration details table entry'
  },
  placeOfDeclaration: {
    id: 'print.declaration.placeOfDeclaration',
    defaultMessage: 'Place of declaration',
    description: 'Label for declaration details table entry'
  },
  civilRegistrationOffice: {
    id: 'print.declaration.civilRegistrationOffice',
    defaultMessage: 'Civil registration office',
    description: 'Label for declaration details table entry'
  }
}

export const printRecordMessages = defineMessage(messagesToDefine)
