 
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
import { within, expect, waitFor } from '@storybook/test'
import superjson from 'superjson'
import React from 'react'
import styled from 'styled-components'
import { userEvent } from '@storybook/testing-library'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import { http, HttpResponse } from 'msw'
import {
  ActionType,
  DocumentPath,
  FieldType,
  generateEventDocument,
  generateTranslationConfig,
  MimeType,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import {
  FormFieldGenerator,
  type FormFieldGeneratorHandle
} from '@client/v2-events/components/forms/FormFieldGenerator'
import { AppRouter, TRPCProvider } from '@client/v2-events/trpc'
import { TestImage } from '@client/v2-events/features/events/fixtures'
import { shouldBypassLock } from '@client/utils/lockBypass'
import { getTestValidatorContext } from '../../../../../../.storybook/decorators'
import { SignatureField } from './SignatureField'

const meta: Meta<typeof FormFieldGenerator> = {
  title: 'Inputs/SignatureField/Interaction',
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
}

const StyledFormFieldGenerator = styled(FormFieldGenerator)`
  width: '400px';
`

const noDuplicateErrorFormRef = React.createRef<FormFieldGeneratorHandle>()
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
  actions: [{ type: ActionType.CREATE }]
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
            validatorContext={getTestValidatorContext()}
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

/**
 * Regression test for the mobile PIN-lock-during-upload fix.
 *
 * Every uploader that opens a native picker — `SignatureField`,
 * `SimpleDocumentUploader` (FILE), and `DocumentUploaderWithOption`
 * (FILE_WITH_OPTIONS) — must arm the bypass flag (via `setLockBypass`)
 * before the picker is invoked. Otherwise `ProtectedPage` triggers the
 * PIN re-lock as soon as the picker sends the page to background,
 * interrupting the upload mid-flow.
 *
 * Renders all three uploaders on the same form and checks each Upload
 * button in turn. Asserts via `shouldBypassLock()` — the same call
 * `ProtectedPage` would make on a visibility transition. Single-shot:
 * the second call must return `false` so a later real background still
 * triggers the PIN.
 */
export const UploadButtonsArmLockBypass: StoryObj<
  typeof StyledFormFieldGenerator
> = {
  name: 'Upload buttons arm PIN-lock bypass (Signature / File / FileWithOptions)',
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
              },
              {
                id: 'storybook.file',
                type: FieldType.FILE,
                configuration: {
                  maxFileSize: 1 * 1024 * 1024,
                  acceptedFileTypes: [MimeType.enum['image/png']]
                },
                label: generateTranslationConfig('Upload document')
              },
              {
                id: 'storybook.fileWithOption',
                type: FieldType.FILE_WITH_OPTIONS,
                configuration: {
                  maxFileSize: 1 * 1024 * 1024,
                  acceptedFileTypes: [MimeType.enum['image/png']]
                },
                label: generateTranslationConfig('Upload supporting document'),
                options: [
                  {
                    value: 'forest',
                    label: generateTranslationConfig('Forest')
                  },
                  {
                    value: 'beach',
                    label: generateTranslationConfig('Beach')
                  }
                ]
              }
            ]}
            id="my-form"
            validatorContext={getTestValidatorContext()}
          />
        )
      },
      initialPath: '/event/123-abcd-213'
    },
    chromatic: { disableSnapshot: true }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    /**
     * Both `formMessages.uploadFile` and `buttonMessages.upload` resolve to
     * the string "Upload", so all three uploader buttons share that name.
     * `findAllByRole` returns them in DOM order, which matches the order of
     * the `fields` array above: [signature, file, fileWithOption].
     */
    const getUploadButtons = async () =>
      canvas.findAllByRole('button', { name: 'Upload' })

    /**
     * Dispatching a `focus` event on `window` simulates the user returning
     * from the native picker / camera / external app — the same signal the
     * lockBypass module listens for to clear the pending bypass.
     */
    const simulateReturnFromPicker = () =>
      window.dispatchEvent(new Event('focus'))

    await step('Bypass flag is not armed before user interacts', async () => {
      // Drain any pending bypass a previous story may have left behind.
      simulateReturnFromPicker()
      await expect(shouldBypassLock()).toBe(false)
    })

    await step(
      'SignatureField upload arms the bypass, focus return clears it',
      async () => {
        const [signatureUpload] = await getUploadButtons()
        await userEvent.click(signatureUpload)

        // Upload click armed the bypass — repeated reads stay true because
        // shouldBypassLock is a pure query.
        await expect(shouldBypassLock()).toBe(true)
        await expect(shouldBypassLock()).toBe(true)

        // User returns from the picker → focus listener clears the flag,
        // so a later real background event still triggers the PIN re-lock.
        simulateReturnFromPicker()
        await expect(shouldBypassLock()).toBe(false)
      }
    )

    await step(
      'FILE field upload arms the bypass, focus return clears it',
      async () => {
        const [, fileUpload] = await getUploadButtons()
        await userEvent.click(fileUpload)

        await expect(shouldBypassLock()).toBe(true)

        simulateReturnFromPicker()
        await expect(shouldBypassLock()).toBe(false)
      }
    )

    await step(
      'FILE_WITH_OPTIONS upload arms the bypass, focus return clears it',
      async () => {
        // The Upload button is disabled until a document type is picked.
        // Open the react-select dropdown and choose an option to enable it.
        const selectControl = canvasElement.querySelector(
          '.react-select__control'
        ) as HTMLElement
        await userEvent.click(selectControl)
        await userEvent.click(await canvas.findByText('Forest'))

        const [, , fileWithOptionUpload] = await getUploadButtons()
        await userEvent.click(fileWithOptionUpload)

        await expect(shouldBypassLock()).toBe(true)

        simulateReturnFromPicker()
        await expect(shouldBypassLock()).toBe(false)
      }
    )
  }
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
              validatorContext={getTestValidatorContext()}
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
          await waitFor(async () =>
            expect(
              canvas.getByText(
                'By signing this document with an electronic signature, I agree that such signature will be valid as handwritten signatures to the extent allowed by the laws of Farajaland.'
              )
            ).toBeVisible()
          )

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

        // Assert the signature preview becomes visible. Previously this
        // counted MSW handler invocations, which was flaky because the exact
        // number of image fetches depends on React 18 / React Query / MSW
        // timing.
        await canvas.findByAltText('Signature')
      })
    }
  }

/**
 * Regression test for: duplicate "Required" error appearing after deleting a signature.
 *
 * Root cause: SignatureFieldInput had its own local <InputError> that rendered
 * "Required" when local `touched` was true (set by the delete button's onClick)
 * and the field was empty. At the same time, InputField was already rendering
 * "Required" from Formik's meta.error + meta.touched — producing two identical
 * error messages simultaneously.
 *
 * Fix: removed all local "Required" rendering from SignatureFieldInput. InputField
 * is now the sole error renderer for validation errors.
 */
export const NoDuplicateErrorAfterDelete: StoryObj<
  typeof StyledFormFieldGenerator
> = {
  name: 'No duplicate "Required" error after deleting signature',
  parameters: {
    layout: 'centered',
    chromatic: { disableSnapshot: true },
    reactRouter: {
      router: {
        path: '/event/:eventId',
        element: (
          <StyledFormFieldGenerator
            ref={noDuplicateErrorFormRef}
            fields={[
              {
                id: 'storybook.signature',
                type: FieldType.SIGNATURE,
                required: true,
                configuration: {
                  maxFileSize: 1 * 1024 * 1024,
                  acceptedFileTypes: [MimeType.enum['image/png']]
                },
                signaturePromptLabel: generateTranslationConfig('Signature'),
                label: generateTranslationConfig('Upload signature')
              }
            ]}
            formTouched={{ 'storybook.signature': true }}
            formValues={{
              'storybook.signature': {
                path: 'signature-test.png' as DocumentPath,
                originalFilename: 'signature-test.png',
                type: MimeType.enum['image/png']
              }
            }}
            id="my-form"
            validatorContext={getTestValidatorContext()}
          />
        )
      },
      initialPath: '/event/123-abcd-213'
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Signature preview is visible', async () => {
      await canvas.findByAltText('Signature')
    })

    await step('Delete the signature', async () => {
      await userEvent.click(
        await canvas.findByRole('button', { name: 'Delete' })
      )
    })

    await step('Trigger validation via submit', () => {
      noDuplicateErrorFormRef.current?.submit()
    })

    await step('Exactly one Required error — no duplicate', async () => {
      await waitFor(async () =>
        expect(canvas.getAllByText('Required')).toHaveLength(1)
      )
    })
  }
}

export const ToCertificateVariables: StoryObj<typeof FormFieldGenerator> = {
  name: 'Certificate Variables',
  parameters: { layout: 'centered' },
  render: function Component() {
    const withValue = SignatureField.toCertificateVariables({
      path: 'events/birth-123/signature.png' as DocumentPath,
      originalFilename: 'signature.png',
      type: MimeType.enum['image/png']
    })

    const withUndefined = SignatureField.toCertificateVariables(undefined)

    return (
      <div>
        <div data-testid="with-value">{withValue}</div>
        <div data-testid="with-undefined">{withUndefined}</div>
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(await canvas.findByTestId('with-value')).toHaveTextContent(
      '/events/birth-123/signature.png'
    )
    await expect(await canvas.findByTestId('with-undefined')).toHaveTextContent(
      ''
    )
  }
}
