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

import React from 'react'
import { Meta, Story } from '@storybook/react'
import { SideNav, ISideNavProps } from './SideNav'
import { NavigationGroup } from './NavigationGroup'
import { NavigationGroupTitle } from './NavigationGroupTitle'
import { NavigationItem } from './NavigationItem'
import { NavigationSubItem } from './NavigationSubItem'
import { DeclarationIconSmall } from '../icons/DeclarationIconSmall'
import { Icon } from '../Icon'
import { Expandable } from '../icons/Expandable'

const { useState } = React

const Template: Story<ISideNavProps> = (args) => {
  const [isExpanded, setExpanded] = useState(true)
  const [is2Expanded, set2Expanded] = useState(true)
  const [is3Expanded, set3Expanded] = useState(false)
  const [is4Expanded, set4Expanded] = useState(false)

  return (
    <SideNav {...args}>
      <NavigationGroup>
        <NavigationGroupTitle
          label="RECORDS"
          onClick={() => setExpanded(!isExpanded)}
          expandableIcon={() =>
            isExpanded ? <Expandable selected={true} /> : <Expandable />
          }
        />

        {isExpanded && (
          <>
            <NavigationItem
              label="In progress"
              icon={() => <DeclarationIconSmall color={'purple'} />}
              count={1}
            />
            <NavigationItem
              label="Ready for review"
              icon={() => <DeclarationIconSmall color={'orange'} />}
              count={1}
            />
            <NavigationItem
              label="Ready to print"
              icon={() => <DeclarationIconSmall color={'green'} />}
              count={1}
            />
          </>
        )}
      </NavigationGroup>
      <NavigationGroup>
        <NavigationGroupTitle
          label="PERFORMANCE"
          onClick={() => set2Expanded(!is2Expanded)}
          expandableIcon={() =>
            is2Expanded ? <Expandable selected={true} /> : <Expandable />
          }
        />
        {is2Expanded && (
          <>
            <NavigationItem
              label="Registrations"
              icon={() => (
                <Icon color="currentColor" name="Globe" size="small" />
              )}
              count={1}
            />
            <NavigationItem
              label="Statistics"
              icon={() => (
                <Icon color="currentColor" name="Globe" size="small" />
              )}
              count={1}
            />
            <NavigationItem
              label="Leaderboards"
              icon={() => (
                <Icon color="currentColor" name="Globe" size="small" />
              )}
              onClick={() => set3Expanded(!is3Expanded)}
              expandableIcon={() =>
                is3Expanded ? <Expandable selected={true} /> : <Expandable />
              }
            />
            {is3Expanded && (
              <>
                <NavigationSubItem label="SubItem" />
              </>
            )}
          </>
        )}
      </NavigationGroup>
      <NavigationGroup>
        <NavigationGroupTitle
          label="CONFIGURATION"
          onClick={() => set4Expanded(!is4Expanded)}
          expandableIcon={() =>
            is4Expanded ? <Expandable selected={true} /> : <Expandable />
          }
        />
        {is4Expanded && (
          <>
            <NavigationItem
              label="Application"
              icon={() => (
                <Icon color="currentColor" name="Globe" size="small" />
              )}
            />
            <NavigationItem
              label="Declaration forms"
              icon={() => (
                <Icon color="currentColor" name="Globe" size="small" />
              )}
            />
            <NavigationItem
              label="Certificates"
              icon={() => (
                <Icon color="currentColor" name="Globe" size="small" />
              )}
            />
            <NavigationItem
              label="User roles"
              icon={() => (
                <Icon color="currentColor" name="Globe" size="small" />
              )}
            />
          </>
        )}
      </NavigationGroup>
    </SideNav>
  )
}

export const Default = Template.bind({})

Default.args = {
  applicationName: 'OpenCRVS',
  applicationVersion: '1.1.0',
  buildVersion: 'Development'
}

export default {
  title: 'Layout/Side Nav',
  component: SideNav
} as Meta
