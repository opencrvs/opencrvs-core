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
import { defineMessages, MessageDescriptor } from 'react-intl'

const messagesToDefine = {
  dateOfBirth: {
    defaultMessage: 'Date of Birth',
    description: 'Parent Date of Birth',
    id: 'certificate.parent.details.label.dateOfBirth'
  },
  familyName: {
    defaultMessage: 'Last Name',
    description: 'Parent last name',
    id: 'certificate.parent.details.label.familyName'
  },
  firstName: {
    defaultMessage: 'First Name(s)',
    description: 'Parent first names',
    id: 'certificate.parent.details.label.firstName'
  },
  nationality: {
    defaultMessage: 'Nationality',
    description: 'Parent Nationality',
    id: 'certificate.parent.details.label.nationality'
  },
  age: {
    defaultMessage: 'Age',
    description: 'Person age',
    id: 'certificate.parent.details.label.age'
  },
  number: {
    defaultMessage: 'Number',
    description: 'Parent number',
    id: 'certificate.parent.details.label.number'
  },
  other: {
    defaultMessage: 'Other',
    description:
      'The label for select value when the collector of certificate is other person',
    id: 'print.certificate.collector.other'
  },
  preview: {
    defaultMessage: 'Certificate Preview',
    description: 'The title for certificate preview form',
    id: 'print.certificate.certificatePreview'
  },
  print: {
    defaultMessage: 'Print certificate',
    description: 'The title of review button in list expansion actions',
    id: 'print.certificate.form.title'
  },
  printCertificate: {
    defaultMessage: 'Print',
    description: 'The title of review button in list expansion actions',
    id: 'print.certificate.form.name'
  },
  confirmAndPrint: {
    defaultMessage: 'Yes, print certificate',
    description: 'The text for print button',
    id: 'print.certificate.button.confirmPrint'
  },
  printAndIssueModalTitle: {
    id: 'print.certificate.review.printAndIssueModalTitle',
    defaultMessage: 'Print and issue certificate?',
    description: 'Print and issue certificate modal title text'
  },
  printAndIssueModalBody: {
    id: 'print.certificate.review.modal.body.printAndIssue',
    defaultMessage:
      'A PDF of the certificate will open in a new tab for you to print and issue',
    description: 'Print certificate modal body text'
  },
  toastMessage: {
    id: 'print.certificate.toast.message',
    defaultMessage: 'Certificate is ready to print',
    description: 'Floating Toast message upon certificate ready to print'
  },
}

interface IDynamicCertificateMessages {
  [key: string]: MessageDescriptor
}

const dynamicMessagesToDefine = {
}

export const messages = defineMessages(messagesToDefine)
const dynamicMessages: IDynamicCertificateMessages = defineMessages(
  dynamicMessagesToDefine
)
