import { defineMessages } from 'react-intl'

export const messages: {
  [key: string]: ReactIntl.FormattedMessage.MessageDescriptor
} = defineMessages({
  name: {
    id: 'register.registrationHome.listItemName',
    defaultMessage: 'Name',
    description: 'Label for name in work queue list item'
  },
  dob: {
    id: 'register.registrationHome.listItemDoB',
    defaultMessage: 'D.o.B',
    description: 'Label for DoB in work queue list item'
  },
  dod: {
    id: 'register.registrationHome.listItemDod',
    defaultMessage: 'D.o.D',
    description: 'Label for DoD in work queue list item'
  },
  queryError: {
    id: 'register.searchResult.queryError',
    defaultMessage: 'An error occurred while searching',
    description: 'The error message shown when a search query fails'
  },
  dataTableResults: {
    id: 'register.searchResult.results',
    defaultMessage: 'Results',
    description: 'Results label at the top of the data table component'
  },
  dataTableNoResults: {
    id: 'register.searchResult.noResults',
    defaultMessage: 'No result to display',
    description:
      'Text to display if the search return no results for the current filters'
  },
  filtersBirth: {
    id: 'register.searchResult.labels.events.birth',
    defaultMessage: 'Birth',
    description: 'Label for the filter by birth option'
  },
  filtersDeath: {
    id: 'register.searchResult.labels.events.death',
    defaultMessage: 'Death',
    description: 'Label for the filter by death option'
  },
  listItemName: {
    id: 'register.searchResult.listItemName',
    defaultMessage: 'Name',
    description: 'Label for name in search result list item'
  },
  listItemDob: {
    id: 'register.searchResult.listItemDoB',
    defaultMessage: 'D.o.B',
    description: 'Label for DoB in search result list item'
  },
  listItemDod: {
    id: 'register.searchResult.listItemDod',
    defaultMessage: 'D.o.D',
    description: 'Label for DoD in search result list item'
  },
  listItemTrackingNumber: {
    id: 'constants.trackingId',
    defaultMessage: 'Tracking ID',
    description: 'Label for tracking ID in search result list item'
  },
  listItemEventRegistrationNumber: {
    id: 'register.searchResult.labels.results.eventRegistrationNumber',
    defaultMessage:
      '{event, select, birth {B} death {D} marriage {M} divorce {Divorce } adoption {A}}RN',
    description:
      'Label for event registration number in search result list item'
  },
  listItemRejectionReasonLabel: {
    id: 'register.application.details.item.label.rejectionReason',
    defaultMessage: 'Reason',
    description: 'Label for rejection reason'
  },
  listItemCommentLabel: {
    id: 'register.application.details.item.label.rejectionComment',
    defaultMessage: 'Comment',
    description: 'Label for rejection comment'
  },
  review: {
    id: 'buttons.review',
    defaultMessage: 'Review',
    description: 'The title of review button in list item actions'
  },
  print: {
    id: 'buttons.print',
    defaultMessage: 'Print',
    description: 'The title of print button in list item actions'
  },
  workflowStatusDateApplication: {
    id: 'register.application.details.item.label.application',
    defaultMessage: 'Application submitted on',
    description:
      'Label for the workflow timestamp when the status is application'
  },
  workflowStatusDateRegistered: {
    id: 'register.application.details.item.label.registered',
    defaultMessage: 'Registrated on',
    description:
      'Label for the workflow timestamp when the status is registered'
  },
  workflowStatusDateRejected: {
    id: 'register.application.details.item.label.rejected',
    defaultMessage: 'Application rejected on',
    description: 'Label for the workflow timestamp when the status is rejected'
  },
  workflowStatusDateCollected: {
    id: 'register.application.details.item.label.collected',
    defaultMessage: 'Certificate collected on',
    description: 'Label for the workflow timestamp when the status is collected'
  },
  workflowPractitionerLabel: {
    id: 'register.application.details.item.label.by',
    defaultMessage: 'By',
    description: 'Label for the practitioner name in workflow'
  },
  EditBtnText: {
    id: 'buttons.edit',
    defaultMessage: 'Edit',
    description: 'Edit button text'
  },
  application: {
    id: 'register.searchResult.labels.statuses.application',
    defaultMessage: 'application',
    description: 'The status label for application'
  },
  registered: {
    id: 'register.searchResult.labels.statuses.registered',
    defaultMessage: 'registered',
    description: 'The status label for registered'
  },
  rejected: {
    id: 'register.searchResult.labels.statuses.rejected',
    defaultMessage: 'rejected',
    description: 'The status label for rejected'
  },
  collected: {
    id: 'register.searchResult.labels.statuses.collected',
    defaultMessage: 'collected',
    description: 'The status label for collected'
  },
  title: {
    id: 'register.SearchResult.title',
    defaultMessage: 'Search',
    description: 'The title of the page'
  },
  collectedBy: {
    id: 'register.SearchResult.collectedBy',
    defaultMessage: 'Collected by',
    description: 'The collected by sec text'
  },
  issuedBy: {
    id: 'register.SearchResult.issuedBy',
    defaultMessage: 'Issued by',
    description: 'The issued by sec text'
  },
  rejectReason: {
    id: 'register.SearchResult.rejectReason',
    defaultMessage: 'Reason',
    description: 'The rejected reason'
  },
  informantContact: {
    id: 'register.SearchResult.informantContact',
    defaultMessage: 'Informant contact number',
    description: 'The rejected reason'
  },
  searchingFor: {
    id: 'register.SearchResult.searchingFor',
    defaultMessage: 'Searching for “{param}”',
    description: 'The searching for text'
  },
  searchResultFor: {
    id: 'register.SearchResult.searchResultFor',
    defaultMessage:
      '{total, plural, =0 {No results for “{param}”} other {Search results for “{param}”}}',
    description: 'The search result text'
  },
  totalResultText: {
    id: 'register.SearchResult.totalResultText',
    defaultMessage:
      '{total, plural, =0 {} one {# record found} other {# records found}} ',
    description: 'The total result text'
  },
  reject: {
    id: 'register.SearchResult.reject',
    defaultMessage: 'Update',
    description: 'The title of reject button in list item actions'
  },
  rejectComments: {
    id: 'register.SearchResult.rejectComments',
    defaultMessage: 'Comments',
    description: 'The rejected comments'
  }
})
