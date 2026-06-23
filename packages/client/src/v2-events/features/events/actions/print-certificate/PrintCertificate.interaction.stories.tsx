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

/* eslint-disable max-lines */

import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'

import { within, userEvent, expect, waitFor, fireEvent } from '@storybook/test'
import { Outlet } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import {
  ActionType,
  EventConfig,
  generateEventDocument,
  generateWorkqueues,
  getCurrentEventState,
  tennisClubMembershipEvent,
  never
} from '@opencrvs/commons/client'
import { tennisClubMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { AppRouter } from '@client/v2-events/trpc'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { mockOfflineData } from '@client/tests/mock-offline-data'
import { localDraftStore } from '@client/v2-events/features/drafts/useDrafts'
import { createImageFile } from '@client/tests/image-file'
import { setNavigatorOnline } from '@client/tests/storybook-utils'
import { CERT_TEMPLATE_ID } from '../../useCertificateTemplateSelectorFieldConfig'
import { useEventFormData } from '../../useEventFormData'
import { useActionAnnotation } from '../../useActionAnnotation'
import * as PrintCertificate from './index'

const meta: Meta<typeof PrintCertificate.Review> = {
  title: 'Print Certificate/Interaction'
}

export default meta

type Story = StoryObj<typeof PrintCertificate.Pages>
const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

export const NoTemplateAvailable: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.PRINT_CERTIFICATE.PAGES.buildPath({
        eventId: tennisClubMembershipEventDocument.id,
        pageId: 'collector'
      })
    },
    test: {
      // Ignoring the failed font request
      dangerouslyIgnoreUnhandledErrors: true
    },
    msw: {
      handlers: {
        config: [
          http.get(
            '/api/countryconfig/certificates/simple-certificate.svg',
            () => {
              return HttpResponse.text(
                `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><text x="10" y="20">Simple Certificate</text></svg>`
              )
            }
          ),
          http.get('/api/config', () => {
            return HttpResponse.json({
              systems: [],
              config: mockOfflineData.config,
              certificates: [
                {
                  id: 'simple-certificate',
                  isV2Template: true,
                  event: 'tennis-club-membership',
                  label: {
                    id: 'certificates.simple.certificate.copy',
                    defaultMessage: 'Simple Certificate copy',
                    description: 'The label for a simple certificate'
                  },
                  conditionals: [
                    {
                      type: 'SHOW',
                      conditional: never()
                    }
                  ],
                  isDefault: false,
                  fee: {
                    onTime: 7,
                    late: 10.6,
                    delayed: 18
                  },
                  svgUrl:
                    '/api/countryconfig/certificates/simple-certificate.svg'
                }
              ]
            })
          })
        ],
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.get.query(() => {
            return tennisClubMembershipEventDocument
          })
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      'Click Certification Type and find no options message',
      async () => {
        const selectControl = await canvas.findByTestId(
          'select__certificateTemplateId'
        )
        await fireEvent.mouseDown(selectControl)
        await expect(
          await canvas.findByText(
            'No template available for this event, contact Admin'
          )
        ).toBeInTheDocument()
      }
    )
  }
}

export const ContinuingAndGoingBack: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.PRINT_CERTIFICATE.PAGES.buildPath({
        eventId: tennisClubMembershipEventDocument.id,
        pageId: 'collector'
      })
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [tennisClubMembershipEvent]
          }),
          tRPCMsw.event.get.query(() => {
            return tennisClubMembershipEventDocument
          })
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Try continuing without filling the form', async () => {
      await expect(
        await canvas.findByText('Print certified copy')
      ).toBeInTheDocument()

      const continueButton = await canvas.findByRole('button', {
        name: 'Continue'
      })
      await userEvent.click(continueButton)
      const requiredErrors = await canvas.findAllByText('Required')

      await expect(requiredErrors.length).toBe(2)
    })

    await step(
      'Fill in the Certification Type and try continuing',
      async () => {
        await userEvent.click(
          await canvas.findByTestId('select__certificateTemplateId')
        )

        await userEvent.click(
          await canvas.findByText(
            'Tennis Club Membership Certificate certified copy'
          )
        )

        const continueButton = await canvas.findByRole('button', {
          name: 'Continue'
        })
        await userEvent.click(continueButton)
        const requiredErrors = await canvas.findAllByText('Required')

        await expect(requiredErrors.length).toBe(1)
      }
    )

    await step(
      "Fill in the Requester details and successfully continue to 'Verify their identity' page",
      async () => {
        await userEvent.click(
          await canvas.findByTestId('select__collector____requesterId')
        )

        await userEvent.click(
          await canvas.findByText('Print and issue Informant')
        )

        const continueButton = await canvas.findByRole('button', {
          name: 'Continue'
        })

        await userEvent.click(continueButton)

        await expect(
          canvas.getByText('Verify their identity')
        ).toBeInTheDocument()
      }
    )

    await step('Go back to the previous page', async () => {
      await userEvent.click(await canvas.findByRole('button', { name: 'Back' }))

      await expect(canvas.queryByText('Required')).not.toBeInTheDocument()
    })

    await step('Fill in other requester details and continue', async () => {
      await userEvent.click(
        await canvas.findByTestId('select__collector____requesterId')
      )

      await userEvent.click(
        await canvas.findByText('Print and issue someone else')
      )

      const continueButton = await canvas.findByRole('button', {
        name: 'Continue'
      })

      await userEvent.click(continueButton)
      const requiredErrorsAfter = await canvas.findAllByText('Required')

      await expect(requiredErrorsAfter.length).toBe(4)

      await userEvent.click(
        await canvas.findByTestId('select__collector____OTHER____idType')
      )

      await userEvent.click(await canvas.findByText('No ID'))

      await userEvent.type(
        await canvas.findByTestId('text__collector____OTHER____firstName'),
        'Nomen'
      )

      await userEvent.type(
        await canvas.findByTestId('text__collector____OTHER____lastName'),
        'Est Omen'
      )

      await userEvent.type(
        await canvas.findByTestId(
          'text__collector____OTHER____relationshipToMember'
        ),
        'Best friend'
      )

      await userEvent.click(continueButton)
      await expect(
        await canvas.findByRole('button', { name: 'Yes, print certificate' })
      ).toBeInTheDocument()
    })
  }
}

/**
 * Regression test for the print-certificate file-upload bug.
 *
 * This event config is consists of a modified print action form, where the SOMEONE_ELSE
 * collector has a page AFTER `collector` (collector.identity.verify) — so going Next then
 * Back is genuine in-form navigation that re-mounts the collector page.
 *
 * Before the FileInput fix the uploaded affidavit vanished on Back even though
 * the annotation store still held it; this drives that exact sequence and then
 * opens the preview. Here, we are going to test the file persists after going back,
 * and that clicking the link opens the preview as expected.
 */
const eventWithVisibleVerifyPage = {
  ...tennisClubMembershipEvent,
  actions: tennisClubMembershipEvent.actions.map((action) =>
    action.type === ActionType.PRINT_CERTIFICATE
      ? {
          ...action,
          printForm: {
            ...action.printForm,
            pages: action.printForm.pages.map((page) => {
              if (page.id === 'collector.identity.verify') {
                const { conditional, ...rest } = page
                return rest
              }
              return page
            })
          }
        }
      : action
  )
} as EventConfig

export const UploadedFilePersistsOnBackNavigation: Story = {
  // The annotation/form Zustand stores and the local draft are module-level
  // singletons that survive between runs. Without resetting them, a re-run
  // re-initialises the form from the previous run's data and the selects come
  // back pre-populated, failing the play steps.
  beforeEach: () => {
    useActionAnnotation.getState().clear()
    useEventFormData.getState().clear()
    localDraftStore.getState().setDraft(null)
  },
  parameters: {
    chromatic: { disableSnapshot: true },
    test: {
      // The optimistic upload fires a background POST /api/upload that has no
      // handler here; the value is set optimistically regardless.
      dangerouslyIgnoreUnhandledErrors: true
    },
    offline: {
      configs: [eventWithVisibleVerifyPage]
    },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.PRINT_CERTIFICATE.PAGES.buildPath({
        eventId: tennisClubMembershipEventDocument.id,
        pageId: 'collector'
      })
    },
    msw: {
      handlers: {
        upload: [
          http.post('/api/upload', () => {
            return HttpResponse.text('ok')
          })
        ],
        events: [
          tRPCMsw.event.get.query(() => {
            return tennisClubMembershipEventDocument
          })
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Fill the certificate template and requester', async () => {
      await userEvent.click(
        await canvas.findByTestId('select__certificateTemplateId')
      )
      await userEvent.click(
        await canvas.findByText(
          'Tennis Club Membership Certificate certified copy'
        )
      )
      await userEvent.click(
        await canvas.findByTestId('select__collector____requesterId')
      )
      await userEvent.click(
        await canvas.findByText('Print and issue someone else')
      )
    })

    await step('Fill the required "someone else" details', async () => {
      await userEvent.click(
        await canvas.findByTestId('select__collector____OTHER____idType')
      )
      await userEvent.click(await canvas.findByText('No ID'))

      await userEvent.type(
        await canvas.findByTestId('text__collector____OTHER____firstName'),
        'Nomen'
      )
      await userEvent.type(
        await canvas.findByTestId('text__collector____OTHER____lastName'),
        'Est Omen'
      )
      await userEvent.type(
        await canvas.findByTestId(
          'text__collector____OTHER____relationshipToMember'
        ),
        'Best friend'
      )
    })

    await step('Upload the signed affidavit', async () => {
      const input = canvasElement.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement

      // accepted types vary per config; clear accept so user-event doesn't drop it
      input.accept = ''
      await userEvent.upload(
        input,
        await createImageFile('signed-affidavit.jpg', 64, 64)
      )

      // Uploaded file preview link appears
      await canvas.findByRole('button', { name: /signed affidavit/i })
    })

    await step('Continue to the next page', async () => {
      await userEvent.click(
        await canvas.findByRole('button', { name: 'Continue' })
      )
      // We are now on the second page
      await canvas.findByText('Verify their identity')
    })

    await step('Go back to the collector page', async () => {
      await userEvent.click(await canvas.findByRole('button', { name: 'Back' }))
      await canvas.findByTestId('select__collector____requesterId')
    })

    await step(
      'Uploaded affidavit is still present after back-navigation',
      async () => {
        // Regression: before the FileInput fix this link was gone.
        await canvas.findByRole('button', { name: /signed affidavit/i })
      }
    )

    await step(
      'Clicking the upload link renders the image preview',
      async () => {
        await userEvent.click(
          await canvas.findByRole('button', { name: /signed affidavit/i })
        )
        await waitFor(async () => {
          await expect(
            canvasElement.querySelector('#preview_image_field')
          ).not.toBeNull()
        })
        await userEvent.click(await canvas.findByTestId('preview_close'))
      }
    )
  }
}

const generator = testDataGenerator()
const user = { id: generator.user.id.localRegistrar }

const eventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [
    { type: ActionType.CREATE, user },
    { type: ActionType.ASSIGN, user },
    { type: ActionType.DECLARE, user },
    { type: ActionType.REGISTER, user }
  ]
})

// All actions are created by the logged-in local registrar so the user is
// present in the users list the Review page looks them up in.
const registrar = { id: generator.user.id.localRegistrar }
const registeredEvent = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [
    { type: ActionType.CREATE, user: registrar },
    { type: ActionType.DECLARE, user: registrar },
    { type: ActionType.REGISTER, user: registrar }
  ]
})

export const PrintButtonDisabledWhenGoingOffline: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
    test: {
      // Since we cannot test the generated PDF, we can ignore the failed font request
      dangerouslyIgnoreUnhandledErrors: true
    },
    offline: {
      events: [registeredEvent],
      drafts: [
        generator.event.draft({
          eventId: registeredEvent.id,
          actionType: ActionType.PRINT_CERTIFICATE,
          annotation: {
            [CERT_TEMPLATE_ID]: 'tennis-club-membership-certified-certificate',
            'collector.requesterId': 'INFORMANT',
            'collector.identity.verify': true,
            templateId: 'tennis-club-membership-certified-certificate'
          }
        })
      ]
    },
    reactRouter: {
      router: {
        initialPath: '/',
        element: <Outlet />,
        children: [routesConfig]
      },
      initialPath: ROUTES.V2.EVENTS.PRINT_CERTIFICATE.REVIEW.buildPath(
        { eventId: registeredEvent.id },
        { templateId: 'tennis-club-membership-certificate' }
      )
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Open print confirmation modal while online', async () => {
      await userEvent.click(
        await canvas.findByRole('button', { name: 'Yes, print certificate' })
      )
      await canvas.findByText('Print certified copy?')
      await expect(canvas.getByTestId('confirm-print')).toBeEnabled()
      await expect(canvas.getByTestId('print-certificate')).toBeEnabled()
    })

    await step('Go offline — print button becomes disabled', async () => {
      setNavigatorOnline(false)

      await waitFor(async () => {
        await expect(canvas.getByTestId('confirm-print')).toBeDisabled()
      })
      await expect(canvas.getByTestId('print-certificate')).toBeDisabled()
    })

    await step('Go online — print button becomes enabled', async () => {
      setNavigatorOnline(true)

      await waitFor(async () => {
        await expect(canvas.getByTestId('confirm-print')).toBeEnabled()
      })
      await expect(canvas.getByTestId('print-certificate')).toBeEnabled()
    })
  }
}

export const RedirectAfterPrint: Story = {
  parameters: {
    chromatic: {
      disableSnapshot: true
    },
    test: {
      // Since we cannot test the generated PDF, we can ignore the failed font request
      dangerouslyIgnoreUnhandledErrors: true
    },
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.actions.assignment.unassign.mutation(() => {
            Object.assign(
              eventDocument,
              generateEventDocument({
                configuration: tennisClubMembershipEvent,
                actions: [
                  { type: ActionType.CREATE, user },
                  { type: ActionType.ASSIGN, user },
                  { type: ActionType.DECLARE, user },
                  { type: ActionType.REGISTER, user },
                  { type: ActionType.PRINT_CERTIFICATE, user },
                  { type: ActionType.UNASSIGN, user }
                ]
              })
            )
            return eventDocument
          }),
          tRPCMsw.event.actions.printCertificate.request.mutation(() => {
            Object.assign(
              eventDocument,
              generateEventDocument({
                configuration: tennisClubMembershipEvent,
                actions: [
                  { type: ActionType.CREATE, user },
                  { type: ActionType.ASSIGN, user },
                  { type: ActionType.DECLARE, user },
                  { type: ActionType.REGISTER, user },
                  { type: ActionType.PRINT_CERTIFICATE, user }
                ]
              })
            )
            return eventDocument
          }),
          tRPCMsw.event.search.query(() => {
            return {
              results: [
                getCurrentEventState(eventDocument, tennisClubMembershipEvent)
              ],
              total: 1
            }
          })
        ],
        workqueues: [
          tRPCMsw.workqueue.config.list.query(() => {
            return generateWorkqueues()
          }),
          tRPCMsw.workqueue.count.query((input) => {
            return input.reduce((acc, { slug }) => {
              return { ...acc, [slug]: 1 }
            }, {})
          })
        ]
      }
    },
    offline: {
      events: [eventDocument],

      drafts: [
        generator.event.draft({
          eventId: eventDocument.id,
          actionType: ActionType.PRINT_CERTIFICATE,
          annotation: {
            [CERT_TEMPLATE_ID]: 'tennis-club-membership-certified-certificate',
            'collector.requesterId': 'INFORMANT',
            'collector.identity.verify': true,
            templateId: 'tennis-club-membership-certified-certificate'
          }
        })
      ]
    },
    reactRouter: {
      router: {
        initialPath: '/',
        element: <Outlet />,
        children: [routesConfig]
      },
      initialPath: ROUTES.V2.EVENTS.PRINT_CERTIFICATE.REVIEW.buildPath(
        {
          eventId: eventDocument.id
        },
        {
          templateId: 'tennis-club-membership-certificate'
        }
      )
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Prompts confirmation on print', async () => {
      await userEvent.click(
        await canvas.findByRole('button', { name: 'Yes, print certificate' })
      )

      await canvas.findByText('Print certified copy?')
      await canvas.findByText(
        'This will generate a certified copy of the record for printing.'
      )

      await canvas.findByRole('button', { name: 'Cancel' })
    })

    await step('Redirects to overview after print', async () => {
      await userEvent.click(
        await canvas.findByRole('button', { name: 'Print' })
      )

      await waitFor(
        async () => {
          await canvas.findByText('Assigned to')
          await canvas.findByText('Certificate is ready to print')
        },
        { timeout: 7000 } // Generating the PDF takes a long time.
      )

      await expect(canvas.getByTestId('assignedTo-value')).toHaveTextContent(
        'Not assigned'
      )
    })
  }
}
