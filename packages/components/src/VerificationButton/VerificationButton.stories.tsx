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
import * as React from 'react'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { VerificationButton } from './VerificationButton'

export default {
  title: 'Controls/Verification button',
  component: VerificationButton,
  parameters: {
    docs: {
      description: {
        component: `
\`<VerificationButton />\` is used for authentication flow. It can show an action button, a verified icon or a disabled button with an offline message.`
      }
    }
  }
} as ComponentMeta<typeof VerificationButton>

const Template: ComponentStory<typeof VerificationButton> = (args) => {
  return <VerificationButton {...args} />
}

export const Unverified = Template.bind({})
Unverified.args = {
  status: 'unverified',
  onClick: () => {},
  labelForVerified: 'Authenticated',
  labelForUnverified: 'Authenticate',
  labelForOffline:
    'National ID authentication is currently not available offline.'
}

export const Verified = Template.bind({})
Verified.args = {
  status: 'verified',
  onClick: () => {},
  labelForVerified: 'Authenticated',
  labelForUnverified: 'Authenticate',
  labelForOffline:
    'National ID authentication is currently not available offline.'
}

export const Offline = Template.bind({})
Offline.args = {
  status: 'offline',
  onClick: () => {},
  labelForVerified: 'Authenticated',
  labelForUnverified: 'Authenticate',
  labelForOffline:
    'National ID authentication is currently not available offline.'
}
