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
import React from 'react'
import { Banner, IBannerProps } from './Banner'
import { Text } from '../Text'
import { Meta, StoryObj } from '@storybook/react'
import { Button } from '../Button'
import { Pill } from '../Pill'
import { Icon } from '../Icon'

const meta: Meta<IBannerProps> = {
  title: 'Layout/Banner',
  argTypes: {
    type: {
      control: {
        type: 'radio',
        options: ['active', 'inactive', 'pending', 'default']
      }
    }
  },
  render: (args) => (
    <Banner.Container>
      <Banner.Header type={args.type}>
        <Text variant="reg16" element="span">
          This is header
        </Text>
      </Banner.Header>
      <Banner.Body>
        <Text variant="reg16" element="span">
          This is body
        </Text>
      </Banner.Body>
      <Banner.Footer>
        <Button type="primary">Click me</Button>
      </Banner.Footer>
    </Banner.Container>
  )
}

export default meta

export const Default: StoryObj<IBannerProps> = {
  args: {
    type: 'default'
  }
}

export const Active: StoryObj<IBannerProps> = {
  args: {
    type: 'active'
  }
}

export const Pending: StoryObj<IBannerProps> = {
  args: {
    type: 'pending'
  }
}

export const PendingAdvanced: StoryObj<IBannerProps> = {
  render: () => (
    <Banner.Container>
      <Banner.Header type="pending">
        <Pill
          type="pending"
          size="small"
          pillTheme="dark"
          label={
            <>
              <Icon name="QrCode" size="small" />
              ID Pending Verification
            </>
          }
        />
        <Icon name="Clock" size="large" />
      </Banner.Header>
      <Banner.Body>
        <Text variant="reg16" element="span">
          The Notifier’s identity has been verified successfully using the
          National Identity system. To make edits, please remove the
          verification first.
        </Text>
      </Banner.Body>
      <Banner.Footer justifyContent="flex-end">
        <Button type="secondary">Reset</Button>
      </Banner.Footer>
    </Banner.Container>
  )
}
