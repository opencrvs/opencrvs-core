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

interface ISysAdminMessages {
  overviewTab: MessageDescriptor
  officesTab: MessageDescriptor
  usersTab: MessageDescriptor
  devicesTab: MessageDescriptor
  networkTab: MessageDescriptor
  configTab: MessageDescriptor
  systemTitle: MessageDescriptor
  menuOptionEditDetails: MessageDescriptor
  editUserDetailsTitle: MessageDescriptor
  editUserCommonTitle: MessageDescriptor
}

const messagesToDefine: ISysAdminMessages = {
  overviewTab: {
    id: 'register.sysAdminHome.overview',
    defaultMessage: 'Overview',
    description: 'The title of overview tab'
  },
  officesTab: {
    id: 'register.sysAdminHome.offices',
    defaultMessage: 'Offices',
    description: 'The title of offices tab'
  },
  usersTab: {
    id: 'register.sysAdminHome.users',
    defaultMessage: 'Users',
    description: 'The title of users tab'
  },
  devicesTab: {
    id: 'register.sysAdminHome.devices',
    defaultMessage: 'Devices',
    description: 'The title of devices tab'
  },
  networkTab: {
    id: 'register.sysAdminHome.network',
    defaultMessage: 'Network',
    description: 'The title of network tab'
  },
  configTab: {
    id: 'register.sysAdminHome.config',
    defaultMessage: 'Config',
    description: 'The title of config tab'
  },
  systemTitle: {
    id: 'home.header.systemTitle',
    defaultMessage: 'System',
    description: 'System title'
  },
  menuOptionEditDetails: {
    id: 'register.sysAdminHome.users.table.item.menu.item.editDetails',
    defaultMessage: 'Edit details',
    description:
      'Label for menu option Edit Details in SysAdmin home table item '
  },
  editUserDetailsTitle: {
    defaultMessage: 'Edit details',
    description: 'Title for edit user details',
    id: 'register.sysAdmin.user.header.'
  },
  editUserCommonTitle: {
    defaultMessage: 'Edit user',
    description: 'Common title of form view groups when edit user',
    id: 'register.sysAdmin.user.edit.commonGroupTitle'
  }
}

export const messages: ISysAdminMessages = defineMessages(messagesToDefine)
