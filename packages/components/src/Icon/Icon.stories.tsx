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
import { Icon } from './Icon'
import React from 'react'

const Template: ComponentStory<typeof Icon> = (args) => {
  return <Icon {...args} />
}

export default {
  title: 'Data/Icon',
  component: Icon,
  parameters: {
    docs: {
      description: {
        component: `
\`<Icon>\` displays icons in various different sizes and colors. For complete listing of the icons we have, see "Iconography".
`
      }
    }
  }
} as ComponentMeta<typeof Icon>

export const Default = Template.bind({})
Default.args = {
  name: 'Archive',
  color: 'currentColor',
  size: 'large'
}
