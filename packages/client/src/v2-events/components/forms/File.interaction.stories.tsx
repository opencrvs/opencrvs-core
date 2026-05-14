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
import { expect, waitFor, within } from '@storybook/test'
import React from 'react'
import styled from 'styled-components'
import { userEvent } from '@storybook/testing-library'
import { FieldType, MimeType, TestUserRole } from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { TRPCProvider } from '@client/v2-events/trpc'
import { getTestValidatorContext } from '../../../../.storybook/decorators'
import { FormFieldGeneratorPropsWithoutRef } from './FormFieldGenerator/FormFieldGenerator'

const StyledFormFieldGenerator = styled(FormFieldGenerator)`
  width: '400px';
`

const meta: Meta<FormFieldGeneratorPropsWithoutRef> = {
  title: 'Inputs/File/Interaction',
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta

type Story = StoryObj<FormFieldGeneratorPropsWithoutRef>

export const FileInputWithOptionTest: Story = {
  name: 'Upload file input with option',
  parameters: {
    layout: 'centered',
    reactRouter: {
      router: {
        path: '/event/:eventId',
        element: (
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
            id="my-form"
            validatorContext={getTestValidatorContext(
              TestUserRole.enum.LOCAL_REGISTRAR
            )}
          />
        )
      },
      initialPath: '/event/123-kalsnk-213'
    }
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
        await expect(fileInput.hasAttribute('disabled')).toBeTruthy()
      }
    )

    await step(
      'Allow upload of a file when a valid file type is selected',
      async () => {
        // we use older react-select which does not have aria-labels set
        const selectControl = canvasElement.querySelector(
          '.react-select__control'
        ) as HTMLElement

        // Open dropdown and select
        await userEvent.click(selectControl)
        await userEvent.click(await canvas.findByText('Forest'))

        await expect(fileInput.hasAttribute('disabled')).toBeFalsy()
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

        await canvas.findByRole('button', { name: 'Forest' })
      }
    )
  }
}

export const FileInputButton: Story = {
  name: 'File input without option',
  parameters: {
    layout: 'centered',
    reactRouter: {
      router: {
        path: '/event/:eventId',
        element: (
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
            id="my-form"
            validatorContext={getTestValidatorContext(
              TestUserRole.enum.LOCAL_REGISTRAR
            )}
          />
        )
      },
      initialPath: '/event/123-kalsnk-213'
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await canvas.findByText('Upload your captured photo')

    const fileInput = await canvas.findByRole('button', {
      name: /upload/i
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

export const FileInputPdfWithPreview: Story = {
  name: 'File input PDF with preview modal',
  parameters: {
    layout: 'centered',
    reactRouter: {
      router: {
        path: '/event/:eventId',
        element: (
          <StyledFormFieldGenerator
            fields={[
              {
                id: 'storybook.file',
                type: FieldType.FILE,
                configuration: {
                  maxFileSize: 5 * 1024 * 1024,
                  acceptedFileTypes: ['application/pdf'],
                  fileName: {
                    defaultMessage: 'Uploaded PDF document',
                    description: 'The name for the uploaded PDF file',
                    id: 'storybook.file.pdf.filename'
                  }
                },
                label: {
                  id: 'storybook.file.pdf.label',
                  defaultMessage: 'Upload a PDF document',
                  description: 'The title for the PDF file input'
                }
              }
            ]}
            id="my-form"
            validatorContext={getTestValidatorContext(
              TestUserRole.enum.LOCAL_REGISTRAR
            )}
          />
        )
      },
      initialPath: '/event/123-kalsnk-213'
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await canvas.findByText('Upload a PDF document')

    const input = canvasElement.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement

    const pdfContent = `%PDF-1.0
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 200 50]/Parent 2 0 R/Resources<</Font<</F1<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>>>>>/Contents 4 0 R>>endobj
4 0 obj<</Length 44>>
stream
BT /F1 12 Tf 10 20 Td (pdf loaded) Tj ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000266 00000 n
trailer<</Size 5/Root 1 0 R>>
startxref
360
%%EOF`

    await step('Uploads a valid PDF file', async () => {
      const pdfFile = new File([pdfContent], 'document.pdf', {
        type: MimeType.enum['application/pdf']
      })

      // user-event v14 only treats audio/*, image/*, video/* as wildcards.
      // application/* is not handled, so PDF files are silently dropped.
      // Temporarily clear accept to bypass the filter.
      const originalAccept = input.accept
      input.accept = ''
      await userEvent.upload(input, pdfFile)
      input.accept = originalAccept

      await canvas.findByRole('button', { name: 'Uploaded PDF document' })
    })

    // Mock fetch so PDF.js can load the file in Storybook (no service worker available)
    const originalFetch = window.fetch
    window.fetch = async (url, ...args) => {
      if (String(url).includes('.pdf')) {
        return new Response(
          new Blob([pdfContent], { type: 'application/pdf' }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/pdf' }
          }
        )
      }
      return originalFetch(url as RequestInfo, ...args)
    }

    await step(
      'Clicking uploaded link opens PDF preview modal and shows loading state',
      async () => {
        const uploadedLink = await canvas.findByRole('button', {
          name: 'Uploaded PDF document'
        })
        await userEvent.click(uploadedLink)

        await expect(
          canvasElement.querySelector('#preview_image_field')
        ).not.toBeNull()

        // Loading... is shown immediately while PDF.js fetches and parses the file
        await canvas.findByText('Loading...')
      }
    )

    await step('PDF is rendered to canvas after loading', async () => {
      // PDF.js renders each page as a <canvas> element inside the viewer container
      await waitFor(
        async () => {
          await expect(canvas.queryByText('Failed to load PDF')).toBeNull()
          await expect(
            canvasElement.querySelector('#preview_image_field canvas')
          ).not.toBeNull()
        },
        { timeout: 10000 }
      )
    })

    window.fetch = originalFetch
  }
}

async function createImageFile(name: string, width: number, height: number) {
  return new Promise<File>((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, width, height)
    }
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], name, { type: blob.type })
        resolve(file)
      } else {
        reject(new Error('Could not create blob from canvas'))
      }
    }, 'image/jpeg')
  })
}

export const FileInputButtonMaxImage: Story = {
  name: 'File input without option with maxImageSize configuration',
  parameters: {
    layout: 'centered',
    reactRouter: {
      router: {
        path: '/event/:eventId',
        element: (
          <StyledFormFieldGenerator
            fields={[
              {
                id: 'storybook.file',
                type: FieldType.FILE,
                configuration: {
                  maxFileSize: 1 * 1024 * 1024,
                  acceptedFileTypes: ['image/jpeg'],
                  maxImageSize: {
                    targetSize: {
                      width: 200,
                      height: 200
                    }
                  },
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
            id="my-form"
            validatorContext={getTestValidatorContext(
              TestUserRole.enum.LOCAL_REGISTRAR
            )}
          />
        )
      },
      initialPath: '/event/123-kalsnk-213'
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Upload your captured photo')

    const fileInput = await canvas.findByRole('button', {
      name: /upload/i
    })

    const input = canvasElement.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement

    await step(
      'Opens up image resizing when image exceeds maxImageSize',
      async () => {
        await userEvent.click(fileInput)

        const largeImageFile = await createImageFile('largeImage.jpg', 400, 400)

        await userEvent.upload(input, largeImageFile)
        await canvas.findByText('Crop & resize image')
      }
    )

    await step('Clicking apply button adds the cropped image', async () => {
      const applyButton = await canvas.findByRole('button', {
        name: 'Apply'
      })
      await userEvent.click(applyButton)

      await canvas.findByRole('button', { name: 'Uploaded photo' })
    })
  }
}
