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
import { Meta, Story } from '@storybook/react'
import { Pill, IPillProps } from './Pill'
import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const Template: Story<IPillProps> = (args) => {
  return (
    <Container>
      <Pill {...args} />
      <Pill {...args} size="medium" />
    </Container>
  )
}

export default {
  title: 'Components/Interface/Pill',
  component: Pill
} as Meta

export const Default = Template.bind({})
Default.args = {
  label: 'Default'
}

export const Active = Template.bind({})
Active.args = {
  label: 'Active',
  type: 'active'
}

export const Pending = Template.bind({})
Pending.args = {
  label: 'Pending',
  type: 'pending'
}

export const Inactive = Template.bind({})
Inactive.args = {
  label: 'Inactive',
  type: 'inactive'
}
