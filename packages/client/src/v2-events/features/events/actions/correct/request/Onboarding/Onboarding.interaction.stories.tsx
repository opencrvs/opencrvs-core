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
import type { Meta, StoryObj } from '@storybook/react-vite'
import { waitFor, within, userEvent, expect } from 'storybook/test'
import {
  ActionType,
  ActionUpdate,
  ConditionalType,
  EventConfig,
  field,
  FieldType,
  PageTypes,
  TENNIS_CLUB_MEMBERSHIP,
  generateEventConfig,
  generateEventDocument,
  generateEventDraftDocument,
  generateTranslationConfig,
  not,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { Onboarding as OnboardingIndex } from '@client/v2-events/features/events/actions/correct/request/index'
import {
  tennisClubMembershipEventDocument,
  passiveFileRoute
} from '@client/v2-events/features/events/fixtures'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { createImageFile } from '@client/tests/image-file'
import { handlers as defaultHandlers } from '../../../../../../../../.storybook/default-request-handlers'

const generator = testDataGenerator()

/**
 * Minimal two-page correction form reproducing a bug where an uploaded
 * FILE_WITH_OPTIONS document disappeared after navigating to another FORM
 * page and back, because the field seeded its own local state from its
 * value prop once at mount and never resynced with it.
 */
const eventConfigWithTwoPages = generateEventConfig({
  id: TENNIS_CLUB_MEMBERSHIP,
  fields: [],
  actions: [
    {
      type: ActionType.REQUEST_CORRECTION,
      label: generateTranslationConfig('Request correction'),
      correctionForm: {
        label: generateTranslationConfig('Correction form'),
        pages: [
          {
            id: 'documents',
            type: PageTypes.enum.FORM,
            title: {
              id: 'correction.documents.title',
              defaultMessage: 'Documents',
              description: 'Title for the documents page'
            },
            fields: [
              {
                id: 'documents.supportingDocs',
                type: FieldType.FILE_WITH_OPTIONS,
                configuration: {
                  maxFileSize: 5 * 1024 * 1024,
                  acceptedFileTypes: ['image/jpeg']
                },
                label: {
                  id: 'correction.documents.supportingDocs.label',
                  defaultMessage: 'Upload documents',
                  description: 'Label for the supporting documents field'
                },
                options: [
                  {
                    value: 'AFFIDAVIT',
                    label: {
                      id: 'correction.documents.affidavit.label',
                      defaultMessage: 'Affidavit',
                      description: 'Label for the affidavit option'
                    }
                  },
                  {
                    value: 'COURT_DOCUMENT',
                    label: {
                      id: 'correction.documents.courtDocument.label',
                      defaultMessage: 'Court Document',
                      description: 'Label for the court document option'
                    }
                  }
                ]
              }
            ]
          },
          {
            id: 'fees',
            type: PageTypes.enum.FORM,
            title: {
              id: 'correction.fees.title',
              defaultMessage: 'Fees',
              description: 'Title for the fees page'
            },
            fields: [
              {
                id: 'fees.amount',
                type: FieldType.NUMBER,
                label: {
                  id: 'correction.fees.amount.label',
                  defaultMessage: 'Fee total',
                  description: 'Label for the fee amount field'
                }
              }
            ]
          }
        ]
      }
    }
  ]
})

const meta: Meta<typeof OnboardingIndex> = {
  title: 'CorrectionRequest/Interaction',
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

type Story = StoryObj<typeof OnboardingIndex>

export const UploadedDocumentPersistsAcrossPageNavigation: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
    offline: {
      configs: [eventConfigWithTwoPages]
    },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.REQUEST_CORRECTION.ONBOARDING.buildPath({
        eventId: tennisClubMembershipEventDocument.id,
        pageId: 'documents'
      })
    },
    // Story-level `files` replaces (not merges with) the global default
    // handler group of the same name, so it's re-included here alongside
    // passiveFileRoute.
    msw: {
      handlers: {
        files: [...defaultHandlers.files, passiveFileRoute]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Upload a document on the documents page', async () => {
      // A generous timeout absorbs a cold Vite dev-server compile on first
      // navigation to this story, which can take several seconds before
      // anything renders.
      await waitFor(
        async () => {
          await expect(
            canvas.getByRole('button', { name: 'Continue' })
          ).toBeEnabled()
        },
        { timeout: 15000 }
      )

      const selectControl = canvasElement.querySelector(
        '.react-select__control'
      ) as HTMLElement
      await userEvent.click(selectControl)
      await userEvent.click(await canvas.findByText('Affidavit'))

      const input = canvasElement.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement
      // Must be a real, decodable image — a fake JPEG byte string uploads
      // fine but can never actually render in an <img>, regardless of
      // caching, so previewing it would always fail.
      const validFile = await createImageFile('affidavit.jpg', 100, 100)
      await userEvent.upload(input, validFile)

      await waitFor(async () => {
        await expect(
          canvas.getByRole('button', { name: 'Affidavit' })
        ).toBeInTheDocument()
      })
    })

    await step('Go to the fees page and back', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Continue' }))
      await canvas.findByText('Fee total')

      await userEvent.click(canvas.getByRole('button', { name: 'Go back' }))
      await canvas.findByText('Upload documents')
    })

    await step(
      'Uploaded document is still visible after navigating back',
      async () => {
        await expect(
          canvas.getByRole('button', { name: 'Affidavit' })
        ).toBeInTheDocument()
      }
    )

    await step('Clicking the file name opens it without an error', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Affidavit' }))

      // Both checks belong inside the same retrying waitFor: onError/onload
      // fire asynchronously, so a one-off check right after the click can
      // pass by observing the <img> before it has actually settled.
      await waitFor(async () => {
        await expect(
          canvas.queryByText('Failed to load document')
        ).not.toBeInTheDocument()

        const img = canvasElement.querySelector(
          'img'
        ) as HTMLImageElement | null
        await expect(img).not.toBeNull()
        await expect(Boolean(img?.complete && img.naturalWidth > 0)).toBe(true)
      })
    })
  }
}

// The age note is only relevant when the applicant's age is declared
const eventConfigWithAgeNote = {
  ...tennisClubMembershipEvent,
  actions: tennisClubMembershipEvent.actions.map((action) =>
    action.type !== ActionType.REQUEST_CORRECTION
      ? action
      : {
          ...action,
          correctionForm: {
            ...action.correctionForm,
            pages: [
              {
                id: 'correction-notes',
                type: PageTypes.enum.FORM,
                requireCompletionToContinue: false,
                title: generateTranslationConfig('Notes'),
                fields: [
                  {
                    id: 'correction.reason',
                    type: FieldType.TEXT,
                    label: generateTranslationConfig('Reason for correction')
                  },
                  {
                    id: 'correction.ageNote',
                    type: FieldType.TEXT,
                    label: generateTranslationConfig('Note on age'),
                    conditionals: [
                      {
                        type: ConditionalType.SHOW,
                        conditional: not(field('applicant.age').isFalsy())
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
  )
} satisfies EventConfig

function declaredEvent(declaration: ActionUpdate) {
  return generateEventDocument({
    configuration: eventConfigWithAgeNote,
    actions: [
      { type: ActionType.CREATE },
      { type: ActionType.DECLARE, declarationOverrides: declaration },
      { type: ActionType.REGISTER, declarationOverrides: declaration }
    ]
  })
}

const eventWithoutAge = declaredEvent({ 'applicant.dobUnknown': false })

export const ShowsCorrectionFieldRevealedByCorrectedDeclaration: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
    offline: {
      configs: [eventConfigWithAgeNote],
      events: [eventWithoutAge],
      drafts: [
        generateEventDraftDocument({
          eventId: eventWithoutAge.id,
          actionType: ActionType.REQUEST_CORRECTION,
          declaration: { 'applicant.dobUnknown': true, 'applicant.age': 30 }
        })
      ]
    },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.REQUEST_CORRECTION.ONBOARDING.buildPath({
        eventId: eventWithoutAge.id,
        pageId: 'correction-notes'
      })
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(
      await canvas.findByText('Note on age', {}, { timeout: 15000 })
    ).toBeInTheDocument()
  }
}

// applicant.age is hidden while applicant.dobUnknown is false, but the stored declaration still holds its value
const eventWithHiddenAge = declaredEvent({
  'applicant.dobUnknown': false,
  'applicant.dob': '1990-01-01',
  'applicant.age': 30
})

export const HiddenDeclarationValueDoesNotShowCorrectionField: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
    offline: {
      configs: [eventConfigWithAgeNote],
      events: [eventWithHiddenAge]
    },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.REQUEST_CORRECTION.ONBOARDING.buildPath({
        eventId: eventWithHiddenAge.id,
        pageId: 'correction-notes'
      })
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByText('Reason for correction', {}, { timeout: 15000 })
    await expect(canvas.queryByText('Note on age')).not.toBeInTheDocument()
  }
}
