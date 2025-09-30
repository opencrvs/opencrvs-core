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
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import { userEvent, within, expect, waitFor } from '@storybook/test'
import {
  ActionType,
  tennisClubMembershipEvent,
  generateEventDocument,
  generateActionDocument,
  generateUuid,
  generateTranslationConfig,
  defineFormPage,
  PageTypes,
  FieldType,
  EventDocument,
  EventConfig
} from '@opencrvs/commons/client'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { AppRouter } from '@client/v2-events/trpc'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { setEventData, addLocalEventConfig } from '../../useEvents/api'
import { Review } from './index'

const generator = testDataGenerator()

const declareEventDocument = generateEventDocument({
  configuration: tennisClubMembershipEvent,
  actions: [ActionType.CREATE, ActionType.DECLARE]
})

const eventId = declareEventDocument.id

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

const meta: Meta<typeof Review> = {
  title: 'Review/Interaction/FileRemoval',
  loaders: [
    () => {
      window.localStorage.setItem(
        'opencrvs',
        generator.user.token.registrationAgent
      )
    }
  ]
}

export default meta

type Story = StoryObj<typeof Review>

export const RemovingExistingFileSendsNull: Story = {
  beforeEach: () => {
    /*
     * Ensure record is "downloaded offline" in the user's browser
     */
    addLocalEventConfig(tennisClubMembershipEvent)
    setEventData(eventId, declareEventDocument)
  },
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.VALIDATE.REVIEW.buildPath({
        eventId
      })
    },
    chromatic: { disableSnapshot: true },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.actions.validate.request.mutation(async (payload) => {
            await expect(payload.declaration).toEqual({
              'applicant.name': {
                firstname: 'John',
                surname: 'Smith'
              },
              'applicant.email': 'test@opencrvs.org',
              'applicant.dobUnknown': true,
              'applicant.age': 19,
              'applicant.image': null,
              'applicant.address': {
                country: 'FAR',
                addressType: 'DOMESTIC',
                province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
                district: '5ef450bc-712d-48ad-93f3-8da0fa453baa',
                urbanOrRural: 'URBAN',
                town: 'Example Town',
                residentialArea: 'Example Residential Area',
                street: 'Example Street',
                number: '55',
                zipCode: '123456'
              },
              'recommender.none': true
            })

            return generateEventDocument({
              configuration: tennisClubMembershipEvent,
              actions: [
                ActionType.CREATE,
                ActionType.DECLARE,
                ActionType.VALIDATE
              ]
            })
          })
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Remove existing file', async () => {
      const applicantAccordion = await canvas.findByTestId(
        'accordion-Accordion_applicant'
      )

      const changeAllButton = await within(applicantAccordion).findByRole(
        'button',
        {
          name: 'Change all'
        }
      )

      await userEvent.click(changeAllButton)
      await userEvent.click(await canvas.findByText('Continue'))

      await userEvent.click(
        await canvas.findByRole('button', {
          name: 'Delete attachment'
        })
      )

      await userEvent.click(
        await canvas.findByRole('button', {
          name: 'Back to review'
        })
      )
    })

    await step('Sends null for removed file', async () => {
      await canvas.findByText('No supporting documents')

      const sendForApprovalButton = await canvas.findByRole('button', {
        name: 'Send for approval'
      })

      await userEvent.click(sendForApprovalButton)

      const modal = within(await canvas.findByRole('dialog'))

      await modal.findByText('Send for approval?')

      await userEvent.click(
        await modal.findByRole('button', { name: 'Confirm' })
      )
    })
  }
}

const actions = [
  generateActionDocument({
    configuration: tennisClubMembershipEvent,
    action: ActionType.CREATE
  }),
  generateActionDocument({
    configuration: tennisClubMembershipEvent,
    action: ActionType.DECLARE,
    defaults: {
      annotation: {
        'review.signature': {
          type: 'image/png',
          originalFilename: 'signature.png',
          path: '/ocrvs/signature.png'
        }
      }
    }
  })
]

const declareEventWithSignature = {
  trackingId: generateUuid(),
  type: tennisClubMembershipEvent.id,
  actions,
  createdAt: new Date(Date.now()).toISOString(),
  id: generateUuid(),

  updatedAt: new Date(Date.now()).toISOString()
}

export const RemovingExistingSignatureSendsNull: Story = {
  beforeEach: () => {
    /*
     * Ensure record is "downloaded offline" in the user's browser
     */
    addLocalEventConfig(tennisClubMembershipEvent)
    setEventData(eventId, declareEventWithSignature)
  },
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.VALIDATE.REVIEW.buildPath({
        eventId
      })
    },
    chromatic: { disableSnapshot: true },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.actions.validate.request.mutation(async (payload) => {
            await expect(payload.annotation).toEqual({
              'review.signature': null
            })

            return generateEventDocument({
              configuration: tennisClubMembershipEvent,
              actions: [
                ActionType.CREATE,
                ActionType.DECLARE,
                ActionType.VALIDATE
              ]
            })
          })
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Remove signature and update', async () => {
      await userEvent.click(
        await canvas.findByRole('button', { name: 'Delete' })
      )

      const sendForApprovalButton = await canvas.findByRole('button', {
        name: 'Send for approval'
      })

      await userEvent.click(sendForApprovalButton)

      const modal = within(await canvas.findByRole('dialog'))

      await modal.findByText('Send for approval?')

      await userEvent.click(
        await modal.findByRole('button', { name: 'Confirm' })
      )
    })
  }
}

const multiFileConfig = {
  ...tennisClubMembershipEvent,
  id: 'death', // Use an existing event type id here, so that the user has the required scope to it
  declaration: {
    label: generateTranslationConfig('File club form'),
    pages: [
      defineFormPage({
        id: 'documents',
        type: PageTypes.enum.FORM,
        title: generateTranslationConfig('Upload supporting documents'),
        fields: [
          {
            id: 'documents.singleFile',
            type: FieldType.FILE,
            required: false,
            configuration: {},
            label: generateTranslationConfig('single file')
          },
          {
            id: 'documents.multiFile',
            type: FieldType.FILE_WITH_OPTIONS,
            required: false,
            label: generateTranslationConfig('multi file'),
            configuration: {},
            options: [
              {
                label: generateTranslationConfig('multi file option 1'),
                value: 'multifile1'
              },
              {
                label: generateTranslationConfig('multi file option 2'),
                value: 'multifile2'
              }
            ]
          }
        ]
      })
    ]
  }
} satisfies EventConfig

const fileDeclareActions = [
  generateActionDocument({
    configuration: multiFileConfig,
    action: ActionType.CREATE
  }),
  generateActionDocument({
    configuration: multiFileConfig,
    action: ActionType.DECLARE,
    defaults: {
      declaration: {
        'documents.singleFile': {
          type: 'image/svg+xml',
          originalFilename: 'tree.svg',
          path: '/ocrvs/tree.svg'
        },
        'documents.multiFile': [
          {
            type: 'image/svg+xml',
            originalFilename: 'multi-file-1.svg',
            path: '/ocrvs/fish.svg',
            option: 'multifile1'
          },
          {
            type: 'image/svg+xml',
            originalFilename: 'multi-file-2.svg',
            path: '/ocrvs/mountain.svg',
            option: 'multifile2'
          }
        ]
      }
    }
  })
]

const multiFileEvent = {
  trackingId: generateUuid(),
  type: multiFileConfig.id,
  actions: fileDeclareActions,
  createdAt: new Date(Date.now()).toISOString(),
  id: generateUuid(),
  updatedAt: new Date(Date.now()).toISOString()
} satisfies EventDocument

export const RemovingMultipleFilesDeletesAll: Story = {
  beforeEach: () => {
    /*
     * Ensure record is "downloaded offline" in the user's browser
     */
    addLocalEventConfig(multiFileConfig)
    setEventData(eventId, multiFileEvent)
  },
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.VALIDATE.REVIEW.buildPath({
        eventId
      })
    },
    chromatic: { disableSnapshot: true },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [multiFileConfig]
          }),
          tRPCMsw.event.actions.validate.request.mutation(async (payload) => {
            await expect(payload.declaration).toEqual({
              'documents.multiFile': [],
              'documents.singleFile': null
            })

            return generateEventDocument({
              configuration: multiFileConfig,
              actions: [
                ActionType.CREATE,
                ActionType.DECLARE,
                ActionType.VALIDATE
              ]
            })
          })
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    await step('Check files are present in review', async () => {
      const singleFileRefs = await canvas.findAllByText('single file')

      await expect(singleFileRefs).toHaveLength(3) // filename, title, option

      await canvas.findByText('multi file option 1')
      await canvas.findByText('multi file option 2')
    })

    await step('Remove all files', async () => {
      await userEvent.click(
        await canvas.findByRole('button', { name: 'Change all' })
      )

      await userEvent.click(await canvas.findByText('Continue'))

      // single file + 2 option files
      await expect(
        await canvas.findAllByRole('button', { name: 'Delete attachment' })
      ).toHaveLength(3)

      // Delete all attachments one by one. Use loop with query rather than findAllByRole once. They are not stable due internal workings of DocumentUploaderWithOption.
      for (let remaining = 3; remaining > 0; remaining--) {
        const [btn] = await canvas.findAllByRole('button', {
          name: 'Delete attachment'
        })
        await userEvent.click(btn)

        await waitFor(async () =>
          expect(
            canvas.queryAllByRole('button', { name: 'Delete attachment' })
          ).toHaveLength(remaining - 1)
        )
      }
    })

    await step('Clears file references and sends payload', async () => {
      await userEvent.click(
        await canvas.findByRole('button', {
          name: 'Back to review'
        })
      )
      await canvas.findByText('No supporting documents')

      await expect(
        canvas
          .getByTestId('row-value-documents.singleFile')
          .querySelector('del')
      ).toHaveTextContent('single file')

      await expect(
        canvas.getByTestId('row-value-documents.multiFile').querySelector('del')
      ).toHaveTextContent('multi file option 1')

      await expect(
        canvas.getByTestId('row-value-documents.multiFile').querySelector('del')
      ).toHaveTextContent('multi file option 2')

      const sendForApprovalButton = await canvas.findByRole('button', {
        name: 'Send for approval'
      })

      await userEvent.click(sendForApprovalButton)

      const modal = within(await canvas.findByRole('dialog'))

      await modal.findByText('Send for approval?')

      await userEvent.click(
        await modal.findByRole('button', { name: 'Confirm' })
      )
    })
  }
}
