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
import React from 'react'
import styled from 'styled-components'
import { Meta } from '@storybook/react'

import { Button } from './Button'
import { Activity } from '../icons/Activity'

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export default {
  title: 'Controls/MyButton',
  component: Button
} as Meta

// export const Basic = (args) => <Button {...args} />
// Basic.args = { children: 'Label' }

export const All = () => (
  <>
    <Container>
      <Button appearance="primary">Primary</Button>
      <Button appearance="positive">Positive</Button>
      <Button appearance="negative">Negative</Button>
      <Button appearance="secondary">Secondary</Button>
      <Button appearance="tertiary" size="small">
        Tertiary
      </Button>
      <Button appearance="icon" size="medium">
        <Activity />
      </Button>
      <Button appearance="primary" withIcon>
        <Activity stroke="#ffffff" />
        Primary
      </Button>
      <Button appearance="secondary" withIcon>
        <Activity />
        Secondary
      </Button>
      <Button appearance="tertiary" size="small" withIcon>
        <Activity />
        Primary
      </Button>
    </Container>
  </>
)

export const Sizes = () => (
  <>
    <Container>
      <Button appearance="primary" size="large">
        Default
      </Button>
      <Button appearance="primary" size="medium">
        Default
      </Button>
      <Button appearance="primary" size="small">
        Small
      </Button>
    </Container>
  </>
)

export const Icon = () => (
  <>
    <Container>
      <Button appearance="icon" size="large">
        <Activity />
      </Button>
      <Button appearance="icon" size="medium">
        <Activity />
      </Button>
      <Button appearance="icon" size="small">
        <Activity />
      </Button>
    </Container>
  </>
)

export const Loading = () => (
  <>
    <Container>
      <Button appearance="primary" size="large" isLoading>
        Primary
      </Button>
      <Button appearance="secondary" isLoading>
        Secondary
      </Button>
      <Button appearance="tertiary" isLoading>
        Tertiary
      </Button>
    </Container>
  </>
)

export const Disabled = () => (
  <>
    <Container>
      <Button appearance="primary" isDisabled>
        Primary
      </Button>
      <Button appearance="secondary" isDisabled>
        Secondary
      </Button>
      <Button appearance="tertiary" isDisabled>
        Tertiary
      </Button>
    </Container>
  </>
)
