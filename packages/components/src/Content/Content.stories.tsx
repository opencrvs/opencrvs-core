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
import { Meta, Story } from '@storybook/react'
import { Content } from './Content'
import React, { ReactElement } from 'react'
import { DeclarationIcon } from '../icons'
import { Button } from '../Button'
import { Link } from '../Link'

export default {
  title: 'Layout/Content',
  component: Content,
  parameters: {
    docs: {
      description: {
        component: `
\`<Content>\` adds styling and actions to a page body content.
Content is often used by \`<Frame>\` where you can find more complex examples of layouting.
`
      }
    }
  }
} as Meta

interface IProps {
  icon?: () => React.ReactNode
  title?: string
  topActionButtons?: ReactElement[]
  subtitle?: string
  children?: React.ReactNode
  bottomActionButtons?: ReactElement[]
  maxWidth?: '778px' | '1140px'
}

const Template: Story<IProps> = (args) => <Content {...args}>Test</Content>
export const Default = Template.bind({})
Default.args = {
  icon: () => <DeclarationIcon />,
  title: 'Register',
  topActionButtons: [
    <Button
      type="secondary"
      key="1"
      id="myButton"
      onClick={() => {
        alert('Clicked')
      }}
    >
      Press me
    </Button>,
    <Link font="reg14">Click</Link>
  ],
  subtitle:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  bottomActionButtons: [
    <Button
      key="1"
      type="primary"
      id="myButton"
      onClick={() => {
        alert('Clicked')
      }}
    >
      Press me
    </Button>
  ],
  size: 'normal'
}
