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
            type: 'FILE_WITH_OPTIONS',
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
            type: 'FILE',
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
              filename: '2d2c06e7-cadb-47b7-9779-419e6125b681.jpg',
              originalFilename: '8073450b-c9e5-486b-bef4-52db3dc39f2e.jpg',
              type: 'image/jpeg'
            },
            'documents.proofOfMother': [
              {
                filename: '30555050-01b9-4b90-9172-da7eaa97bdf1.jpeg',
                originalFilename: 'abcd.jpeg',
                type: 'image/jpeg',
                option: 'NATIONAL_ID'
              },
              {
                filename: 'b7bf34d7-4a93-4f18-8fb7-e04a5801c0bd.jpg',
                originalFilename: 'abcd.jpg',
                type: 'image/jpeg',
                option: 'PASSPORT'
              },
              {
                filename: '019dc6d3-1e09-4fbc-854f-4b1b10d9d42e.jpg',
                originalFilename: 'abcd.jpg',
                type: 'image/jpeg',
                option: 'BIRTH_REGISTRATION_NUMBER'
              },
              {
                filename: '01cbaef6-bada-458b-8ce6-69f456df25e4.png',
                originalFilename: 'abcd.png',
                type: 'image/png',
                option: 'NONE'
              }
            ],
            'documents.proofOther': {
              filename: '9b797687-c294-42d6-b504-2a20a72fb9bb.png',
              originalFilename: 'abcd.png',
              type: 'image/png'
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
