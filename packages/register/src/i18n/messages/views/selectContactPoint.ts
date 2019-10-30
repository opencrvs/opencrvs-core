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

interface ISelectContactPointMessages {
  heading: MessageDescriptor
  birthRelationshipLabel: MessageDescriptor
  error: MessageDescriptor
  phoneNumberNotValid: MessageDescriptor
}

const messagesToDefine: ISelectContactPointMessages = {
  heading: {
    id: 'register.SelectContactPoint.heading',
    defaultMessage: 'Who is the main point of contact for this application?',
    description: 'The section heading on the page'
  },
  birthRelationshipLabel: {
    id: 'register.SelectContactPoint.birthRelationshipLabel',
    defaultMessage: 'Relationship to child',
    description: 'Relationship Label for birth'
  },
  error: {
    id: 'register.SelectContactPoint.error',
    defaultMessage: 'Please select a main point of contact',
    description: 'Error text'
  },
  phoneNumberNotValid: {
    id: 'register.SelectContactPoint.phoneNoError',
    defaultMessage: 'Not a valid mobile number',
    description: 'Phone no error text'
  }
}

export const messages: ISelectContactPointMessages = defineMessages(
  messagesToDefine
)
