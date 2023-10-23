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
import { ComponentMeta, Story } from '@storybook/react'
import { Accordion, IAccordionProps } from './Accordion'
import React from 'react'

export default {
  title: 'Data/Accordion',
  component: Accordion,
  parameters: {
    docs: {
      description: {
        component: `The accordion \`<Accordion />\` component is a wrapper container which allows user to hide or expand the relevant content inside.`
      }
    }
  }
} as ComponentMeta<typeof Accordion>

const Template: Story<IAccordionProps> = (args) => (
  <Accordion {...args}>This is the content of the accordion.</Accordion>
)

export const AccordionView = Template.bind({})
AccordionView.args = {
  name: 'accordion-component',
  label: 'Accordion Label',
  labelForHideAction: 'Hide',
  labelForShowAction: 'Show'
}
