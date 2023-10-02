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
  loadingState: MessageDescriptor
  timeOutState: MessageDescriptor
  successAlertTitle: MessageDescriptor
  successAlertMessage: MessageDescriptor
  errorAlertTitle: MessageDescriptor
  errorAlertMessage: MessageDescriptor
  successUrlValidation: MessageDescriptor
  fullName: MessageDescriptor
  dateOfBirth: MessageDescriptor
  dateOfDeath: MessageDescriptor
  sex: MessageDescriptor
  placeOfBirth: MessageDescriptor
  placeOfDeath: MessageDescriptor
  registrationCenter: MessageDescriptor
  registar: MessageDescriptor
  brn: MessageDescriptor
  drn: MessageDescriptor
  createdAt: MessageDescriptor
  toastMessage: MessageDescriptor
}

const messagesToDefine: IVerifyCertificateMessages = {
  loadingState: {
    id: 'verifyCertificate.loading',
    defaultMessage: 'Verifying certificate',
    description: 'message when verification is checking'
  },
  timeOutState: {
    id: 'verifyCertificate.timeOut',
    defaultMessage: 'You been timed out',
    description: 'message when time out after few minute'
  },
  successAlertTitle: {
    id: 'verifyCertificate.successTitle',
    defaultMessage: 'Valid QR code',
    description: 'title for success alert'
  },
  successAlertMessage: {
    id: 'verifyCertificate.successMessage',
    defaultMessage:
      'Compare the partial details of the record below against those against those recorded on the certificate',
    description: 'message for success alert'
  },
  errorAlertTitle: {
    id: 'verifyCertificate.errorTitle',
    defaultMessage: 'Invalid QR code',
    description: 'title for error alert'
  },
  errorAlertMessage: {
    id: 'verifyCertificate.errorMessage',
    defaultMessage: 'The certificate is a potential forgery please...',
    description: 'message for error alert'
  },
  successUrlValidation: {
    id: 'verifyCertificate.successUrl',
    defaultMessage: 'URL Verification',
    description: 'title for success alert for url validation'
  },
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
  dateOfDeath: {
    id: 'verifyCertificate.dateOfDeath',
    defaultMessage: 'Date of death',
    description: 'Label for date of death'
  },
  sex: {
    id: 'verifyCertificate.sex',
    defaultMessage: 'Sex',
    description: 'Label for sex'
  },
  placeOfBirth: {
    id: 'verifyCertificate.placeOfBirth',
    defaultMessage: 'Place of birth',
    description: 'Label for place of birth'
  },
  placeOfDeath: {
    id: 'verifyCertificate.placeOfDeath',
    defaultMessage: 'Place of death',
    description: 'Label for place of death'
  },
  registrationCenter: {
    id: 'verifyCertificate.registrationCenter',
    defaultMessage: 'Registration Center',
    description: 'Label for registration center'
  },
  registar: {
    id: 'verifyCertificate.registar',
    defaultMessage: 'Name of registar',
    description: 'Label for name of registar center'
  },
  createdAt: {
    id: 'verifyCertificate.createdAt',
    defaultMessage: 'Date of certification',
    description: 'Label for date of certification'
  },
  brn: {
    id: 'verifyCertificate.brn',
    defaultMessage: 'BRN',
    description: 'Label for Birth Registration Number'
  },
  drn: {
    id: 'verifyCertificate.drn',
    defaultMessage: 'DRN',
    description: 'Label for Death Registration Number'
  },
  toastMessage: {
    id: 'verifyCertificate.toastMessage',
    defaultMessage:
      'After verifying the certificate, please close the browser window',
    description: 'Message for the toast when time spend 1 minute'
  },
  female: {
    defaultMessage: 'Female',
    description: 'Option for form field: Sex name',
    id: 'verifyCertificate.sexFemale'
  },
  male: {
    defaultMessage: 'Male',
    description: 'Option for form field: Sex name',
    id: 'verifyCertificate.sexMale'
  }
}

export const messageToDefine: IVerifyCertificateMessages =
  defineMessages(messagesToDefine)
