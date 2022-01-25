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
  whatWasTheReasonForCorrection: MessageDescriptor
  reasonForChange: MessageDescriptor
  additionalComment: MessageDescriptor
  clericalError: MessageDescriptor
  materialError: MessageDescriptor
  materialOmission: MessageDescriptor
  judicialOrder: MessageDescriptor
  reasonForChangeError: MessageDescriptor
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
  whatWasTheReasonForCorrection: {
    id: 'correction.reason.title',
    defaultMessage: 'What was the reason for making a correction?',
    description: 'The title for the correction reason form'
  },
  reasonForChange: {
    id: 'correction.reason.reasonForChange',
    defaultMessage: 'Reason for change',
    description: 'Label for other reason for correction reason form'
  },
  additionalComment: {
    id: 'correction.reason.additionalComment',
    defaultMessage: 'Any additional comment?',
    description: 'Label for any additional comment for correction reason form'
  },
  clericalError: {
    id: 'correction.reason.clericalError',
    defaultMessage: 'Myself or an agent made a mistake (Clerical error)',
    description: 'Label for clerical error for correction reason form'
  },
  materialError: {
    id: 'correction.reason.materialError',
    defaultMessage: 'Applicant provided incorrect information (Material error)',
    description: 'Label for material error for correction reason form'
  },
  materialOmission: {
    id: 'correction.reason.materialOmission',
    defaultMessage:
      'Applicant did not provide this information (Material omission)',
    description: 'Label for material omission for correction reason form'
  },
  judicialOrder: {
    id: 'correction.reason.judicialOrder',
    defaultMessage: 'Requested to do so by the court (Judicial order)',
    description: 'Label for judicial order for correction reason form'
  },
  reasonForChangeError: {
    id: 'correction.reason.error',
    defaultMessage: 'Please type the reason for change',
    description: 'Error for reason form'
  }
}

export const messages: ICorrectionMessages = defineMessages(messagesToDefine)
