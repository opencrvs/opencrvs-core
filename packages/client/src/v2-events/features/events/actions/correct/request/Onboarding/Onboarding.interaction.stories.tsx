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
  FieldType,
  PageTypes,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { Onboarding as OnboardingIndex } from '@client/v2-events/features/events/actions/correct/request/index'
import { tennisClubMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { testDataGenerator } from '@client/tests/test-data-generators'

const generator = testDataGenerator()

/**
 * Minimal two-page correction form reproducing a bug where an uploaded
 * FILE_WITH_OPTIONS document disappeared after navigating to another FORM
 * page and back, because the field seeded its own local state from its
 * value prop once at mount and never resynced with it.
 */
const eventConfigWithTwoPages = {
  ...tennisClubMembershipEvent,
  actions: tennisClubMembershipEvent.actions.map((action) => {
    if (action.type !== ActionType.REQUEST_CORRECTION) {
      return action
    }
    return {
      ...action,
      correctionForm: {
        ...action.correctionForm,
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
  })
}

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
      const validFile = new File(['a'.repeat(512)], 'affidavit.jpg', {
        type: 'image/jpeg'
      })
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
  }
}
