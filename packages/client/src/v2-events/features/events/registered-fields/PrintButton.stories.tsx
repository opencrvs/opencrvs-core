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
import { PrintButton } from './PrintButton'

const meta: Meta<typeof PrintButton.Input> = {
  title: 'V2 Events/Registered Fields/PrintButton',
  component: PrintButton.Input,
  parameters: {
    docs: {
      description: {
        component:
          'A print button field that allows printing certificates using template compilation.'
      }
    }
  },
  argTypes: {
    id: {
      description: 'Unique identifier for the field',
      control: 'text'
    },
    template: {
      description:
        'Template ID from countryconfig templates to use for printing',
      control: 'text'
    },
    buttonLabel: {
      description: 'Optional custom label for the print button',
      control: 'object'
    },
    disabled: {
      description: 'Whether the button is disabled',
      control: 'boolean'
    }
  }
}

export default meta
type Story = StoryObj<typeof PrintButton.Input>

export const Default: Story = {
  args: {
    id: 'print-certificate',
    template: 'birth-certificate-template',
    buttonLabel: {
      id: 'print.certificate',
      defaultMessage: 'Print Certificate'
    },
    disabled: false
  }
}

export const CustomLabel: Story = {
  args: {
    id: 'print-certificate',
    template: 'death-certificate-template',
    buttonLabel: {
      id: 'print.death.certificate',
      defaultMessage: 'Print Death Certificate'
    },
    disabled: false
  }
}

export const Disabled: Story = {
  args: {
    id: 'print-certificate',
    template: 'birth-certificate-template',
    buttonLabel: {
      id: 'print.certificate',
      defaultMessage: 'Print Certificate'
    },
    disabled: true
  }
}
