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
import { fn, within } from '@storybook/test'
import React from 'react'
import styled from 'styled-components'
import { userEvent } from '@storybook/testing-library'
import { FieldType, MimeType } from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { TRPCProvider } from '@client/v2-events/trpc'

const meta: Meta<typeof FormFieldGenerator> = {
  title: 'Inputs/File/Interaction',
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

const StyledFormFieldGenerator = styled(FormFieldGenerator)`
  width: '400px';
`

export const FileInputWithOptionTest: StoryObj<typeof FormFieldGenerator> = {
  name: 'Upload file input with option',
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
            configuration: {
              maxFileSize: 1 * 1024 * 1024,
              acceptedFileTypes: ['image/jpeg']
            },
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
        form={formData}
        id="my-form"
        setAllFieldsDirty={false}
        onChange={(data) => {
          args.onChange(data)
          setFormData(data)
        }}
      />
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    const fileInput = await canvas.findByRole('button', {
      name: 'Upload'
    })

    const input = canvasElement.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement

    await step(
      'Prevents upload of a file with an invalid file type',
      async () => {
        await userEvent.click(fileInput)

        const svgFile = new File(['treeSvg'], 'tree.svg', {
          type: MimeType.enum['image/svg+xml']
        })

        await userEvent.upload(input, svgFile)
        await canvas.findByText(
          'File format not supported. Please attach jpeg (max 1mb)'
        )
      }
    )

    await step(
      'Prevents upload of a file with an invalid file size',
      async () => {
        const largeFile = new File(['a'.repeat(1024 * 1025)], 'large.jpg', {
          type: MimeType.enum['image/jpeg']
        })

        await userEvent.upload(input, largeFile)
        await canvas.findByText('File size must be less than 1mb')
      }
    )

    await step(
      'Accepts file of valid size and type when option is selected',
      async () => {
        const validFile = new File(['a'.repeat(512 * 512)], 'valid.jpg', {
          type: MimeType.enum['image/jpeg']
        })

        await userEvent.upload(input, validFile)
        await canvas.findByText('Please select the type of document first')

        // we use older react-select which does not have aria-labels set
        const selectControl = canvasElement.querySelector(
          '.react-select__control'
        ) as HTMLElement

        // Open dropdown and select
        await userEvent.click(selectControl)
        await userEvent.click(await canvas.findByText('Forest'))

        await userEvent.upload(input, validFile)

        await canvas.findByRole('button', { name: 'Forest' })
      }
    )
  }
}

export const FileInputButton: StoryObj<typeof StyledFormFieldGenerator> = {
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
            id: 'storybook.file',
            type: FieldType.FILE,
            configuration: {
              maxFileSize: 1 * 1024 * 1024,
              acceptedFileTypes: ['image/jpeg'],
              fileName: {
                defaultMessage: 'Uploaded photo',
                description: 'The title for the file input',
                id: 'storybook.file.label'
              }
            },
            label: {
              id: 'storybook.file.label',
              defaultMessage: 'Upload your captured photo',
              description: 'The title for the file input'
            }
          }
        ]}
        form={formData}
        id="my-form"
        setAllFieldsDirty={false}
        onChange={(data) => {
          args.onChange(data)
          setFormData(data)
        }}
      />
    )
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    const fileInput = await canvas.findByRole('button', {
      name: 'Upload'
    })

    const input = canvasElement.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement

    await step(
      'Prevents upload of a file with an invalid file type',
      async () => {
        await userEvent.click(fileInput)

        const svgFile = new File(['treeSvg'], 'tree.svg', {
          type: MimeType.enum['image/svg+xml']
        })

        await userEvent.upload(input, svgFile)
        await canvas.findByText(
          'File format not supported. Please attach jpeg (max 1mb)'
        )
      }
    )

    await step(
      'Prevents upload of a file with an invalid file size',
      async () => {
        const largeFile = new File(['a'.repeat(1024 * 1025)], 'large.jpg', {
          type: MimeType.enum['image/jpeg']
        })

        await userEvent.upload(input, largeFile)
        await canvas.findByText('File size must be less than 1mb')
      }
    )

    await step('Accepts file of valid size and type', async () => {
      const filename = 'valid.jpg'
      const validFile = new File(['a'.repeat(512 * 512)], filename, {
        type: MimeType.enum['image/jpeg']
      })

      await userEvent.upload(input, validFile)

      await canvas.findByRole('button', { name: 'Uploaded photo' })
    })
  }
}
