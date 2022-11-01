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

interface IAdvancedSearchMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  registrationDetails: MessageDescriptor
  placeOfRegistrationlabel: MessageDescriptor
  placeOfRegistrationHelperText: MessageDescriptor
  placeOfRegistrationplaceholder: MessageDescriptor
  dateOfRegistration: MessageDescriptor
  statusOfRecordLabel: MessageDescriptor
  statusOfRecordPlaceholder: MessageDescriptor
  informantDetails: MessageDescriptor
  recordStatusAny: MessageDescriptor
  recordStatusInprogress: MessageDescriptor
  recordStatusInReview: MessageDescriptor
  recordStatusRequireUpdate: MessageDescriptor
  recordStatusRegistered: MessageDescriptor
  recordStatusCertified: MessageDescriptor
  recordStatusAchived: MessageDescriptor
}

const messagesToDefine: IAdvancedSearchMessages = {
  registrationDetails: {
    defaultMessage: 'Registration details',
    description: 'The title of advanced search birth tab form',
    id: 'form.section.advancedSearch.birth.title'
  },
  placeOfRegistrationlabel: {
    defaultMessage: 'Place of registration',
    description: 'Label for input Place of registration',
    id: 'form.field.label.birth.placeOfRegistration'
  },
  placeOfRegistrationHelperText: {
    defaultMessage: 'Search for a province, district or registration office',
    description: 'Helper text for input Place of registration',
    id: 'form.field.label.birth.placeOfRegistrationHelperText'
  },
  placeOfRegistrationplaceholder: {
    defaultMessage: 'Search',
    description: 'Placeholder for example of relationship',
    id: 'form.field.label.birth.placeOfRegistrationPlaceHolder'
  },
  dateOfRegistration: {
    defaultMessage: 'Date of registration',
    description: 'Label for input date of registration',
    id: 'form.field.label.birth.dateOfRegistration'
  },
  statusOfRecordLabel: {
    defaultMessage: 'Status of record',
    description: 'Label for input Status of record',
    id: 'form.field.label.birth.statusOfRecordLabel'
  },
  statusOfRecordPlaceholder: {
    defaultMessage: 'Select',
    description: 'Placeholder for status of record',
    id: 'form.field.label.birth.statusOfRecordPlaceholder'
  },
  informantDetails: {
    defaultMessage: 'Informant details',
    description: 'The title informant details form',
    id: 'form.section.advancedSearch.birth.informantDetails'
  },
  recordStatusAny: {
    defaultMessage: 'Any status',
    description: 'Option for form field: status of record',
    id: 'form.field.label.recordStatusAny'
  },
  recordStatusInprogress: {
    defaultMessage: 'In progress',
    description: 'Option for form field: status of record',
    id: 'form.field.label.recordStatusInprogress'
  },
  recordStatusInReview: {
    defaultMessage: 'In review',
    description: 'Option for form field: status of record',
    id: 'form.field.label.recordStatusInReview'
  },
  recordStatusRequireUpdate: {
    defaultMessage: 'Requires updates',
    description: 'Option for form field: status of record',
    id: 'form.field.label.recordStatusRequireUpdate'
  },
  recordStatusRegistered: {
    defaultMessage: 'Registered',
    description: 'Option for form field: status of record',
    id: 'form.field.label.recordStatusRegistered'
  },
  recordStatusCertified: {
    defaultMessage: 'Certified',
    description: 'Option for form field: status of record',
    id: 'form.field.label.recordStatusCertified'
  },
  recordStatusAchived: {
    defaultMessage: 'Archived',
    description: 'Option for form field: status of record',
    id: 'form.field.label.recordStatusAchived'
  }
}
export const messages: IAdvancedSearchMessages =
  defineMessages(messagesToDefine)
