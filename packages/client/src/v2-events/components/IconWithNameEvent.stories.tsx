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
import type { Meta, StoryObj } from '@storybook/react'
import { InherentFlags } from '@opencrvs/commons/client'
import { IconWithNameEvent } from './IconWithNameEvent'

const meta: Meta<typeof IconWithNameEvent> = {
  title: 'IconWithNameEvent',
  component: IconWithNameEvent
}

export default meta
type Story = StoryObj<typeof IconWithNameEvent>

export const PotentialDuplicateInMobileView: Story = {
  args: {
    status: 'DECLARED',
    name: 'John Doe',
    event: 'Birth Registration',
    flags: [InherentFlags.POTENTIAL_DUPLICATE]
  },
  parameters: {
    viewport: { defaultViewport: 'mobile' }
  }
}
