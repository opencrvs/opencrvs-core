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
import { fn, within, expect, waitFor } from '@storybook/test'
import superjson from 'superjson'
import React from 'react'
import styled from 'styled-components'
import { userEvent } from '@storybook/testing-library'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import { http, HttpResponse } from 'msw'
import {
  ActionType,
  FieldType,
  generateEventDocument,
  generateTranslationConfig,
  MimeType,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { FormFieldGenerator } from '@client/v2-events/components/forms/FormFieldGenerator'
import { AppRouter, TRPCProvider } from '@client/v2-events/trpc'
import { TestImage } from '@client/v2-events/features/events/fixtures'
import { noop } from '@client/v2-events'

const meta: Meta<typeof FormFieldGenerator> = {
  title: 'Inputs/SignatureField/Interaction',
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

/**
 * Global variable to store the base64 representation of the signature PNG when testing drawing flow.
 * This is used to simulate the signature image that will be uploaded and displayed in the component.
 */
let signaturePngBase64 = ''

/**
 *
 * @param canvas HTMLCanvasElement
 * Draws a wiggly line simulating a signature on the provided canvas element.
 */
async function drawSignature(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect()

  const centerX = rect.width / 2
  const centerY = rect.height / 2

  const startX = centerX - 40
  const startY = centerY + 30

  const strokePoints = [
    { x: startX, y: startY },
    { x: startX, y: startY - 100 },
    { x: startX + 20, y: startY - 30 },
    { x: startX + 40, y: startY - 60 }
  ]

  const dispatchMouseEvent = (
    type: string,
    { x, y }: { x: number; y: number }
  ) => {
    canvas.dispatchEvent(
      new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        clientX: rect.left + x,
        clientY: rect.top + y
      })
    )
  }

  dispatchMouseEvent('mousedown', strokePoints[0])
  dispatchMouseEvent('mousemove', strokePoints[1])
  dispatchMouseEvent('mousemove', strokePoints[2])
  dispatchMouseEvent('mouseup', strokePoints[2])

  await new Promise((res) => setTimeout(res, 50)) // needs time to render the signature
  signaturePngBase64 = canvas.toDataURL(MimeType.enum['image/png'])
}

const StyledFormFieldGenerator = styled(FormFieldGenerator)`
  width: '400px';
`
const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

const createdEvent = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [ActionType.CREATE]
})

export const SignatureFileUpload: StoryObj<typeof StyledFormFieldGenerator> = {
  parameters: {
    layout: 'centered',
    reactRouter: {
      router: {
        path: '/event/:eventId',
        element: (
          <StyledFormFieldGenerator
            fields={[
              {
                id: 'storybook.signature',
                type: FieldType.SIGNATURE,
                configuration: {
                  maxFileSize: 1 * 1024 * 1024,
                  acceptedFileTypes: [MimeType.enum['image/png']]
                },
                signaturePromptLabel: generateTranslationConfig('Signature'),
                label: generateTranslationConfig('Upload signature')
              }
            ]}
            id="my-form"
            onChange={(data) => {
              meta.args?.onChange?.(data) ?? noop()
            }}
          />
        )
      },
      initialPath: '/event/123-abcd-213'
    },
    chromatic: { disableSnapshot: true },
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.get.query(() => {
            return createdEvent
          })
        ],
        files: [
          http.get('/api/presigned-url/:filePath*', (req) => {
            return HttpResponse.json({
              presignedURL: `http://localhost:3535/ocrvs/${req.params.filePath}`
            })
          }),
          http.get('http://localhost:3535/ocrvs/:eventId/:id', () => {
            return new HttpResponse(TestImage.Fish, {
              headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'no-cache'
              }
            })
          })
        ]
      }
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
      'Prevents upload of a signature file with an invalid file type',
      async () => {
        await userEvent.click(fileInput)

        const svgFile = new File(['treeSvg'], 'tree.svg', {
          type: MimeType.enum['image/svg+xml']
        })

        await userEvent.upload(input, svgFile)
        await canvas.findByText(
          'File format not supported. Please attach png (max 1mb)'
        )
      }
    )

    await step(
      'Prevents upload of a file with an invalid file size',
      async () => {
        const largeFile = new File(['a'.repeat(1024 * 1025)], 'large.png', {
          type: MimeType.enum['image/png']
        })

        await userEvent.upload(input, largeFile)
        await canvas.findByText('File size must be less than 1mb')
      }
    )

    await step('Accepts file of valid size and type', async () => {
      const filename = 'valid.jpg'
      const validFile = new File(['a'.repeat(512 * 512)], filename, {
        type: MimeType.enum['image/png']
      })

      await userEvent.upload(input, validFile)

      // alt text of the image
      await canvas.findByAltText('Signature')
    })
  }
}

const spies = {
  getImage: 0
}

export const SignatureCanvasUpload: StoryObj<typeof StyledFormFieldGenerator> =
  {
    parameters: {
      layout: 'centered',
      chromatic: { disableSnapshot: true },
      reactRouter: {
        router: {
          path: '/event/:eventId',
          element: (
            <StyledFormFieldGenerator
              fields={[
                {
                  id: 'storybook.signature',
                  type: FieldType.SIGNATURE,
                  configuration: {
                    maxFileSize: 1 * 1024 * 1024,
                    acceptedFileTypes: ['image/png']
                  },
                  signaturePromptLabel: generateTranslationConfig('Signature'),
                  label: generateTranslationConfig('Upload signature')
                }
              ]}
              id="my-form"
              onChange={(data) => {
                meta.args?.onChange?.(data) ?? noop()
              }}
            />
          )
        },
        initialPath: '/event/123-abcd-213'
      },
      msw: {
        handlers: {
          event: [
            tRPCMsw.event.get.query(() => {
              return createdEvent
            })
          ],
          files: [
            http.get('/api/presigned-url/:filePath*', (req) => {
              return HttpResponse.json({
                presignedURL: `http://localhost:3535/ocrvs/${req.params.filePath}`
              })
            }),
            http.post('/api/upload', () => {
              return HttpResponse.text(
                `uploaded-image-${new Date().getTime()}.jpg`
              )
            }),
            http.get('http://localhost:3535/ocrvs/:id', async () => {
              spies.getImage++
              const response = await fetch(signaturePngBase64)
              const binary = new Uint8Array(await response.arrayBuffer())

              return new HttpResponse(binary, {
                headers: {
                  'Content-Type': MimeType.enum['image/png'],
                  'Cache-Control': 'no-cache'
                }
              })
            }),
            http.get('http://localhost:3535/ocrvs/:eventId/:id', async () => {
              spies.getImage++
              const response = await fetch(signaturePngBase64)
              const binary = new Uint8Array(await response.arrayBuffer())

              return new HttpResponse(binary, {
                headers: {
                  'Content-Type': MimeType.enum['image/png'],
                  'Cache-Control': 'no-cache'
                }
              })
            })
          ]
        }
      }
    },
    play: async ({ canvasElement, step }) => {
      const canvas = within(canvasElement)

      await step(
        'Opens up signature prompt when clicking on the sign button',
        async () => {
          await userEvent.click(
            await canvas.findByRole('button', {
              name: 'Sign'
            })
          )

          await canvas.findByText('Signature')

          await expect(
            await canvas.findByText(
              'By signing this document with an electronic signature, I agree that such signature will be valid as handwritten signatures to the extent allowed by the laws of Farajaland.'
            )
          ).toBeVisible()

          await canvas.findByRole('button', {
            name: 'Cancel'
          })
          await expect(
            await canvas.findByRole(
              'button',
              {
                name: 'Apply'
              },
              { timeout: 2000 }
            )
          ).toBeDisabled()
        }
      )

      await step('Draws a signature on the canvas, allows saving', async () => {
        const signatureCanvas = canvasElement.querySelector(
          '#storybook____signature_canvas_element'
        )

        if (!signatureCanvas) {
          throw new Error('Signature canvas not found')
        }

        await drawSignature(signatureCanvas as HTMLCanvasElement)

        const applyButton = await canvas.findByRole('button', {
          name: 'Apply'
        })

        await expect(applyButton).not.toBeDisabled()
        applyButton.click()

        await waitFor(async () => {
          await expect(spies.getImage).toBe(2) // first is the initial fetch, second is after signature is applied
        })
      })
    }
  }
