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
  generateActionDocument
} from '@opencrvs/commons/client'
import { ROUTES } from '@client/v2-events/routes'
import { AppRouter } from '@client/v2-events/trpc'
import { testDataGenerator } from '@client/tests/test-data-generators'
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
    label: {
      defaultMessage: 'Club Member',
      description: 'Label for option club member',
      id: 'v2.form.field.label.recommender.member'
    },
    value: 'MEMBER'
  },
  {
    label: {
      defaultMessage: 'Coach',
      description: 'Label for option coach',
      id: 'v2.form.field.label.recommender.coach'
    },
    value: 'COACH'
  },
  {
    label: {
      defaultMessage: 'Friend',
      description: 'Label for option friend',
      id: 'v2.form.field.label.recommender.friend'
    },
    value: 'FRIEND'
  },
  {
    label: {
      defaultMessage: 'Family',
      description: 'Label for option family',
      id: 'v2.form.field.label.recommender.family'
    },
    value: 'FAMILY'
  },
  {
    label: {
      defaultMessage: 'Other',
      description: 'Label for option other',
      id: 'v2.form.field.label.recommender.other'
    },
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
  id: 'overriddenEventConfig',
  declaration: defineDeclarationForm({
    ...tennisClubMembershipEvent.declaration,
    pages: [
      {
        id: 'recommender',
        title: {
          id: 'v2.event.tennis-club-membership.action.declare.form.section.recommender.title',
          defaultMessage: 'Who is recommending the applicant?',
          description: 'This is the title of the section'
        },
        fields: [
          {
            id: 'recommender.relation',
            type: FieldType.SELECT,
            required: true,
            label: {
              defaultMessage: 'Relationship to child',
              description: 'This is the label for the field',
              id: 'v2.event.birth.action.declare.form.section.recommender.field.relation.label'
            },
            options: recommenderOptions
          },
          {
            id: 'recommender.name',
            type: FieldType.NAME,
            hideLabel: true,
            required: true,
            label: {
              defaultMessage: "Recommender's name",
              description: 'This is the label for the field',
              id: 'v2.event.tennis-club-membership.action.declare.form.section.recommender.field.firstname.label'
            },
            parent: field('recommender.relation')
          },
          {
            id: 'recommender.dob',
            type: 'DATE',
            required: true,
            validation: [
              {
                message: {
                  defaultMessage: 'Must be a valid Birthdate',
                  description: 'This is the error message for invalid date',
                  id: 'v2.event.birth.action.declare.form.section.person.field.dob.error'
                },
                validator: field('recommender.dob').isBefore().now()
              },
              {
                message: {
                  defaultMessage:
                    "Birth date must be before child's birth date",
                  description:
                    "This is the error message for a birth date after child's birth date",
                  id: 'v2.event.birth.action.declare.form.section.person.dob.afterChild'
                },
                validator: field('recommender.dob')
                  .isBefore()
                  .date(field('child.dob'))
              }
            ],
            label: {
              defaultMessage: 'Date of birth',
              description: 'This is the label for the field',
              id: 'v2.event.birth.action.declare.form.section.person.field.dob.label'
            },
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
            label: {
              defaultMessage: 'Exact date of birth unknown',
              description: 'This is the label for the field',
              id: 'v2.event.birth.action.declare.form.section.person.field.age.checkbox.label'
            },
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
            type: FieldType.TEXT,
            required: true,
            label: {
              defaultMessage: 'Age of recommender',
              description: 'This is the label for the field',
              id: 'v2.event.birth.action.declare.form.section.recommender.field.age.label'
            },
            configuration: {
              postfix: {
                defaultMessage: 'years',
                description: 'This is the postfix for age field',
                id: 'v2.event.birth.action.declare.form.section.person.field.age.postfix'
              }
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
const generator = testDataGenerator()
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
        children: [router]
      },
      initialPath: ROUTES.V2.EVENTS.CORRECTION.REVIEW.buildPath({
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
    })
  }
}
