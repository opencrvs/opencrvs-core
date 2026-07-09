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

interface IVerifyCertificateMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  fullName: MessageDescriptor
  dateOfBirth: MessageDescriptor
  placeOfBirth: MessageDescriptor
  brn: MessageDescriptor
  toastMessage: MessageDescriptor
}

const messagesToDefine: IVerifyCertificateMessages = {
  fullName: {
    id: 'verifyCertificate.fullname',
    defaultMessage: 'Full Name',
    description: 'title for success alert for url validation'
  },
  dateOfBirth: {
    id: 'verifyCertificate.dateOfBirth',
    defaultMessage: 'Date of birth',
    description: 'Label for date of birth'
  },
  placeOfBirth: {
    id: 'verifyCertificate.placeOfBirth',
    defaultMessage: 'Place of birth',
    description: 'Label for place of birth'
  },
  brn: {
    id: 'verifyCertificate.brn',
    defaultMessage: 'BRN',
    description: 'Label for Birth Registration Number'
  },
  toastMessage: {
    id: 'verifyCertificate.toastMessage',
    defaultMessage:
      'After verifying the certificate, please close the browser window',
    description: 'Message for the toast when time spend 1 minute'
  },
  male: {
    defaultMessage: 'Male',
    description: 'Option for form field: Sex name',
    id: 'verifyCertificate.sexMale'
  },
  unknown: {
    defaultMessage: 'Unknown',
    description: 'Option for form field: Sex name',
    id: 'form.field.label.sexUnknown'
  }
}

export const messageToDefine: IVerifyCertificateMessages =
  defineMessages(messagesToDefine)
