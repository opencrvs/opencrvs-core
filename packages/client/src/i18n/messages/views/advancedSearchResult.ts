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

interface IAdvancedSearchResultMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  event: MessageDescriptor
  registationStatus: MessageDescriptor
  eventDate: MessageDescriptor
  regNumber: MessageDescriptor
  trackingId: MessageDescriptor
  regDate: MessageDescriptor
  eventlocation: MessageDescriptor
  regLocation: MessageDescriptor
  childFirstName: MessageDescriptor
  childLastName: MessageDescriptor
  motherFirstName: MessageDescriptor
  motherLastName: MessageDescriptor
  fatherFirstName: MessageDescriptor
  fatherLastName: MessageDescriptor
  deceasedFirstName: MessageDescriptor
  deceasedLastName: MessageDescriptor
  informantFirstName: MessageDescriptor
  informantLastName: MessageDescriptor
  gender: MessageDescriptor
  childDoB: MessageDescriptor
  fatherDoB: MessageDescriptor
  motherDoB: MessageDescriptor
  deceasedDoB: MessageDescriptor
  informantDoB: MessageDescriptor
  searchResult: MessageDescriptor
  noResult: MessageDescriptor
}

const messagesToDefine: IAdvancedSearchResultMessages = {
  event: {
    defaultMessage: 'Event',
    description: 'The label for event param in active advancedSearchParams',
    id: 'advancedSearchResult.pill.event'
  },
  registationStatus: {
    defaultMessage: 'Registration Status',
    description:
      'The label for registration Status param in active advancedSearchParams',
    id: 'advancedSearchResult.pill.registationStatus'
  },
  eventDate: {
    defaultMessage: 'Event Date',
    description:
      'The label for event date param in active advancedSearchParams',
    id: 'advancedSearchResult.pill.eventDate'
  },
  regNumber: {
    defaultMessage: 'Registration Number',
    description:
      'The label for registration number in active advancedSearchParams',
    id: 'advancedSearchResult.pill.regNumber'
  },
  trackingId: {
    defaultMessage: 'Tracking Id',
    description: 'The label for tracking id in active advancedSearchParams',
    id: 'advancedSearchResult.pill.trackingId'
  },
  regDate: {
    defaultMessage: 'Registration Date',
    description:
      'The label for  registration date in active advancedSearchParams',
    id: 'advancedSearchResult.pill.regDate'
  },
  eventlocation: {
    defaultMessage: 'Event Location',
    description: 'The label for event location in active advancedSearchParams',
    id: 'advancedSearchResult.pill.eventlocation'
  },
  regLocation: {
    defaultMessage: 'Location',
    description: 'The label for event location in active advancedSearchParams',
    id: 'advancedSearchResult.pill.regLocation'
  },
  childFirstName: {
    defaultMessage: 'Child Firstname',
    description: 'The label for child firstname in active advancedSearchParams',
    id: 'advancedSearchResult.pill.childFirstName'
  },
  childLastName: {
    defaultMessage: 'Child Lastname',
    description: 'The label for child lastname in active advancedSearchParams',
    id: 'advancedSearchResult.pill.childLastName'
  },
  fatherFirstName: {
    defaultMessage: 'Father Firstname',
    description:
      'The label for father firstname in active advancedSearchParams',
    id: 'advancedSearchResult.pill.fatherFirstName'
  },
  fatherLastName: {
    defaultMessage: 'Father Lastname',
    description: 'The label for father lastname in active advancedSearchParams',
    id: 'advancedSearchResult.pill.fatherLastName'
  },
  motherFirstName: {
    defaultMessage: 'Mother Firstname',
    description:
      'The label for mother firstname in active advancedSearchParams',
    id: 'advancedSearchResult.pill.motherFirstName'
  },
  motherLastName: {
    defaultMessage: 'Mother Lastname',
    description: 'The label for mother lastname in active advancedSearchParams',
    id: 'advancedSearchResult.pill.motherLastName'
  },
  deceasedFirstName: {
    defaultMessage: 'Deceased Firstname',
    description:
      'The label for deceased firstname in active advancedSearchParams',
    id: 'advancedSearchResult.pill.deceasedFirstName'
  },
  deceasedLastName: {
    defaultMessage: 'Deceased Lastname',
    description:
      'The label for deceased lastname in active advancedSearchParams',
    id: 'advancedSearchResult.pill.deceasedLastName'
  },
  informantFirstName: {
    defaultMessage: 'Informant FirstName',
    description:
      'The label for informant firstname in active advancedSearchParams',
    id: 'advancedSearchResult.pill.informantFirstName'
  },
  informantLastName: {
    defaultMessage: 'Informant LastName',
    description:
      'The label for informant lastname in active advancedSearchParams',
    id: 'advancedSearchResult.pill.informantLastName'
  },
  gender: {
    defaultMessage: 'Gender',
    description: 'The label for gender in active advancedSearchParams',
    id: 'advancedSearchResult.pill.gender'
  },
  childDoB: {
    defaultMessage: 'ChildDOB',
    description: 'The label for child DOB in active advancedSearchParams',
    id: 'advancedSearchResult.pill.childDoB'
  },
  fatherDoB: {
    defaultMessage: 'FatherDOB',
    description: 'The label for father DOB in active advancedSearchParams',
    id: 'advancedSearchResult.pill.fatherDoB'
  },
  motherDoB: {
    defaultMessage: 'MotherDOB',
    description: 'The label for mother DOB in active advancedSearchParams',
    id: 'advancedSearchResult.pill.motherDoB'
  },
  deceasedDoB: {
    defaultMessage: 'DeceasedDOB',
    description: 'The label for deceased DOB in active advancedSearchParams',
    id: 'advancedSearchResult.pill.deceasedDoB'
  },
  informantDoB: {
    defaultMessage: 'InformantDOB',
    description: 'The label for informant DOB in active advancedSearchParams',
    id: 'advancedSearchResult.pill.informantDoB'
  },
  searchResult: {
    defaultMessage: 'Search Result',
    description:
      'The label for search result header in advancedSearchResult page',
    id: 'advancedSearchResult.table.searchResult'
  },
  noResult: {
    defaultMessage: 'No Result',
    description: 'The label for no result in advancedSearchResult page',
    id: 'advancedSearchResult.table.noResult'
  }
}
export const messages: IAdvancedSearchResultMessages =
  defineMessages(messagesToDefine)
