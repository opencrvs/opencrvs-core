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
import React from 'react'
import { Button } from './Button'
import { Stack } from '../Stack'
import { Icon } from '../Icon'

const meta: Meta<typeof Button> = {
  title: 'Controls/Button',
  component: Button
}

export default meta

type Story = StoryObj<typeof Button>

export const Primary: Story = {
  name: 'Button',
  args: {
    type: 'primary',
    size: 'medium',
    disabled: false,
    loading: false
  },
  argTypes: {
    type: {
      control: {
        type: 'radio'
      }
    },
    disabled: {
      table: {
        category: 'Modifiers'
      }
    },
    loading: {
      table: {
        category: 'Modifiers'
      }
    },
    icon: {
      table: {
        category: 'Modifiers'
      }
    }
  },
  render: (args) => <Button {...args}>Click here</Button>
}

export const Sizes: Story = {
  render: () => (
    <Stack direction="column" alignItems="left">
      <Stack>
        <Button type="primary" size="large">
          Large
        </Button>
        <Button type="primary" size="medium">
          Default
        </Button>
        <Button type="primary" size="small">
          Small
        </Button>
      </Stack>
      <Stack>
        <Button type="secondary" size="large">
          Large
        </Button>
        <Button type="secondary" size="medium">
          Default
        </Button>
        <Button type="secondary" size="small">
          Small
        </Button>
      </Stack>
      <Stack>
        <Button type="tertiary" size="large">
          Large
        </Button>
        <Button type="tertiary" size="medium">
          Default
        </Button>
        <Button type="tertiary" size="small">
          Small
        </Button>
      </Stack>
    </Stack>
  )
}

export const WithIcon: Story = {
  name: 'With icon',
  render: () => (
    <Stack>
      <Button type="primary">
        <Icon name="Target" size="medium" />
        Primary
      </Button>
      <Button type="secondary">
        <Icon name="Target" size="medium" />
        Secondary
      </Button>
      <Button type="tertiary" size="medium">
        <Icon name="Target" size="large" />
        Tertiary
      </Button>
      <Button type="secondary" size="medium">
        On right
        <Icon name="Target" size="large" />
      </Button>
    </Stack>
  )
}

export const Icons: Story = {
  render: () => (
    <Stack direction="column" alignItems="left">
      <Stack>
        <Button
          type="iconPrimary"
          size="large"
          aria-label="View performance data"
        >
          <Icon name="Target" size="large" />
        </Button>
        <Button
          type="iconPrimary"
          size="medium"
          aria-label="View performance data"
        >
          <Icon name="Target" size="medium" />
        </Button>
        <Button
          type="iconPrimary"
          size="small"
          aria-label="View performance data"
        >
          <Icon name="Target" size="medium" />
        </Button>
      </Stack>
      <Stack>
        <Button type="icon" size="large" aria-label="View performance data">
          <Icon name="Target" size="large" />
        </Button>
        <Button type="icon" size="medium" aria-label="View performance data">
          <Icon name="Target" size="medium" />
        </Button>
        <Button type="icon" size="small" aria-label="View performance data">
          <Icon name="Target" size="medium" />
        </Button>
      </Stack>
    </Stack>
  )
}

export const Loading: Story = {
  render: () => (
    <Stack>
      <Button type="primary" loading>
        Primary
      </Button>
      <Button type="secondary" loading>
        Secondary
      </Button>
      <Button type="tertiary" loading>
        Tertiary
      </Button>
    </Stack>
  )
}

export const Disabled: Story = {
  render: () => (
    <Stack>
      <Button type="primary" disabled>
        Primary
      </Button>
      <Button type="secondary" disabled>
        Secondary
      </Button>
      <Button type="tertiary" disabled>
        Tertiary
      </Button>
    </Stack>
  )
}
