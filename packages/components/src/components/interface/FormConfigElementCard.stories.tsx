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
import React from 'react'
import {
  FormConfigElementCard,
  IFormConfigElementCardProps
} from './FormConfigElementCard'
import styled from 'styled-components'

export default {
  title: 'Components/Interface/FormConfigElementCard',
  component: FormConfigElementCard
} as Meta

const GrayedArea = styled.div`
  margin: 2px 0;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.grey200};
  width: 60%;
  height: 24px;
`

const GrayedAreaSmall = styled(GrayedArea)`
  width: 40%;
`

const Template: Story<IFormConfigElementCardProps> = (args) => {
  return (
    <FormConfigElementCard {...args}>
      <GrayedArea />
      <GrayedAreaSmall />
      <GrayedArea />
      <GrayedArea />
    </FormConfigElementCard>
  )
}

export const Default = Template.bind({})

export const Selected = Template.bind({})
Selected.args = {
  selected: true
}

export const Movable = Template.bind({})
Movable.args = {
  ...Selected.args,
  movable: true
}

export const MoveUpDisabled = Template.bind({})
MoveUpDisabled.args = {
  ...Movable.args,
  isUpDisabled: true
}

export const MoveDownDisabled = Template.bind({})
MoveDownDisabled.args = {
  ...Movable.args,
  isDownDisabled: true
}

export const Removable = Template.bind({})
Removable.args = {
  ...Selected.args,
  removable: true
}

export const TotalView = Template.bind({})
TotalView.args = {
  ...Selected.args,
  ...Movable.args,
  ...Removable.args
}
