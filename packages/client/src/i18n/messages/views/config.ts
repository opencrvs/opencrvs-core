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
  advancedSearch: {
    id: 'config.advanced.search',
    defaultMessage: 'Advanced Search',
    description: 'This is used for the advanced search'
  },
  advancedSearchInstruction: {
    id: 'config.advanced.search.instruction',
    defaultMessage:
      'Select the options to build an advanced search. A minimum of two search parameters is required.',
    description: 'This is used for the advanced search'
  },
  options: {
    id: 'config.certificate.options',
    defaultMessage: 'Options',
    description: 'Show options'
  },
  language: {
    id: 'config.userRoles.language',
    defaultMessage: '{language}',
    description: 'Language name'
  },
  emailAllUsersTitle: {
    id: 'config.emailAllUsers.title',
    defaultMessage: 'Email all users',
    description: 'Title for email all users'
  },
  emailAllUsersSubtitle: {
    id: 'config.emailAllUsers.subtitle',
    defaultMessage:
      'This email will be sent to all users who are active. Emails will be sent over the next 24 hours. Only one email can be sent per day',
    description: 'Subtitle for email all users'
  },
  emailAllUsersModalTitle: {
    id: 'config.emailAllUsers.modal.title',
    defaultMessage: 'Send email to all users?',
    description: 'Label for send email all users confirmation title'
  },
  emailAllUsersModalSupportingCopy: {
    id: 'config.emailAllUsers.modal.supportingCopy',
    defaultMessage: 'User will receive emails over the next 24 hours',
    description: 'Label for send email all users confirmation supporting copy'
  }
}

export const messages = defineMessages(messagesToDefine)
