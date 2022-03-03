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

interface ISelectPrimaryInformantMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  registerNewEventTitle: MessageDescriptor
  registerNewEventHeading: MessageDescriptor
  primaryInformantDescription: MessageDescriptor
  errorMessage: MessageDescriptor
}

const messagesToDefine: ISelectPrimaryInformantMessages = {
  registerNewEventTitle: {
    id: 'register.selectVitalEvent.registerNewEventTitle',
    defaultMessage: 'New declaration',
    description: 'The title that appears on the select vital event page'
  },
  registerNewEventHeading: {
    id: 'register.primaryInformant.registerNewEventHeading',
    defaultMessage: 'Who is the primary informant for this declaration?',
    description: 'The section heading on the page'
  },
  primaryInformantDescription: {
    id: 'register.primaryInformant.description',
    defaultMessage:
      'This person is responsible for providing accurate information in this declaration. ',
    description: 'The section heading on the page'
  },
  errorMessage: {
    id: 'register.primaryInformant.errorMessage',
    defaultMessage: 'Please select who is the primary informant',
    description: 'Error Message to show when no event is being selected'
  }
}

export const messages: ISelectPrimaryInformantMessages =
  defineMessages(messagesToDefine)
