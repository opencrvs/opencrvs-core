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
import { Meta, ComponentStory } from '@storybook/react'
import { Toast, NOTIFICATION_TYPE } from './Toast'
import React, { useState } from 'react'
import { PrimaryButton } from '../buttons'

export default {
  title: 'Data/Toast',
  component: Toast
} as Meta

const Template: ComponentStory<typeof Toast> = (args) => {
  const [isVisible, setVisible] = useState(false)

  return (
    <>
      <PrimaryButton onClick={() => setVisible(!isVisible)}>
        {isVisible ? 'Close' : 'Open'} toast
      </PrimaryButton>

      <Toast {...args} show={isVisible}>
        {args.children ?? `Hi! I'm a ${args.type} toast`}
      </Toast>
    </>
  )
}

export const Success = Template.bind({})
Success.args = {
  type: NOTIFICATION_TYPE.SUCCESS
}

export const Neutral = Template.bind({})
Neutral.args = {
  type: NOTIFICATION_TYPE.NEUTRAL
}

export const Error = Template.bind({})
Error.args = {
  type: NOTIFICATION_TYPE.ERROR
}

export const InProgress = Template.bind({})
InProgress.args = {
  type: NOTIFICATION_TYPE.IN_PROGRESS
}

export const LongText = Template.bind({})
LongText.args = {
  type: NOTIFICATION_TYPE.SUCCESS,
  children:
    'This is a very long text. This is a very long text. This is a very long text. This is a very long text. This is a very long text. This is a very long text. This is a very long text.'
}

export const WithRetry = Template.bind({})
WithRetry.args = {
  type: NOTIFICATION_TYPE.SUCCESS,
  onActionClick: () => alert('Retried'),
  buttonText: 'Retry'
}

export const Closable = () => {
  const [isVisible, setVisible] = useState(false)

  return (
    <>
      <PrimaryButton onClick={() => setVisible(true)}>Open toast</PrimaryButton>

      <Toast
        type={NOTIFICATION_TYPE.SUCCESS}
        show={isVisible}
        onClose={() => setVisible(false)}
      >
        Hi, I'm a closable toast!
      </Toast>
    </>
  )
}

export const ClosableWithRetry = () => {
  const [isVisible, setVisible] = useState(false)

  return (
    <>
      <PrimaryButton onClick={() => setVisible(true)}>Open toast</PrimaryButton>

      <Toast
        type={NOTIFICATION_TYPE.SUCCESS}
        show={isVisible}
        onClose={() => setVisible(false)}
        actionText="Retry"
        onActionClick={() => alert('Retried')}
      >
        Hi, I'm a closable toast!
      </Toast>
    </>
  )
}

export const ClosableWithRetryWithLongText = () => {
  const [isVisible, setVisible] = useState(false)

  return (
    <>
      <PrimaryButton onClick={() => setVisible(true)}>Open toast</PrimaryButton>

      <Toast
        type={NOTIFICATION_TYPE.SUCCESS}
        show={isVisible}
        onClose={() => setVisible(false)}
        actionText="Retry"
        onActionClick={() => alert('Retried')}
      >
        This is a very long text. This is a very long text. This is a very long
        text. This is a very long text. This is a very long text. This is a very
        long text. This is a very long text.
      </Toast>
    </>
  )
}
