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
import { Summary } from './Summary'
import { ComponentMeta, ComponentStory } from '@storybook/react'

export default {
  title: 'Data/Summary',
  component: Summary
} as ComponentMeta<typeof Summary>

export const Default: ComponentStory<typeof Summary> = () => (
  <Summary>
    <Summary.Row label="Status" value="Draft" placeholder="No status" />
    <Summary.Row label="Event" value="Birth" placeholder="No event" />
    <Summary.Row label="Tracking ID" placeholder="No tracking ID" />
    <Summary.Row label="Date of birth" locked={true} />
    <Summary.Row label="Place of birth" locked={true} />
    <Summary.Row label="Informant" locked={true} />
  </Summary>
)
