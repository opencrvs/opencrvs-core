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

import { Meta } from '@storybook/react'
import React from 'react'
import { Icon } from '../Icon'
import { DeclarationIconSmall } from '../icons/DeclarationIconSmall'
import { LeftNavigation } from './LeftNavigation'
import { NavigationGroup } from './NavigationGroup'
import { NavigationGroupHeader } from './NavigationGroupHeader'
import { NavigationItem } from './NavigationItem'
import { SettingsNavigation } from '../icons/SettingsNavigation'

export const SideNav = () => (
  <LeftNavigation
    applicationName="OpenCRVS"
    applicationVersion="1.3.0"
    buildVersion="Development"
  >
    <NavigationGroup>
      <NavigationGroupHeader label="RECORD" isSelected={true} />
      <NavigationItem
        label="Outbox"
        icon={() => <Icon name="PaperPlaneTilt" size="medium" />}
      />
      <NavigationItem
        label="In progress"
        icon={() => <DeclarationIconSmall color={'purple'} />}
      />
      <NavigationItem
        label="Ready for review"
        icon={() => <DeclarationIconSmall color={'orange'} />}
      />
      <NavigationItem
        label="Requires updates"
        icon={() => <DeclarationIconSmall color={'red'} />}
      />
      <NavigationItem
        label="Sent for approval"
        icon={() => <DeclarationIconSmall color={'grey'} />}
      />
      <NavigationItem
        label="Ready to print"
        icon={() => <DeclarationIconSmall color={'green'} />}
      />
      <NavigationItem
        label="Ready to issue"
        icon={() => <DeclarationIconSmall color={'teal'} />}
      />
      <NavigationItem
        label="Saved search"
        isSelected={true}
        icon={() => (
          <Icon name={'Star'} color={'grey600'} weight={'fill'}></Icon>
        )}
      />
      <NavigationItem
        label="Saved search"
        icon={() => (
          <Icon name={'Star'} color={'yellow'} weight={'fill'}></Icon>
        )}
      />
    </NavigationGroup>

    <NavigationGroup>
      <NavigationGroupHeader label="PERFORMANCE" />
      <NavigationItem
        label="Performance"
        icon={() => <Icon name="ChartLine" size="medium" />}
      />
      <NavigationItem
        label="Dashboard"
        icon={() => <Icon name="ChartLine" size="medium" />}
      />
      <NavigationItem
        label="Reports"
        icon={() => <Icon name="Activity" size="medium" />}
      />
      <NavigationItem
        label="Vital Statistics export"
        icon={() => <Icon name="UploadSimple" size="medium" />}
      />
      <NavigationItem
        label="Saved location"
        icon={() => (
          <Icon name={'Star'} color={'yellow'} weight={'fill'}></Icon>
        )}
      />
      <NavigationItem
        label="Saved location"
        icon={() => (
          <Icon name={'Star'} color={'yellow'} weight={'fill'}></Icon>
        )}
      />
    </NavigationGroup>

    <NavigationGroup>
      <NavigationGroupHeader label="ORGANIZATION" />
      <NavigationItem
        label="Administrative areas"
        icon={() => <Icon name="ListBullets" size="medium" />}
      />
      <NavigationItem
        label="My office"
        icon={() => <Icon name="Users" size="medium" />}
      />
    </NavigationGroup>

    <NavigationGroup>
      <NavigationGroupHeader label="CONFIG" />
      <NavigationItem
        label="Application"
        icon={() => <Icon name="Compass" size="medium" />}
      />
      <NavigationItem
        label="Declaration forms"
        icon={() => <Icon name="Database" size="medium" />}
      />
      <NavigationItem
        label="Certificates"
        icon={() => <Icon name="Medal" size="medium" />}
      />
      <NavigationItem label="User roles" icon={() => <SettingsNavigation />} />
    </NavigationGroup>
  </LeftNavigation>
)

export default {
  title: 'Layout/Side navigation/Side Nav',
  component: LeftNavigation
} as Meta
