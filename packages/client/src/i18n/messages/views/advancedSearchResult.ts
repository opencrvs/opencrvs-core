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

export type IAdvancedSearchResultMessages = {
  event: MessageDescriptor
  registationStatus: MessageDescriptor
  eventDate: MessageDescriptor
  regNumber: MessageDescriptor
  trackingId: MessageDescriptor
  regDate: MessageDescriptor
  eventLocation: MessageDescriptor
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
    defaultMessage: 'Registration status',
    description:
      'The label for registration Status param in active advancedSearchParams',
    id: 'advancedSearchResult.pill.registationStatus'
  },
  eventDate: {
    defaultMessage: 'Event date',
    description:
      'The label for event date param in active advancedSearchParams',
    id: 'advancedSearchResult.pill.eventDate'
  },
  regNumber: {
    defaultMessage: 'Registration number',
    description:
      'The label for registration number in active advancedSearchParams',
    id: 'advancedSearchResult.pill.regNumber'
  },
  trackingId: {
    defaultMessage: 'Tracking ID',
    description: 'The label for tracking id in active advancedSearchParams',
    id: 'advancedSearchResult.pill.trackingId'
  },
  regDate: {
    defaultMessage: 'Registration date',
    description:
      'The label for  registration date in active advancedSearchParams',
    id: 'advancedSearchResult.pill.regDate'
  },
  eventLocation: {
    defaultMessage: 'Event location',
    description: 'The label for event location in active advancedSearchParams',
    id: 'advancedSearchResult.pill.eventLocation'
  },
  regLocation: {
    defaultMessage: 'Location',
    description: 'The label for event location in active advancedSearchParams',
    id: 'advancedSearchResult.pill.regLocation'
  },
  childFirstName: {
    defaultMessage: 'Child firstname',
    description: 'The label for child firstname in active advancedSearchParams',
    id: 'advancedSearchResult.pill.childFirstName'
  },
  childLastName: {
    defaultMessage: 'Child lastname',
    description: 'The label for child lastname in active advancedSearchParams',
    id: 'advancedSearchResult.pill.childLastName'
  },
  fatherFirstName: {
    defaultMessage: 'Father firstname',
    description:
      'The label for father firstname in active advancedSearchParams',
    id: 'advancedSearchResult.pill.fatherFirstName'
  },
  fatherLastName: {
    defaultMessage: 'Father lastname',
    description: 'The label for father lastname in active advancedSearchParams',
    id: 'advancedSearchResult.pill.fatherLastName'
  },
  motherFirstName: {
    defaultMessage: 'Mother firstname',
    description:
      'The label for mother firstname in active advancedSearchParams',
    id: 'advancedSearchResult.pill.motherFirstName'
  },
  motherLastName: {
    defaultMessage: 'Mother lastname',
    description: 'The label for mother lastname in active advancedSearchParams',
    id: 'advancedSearchResult.pill.motherLastName'
  },
  deceasedFirstName: {
    defaultMessage: 'Deceased Ffirstname',
    description:
      'The label for deceased firstname in active advancedSearchParams',
    id: 'advancedSearchResult.pill.deceasedFirstName'
  },
  deceasedLastName: {
    defaultMessage: 'Deceased lastname',
    description:
      'The label for deceased lastname in active advancedSearchParams',
    id: 'advancedSearchResult.pill.deceasedLastName'
  },
  informantFirstName: {
    defaultMessage: 'Informant Firstname',
    description:
      'The label for informant firstname in active advancedSearchParams',
    id: 'advancedSearchResult.pill.informantFirstName'
  },
  informantLastName: {
    defaultMessage: 'Informant lastname',
    description:
      'The label for informant lastname in active advancedSearchParams',
    id: 'advancedSearchResult.pill.informantLastName'
  },
  gender: {
    defaultMessage: 'Sex',
    description: 'The label for gender in active advancedSearchParams',
    id: 'advancedSearchResult.pill.gender'
  },
  childDoB: {
    defaultMessage: 'Child d.o.b',
    description: 'The label for child d.o.b in active advancedSearchParams',
    id: 'advancedSearchResult.pill.childDoB'
  },
  fatherDoB: {
    defaultMessage: 'Father d.o.b',
    description: 'The label for father d.o.b in active advancedSearchParams',
    id: 'advancedSearchResult.pill.fatherDoB'
  },
  motherDoB: {
    defaultMessage: 'Mother d.o.b',
    description: 'The label for mother d.o.b in active advancedSearchParams',
    id: 'advancedSearchResult.pill.motherDoB'
  },
  deceasedDoB: {
    defaultMessage: 'Deceased d.o.b',
    description: 'The label for deceased d.o.b in active advancedSearchParams',
    id: 'advancedSearchResult.pill.deceasedDoB'
  },
  informantDoB: {
    defaultMessage: 'Informant d.o.b',
    description: 'The label for informant d.o.b in active advancedSearchParams',
    id: 'advancedSearchResult.pill.informantDoB'
  },
  searchResult: {
    defaultMessage: 'Search results',
    description:
      'The label for search result header in advancedSearchResult page',
    id: 'advancedSearchResult.table.searchResult'
  },
  noResult: {
    defaultMessage: 'No result',
    description: 'The label for no result in advancedSearchResult page',
    id: 'advancedSearchResult.table.noResult'
  }
}
export const messages: IAdvancedSearchResultMessages =
  defineMessages(messagesToDefine)
