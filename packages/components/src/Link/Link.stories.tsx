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
import { ComponentMeta, ComponentStory } from '@storybook/react'
import { Link } from './Link'

export default {
  title: 'Controls/Link',
  component: Link,
  parameters: {
    docs: {
      description: {
        component: `
\`<Link>\` is a clickable variant of text. It can be used as a button or a link.
`
      }
    }
  }
} as ComponentMeta<typeof Link>

export const Default: ComponentStory<typeof Link> = (args) => (
  <Link {...args}>Click here</Link>
)
