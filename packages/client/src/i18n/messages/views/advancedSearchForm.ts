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
  dateOfRegistration: MessageDescriptor
  statusOfRecordLabel: MessageDescriptor
  informantDetails: MessageDescriptor
  recordStatusAny: MessageDescriptor
  recordStatusInprogress: MessageDescriptor
  recordStatusInReview: MessageDescriptor
  recordStatusRequireUpdate: MessageDescriptor
  recordStatusRegistered: MessageDescriptor
  recordStatusCertified: MessageDescriptor
  recordStatusAchived: MessageDescriptor
  placeOfDeath: MessageDescriptor
}

const messagesToDefine: IAdvancedSearchMessages = {
  registrationDetails: {
    defaultMessage: 'Registration details',
    description: 'The title of advanced search birth tab form',
    id: 'advancedSearch.birth.title'
  },
  placeOfRegistrationlabel: {
    defaultMessage: 'Place of registration',
    description: 'Label for input Place of registration',
    id: 'advancedSearch.birth.placeOfRegistration'
  },
  placeOfRegistrationHelperText: {
    defaultMessage: 'Search for a province, district or registration office',
    description: 'Helper text for input Place of registration',
    id: 'advancedSearch.birth.placeOfRegistrationHelperText'
  },
  dateOfRegistration: {
    defaultMessage: 'Date of registration',
    description: 'Label for input date of registration',
    id: 'advancedSearch.birth.dateOfRegistration'
  },
  statusOfRecordLabel: {
    defaultMessage: 'Status of record',
    description: 'Label for input Status of record',
    id: 'advancedSearch.birth.statusOfRecordLabel'
  },
  informantDetails: {
    defaultMessage: 'Informant details',
    description: 'The title informant details form',
    id: 'advancedSearch.birth.informantDetails'
  },
  recordStatusAny: {
    defaultMessage: 'Any status',
    description: 'Option for form field: status of record',
    id: 'advancedSearch.birth.recordStatusAny'
  },
  recordStatusInprogress: {
    defaultMessage: 'In progress',
    description: 'Option for form field: status of record',
    id: 'advancedSearch.birth.recordStatusInprogress'
  },
  recordStatusInReview: {
    defaultMessage: 'In review',
    description: 'Option for form field: status of record',
    id: 'advancedSearch.birth.recordStatusInReview'
  },
  recordStatusRequireUpdate: {
    defaultMessage: 'Requires updates',
    description: 'Option for form field: status of record',
    id: 'advancedSearch.birth.recordStatusRequireUpdate'
  },
  recordStatusRegistered: {
    defaultMessage: 'Registered',
    description: 'Option for form field: status of record',
    id: 'advancedSearch.birth.recordStatusRegistered'
  },
  recordStatusCertified: {
    defaultMessage: 'Certified',
    description: 'Option for form field: status of record',
    id: 'advancedSearch.birth.recordStatusCertified'
  },
  recordStatusAchived: {
    defaultMessage: 'Archived',
    description: 'Option for form field: status of record',
    id: 'advancedSearch.birth.recordStatusAchived'
  },
  placeOfDeath: {
    defaultMessage: 'Place of death',
    description: 'Label for input place of death',
    id: 'advancedSearch.death.placeOfDeath'
  }
}
export const messages: IAdvancedSearchMessages =
  defineMessages(messagesToDefine)
