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
import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import { Outlet } from 'react-router-dom'
import superjson from 'superjson'
import { expect, waitFor, within, userEvent } from '@storybook/test'
import {
  ActionType,
  and,
  not,
  ConditionalType,
  field,
  FieldType,
  tennisClubMembershipEvent,
  never,
  defineDeclarationForm,
  generateUuid,
  generateActionDocument,
  generateTranslationConfig
} from '@opencrvs/commons/client'
import { ROUTES } from '@client/v2-events/routes'
import { AppRouter } from '@client/v2-events/trpc'
import { EventOverviewLayout } from '@client/v2-events/layouts'
import { EventOverviewIndex } from '@client/v2-events/features/workqueues/EventOverview/EventOverview'
import { setEventData, addLocalEventConfig } from '../../../useEvents/api'
import { router } from './router'
import * as Request from './index'

const meta: Meta<typeof Request.Pages> = {
  title: 'CorrectionRequest'
}

export default meta

type Story = StoryObj<typeof Request.Pages>
const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

const RecommenderType = {
  MEMBER: 'MEMBER',
  COACH: 'COACH',
  FRIEND: 'FRIEND',
  FAMILY: 'FAMILY',
  OTHER: 'OTHER'
} as const

const recommenderOptions = [
  {
    label: generateTranslationConfig('Club Member'),
    value: 'MEMBER'
  },
  {
    label: generateTranslationConfig('Coach'),
    value: 'COACH'
  },
  {
    label: generateTranslationConfig('Friend'),
    value: 'FRIEND'
  },
  {
    label: generateTranslationConfig('Family'),
    value: 'FAMILY'
  },
  {
    label: generateTranslationConfig('Other'),
    value: 'OTHER'
  }
]
const recommenderOtherThanClubMembers = and(
  not(
    field('recommender.relation').inArray([
      RecommenderType.COACH,
      RecommenderType.MEMBER
    ])
  ),
  not(field('recommender.relation').isFalsy())
)

const overriddenEventConfig = {
  ...tennisClubMembershipEvent,
  id: 'death', // use an existing event id, so that permissions to it are in scopes
  declaration: defineDeclarationForm({
    ...tennisClubMembershipEvent.declaration,
    pages: [
      {
        id: 'recommender',
        title: generateTranslationConfig('Who is recommending the applicant?'),
        fields: [
          {
            id: 'recommender.relation',
            type: FieldType.SELECT,
            required: true,
            label: generateTranslationConfig('Relationship to child'),
            options: recommenderOptions
          },
          {
            id: 'recommender.name',
            type: FieldType.NAME,
            hideLabel: true,
            required: true,
            label: generateTranslationConfig("Recommender's name"),
            parent: field('recommender.relation')
          },
          {
            id: 'recommender.dob',
            type: 'DATE',
            required: true,
            validation: [
              {
                message: generateTranslationConfig('Must be a valid Birthdate'),
                validator: field('recommender.dob').isBefore().now()
              },
              {
                message: generateTranslationConfig(
                  "Birth date must be before child's birth date"
                ),
                validator: field('recommender.dob')
                  .isBefore()
                  .date(field('child.dob'))
              }
            ],
            label: generateTranslationConfig('Date of birth'),
            conditionals: [
              {
                type: ConditionalType.SHOW,
                conditional: not(
                  field('recommender.dobUnknown').isEqualTo(true)
                )
              }
            ],
            parent: field('recommender.relation')
          },
          {
            id: 'recommender.dobUnknown',
            type: FieldType.CHECKBOX,
            label: generateTranslationConfig('Exact date of birth unknown'),
            conditionals: [
              {
                type: ConditionalType.SHOW,
                conditional: recommenderOtherThanClubMembers
              },
              {
                type: ConditionalType.DISPLAY_ON_REVIEW,
                conditional: never()
              }
            ],
            parent: field('recommender.relation')
          },
          {
            id: 'recommender.age',
            type: FieldType.NUMBER,
            required: true,
            label: generateTranslationConfig('Age of recommender'),
            configuration: {
              postfix: generateTranslationConfig('years')
            },
            conditionals: [
              {
                type: ConditionalType.SHOW,
                conditional: field('recommender.dobUnknown').isEqualTo(true)
              }
            ],
            parent: field('recommender.relation')
          }
        ]
      }
    ]
  })
}

const overridenActions = [
  generateActionDocument({
    configuration: overriddenEventConfig,
    action: ActionType.CREATE
  }),
  generateActionDocument({
    configuration: overriddenEventConfig,
    action: ActionType.DECLARE,
    defaults: {
      declaration: {
        'recommender.relation': 'COACH',
        'recommender.name': { firstname: 'Mohammed', surname: 'Rahim' },
        'recommender.dob': '1978-05-12',
        'recommender.dobUnknown': false
      }
    }
  }),
  generateActionDocument({
    configuration: overriddenEventConfig,
    action: ActionType.VALIDATE,
    defaults: { declaration: {} }
  }),
  generateActionDocument({
    configuration: overriddenEventConfig,
    action: ActionType.REGISTER,
    defaults: { declaration: {} }
  })
]
const overridenEvent = {
  trackingId: generateUuid(),
  type: overriddenEventConfig.id,
  actions: overridenActions,
  createdAt: new Date(Date.now()).toISOString(),
  id: generateUuid(),
  updatedAt: new Date(Date.now()).toISOString()
}
export const FormFieldParentChildReset: Story = {
  beforeEach: () => {
    /*
     * Ensure record is "downloaded offline" in the user's browser
     */
    addLocalEventConfig(overriddenEventConfig)
    setEventData(overridenEvent.id, overridenEvent)
  },
  parameters: {
    reactRouter: {
      router: {
        path: '/',
        element: <Outlet />,
        children: [
          router,
          {
            path: ROUTES.V2.EVENTS.OVERVIEW.path,
            element: (
              <EventOverviewLayout>
                <EventOverviewIndex />
              </EventOverviewLayout>
            )
          }
        ]
      },
      initialPath: ROUTES.V2.EVENTS.REQUEST_CORRECTION.REVIEW.buildPath({
        eventId: overridenEvent.id
      })
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [overriddenEventConfig]
          })
        ],
        event: [
          tRPCMsw.event.get.query(() => {
            return overridenEvent
          })
        ],
        actions: [
          tRPCMsw.event.actions.correction.request.request.mutation(
            async (payload) => {
              await expect(payload.declaration).toEqual({
                'recommender.relation': 'FRIEND',
                'recommender.name': {
                  firstname: 'John',
                  middlename: '',
                  surname: 'Doe'
                },
                'recommender.dobUnknown': true,
                'recommender.age': 36
              })
              return {
                ...overridenEvent,
                actions: [
                  ...overridenEvent.actions,
                  generateActionDocument({
                    configuration: overriddenEventConfig,
                    action: ActionType.REQUEST_CORRECTION,
                    defaults: {
                      annotation: payload.annotation,
                      declaration: payload.declaration
                    }
                  })
                ]
              }
            }
          )
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await waitFor(async () => {
      await expect(
        canvas.getByRole('button', { name: 'Continue' })
      ).toBeVisible()
    })

    await step('Change recommender relation', async () => {
      await userEvent.click(
        canvas.getByTestId('change-button-recommender.relation')
      )
      await expect(canvas.getByTestId('text__firstname')).toHaveValue(
        'Mohammed'
      )
      await expect(canvas.getByTestId('text__surname')).toHaveValue('Rahim')
      await expect(canvas.getByTestId('recommender____dob-dd')).toHaveValue(12)
      await expect(canvas.getByTestId('recommender____dob-mm')).toHaveValue(5)
      await expect(canvas.getByTestId('recommender____dob-yyyy')).toHaveValue(
        1978
      )

      await userEvent.click(
        canvas.getByTestId('select__recommender____relation')
      )
      await userEvent.click(canvas.getByText('Friend', { exact: true }))
      await expect(canvas.getByTestId('text__firstname')).toHaveValue('')
      await expect(canvas.getByTestId('text__surname')).toHaveValue('')
      await expect(canvas.getByTestId('recommender____dob-dd')).toHaveValue(
        null
      )
      await expect(canvas.getByTestId('recommender____dob-mm')).toHaveValue(
        null
      )
      await expect(canvas.getByTestId('recommender____dob-yyyy')).toHaveValue(
        null
      )
      await userEvent.type(canvas.getByTestId('text__firstname'), 'John')
      await userEvent.type(canvas.getByTestId('text__surname'), 'Doe')

      await userEvent.click(
        await canvas.findByLabelText('Exact date of birth unknown')
      )
      await userEvent.type(canvas.getByTestId('text__recommender____age'), '36')
    })

    await step('Go back to review', async () => {
      await userEvent.click(
        canvas.getByRole('button', { name: 'Back to review' })
      )

      await expect(
        within(canvas.getByTestId('row-value-recommender.relation')).getByText(
          'Coach',
          { selector: 'del' }
        )
      ).toHaveTextContent('Coach')
      await expect(
        canvas.getByTestId('row-value-recommender.relation')
      ).toHaveTextContent('Friend')

      await expect(
        within(canvas.getByTestId('row-value-recommender.name')).getByText(
          'Mohammed Rahim',
          { selector: 'del' }
        )
      ).toHaveTextContent('Mohammed Rahim')
      await expect(
        canvas.getByTestId('row-value-recommender.name')
      ).toHaveTextContent('John Doe')

      await expect(
        within(canvas.getByTestId('row-value-recommender.age')).getByText('-', {
          selector: 'del'
        })
      ).toHaveTextContent('-')
      await expect(
        canvas.getByTestId('row-value-recommender.age')
      ).toHaveTextContent('36')

      await waitFor(async () => {
        await expect(
          canvas.getByRole('button', { name: 'Continue' })
        ).toBeEnabled()
      })

      await userEvent.click(canvas.getByRole('button', { name: 'Continue' }))
      await userEvent.click(
        canvas.getByRole('button', { name: 'Correct record' })
      )
      await userEvent.click(canvas.getByRole('button', { name: 'Confirm' }))
    })
  }
}
