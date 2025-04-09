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

import { fireEvent, within } from '@storybook/test'
import React from 'react'
import superjson from 'superjson'
import {
  AddressFieldValue,
  AddressType,
  ConditionalType,
  defineDeclarationForm,
  field,
  FieldType,
  TENNIS_CLUB_DECLARATION_FORM
} from '@opencrvs/commons/client'
import { AppRouter, TRPCProvider } from '@client/v2-events/trpc'
import { tennisClubMembershipEventDocument } from '@client/v2-events/features/events/fixtures'

import { useModal } from '@client/v2-events/hooks/useModal'
import { RejectionState, Review } from './Review'

const mockDeclaration = {
  'applicant.firstname': 'John',
  'applicant.surname': 'Doe',
  'applicant.dob': '1990-01-01',
  'applicant.address': {
    country: 'FAR',
    addressType: AddressType.DOMESTIC,
    province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
    district: '5ef450bc-712d-48ad-93f3-8da0fa453baa',
    street: '123 Tennis Club Avenue',
    number: '123',
    zipCode: 'Z12345',
    urbanOrRural: 'URBAN' as const,
    town: 'Tennisville',
    residentialArea: 'Example Residential Area'
  },
  'recommender.none': true
}

const meta: Meta<typeof Review.Body> = {
  title: 'Components/Review',
  component: Review.Body,
  args: {
    formConfig: TENNIS_CLUB_DECLARATION_FORM,
    form: mockDeclaration,
    onEdit: () => undefined,
    title: 'Member declaration for John Doe'
  },
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}

export default meta

type Story = StoryObj<typeof Review.Body>
const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

export const ReviewWithoutChanges: Story = {
  parameters: {
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.get.query(() => {
            return tennisClubMembershipEventDocument
          })
        ]
      }
    }
  }
}

const reviewActionMessages = {
  title: {
    id: 'v2.changeModal.title',
    defaultMessage: 'This is a title',
    description: 'The title for review action'
  },
  description: {
    id: 'v2.changeModal.description',
    defaultMessage: 'This is a description',
    description: 'The title for review action'
  },
  onConfirm: {
    id: 'ourOnConfirm',
    defaultMessage: 'Confirm test',
    description: 'The title for review action'
  },
  onReject: {
    id: 'ourOnReject',
    defaultMessage: 'Reject test',
    description: 'The title for review action'
  }
}

export const ChangeModalInteraction: StoryObj<typeof Review.Body> = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Open modal', async () => {
      const [changeButton] = await canvas.findAllByRole('button', {
        name: 'Change'
      })

      await fireEvent.click(changeButton)
    })

    await step('Close modal', async () => {
      const cancelButton = await canvas.findByRole('button', {
        name: 'Cancel'
      })

      await fireEvent.click(cancelButton)
    })
  },
  render: function Component() {
    const [modal, openModal] = useModal()

    async function handleDeclaration() {
      await openModal<boolean | null>((close) => (
        <Review.ActionModal.Accept action="Declare" close={close} />
      ))
    }

    async function handleRejection() {
      await openModal<RejectionState | null>((close) => (
        <Review.ActionModal.Reject close={close} />
      ))
    }

    async function handleEdit() {
      await openModal<boolean | null>((close) => (
        <Review.EditModal close={close}></Review.EditModal>
      ))

      return
    }

    return (
      <>
        <Review.Body
          form={mockDeclaration}
          formConfig={TENNIS_CLUB_DECLARATION_FORM}
          title="My test action"
          onEdit={handleEdit}
        >
          <Review.Actions
            incomplete={false}
            messages={reviewActionMessages}
            onConfirm={handleDeclaration}
            onReject={handleRejection}
          />
        </Review.Body>
        {modal}
      </>
    )
  }
}

export const ReviewWithValidationErrors: Story = {
  parameters: {
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.get.query(() => {
            return tennisClubMembershipEventDocument
          })
        ]
      }
    }
  },
  args: {
    form: {
      'applicant.firstname': 'Mia',
      // @ts-ignore
      'applicant.surname': undefined,
      // @ts-ignore
      'applicant.dob': undefined,
      'applicant.email': 'mia@',
      'applicant.address': {
        country: 'FAR',
        addressType: AddressType.DOMESTIC,
        province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
        urbanOrRural: 'RURAL',
        village: 'Tennisville'
      } as AddressFieldValue
    }
  },
  render: function Component() {
    const [modal, openModal] = useModal()

    async function handleRejection() {
      await openModal<RejectionState | null>((close) => (
        <Review.ActionModal.Reject close={close} />
      ))
    }
    return (
      <Review.Body
        form={this.args?.form || {}}
        formConfig={TENNIS_CLUB_DECLARATION_FORM}
        title="My test action"
        onEdit={() => undefined}
      >
        <Review.Actions
          incomplete={false}
          messages={reviewActionMessages}
          onConfirm={() => undefined}
          onReject={handleRejection}
        />
        {modal}
      </Review.Body>
    )
  }
}

export const ReviewWithConditionallyHiddenFields: Story = {
  parameters: {
    msw: {
      handlers: {
        event: [
          tRPCMsw.event.get.query(() => {
            return tennisClubMembershipEventDocument
          })
        ]
      }
    }
  },
  args: {
    form: {
      firstname: 'Mia∞$∞©@£$',
      'favourite-animal': 'cat',
      'are-you-feeling-all-right': true
    }
  },
  render: function Component() {
    const [modal, openModal] = useModal()

    async function handleRejection() {
      await openModal<RejectionState | null>((close) => (
        <Review.ActionModal.Reject close={close} />
      ))
    }
    return (
      <Review.Body
        form={this.args?.form || {}}
        formConfig={defineDeclarationForm({
          label: {
            id: 'declaration.form.label',
            defaultMessage:
              'Form for testing conditionally hidden fields on review page',
            description: ''
          },
          pages: [
            {
              id: 'page1',
              title: {
                id: 'page1.title',
                defaultMessage: 'Page 1 Title',
                description: ''
              },
              fields: [
                // This field should be hidden, since condition is not met
                {
                  id: 'firstname',
                  type: FieldType.TEXT,
                  conditionals: [
                    {
                      type: ConditionalType.DISPLAY_ON_REVIEW,
                      conditional: field('firstname').isValidEnglishName()
                    }
                  ],
                  label: {
                    defaultMessage: 'First name',
                    description: '',
                    id: 'firstname.label'
                  }
                },
                {
                  id: 'favourite-animal',
                  type: FieldType.RADIO_GROUP,
                  // This field should be shown, since both conditions are met
                  conditionals: [
                    {
                      type: ConditionalType.SHOW,
                      conditional: field('firstname').isEqualTo('Mia∞$∞©@£$')
                    },
                    {
                      type: ConditionalType.DISPLAY_ON_REVIEW,
                      conditional: field('favourite-animal').isEqualTo('cat')
                    }
                  ],
                  label: {
                    defaultMessage: 'Favourite animal',
                    description: '',
                    id: 'favourite-animal.label'
                  },
                  options: [
                    {
                      value: 'dog',
                      label: {
                        id: 'favourite-animal.dog',
                        defaultMessage: 'Dog',
                        description: ''
                      }
                    },
                    {
                      value: 'cat',
                      label: {
                        id: 'favourite-animal.cat',
                        defaultMessage: 'Cat',
                        description: ''
                      }
                    }
                  ]
                },
                // By default, checkboxes are hidden unless selected
                // I.e. this should be hidden
                {
                  id: 'has-it-been-a-nice-day',
                  type: FieldType.CHECKBOX,
                  conditionals: [],
                  label: {
                    defaultMessage: 'Has it been a nice day?',
                    description: '',
                    id: 'has-it-been-a-nice-day.label'
                  }
                },
                // This field should be shown, since its selected
                {
                  id: 'are-you-feeling-all-right',
                  type: FieldType.CHECKBOX,
                  conditionals: [],
                  label: {
                    defaultMessage: 'Are you feeling all right?',
                    description: '',
                    id: 'are-you-feeling-all-right.label'
                  }
                }
              ]
            }
          ]
        })}
        title="My review page for testing conditionally hidden fields"
        onEdit={() => undefined}
      >
        <Review.Actions
          incomplete={false}
          messages={reviewActionMessages}
          onConfirm={() => undefined}
          onReject={handleRejection}
        />
        {modal}
      </Review.Body>
    )
  }
}
