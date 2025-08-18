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
import React, { useEffect } from 'react'
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
  TranslationConfig,
  never,
  defineDeclarationForm,
  footballClubMembershipEvent
} from '@opencrvs/commons/client'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { useDrafts } from '@client/v2-events/features/drafts/useDrafts'
import {
  tennisClubMembershipEventDocument,
  tennisClubMembershipEventWithCorrectionRequest
} from '@client/v2-events/features/events/fixtures'
import { ROUTES } from '@client/v2-events/routes'
import { AppRouter } from '@client/v2-events/trpc'
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

const generator = testDataGenerator()
const draft = testDataGenerator().event.draft({
  eventId: tennisClubMembershipEventDocument.id,
  actionType: ActionType.REQUEST_CORRECTION
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

export const FormFieldParentChildReset: Story = {
  parameters: {
    offline: {
      drafts: [draft]
    },
    reactRouter: {
      router: {
        path: '/',
        element: <Outlet />,
        children: [router]
      },
      initialPath: ROUTES.V2.EVENTS.CORRECTION.REVIEW.buildPath({
        eventId: tennisClubMembershipEventDocument.id
      })
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.config.get.query(() => {
            return [
              {
                ...tennisClubMembershipEvent,
                declaration: defineDeclarationForm({
                  ...tennisClubMembershipEvent.declaration,
                  pages: {
                    ...tennisClubMembershipEvent.declaration.pages.map(
                      (x, i) => {
                        if (i === 2) {
                          return {
                            ...x,
                            fields: [
                              {
                                id: 'recommender.none',
                                type: FieldType.CHECKBOX,
                                required: false,
                                conditionals: [],
                                label: {
                                  defaultMessage: 'No recommender',
                                  description:
                                    'This is the label for the field',
                                  id: 'v2.event.tennis-club-membership.action.declare.form.section.recommender.field.none.label'
                                }
                              },
                              {
                                id: 'recommender.relation',
                                type: FieldType.SELECT,
                                required: true,
                                conditionals: [
                                  {
                                    type: ConditionalType.SHOW,
                                    conditional:
                                      field('recommender.none').isFalsy()
                                  }
                                ],
                                label: {
                                  defaultMessage: 'Relationship to child',
                                  description:
                                    'This is the label for the field',
                                  id: 'v2.event.birth.action.declare.form.section.recommender.field.relation.label'
                                },
                                options: recommenderOptions
                              },
                              {
                                id: 'recommender.name',
                                type: FieldType.NAME,
                                hideLabel: true,
                                required: true,
                                conditionals: [
                                  {
                                    type: ConditionalType.SHOW,
                                    conditional:
                                      field('recommender.none').isFalsy()
                                  }
                                ],
                                label: {
                                  defaultMessage: "Recommender's name",
                                  description:
                                    'This is the label for the field',
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
                                      defaultMessage:
                                        'Must be a valid Birthdate',
                                      description:
                                        'This is the error message for invalid date',
                                      id: 'v2.event.birth.action.declare.form.section.person.field.dob.error'
                                    },
                                    validator: field('recommender.dob')
                                      .isBefore()
                                      .now()
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
                                  description:
                                    'This is the label for the field',
                                  id: 'v2.event.birth.action.declare.form.section.person.field.dob.label'
                                },
                                conditionals: [
                                  {
                                    type: ConditionalType.SHOW,
                                    conditional: and(
                                      not(
                                        field(
                                          'recommender.dobUnknown'
                                        ).isEqualTo(true)
                                      ),
                                      recommenderOtherThanClubMembers
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
                                  description:
                                    'This is the label for the field',
                                  id: 'v2.event.birth.action.declare.form.section.person.field.age.checkbox.label'
                                },
                                conditionals: [
                                  {
                                    type: ConditionalType.SHOW,
                                    conditional:
                                      field('recommender.none').isFalsy()
                                  },
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
                                  description:
                                    'This is the label for the field',
                                  id: 'v2.event.birth.action.declare.form.section.recommender.field.age.label'
                                },
                                configuration: {
                                  postfix: {
                                    defaultMessage: 'years',
                                    description:
                                      'This is the postfix for age field',
                                    id: 'v2.event.birth.action.declare.form.section.person.field.age.postfix'
                                  }
                                },
                                conditionals: [
                                  {
                                    type: ConditionalType.SHOW,
                                    conditional:
                                      field('recommender.none').isFalsy()
                                  },
                                  {
                                    type: ConditionalType.SHOW,
                                    conditional: and(
                                      field('recommender.dobUnknown').isEqualTo(
                                        true
                                      ),
                                      recommenderOtherThanClubMembers
                                    )
                                  }
                                ],
                                parent: field('recommender.relation')
                              },
                              {
                                id: 'recommender.id',
                                type: FieldType.TEXT,
                                required: true,
                                conditionals: [
                                  {
                                    type: ConditionalType.SHOW,
                                    conditional:
                                      field('recommender.none').isFalsy()
                                  }
                                ],
                                label: {
                                  defaultMessage: "Recommender's membership ID",
                                  description:
                                    'This is the label for the field',
                                  id: 'v2.event.tennis-club-membership.action.declare.form.section.recommender.field.id.label'
                                },
                                parent: field('recommender.relation')
                              }
                            ]
                          }
                        }
                        return x
                      }
                    )
                  }
                })
              }
            ]
          })
        ],
        event: [
          tRPCMsw.event.get.query(() => {
            return tennisClubMembershipEventDocument
          })
        ]
      }
    }
  }
  // play: async ({ canvasElement, step }) => {
  //   const canvas = within(canvasElement)

  //   await waitFor(async () => {
  //     await expect(
  //       canvas.getByRole('button', { name: 'Continue' })
  //     ).toBeDisabled()
  //   })

  //   await step('Change applicant values', async () => {
  //     await userEvent.click(
  //       canvas.getByTestId('change-button-applicant.address')
  //     )

  //     await userEvent.click(canvas.getByTestId('location__country'))
  //     await userEvent.type(canvas.getByTestId('location__country'), 'Far')
  //     await userEvent.click(canvas.getByText('Farajaland', { exact: true }))

  //     await userEvent.type(canvas.getByTestId('text__state'), 'My State')
  //     await userEvent.type(canvas.getByTestId('text__district2'), 'My District')
  //     await userEvent.click(canvas.getByRole('button', { name: 'Continue' }))
  //   })

  //   await step('Go back to review', async () => {
  //     await userEvent.click(
  //       canvas.getByRole('button', { name: 'Back to review' })
  //     )
  //     await waitFor(async () => {
  //       await expect(
  //         canvas.getByRole('button', { name: 'Continue' })
  //       ).toBeDisabled()
  //     })
  //   })

  //   await step("Check applicant's profile picture", async () => {
  //     const container = canvas.getByTestId('row-value-applicant.image')
  //     const buttons = within(container).getAllByRole('button', {
  //       name: "Applicant's profile picture"
  //     })
  //     await expect(buttons).toHaveLength(2)
  //     await userEvent.click(buttons[0])
  //     const closeButton = (await canvas.findAllByRole('button')).find(
  //       (btn) => btn.id === 'preview_close'
  //     )
  //     if (!closeButton) {
  //       throw new Error("Close button with id 'preview_close' not found")
  //     }
  //     await userEvent.click(closeButton)
  //   })

  //   await step('Change recommender values', async () => {
  //     await userEvent.click(canvas.getByTestId('change-button-recommender.id'))
  //     await userEvent.type(
  //       canvas.getByTestId('text__recommender____id'),
  //       '1234567890'
  //     )
  //   })

  //   await step('Go back to review', async () => {
  //     await userEvent.click(
  //       canvas.getByRole('button', { name: 'Back to review' })
  //     )
  //     await waitFor(async () => {
  //       await expect(
  //         canvas.getByRole('button', { name: 'Continue' })
  //       ).toBeEnabled()
  //     })
  //   })
  // }
}
