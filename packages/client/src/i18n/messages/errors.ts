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

export const errorMessages = defineMessages({
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
  pleaseTryAgainError: {
    defaultMessage: 'An error occurred. Please try again.',
    description:
      'The error message that displays if we want the user to try the action again',
    id: 'error.occurred'
  },
  queryError: {
    defaultMessage: 'An error occurred while searching',
    description: 'The error message shown when a search query fails',
    id: 'error.search'
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
  pageLoadFailed: {
    defaultMessage: "Sorry, we couldn't load the content for this page",
    description: 'Error message when page failed to load',
    id: 'error.page.load.failed'
  },
  passwordSubmissionError: {
    defaultMessage: 'The password you entered was incorrect',
    description: 'Error message when password verification fails',
    id: 'error.passwordSubmissionError'
  }
})
