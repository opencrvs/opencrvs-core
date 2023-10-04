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

interface IAdvancedSearchMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  registrationDetails: MessageDescriptor
  childDetails: MessageDescriptor
  eventDetails: MessageDescriptor
  motherDetails: MessageDescriptor
  fatherDetails: MessageDescriptor
  placeOfRegistrationlabel: MessageDescriptor
  placeOfRegistrationHelperText: MessageDescriptor
  dateOfRegistration: MessageDescriptor
  statusOfRecordLabel: MessageDescriptor
  deceasedDetails: MessageDescriptor
  informantDetails: MessageDescriptor
  recordStatusAny: MessageDescriptor
  recordStatusInprogress: MessageDescriptor
  recordStatusInReview: MessageDescriptor
  recordStatusRequireUpdate: MessageDescriptor
  recordStatusRegistered: MessageDescriptor
  recordStatusCertified: MessageDescriptor
  recordStatusAchived: MessageDescriptor
  show: MessageDescriptor
  hide: MessageDescriptor
}

const messagesToDefine: IAdvancedSearchMessages = {
  registrationDetails: {
    defaultMessage: 'Registration details',
    description: 'The title of Registration details accordion',
    id: 'advancedSearch.form.registrationDetails'
  },
  childDetails: {
    defaultMessage: 'Child details',
    description: 'The title of Child details accordion',
    id: 'advancedSearch.form.childDetails'
  },
  eventDetails: {
    defaultMessage: 'Event details',
    description: 'The title of event details accordion',
    id: 'advancedSearch.form.eventDetails'
  },
  motherDetails: {
    defaultMessage: 'Mother details',
    description: 'The title of Mother details accordion',
    id: 'advancedSearch.form.motherDetails'
  },
  fatherDetails: {
    defaultMessage: 'Father details',
    description: 'The title of Father details accordion',
    id: 'advancedSearch.form.fatherDetails'
  },
  placeOfRegistrationlabel: {
    defaultMessage: 'Place of registration',
    description: 'Label for input Place of registration',
    id: 'advancedSearch.form.placeOfRegistration'
  },
  placeOfRegistrationHelperText: {
    defaultMessage: 'Search for a province, district or registration office',
    description: 'Helper text for input Place of registration',
    id: 'advancedSearch.form.placeOfRegistrationHelperText'
  },
  dateOfRegistration: {
    defaultMessage: 'Date of registration',
    description: 'Label for input date of registration',
    id: 'advancedSearch.form.dateOfRegistration'
  },
  statusOfRecordLabel: {
    defaultMessage: 'Status of record',
    description: 'Label for input Status of record',
    id: 'advancedSearch.form.statusOfRecordLabel'
  },
  deceasedDetails: {
    defaultMessage: 'Deceased details',
    description: 'The title of Deceased details accordion',
    id: 'advancedSearch.form.deceasedDetails'
  },
  informantDetails: {
    defaultMessage: 'Informant details',
    description: 'The title informant details form',
    id: 'advancedSearch.form.informantDetails'
  },
  recordStatusAny: {
    defaultMessage: 'Any status',
    description: 'Option for form field: status of record',
    id: 'advancedSearch.form.recordStatusAny'
  },
  recordStatusInprogress: {
    defaultMessage: 'In progress',
    description: 'Option for form field: status of record',
    id: 'advancedSearch.form.recordStatusInprogress'
  },
  recordStatusInReview: {
    defaultMessage: 'In review',
    description: 'Option for form field: status of record',
    id: 'advancedSearch.form.recordStatusInReview'
  },
  recordStatusRequireUpdate: {
    defaultMessage: 'Requires updates',
    description: 'Option for form field: status of record',
    id: 'advancedSearch.form.recordStatusRequireUpdate'
  },
  recordStatusRegistered: {
    defaultMessage: 'Registered',
    description: 'Option for form field: status of record',
    id: 'advancedSearch.form.recordStatusRegistered'
  },
  recordStatusCertified: {
    defaultMessage: 'Certified',
    description: 'Option for form field: status of record',
    id: 'advancedSearch.form.recordStatusCertified'
  },
  recordStatusAchived: {
    defaultMessage: 'Archived',
    description: 'Option for form field: status of record',
    id: 'advancedSearch.form.recordStatusAchived'
  },
  hide: {
    defaultMessage: 'Hide',
    description: 'Label for hide button when accordion is closed',
    id: 'advancedSearch.accordion.hide'
  },
  show: {
    defaultMessage: 'Show',
    description: 'Label for show button when accordion is closed',
    id: 'advancedSearch.accordion.show'
  }
}
export const messages: IAdvancedSearchMessages =
  defineMessages(messagesToDefine)
