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
import { defineMessages, MessageDescriptor } from 'react-intl'

interface ICorrectionMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  whoRequestedCorrection: MessageDescriptor
  title: MessageDescriptor
  name: MessageDescriptor
  correctorError: MessageDescriptor
  mother: MessageDescriptor
  father: MessageDescriptor
  child: MessageDescriptor
  legalGuardian: MessageDescriptor
  anotherRegOrFieldAgent: MessageDescriptor
  me: MessageDescriptor
  court: MessageDescriptor
  others: MessageDescriptor
  informant: MessageDescriptor
}

const messagesToDefine: ICorrectionMessages = {
  whoRequestedCorrection: {
    id: 'correction.corrector.title',
    defaultMessage: 'Who is requesting a change to this record?',
    description: 'The title for the corrector form'
  },
  name: {
    id: 'correction.name',
    defaultMessage: 'Correction',
    description: 'Certificate correction section name'
  },
  title: {
    id: 'correction.title',
    defaultMessage: 'Correct record',
    description: 'Certificate correction section title'
  },
  correctorError: {
    id: 'correction.corrector.error',
    defaultMessage: 'Please select who is correcting the certificate',
    description: 'Error for corrector form'
  },
  mother: {
    id: 'correction.corrector.mother',
    defaultMessage: 'Mother',
    description: 'Label for mother option in certificate correction form'
  },
  father: {
    id: 'correction.corrector.father',
    defaultMessage: 'Father',
    description: 'Label for father option in certificate correction form'
  },
  child: {
    id: 'correction.corrector.child',
    defaultMessage: 'Child',
    description: 'Label for child option in certificate correction form'
  },
  legalGuardian: {
    id: 'correction.corrector.legalGuardian',
    defaultMessage: 'Legal guardian',
    description:
      'Label for legal guardian option in certificate correction form'
  },
  anotherRegOrFieldAgent: {
    id: 'correction.corrector.anotherAgent',
    defaultMessage: 'Another registration agent or field agent',
    description:
      'Label for another registration or field agent option in certificate correction form'
  },
  me: {
    id: 'correction.corrector.me',
    defaultMessage: 'Me (Registrar)',
    description: 'Label for registrar option in certificate correction form'
  },
  court: {
    id: 'correction.corrector.court',
    defaultMessage: 'Court',
    description: 'Label for court option in certificate correction form'
  },
  others: {
    id: 'correction.corrector.others',
    defaultMessage: 'Someone else',
    description: 'Label for someone else option in certificate correction form'
  },
  informant: {
    id: 'correction.corrector.informant',
    defaultMessage: 'Informant',
    description: 'Label for informant option in certificate correction form'
  },
  CorrectCertificate: {
    defaultMessage: 'Correct',
    description: 'The title of Correct button in list expansion actions',
    id: 'correct.certificate.SupportDocument.form.name'
  },
  correctRecordTitle: {
    defaultMessage: 'Correct record',
    description: 'The title of correct certificate action',
    id: 'correct.certificate.section.title'
  }
}

export const messages: ICorrectionMessages = defineMessages(messagesToDefine)
