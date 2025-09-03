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
import { testDataGenerator } from '@client/tests/test-data-generators'
import { EventOverviewLayout } from '@client/v2-events/layouts'
import { EventOverviewIndex } from '@client/v2-events/features/workqueues/EventOverview/EventOverview'
import { setEventData, addLocalEventConfig } from '../../../useEvents/api'
import { useEventFormData } from '../../../useEventFormData'
import { router } from './router'
import * as Request from './index'

const meta: Meta<typeof Request.Pages> = {
  title: 'CorrectionRequest'
}
export default meta

type Story = StoryObj<typeof Request.Pages>

// --- MSW setup ---
const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

// --- Event config overrides ---
const recommenderOptions = [
  { label: generateTranslationConfig('Club Member'), value: 'MEMBER' },
  { label: generateTranslationConfig('Coach'), value: 'COACH' },
  { label: generateTranslationConfig('Friend'), value: 'FRIEND' },
  { label: generateTranslationConfig('Family'), value: 'FAMILY' },
  { label: generateTranslationConfig('Other'), value: 'OTHER' }
]

const recommenderOtherThanClubMembers = and(
  not(field('recommender.relation').inArray(['MEMBER'])),
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
            required: true,
            hideLabel: true,
            label: generateTranslationConfig("Recommender's name"),
            conditionals: [
              {
                type: ConditionalType.SHOW,
                conditional: recommenderOtherThanClubMembers
              }
            ],
            parent: field('recommender.relation')
          },
          {
            id: 'recommender.dob',
            type: 'DATE',
            required: true,
            label: generateTranslationConfig('Date of birth'),
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
            conditionals: [
              {
                type: ConditionalType.SHOW,
                conditional: and(
                  not(field('recommender.dobUnknown').isEqualTo(true)),
                  recommenderOtherThanClubMembers
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
              { type: ConditionalType.DISPLAY_ON_REVIEW, conditional: never() }
            ],
            parent: field('recommender.relation')
          },
          {
            id: 'recommender.age',
            type: FieldType.TEXT,
            required: true,
            label: generateTranslationConfig('Age of recommender'),
            configuration: { postfix: generateTranslationConfig('years') },
            conditionals: [
              {
                type: ConditionalType.SHOW,
                conditional: and(
                  field('recommender.dobUnknown').isEqualTo(true),
                  recommenderOtherThanClubMembers
                )
              }
            ],
            parent: field('recommender.relation')
          }
        ]
      }
    ]
  })
}

// --- Event data ---
const overriddenEvent = {
  trackingId: generateUuid(),
  type: overriddenEventConfig.id,
  id: generateUuid(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  actions: [
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
          'recommender.dob': '1978-05-12'
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
}

const generator = testDataGenerator()
const draft = generator.event.draft({
  eventId: overriddenEvent.id,
  actionType: ActionType.REQUEST_CORRECTION
})

// --- Story ---
export const CleanedUpCorrectionPayload: Story = {
  beforeEach: () => {
    useEventFormData.setState({ formValues: {} })
    addLocalEventConfig(overriddenEventConfig)
    setEventData(overriddenEvent.id, overriddenEvent)
  },
  loaders: [
    async () => {
      window.localStorage.setItem(
        'opencrvs',
        generator.user.token.registrationAgent
      )
      // Avoid flaky state leakage when running stories in parallel
      await new Promise((r) => setTimeout(r, 50))
    }
  ],
  parameters: {
    mockingDate: new Date(),
    offline: {
      drafts: [
        {
          ...draft,
          action: {
            ...draft.action,
            // all of the fields in the below declaration is dependent on recommender.relation
            // ideally, all of the valid fields below should be available in the correction request endpoint.
            declaration: {
              'recommender.dob': '2002-05-12',
              'recommender.dobUnknown': true,
              'recommender.age': '45',
              'recommender.name': { firstname: 'Mohammed', surname: 'Karim' }
            }
          }
        }
      ]
    },
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
      initialPath: ROUTES.V2.EVENTS.REQUEST_CORRECTION.SUMMARY.buildPath({
        eventId: overriddenEvent.id
      })
    },
    msw: {
      handlers: {
        events: [tRPCMsw.event.config.get.query(() => [overriddenEventConfig])],
        event: [tRPCMsw.event.get.query(() => overriddenEvent)],
        actions: [
          tRPCMsw.event.actions.correction.request.request.mutation(
            async (payload) => {
              // all the valid fields are available in the correction request endpoint
              await expect(payload.declaration).toEqual({
                'recommender.dobUnknown': true,
                'recommender.age': '45',
                'recommender.name': { firstname: 'Mohammed', surname: 'Karim' }
              })
              // since recommender.dobKnown is true, recommender.dob is filtered in the client
              // before arriving to correction request endpoint
              await expect(payload.declaration).not.toHaveProperty(
                'recommender.dob'
              )
              return {
                ...overriddenEvent,
                actions: [
                  ...overriddenEvent.actions,
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
          ),
          tRPCMsw.event.actions.correction.approve.request.mutation(() => ({
            ...overriddenEvent,
            actions: [
              ...overriddenEvent.actions,
              generateActionDocument({
                configuration: overriddenEventConfig,
                action: ActionType.APPROVE_CORRECTION
              })
            ]
          }))
        ]
      }
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await waitFor(async () =>
      expect(
        canvas.getByRole('button', { name: 'Submit correction request' })
      ).toBeVisible()
    )

    await step('Submit correction request', async () => {
      await userEvent.click(
        canvas.getByRole('button', { name: 'Submit correction request' })
      )
      await userEvent.click(canvas.getByRole('button', { name: 'Confirm' }))
    })
  }
}
