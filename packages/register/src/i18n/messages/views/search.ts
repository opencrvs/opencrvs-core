import { defineMessages, MessageDescriptor } from 'react-intl'

interface ISearchMessages {
  dataTableResults: MessageDescriptor
  dataTableNoResults: MessageDescriptor
  listItemEventRegistrationNumber: MessageDescriptor
  informantContact: MessageDescriptor
  searchingFor: MessageDescriptor
  searchResultFor: MessageDescriptor
  totalResultText: MessageDescriptor
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
    defaultMessage:
      '{total, plural, =0 {No results for “{param}”} other {Search results for “{param}”}}',
    description: 'The search result text'
  },
  totalResultText: {
    id: 'search.totalResultText',
    defaultMessage:
      '{total, plural, =0 {} one {# record found} other {# records found}} ',
    description: 'The total result text'
  }
}

export const messages: ISearchMessages = defineMessages(messagesToDefine)
