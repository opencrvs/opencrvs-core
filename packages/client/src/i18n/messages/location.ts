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

interface ILocationMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  DISTRICT: MessageDescriptor
  CITY: MessageDescriptor
  STATE: MessageDescriptor
  LOCATION_LEVEL_3: MessageDescriptor
  LOCATION_LEVEL_4: MessageDescriptor
  LOCATION_LEVEL_5: MessageDescriptor
}

const messagesToDefine: ILocationMessages = {
  UNION: {
    id: 'location.jurisdictionType.UNION',
    defaultMessage: 'Union',
    description: 'Label for Union'
  },
  DIVISION: {
    id: 'location.jurisdictionType.DIVISION',
    defaultMessage: 'Division',
    description: 'Label for Division'
  },
  DISTRICT: {
    id: 'location.jurisdictionType.DISTRICT',
    defaultMessage: 'District',
    description: 'Label for District'
  },
  CITY: {
    id: 'location.jurisdictionType.CITY',
    defaultMessage: 'City',
    description: 'Label for City'
  },
  STATE: {
    id: 'location.jurisdictionType.STATE',
    defaultMessage: 'State',
    description: 'Label for State'
  },
  LOCATION_LEVEL_3: {
    id: 'location.jurisdictionType.LOCATION_LEVEL_3',
    defaultMessage: 'Location Level 3',
    description: 'Label for locationLevel3'
  },
  LOCATION_LEVEL_4: {
    id: 'location.jurisdictionType.LOCATION_LEVEL_4',
    defaultMessage: 'Location Level 4',
    description: 'Label for locationLevel4'
  },
  LOCATION_LEVEL_5: {
    id: 'location.jurisdictionType.LOCATION_LEVEL_5',
    defaultMessage: 'Location Level 5',
    description: 'Label for locationLevel5'
  }
}

export const locationMessages: ILocationMessages =
  defineMessages(messagesToDefine)
