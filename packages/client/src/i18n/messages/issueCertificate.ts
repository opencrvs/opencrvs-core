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

interface IIssueMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  regNumber: MessageDescriptor
  issueCertificate: MessageDescriptor
  collectorDetails: MessageDescriptor
  issueToMother: MessageDescriptor
  issueToFather: MessageDescriptor
  issueToSomeoneElse: MessageDescriptor
  issueToInformant: MessageDescriptor
  issueConfirmationMessage: MessageDescriptor
  idCheckWithoutVerify: MessageDescriptor
}

const messagesToDefine: IIssueMessages = {
  regNumber: {
    defaultMessage: 'Reg no.',
    description: 'Label for registered number',
    id: 'constants.registrationNumber'
  },
  issueCertificate: {
    defaultMessage: 'Issue Certificate',
    description: 'Label for issue certificate',
    id: 'constants.issueCertificate'
  },
  collectorDetails: {
    defaultMessage: 'Collector Details',
    description: 'Label for collector details',
    id: 'constants.collectorDetails'
  },
  issueToMother: {
    defaultMessage: 'Issue to informant (Mother)',
    description: 'Issuing to mother',
    id: 'constants.issueToMother'
  },
  issueToFather: {
    defaultMessage: 'Issue to informant (Father)',
    description: 'Issuing to father',
    id: 'constants.issueToFather'
  },
  issueToSomeoneElse: {
    defaultMessage: 'Issue to someone else',
    description: 'Issuing to someone else',
    id: 'constants.issueToSomeoneElse'
  },
  issueToInformant: {
    defaultMessage: 'Issue to informant',
    description: 'Issuance of death to informant',
    id: 'constants.issueToInformant'
  },
  issueConfirmationMessage: {
    defaultMessage:
      'Please confirm that the certificate has been issued to the informant or collector.',
    description: 'Confirmation of issuance',
    id: 'constants.issueConfirmationMessage'
  },
  idCheckWithoutVerify: {
    defaultMessage: 'Continue without proof of ID?',
    description: 'Issuance without the confirmation of proof',
    id: 'constants.idCheckWithoutVerify'
  }
}

export const issueMessages: Record<
  string | number | symbol,
  MessageDescriptor
> = defineMessages(messagesToDefine)
