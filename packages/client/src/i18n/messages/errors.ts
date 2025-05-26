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

interface IErrorMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  draftFailed: MessageDescriptor
  duplicateWarning: MessageDescriptor
  errorCodeUnauthorized: MessageDescriptor
  unknownErrorTitle: MessageDescriptor
  unknownErrorDescription: MessageDescriptor
  errorTitle: MessageDescriptor
  errorTitleUnauthorized: MessageDescriptor
  fieldAgentQueryError: MessageDescriptor
  pleaseTryAgainError: MessageDescriptor
  printQueryError: MessageDescriptor
  queryError: MessageDescriptor
  registrationQueryError: MessageDescriptor
  unauthorized: MessageDescriptor
  userQueryError: MessageDescriptor
  loadingDeclarations: MessageDescriptor
  noDeclaration: MessageDescriptor
  waitingForConnection: MessageDescriptor
  pageLoadFailed: MessageDescriptor
  passwordSubmissionError: MessageDescriptor
  userListError: MessageDescriptor
}

const messagesToDefine: IErrorMessages = {
  draftFailed: {
    defaultMessage:
      'This is some messaging on advicing the user on what to do... in the event of a failed applicaton.',
    description: 'Tips for failed declarations',
    id: 'error.draftFailed'
  },
  duplicateWarning: {
    defaultMessage: 'Potential duplicate of record {trackingId}',
    description:
      'The warning message shown when a declaration has potential duplicates',
    id: 'duplicates.warning'
  },
  errorCodeUnauthorized: {
    defaultMessage: '401',
    description: 'Error code',
    id: 'error.code'
  },
  unknownErrorTitle: {
    defaultMessage: 'Something went wrong.',
    description: 'Error description',
    id: 'error.somethingWentWrong'
  },
  unknownErrorDescription: {
    defaultMessage: 'This page could not be found',
    description: 'Error description',
    id: 'error.weAreTryingToFixThisError'
  },
  errorTitle: {
    defaultMessage: 'Oops!',
    description: 'Error title',
    id: 'error.title'
  },
  errorTitleUnauthorized: {
    defaultMessage: 'Unauthorized!',
    description: 'Error title unauthorized',
    id: 'error.title.unauthorized'
  },
  fieldAgentQueryError: {
    defaultMessage: 'An error occurred while loading declarations',
    description: 'The text when error ocurred loading rejected declarations',
    id: 'fieldAgentHome.queryError'
  },
  pleaseTryAgainError: {
    defaultMessage: 'An error occurred. Please try again.',
    description:
      'The error message that displays if we want the user to try the action again',
    id: 'error.occurred'
  },
  printQueryError: {
    defaultMessage:
      'An error occurred while querying for birth registration data',
    description: 'The error message shown when a query fails',
    id: 'print.certificate.queryError'
  },
  queryError: {
    defaultMessage: 'An error occurred while searching',
    description: 'The error message shown when a search query fails',
    id: 'error.search'
  },
  registrationQueryError: {
    defaultMessage: 'An error occurred while fetching birth registration',
    description: 'The error message shown when a query fails',
    id: 'review.birthRegistration.queryError'
  },
  unauthorized: {
    defaultMessage: 'We are unable to display this page to you',
    description: 'The error message shown when a query fails',
    id: 'review.error.unauthorized'
  },
  userQueryError: {
    defaultMessage: 'An error occurred while loading system users',
    description: 'The text when error ocurred loading system users',
    id: 'system.user.queryError'
  },
  loadingDeclarations: {
    defaultMessage: 'Loading declarations...',
    description: 'The text when loading declaration',
    id: 'search.loadingDeclarations'
  },
  noDeclaration: {
    defaultMessage: 'No declarations to review',
    description: 'The text when there is no declaration to review',
    id: 'search.noDeclarations'
  },
  waitingForConnection: {
    defaultMessage: 'Reconnect to load declarations',
    description: 'The text when there is no connectivity',
    id: 'search.waitingForConnection'
  },
  pageLoadFailed: {
    defaultMessage: "Sorry, we couldn't load the content for this page",
    description: 'Error message when page failed to load',
    id: 'error.page.load.failed'
  },
  passwordSubmissionError: {
    defaultMessage: 'The password you entered was incorrect',
    description: 'Error message when password verification fails',
    id: 'error.passwordSubmissionError'
  },
  userListError: {
    defaultMessage: 'Failed to load users',
    description: 'Error message when user list loads fails',
    id: 'error.userListError'
  },
  searchParamCountError: {
    defaultMessage: 'You must select a minimum of 2 search criteria',
    description: 'Error message when the search parameters are less than two',
    id: 'error.searchParamCountError'
  }
}

export const errorMessages: IErrorMessages = defineMessages(messagesToDefine)
