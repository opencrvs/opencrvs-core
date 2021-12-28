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
import { PrimaryButton } from '../buttons'
import { Modal } from './Modal'
import React from 'react'

interface IProps {
  title?: string
  actions: JSX.Element[]
  show: boolean
  handleClose?: () => void
  className?: string
}

const Template: Story<IProps> = (args) => <Modal {...args} />

export const ModalView = Template.bind({})
ModalView.args = {
  title: 'Modal',
  show: true,
  actions: [
    <PrimaryButton
      key="submit"
      onClick={() => {
        alert('Submit clicked')
      }}
    >
      Submit
    </PrimaryButton>,
    <button
      key="preview"
      onClick={() => {
        alert('Preview clicked')
      }}
    >
      Preview
    </button>
  ],
  handleClose: () => alert('closed'),
  className: 'Modal view'
}

export default {
  title: 'Components/Interface/Modal',
  component: Modal
} as Meta
