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
import { ComponentStory, ComponentMeta } from '@storybook/react'
import { Alert } from './Alert'
import React, { useState } from 'react'

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
  children:
    'Nothing is currently published. Awaiting to be published: Birth, Death',
  onClose: undefined
}

export const Warning = Template.bind({})
Warning.args = {
  type: 'warning',
  children:
    'Nothing is currently published. Awaiting to be published: Birth, Death',
  onClose: undefined
}

export const Error = Template.bind({})
Error.args = {
  type: 'error',
  children:
    'Nothing is currently published. Awaiting to be published: Birth, Death',
  onClose: undefined
}

export const Info = Template.bind({})
Info.args = {
  type: 'info',
  children:
    'Nothing is currently published. Awaiting to be published: Birth, Death',
  onClose: undefined
}

export const Loading = Template.bind({})
Loading.args = {
  type: 'loading',
  children:
    'Nothing is currently published. Awaiting to be published: Birth, Death',
  onClose: undefined
}

export const Closable = () => {
  const [isVisible, setVisible] = useState(true)

  return (
    isVisible && (
      <Alert type="success" onClose={() => setVisible(false)}>
        Hello, I'm closable!
      </Alert>
    )
  )
}

export const Retryable = () => (
  <Alert
    type="success"
    actionText="Retry"
    onActionClick={() => alert('Retried')}
  >
    Hello, I'm a retriable alert!
  </Alert>
)

export const RetryableAndClosable = () => {
  const [isVisible, setVisible] = useState(true)
  return (
    isVisible && (
      <Alert
        type="success"
        onActionClick={() => alert('Retried')}
        actionText="Retry"
        onClose={() => setVisible(false)}
      >
        Hi! I'm a retryable and closable toast. I also have a very long text
        within the toast. This illustrates how the toast stretches when the
        content is lengthy.
        <br />
        <br />
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis mauris
        libero, tempor ut egestas quis, suscipit ac erat. Donec lacinia mi id
        augue scelerisque, vel vehicula eros lobortis.
      </Alert>
    )
  )
}
