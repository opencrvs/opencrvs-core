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
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { Alert } from './Alert'
import React, { useState } from 'react'
import { Icon } from '../Icon'

const Template: ComponentStory<typeof Alert> = (args) => {
  return <Alert {...args} />
}

export default {
  title: 'Data/Alert',
  component: Alert
} as ComponentMeta<typeof Alert>

export const Success = Template.bind({})
Success.args = {
  type: 'success',
  children: "Hello, I'm an alert to show a success message",
  onClose: undefined
}

export const Warning = Template.bind({})
Warning.args = {
  type: 'warning',
  children: "Hello, I'am an alert to show a warning message",
  onClose: undefined
}

export const Error = Template.bind({})
Error.args = {
  type: 'error',
  children: "Hello, I'm an alert to show an error message",
  onClose: undefined
}

export const Info = Template.bind({})
Info.args = {
  type: 'info',
  children: "Hello, I'm an alert to show an helpful message",
  onClose: undefined
}

export const Loading = Template.bind({})
Loading.args = {
  type: 'loading',
  children: "Hello, I'm an alert to show something is loading",
  onClose: undefined
}

export const CustomIcon = Template.bind({})
CustomIcon.args = {
  type: 'success',
  children: "Hello, I'm an alert to show a custom icon",
  onClose: undefined,
  customIcon: <Icon name={'Medal'} />
}

export const Dismissable = () => {
  const [isVisible, setVisible] = useState(true)

  return (
    isVisible && (
      <Alert type="warning" onClose={() => setVisible(false)}>
        Hello, I'm an alert that you can dismiss!
      </Alert>
    )
  )
}

export const WithAction = () => (
  <Alert type="error" actionText="Retry" onActionClick={() => alert('Retried')}>
    Hello, I'm an alert with an action button!
  </Alert>
)

export const WithActionAndDismiss = () => {
  const [isVisible, setVisible] = useState(true)
  return (
    isVisible && (
      <Alert
        type="warning"
        onActionClick={() => alert('Reviewed')}
        actionText="Review"
        onClose={() => setVisible(false)}
      >
        Hi! I'm an alert with a action button and dismiss close button. I also
        have a very long text within the toast. This illustrates how the toast
        stretches when the content is lengthy.
      </Alert>
    )
  )
}
