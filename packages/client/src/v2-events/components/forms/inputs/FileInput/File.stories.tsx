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
import { Review } from '@client/v2-events/features/events/components/Review'
import { birthEvent } from './fixtures'

const meta: Meta<typeof FormFieldGenerator> = {
  title: 'Inputs/File',
  args: { onChange: fn() },
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta

const StyledFormFieldGenerator = styled(FormFieldGenerator)<{
  fullWidth?: boolean
}>`
  width: '400px';
`
export const FileInputWithOption: StoryObj<typeof FormFieldGenerator> = {
  name: 'File input with option',
  parameters: {
    layout: 'centered'
  },
  render: function Component(args) {
    const [formData, setFormData] = React.useState({})
    return (
      <StyledFormFieldGenerator
        fields={[
          {
            id: 'storybook.file',
            type: FieldType.FILE_WITH_OPTIONS,
            label: {
              id: 'storybook.file.label',
              defaultMessage: 'Upload your captured photo',
              description: 'The title for the file input'
            },
            options: [
              {
                value: 'forest',
                label: {
                  id: 'storybook.file.option.forest',
                  defaultMessage: 'Forest',
                  description: 'Option for a forest setting'
                }
              },
              {
                value: 'beach',
                label: {
                  id: 'storybook.file.option.beach',
                  defaultMessage: 'Beach',
                  description: 'Option for a beach setting'
                }
              },
              {
                value: 'mountain',
                label: {
                  id: 'storybook.file.option.mountain',
                  defaultMessage: 'Mountain',
                  description: 'Option for a mountain setting'
                }
              },
              {
                value: 'desert',
                label: {
                  id: 'storybook.file.option.desert',
                  defaultMessage: 'Desert',
                  description: 'Option for a desert setting'
                }
              },
              {
                value: 'city',
                label: {
                  id: 'storybook.file.option.city',
                  defaultMessage: 'City',
                  description: 'Option for a city setting'
                }
              }
            ]
          }
        ]}
        formData={formData}
        id="my-form"
        setAllFieldsDirty={false}
        onChange={(data) => {
          args.onChange(data)
          setFormData(data)
        }}
      />
    )
  }
}

export const FileInputWithoutOption: StoryObj<
  typeof StyledFormFieldGenerator
> & {
  fullWidth?: boolean
} = {
  name: 'File input without option',
  parameters: {
    layout: 'centered'
  },
  render: function Component(args) {
    const [formData, setFormData] = React.useState({})
    return (
      <StyledFormFieldGenerator
        fields={[
          {
            id: 'storybook.file2',
            type: FieldType.FILE,
            label: {
              id: 'storybook.file2.label',
              defaultMessage: 'Upload your photo',
              description: 'The title for the file input'
            },
            options: { style: { fullWidth: Boolean(args.fullWidth) } }
          }
        ]}
        formData={formData}
        id="my-form"
        setAllFieldsDirty={false}
        onChange={(data) => {
          args.onChange(data)
          setFormData(data)
        }}
      />
    )
  },
  argTypes: {
    fullWidth: {
      control: 'boolean',
      description: 'Toggle to make the input full width'
    }
  },
  args: { fullWidth: false }
}

export const FileReview: StoryObj<typeof Review> = {
  name: 'Review output',
  parameters: {
    layout: 'center'
  },
  render: function Component() {
    return (
      <div>
        <Review.Body
          eventConfig={birthEvent}
          form={{
            'documents.proofOfBirth': {
              filename: 'tree.svg',
              originalFilename: 'tree.svg',
              type: 'image/svg+xml'
            },
            'documents.proofOfMother': [
              {
                filename: 'fish.svg',
                originalFilename: 'fish.svg',
                type: 'image/svg+xml',
                option: 'NATIONAL_ID'
              },
              {
                filename: 'mountain.svg',
                originalFilename: 'mountain.svg',
                type: 'image/svg+xml',
                option: 'PASSPORT'
              },
              {
                filename: 'tree.svg',
                originalFilename: 'tree.svg',
                type: 'image/svg+xml',
                option: 'BIRTH_REGISTRATION_NUMBER'
              },
              {
                filename: 'fish.svg',
                originalFilename: 'fish.svg',
                type: 'image/svg+xml',
                option: 'NONE'
              }
            ],
            'documents.proofOther': {
              filename: 'tree.svg',
              originalFilename: 'tree.svg',
              type: 'image/svg+xml'
            }
          }}
          formConfig={birthEvent.actions[0].forms[0]}
          title="File explorer"
          // eslint-disable-next-line no-console
          onEdit={(values) => console.log(values)}
        >
          <div />
        </Review.Body>
      </div>
    )
  }
}
