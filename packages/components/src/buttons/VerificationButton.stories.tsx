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
import * as React from 'react'
import { Meta, Story } from '@storybook/react'
import { VerificationButton } from './VerificationButton'

interface IVerificationButtonProps {
  status: 'unverified' | 'loading' | 'verified'
  onClick: () => void
  labelForVerifiedState: string
  labelForUnverifiedState: string
  labelForLoadingState: string
}

export default {
  title: 'Controls/Verification Button',
  component: VerificationButton,
  parameters: {
    docs: {
      description: {
        component: `
\`<VerificationButton />\` is used for fetching authenticated NID data from mosip IDP.
It also shows if it has  successfully authenticated NID data from MOSIP.`
      }
    }
  }
} as Meta

const Template: Story<IVerificationButtonProps> = (args) => {
  return <VerificationButton {...args} />
}
export const Default = Template.bind({})
Default.args = {
  status: 'unverified',
  onClick: () => {},
  labelForVerifiedState: 'Authenticated',
  labelForUnverifiedState: 'Authenticate',
  labelForLoadingState: 'Authenticating'
}
