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

import { Meta } from '@storybook/react'
import React from 'react'
import { Icon } from '../Icon'
import { LeftNavigation } from './LeftNavigation'
import { NavigationGroup } from './NavigationGroup'
import { NavigationItem } from './NavigationItem'

export const SideNav = () => (
  <LeftNavigation applicationName="OpenCRVS" applicationVersion="1.1.0">
    <NavigationGroup>
      <NavigationItem
        icon={() => <Icon name="File" size="small" />}
        label="In progress"
      />
      <NavigationItem
        icon={() => <Icon name="FileSearch" size="small" />}
        label="Ready for review"
      />
      <NavigationItem
        icon={() => <Icon name="FileX" size="small" />}
        label="Requires updates"
      />
      <NavigationItem
        icon={() => <Icon name="FileText" size="small" />}
        label="Sent for approval"
      />
      <NavigationItem
        icon={() => <Icon name="Printer" size="small" />}
        label="Ready to print"
      />
      <NavigationItem
        icon={() => <Icon name="Handshake" size="small" />}
        label="Ready to issue"
      />
    </NavigationGroup>
    <NavigationGroup>
      <NavigationItem
        icon={() => <Icon name="Buildings" size="small" />}
        label="Organisation"
      />
      <NavigationItem
        icon={() => <Icon name="Users" size="small" />}
        label="Team"
      />
      <NavigationItem
        icon={() => <Icon name="Activity" size="small" />}
        label="Performance"
      />
    </NavigationGroup>
  </LeftNavigation>
)

SideNav.args = {
  applicationName: 'OpenCRVS',
  applicationVersion: '1.6.0',
  buildVersion: 'Development'
}

export default {
  title: 'Layout/Side Nav',
  component: LeftNavigation
} as Meta
