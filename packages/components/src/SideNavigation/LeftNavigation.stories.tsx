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
import { DeclarationIconSmall } from '../icons/DeclarationIconSmall'
import { LeftNavigation } from './LeftNavigation'
import { NavigationGroup } from './NavigationGroup'
import { NavigationItem } from './NavigationItem'

export const SideNav = () => (
  <LeftNavigation
    applicationName="OpenCRVS"
    applicationVersion="1.1.0"
    buildVersion="Development"
  >
    <NavigationGroup>
      <NavigationItem
        icon={() => <DeclarationIconSmall color={'purple'} />}
        label="In progress"
      />
      <NavigationItem
        icon={() => <DeclarationIconSmall color={'orange'} />}
        label="Ready for review"
      />
      <NavigationItem
        icon={() => <DeclarationIconSmall color={'red'} />}
        label="Requires updates"
      />
      <NavigationItem
        icon={() => <DeclarationIconSmall color={'grey'} />}
        label="Sent for approval"
      />
      <NavigationItem
        icon={() => <DeclarationIconSmall color={'green'} />}
        label="Ready to print"
      />
      <NavigationItem
        icon={() => <DeclarationIconSmall color={'blue'} />}
        label="Ready to issue"
      />
    </NavigationGroup>
    <NavigationGroup>
      <NavigationItem
        icon={() => <Icon name="Buildings" size="medium" />}
        label="Organisation"
      />
      <NavigationItem
        icon={() => <Icon name="Users" size="medium" />}
        label="Team"
      />
      <NavigationItem
        icon={() => <Icon name="Activity" size="medium" />}
        label="Performance"
      />
    </NavigationGroup>
  </LeftNavigation>
)

SideNav.args = {
  applicationName: 'OpenCRVS',
  applicationVersion: '1.3.0',
  buildVersion: 'Development'
}

export default {
  title: 'Layout/Side Nav',
  component: LeftNavigation
} as Meta
