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
import { expect, within } from 'storybook/test'
import React from 'react'
import {
  ActionType,
  ConditionalType,
  EventConfig,
  field,
  FieldType,
  generateTranslationConfig,
  not,
  PageTypes,
  tennisClubMembershipEvent
} from '@opencrvs/commons/client'
import { TRPCProvider } from '@client/v2-events/trpc'
import { tennisClubMembershipEventDocument } from '@client/v2-events/features/events/fixtures'
import { withValidatorContext } from '../../../../../../../../.storybook/decorators'
import { CorrectionDetails } from './CorrectionDetails'

// Both the evidence page and the age note are only relevant when the applicant's age is declared
const eventConfiguration = {
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
                id: 'correction-evidence',
                type: PageTypes.enum.FORM,
                requireCompletionToContinue: false,
                title: generateTranslationConfig('Evidence'),
                conditional: not(field('applicant.age').isFalsy()),
                fields: [
                  {
                    id: 'correction.ageEvidence',
                    type: FieldType.TEXT,
                    label: generateTranslationConfig('Evidence of age')
                  }
                ]
              },
              {
                id: 'correction-notes',
                type: PageTypes.enum.FORM,
                requireCompletionToContinue: false,
                title: generateTranslationConfig('Notes'),
                fields: [
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

const meta: Meta<typeof CorrectionDetails> = {
  title: 'CorrectionRequest/CorrectionDetails/Interaction',
  component: CorrectionDetails,
  args: {
    event: tennisClubMembershipEventDocument,
    requesting: true
  },
  parameters: {
    chromatic: { disableSnapshot: true },
    offline: { configs: [eventConfiguration] }
  },
  decorators: [
    (Story, context) => (
      <TRPCProvider>
        <React.Suspense>
          <Story {...context} />
        </React.Suspense>
      </TRPCProvider>
    ),
    withValidatorContext
  ]
}

export default meta

type Story = StoryObj<typeof CorrectionDetails>

export const ShowsCorrectionFieldRevealedByCorrectedDeclaration: Story = {
  args: {
    form: { 'applicant.dobUnknown': true, 'applicant.age': 30 },
    annotation: { 'correction.ageEvidence': 'Birth certificate' }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await expect(
      await canvas.findByText('Birth certificate')
    ).toBeInTheDocument()
  }
}

// applicant.age is hidden while applicant.dobUnknown is false, but the form still holds its value
export const HiddenDeclarationValueDoesNotShowCorrectionField: Story = {
  args: {
    form: { 'applicant.dobUnknown': false, 'applicant.age': 30 },
    annotation: { 'correction.ageNote': 'Age from school records' }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    await canvas.findByText('Request correction(s)')
    await expect(
      canvas.queryByText('Age from school records')
    ).not.toBeInTheDocument()
  }
}
