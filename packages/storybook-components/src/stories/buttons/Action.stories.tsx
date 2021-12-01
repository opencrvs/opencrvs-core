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
import { Story, Meta } from '@storybook/react'

import { Action, IActionProps } from './Action'

const Template: Story<IActionProps> = args => <Action {...args} />

export default {
  title: 'Components/Buttons/Action',
  component: Action
} as Meta

export const SampleAction = Template.bind({})

SampleAction.args = {
  disabled: true,
  title: 'Self (18+)',
  description:
    'Required: Details of the individual and informant. Optional: Details of the mother/father.'
}
