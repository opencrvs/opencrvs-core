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
import { defineMessages } from 'react-intl'

const messagesToDefine = {
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
  placeholder: {
    id: 'search.placeholder',
    defaultMessage: 'Name of query',
    description: 'Placeholder text of search input'
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
}

export const messages = defineMessages(messagesToDefine)
