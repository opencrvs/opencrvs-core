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
import { Toggle } from './Toggle'

export default {
  title: 'Controls/Toggle',
  component: Toggle,
  parameters: {
    docs: {
      description: {
        component: `
\`<Toggle>\` is used to quickly switch between enabled or disabled states.
`
      }
    }
  }
} as ComponentMeta<typeof Toggle>

const Template: ComponentStory<typeof Toggle> = () => {
  const [selected, setSelected] = React.useState(true)
  return (
    <Toggle defaultChecked={selected} onChange={() => setSelected(!selected)} />
  )
}

export const Default = Template.bind({})
