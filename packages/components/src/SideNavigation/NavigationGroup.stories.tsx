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
import { NavigationGroup, INavigationGroup } from './NavigationGroup'
import {
  itemInProgress,
  itemReadyForReview,
  itemRequiresUpdates
} from './NavigationItem.stories'
import { NavigationGroupHeader } from './NavigationGroupHeader'
import { recordGroup } from './NavigationGroupHeader.stories'
import { NavigationItem } from './NavigationItem'
const RecordTemplate: Story<INavigationGroup> = (args) => (
  <NavigationGroup>
    {/* <NavigationGroupHeader {...recordGroup.args} />
    <NavigationItem {...itemInProgress.args} />
    <NavigationItem {...itemReadyForReview.args} />
    <NavigationItem {...itemRequiresUpdates.args} /> */}
  </NavigationGroup>
)

export const groupRecord = RecordTemplate.bind({})

groupRecord.args = {}

export default {
  title: 'Layout/Side navigation/Side navigation group',
  component: NavigationGroup
} as Meta
