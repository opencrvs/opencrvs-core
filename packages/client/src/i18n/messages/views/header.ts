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

interface IHeaderMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  typeRN: MessageDescriptor
  typePhone: MessageDescriptor
  nationalId: MessageDescriptor
  placeHolderTrackingId: MessageDescriptor
  placeHolderBrnDrn: MessageDescriptor
  placeHolderPhone: MessageDescriptor
  placeHolderNationalId: MessageDescriptor
  systemTitle: MessageDescriptor
  settingsTitle: MessageDescriptor
  helpTitle: MessageDescriptor
  teamTitle: MessageDescriptor
  typeName: MessageDescriptor
  advancedSearch: MessageDescriptor
  placeholderName: MessageDescriptor
}

const messagesToDefine: IHeaderMessages = {
  typeRN: {
    id: 'home.header.typeRN',
    defaultMessage: 'Registration no.',
    description: 'Search menu brn drn type'
  },
  typePhone: {
    id: 'home.header.typePhone',
    defaultMessage: 'Phone No.',
    description: 'Search menu phone no type'
  },
  nationalId: {
    id: 'home.header.nationalId',
    defaultMessage: 'National ID',
    description: 'Search menu national ID type'
  },
  placeHolderTrackingId: {
    id: 'home.header.placeHolderTrackingId',
    defaultMessage: 'Search for a tracking ID',
    description: 'Search menu tracking id place holder'
  },
  placeHolderBrnDrn: {
    id: 'home.header.placeHolderBrnDrn',
    defaultMessage: 'Search for a BRN/DRN',
    description: 'Search menu brn drn place holder'
  },
  placeHolderPhone: {
    id: 'home.header.placeHolderPhone',
    defaultMessage: 'Search for a phone No.',
    description: 'Search menu phone no place holder'
  },
  placeHolderNationalId: {
    id: 'home.header.placeHolderNationalId',
    defaultMessage: 'Search for a national ID.',
    description: 'Search menu national ID place holder'
  },
  systemTitle: {
    id: 'home.header.systemTitle',
    defaultMessage: 'System',
    description: 'System title'
  },
  settingsTitle: {
    id: 'home.header.settingsTitle',
    defaultMessage: 'Settings',
    description: 'settings title'
  },
  helpTitle: {
    id: 'home.header.helpTitle',
    defaultMessage: 'Help',
    description: 'Help title'
  },
  teamTitle: {
    id: 'home.header.teamTitle',
    defaultMessage: 'Team',
    description: 'Team title'
  },
  typeName: {
    id: 'home.header.typeName',
    defaultMessage: 'Name',
    description: 'Search menu name type'
  },
  advancedSearch: {
    id: 'home.header.advancedSearch',
    defaultMessage: 'Advanced Search',
    description: 'Search menu advanced search type'
  },
  placeholderName: {
    id: 'home.header.placeholderName',
    defaultMessage: 'Search for a name',
    description: 'Search menu name placeholder'
  }
}

export const messages: IHeaderMessages = defineMessages(messagesToDefine)
