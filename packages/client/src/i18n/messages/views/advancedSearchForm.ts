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
  deceasedDetails: MessageDescriptor
  informantDetails: MessageDescriptor
  recordStatusAny: MessageDescriptor
  recordStatusRegistered: MessageDescriptor
  timePeriodLast7Days: MessageDescriptor
  timePeriodLast30Days: MessageDescriptor
  timePeriodLast90Days: MessageDescriptor
  timePeriodLastYear: MessageDescriptor
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
  recordStatusRegistered: {
    defaultMessage: 'Registered',
    description: 'Option for form field: status of record',
    id: 'advancedSearch.form.recordStatusRegistered'
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
  },
  timePeriodLast7Days: {
    defaultMessage: 'Last 7 days',
    description: 'Label for option of time period select: last 7 days',
    id: 'form.section.label.timePeriodLast7Days'
  },
  timePeriodLast30Days: {
    defaultMessage: 'Last 30 days',
    description: 'Label for option of time period select: last 30 days',
    id: 'form.section.label.timePeriodLast30Days'
  },
  timePeriodLast90Days: {
    defaultMessage: 'Last 90 days',
    description: 'Label for option of time period select: last 90 days',
    id: 'form.section.label.timePeriodLast90Days'
  },
  timePeriodLastYear: {
    defaultMessage: 'Last year',
    description: 'Label for option of time period select: last year',
    id: 'form.section.label.timePeriodLastYear'
  }
}
export const messages: IAdvancedSearchMessages =
  defineMessages(messagesToDefine)
