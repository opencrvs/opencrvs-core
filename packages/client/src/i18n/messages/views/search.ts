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

interface ISearchMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  dataTableResults: MessageDescriptor
  dataTableNoResults: MessageDescriptor
  listItemEventRegistrationNumber: MessageDescriptor
  informantContact: MessageDescriptor
  searchingFor: MessageDescriptor
  searchResultFor: MessageDescriptor
  noResultFor: MessageDescriptor
  totalResultText: MessageDescriptor
  locationNotFound: MessageDescriptor
  bookmarkAdvancedSearchModalTitle: MessageDescriptor
  bookmarkAdvancedSearchModalBody: MessageDescriptor
  removeBookmarkAdvancedSearchModalTitle: MessageDescriptor
  removeBookmarkAdvancedSearchModalBody: MessageDescriptor
  advancedSearchBookmarkSuccessNotification: MessageDescriptor
  removedAdvancedSearchBookmarkSuccessNotification: MessageDescriptor
  advancedSearchBookmarkErrorNotification: MessageDescriptor
  advancedSearchBookmarkLoadingNotification: MessageDescriptor
  removeAdvancedSearchBookmarkLoadingNotification: MessageDescriptor
}

const messagesToDefine: ISearchMessages = {
  dataTableResults: {
    id: 'search.results',
    defaultMessage: 'Results',
    description: 'Results label at the top of the data table component'
  },
  dataTableNoResults: {
    id: 'search.noResults',
    defaultMessage: 'No result to display',
    description:
      'Text to display if the search return no results for the current filters'
  },
  listItemEventRegistrationNumber: {
    id: 'search.labels.results.eventRegistrationNumber',
    defaultMessage:
      '{event, select, birth {B} death {D} marriage {M} divorce {Divorce } adoption {A}}RN',
    description:
      'Label for event registration number in search result list item'
  },
  informantContact: {
    id: 'search.informantContact',
    defaultMessage: 'Informant contact number',
    description: 'The rejected reason'
  },
  searchingFor: {
    id: 'search.searchingFor',
    defaultMessage: 'Searching for “{param}”',
    description: 'The searching for text'
  },
  searchResultFor: {
    id: 'search.searchResultFor',
    defaultMessage: 'Search results for ”{param}”',
    description: 'The search result text'
  },
  noResultFor: {
    id: 'search.noResultFor',
    defaultMessage: 'No results for ”{param}”',
    description: 'The no result text'
  },
  totalResultText: {
    id: 'search.totalResultText',
    defaultMessage:
      '{total, plural, =0 {} one {# record found} other {# records found}} ',
    description: 'The total result text'
  },
  locationNotFound: {
    id: 'search.locationNotFound',
    defaultMessage: 'Location not found',
    description: 'Label for location not found'
  },
  bookmarkAdvancedSearchModalTitle: {
    id: 'search.bookmarkAdvancedSearchModalTitle',
    defaultMessage: 'Save search query?',
    description: 'Modal title for bookmark advacnced search'
  },
  bookmarkAdvancedSearchModalBody: {
    id: 'search.bookmarkAdvancedSearchModalBody',
    defaultMessage:
      'A shortcut will be added to the side bar so you can rerun this search query',
    description: 'Modal body for bookmark advacnced search'
  },
  removeBookmarkAdvancedSearchModalTitle: {
    id: 'search.removeBookmarkAdvancedSearchModalTitle',
    defaultMessage: 'Remove search query?',
    description: 'Modal title for remove bookmark advacnced search'
  },
  removeBookmarkAdvancedSearchModalBody: {
    id: 'search.removeBbookmarkAdvancedSearchModalBody',
    defaultMessage:
      'This advanced search bookmark will be removed from the side bar shortcut',
    description: 'Modal body for remove bookmark advacnced search'
  },
  advancedSearchBookmarkSuccessNotification: {
    id: 'search.bookmark.success.notification',
    defaultMessage:
      'Your advanced search result has been bookmarked successfully',
    description:
      'Success Notification messages for bookmark advanced search result'
  },
  removedAdvancedSearchBookmarkSuccessNotification: {
    id: 'search.bookmark.remove.success.notification',
    defaultMessage:
      'Your advanced search bookmark has been removed successfully',
    description:
      'Success Notification messages for remove advanced search bookmark'
  },
  advancedSearchBookmarkErrorNotification: {
    id: 'search.bookmark.error.notification',
    defaultMessage: 'Sorry, something went wrong. Please try again',
    description:
      'Error Notification messages for bookmark advanced search result'
  },
  advancedSearchBookmarkLoadingNotification: {
    id: 'search.bookmark.loading.notification',
    defaultMessage: 'Bookmarking your advanced search results...',
    description:
      'Loading Notification messages for bookmark advanced search result'
  },
  removeAdvancedSearchBookmarkLoadingNotification: {
    id: 'search.bookmark.remove.loading.notification',
    defaultMessage: 'Removing your advanced search bookmark...',
    description:
      'Loading Notification messages for remove advanced search bookmark'
  }
}

export const messages: ISearchMessages = defineMessages(messagesToDefine)
