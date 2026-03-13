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
import { fn } from '@storybook/test'
import React from 'react'
import styled from 'styled-components'
import { FieldType } from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { TRPCProvider } from '@client/v2-events/trpc'
import { withValidatorContext } from '../../../../../.storybook/decorators'

const meta: Meta<typeof FormFieldGenerator> = {
  title: 'Inputs/ImageView',
  args: { onChange: fn() },
  parameters: {
    layout: 'centered'
  },
  decorators: [
    (Story, context) => (
      <TRPCProvider>
        <Story {...context} />
      </TRPCProvider>
    ),
    withValidatorContext
  ]
}

export default meta

const StyledFormFieldGenerator = styled(FormFieldGenerator)`
  width: 600px;
`

const svgDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg width="1200" height="500" viewBox="0 0 1200 500" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="500" fill="#E8F4FF"/>
  <rect x="60" y="60" width="1080" height="380" rx="16" fill="#CFE5FF"/>
  <circle cx="300" cy="210" r="80" fill="#4A90E2"/>
  <circle cx="900" cy="260" r="120" fill="#2F6FAF"/>
  <path d="M220 360L500 130L760 320L980 160" stroke="#1B4F8C" stroke-width="28" fill="none" stroke-linecap="round"/>
</svg>
`)}`

const imageField = {
  id: 'storybook.image',
  type: FieldType.IMAGE_VIEW,
  label: {
    id: 'storybook.image.label',
    defaultMessage: 'Reference image',
    description: 'Image field for read-only rendering'
  },
  defaultValue: svgDataUri,
  configuration: {
    alt: 'Decorative map illustration',
    width: '320px',
    height: '160px',
    objectFit: 'cover' as const
  }
}

export const LeftAligned: StoryObj<typeof FormFieldGenerator> = {
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator
        {...args}
        fields={[
          {
            ...imageField,
            configuration: {
              ...imageField.configuration,
              textAlign: 'left'
            }
          }
        ]}
        id="my-form"
      />
    )
  }
}

export const CenterAligned: StoryObj<typeof FormFieldGenerator> = {
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator
        {...args}
        fields={[
          {
            ...imageField,
            configuration: {
              ...imageField.configuration,
              textAlign: 'center'
            }
          }
        ]}
        id="my-form"
      />
    )
  }
}

export const RightAligned: StoryObj<typeof FormFieldGenerator> = {
  render: function Component(args) {
    return (
      <StyledFormFieldGenerator
        {...args}
        fields={[
          {
            ...imageField,
            configuration: {
              ...imageField.configuration,
              textAlign: 'right'
            }
          }
        ]}
        id="my-form"
      />
    )
  }
}
