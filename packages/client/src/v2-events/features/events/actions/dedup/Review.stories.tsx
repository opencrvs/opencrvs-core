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
import { userEvent, within, expect } from '@storybook/test'
import {
  ActionType,
  createPrng,
  generateActionDocument,
  generateUuid,
  tennisClubMembershipEvent,
  generateTrackingId,
  defineDeclarationForm,
  FieldType,
  generateTranslationConfig,
  ConditionalType,
  field
} from '@opencrvs/commons/client'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { ReviewDuplicateIndex } from './ReviewDuplicate'

const meta: Meta<typeof ReviewDuplicateIndex> = {
  title: 'Duplicate/Review'
}

export default meta

type Story = StoryObj<typeof ReviewDuplicateIndex>

const prng = createPrng(123123)
const duplicates = [
  {
    id: generateUuid(prng),
    trackingId: generateTrackingId(prng)
  }
]
const overriddenEventConfig = {
  ...tennisClubMembershipEvent,
  declaration: defineDeclarationForm({
    ...tennisClubMembershipEvent.declaration,
    pages: tennisClubMembershipEvent.declaration.pages.map((x) => {
      x.fields = x.fields.filter((f) => f.type !== FieldType.EMAIL)
      if (x.id === 'applicant') {
        x.fields.push({
          id: 'applicant.contactMethod',
          type: FieldType.SELECT,
          label: generateTranslationConfig('Contact Method'),
          options: [
            { label: generateTranslationConfig('Email'), value: 'EMAIL' },
            { label: generateTranslationConfig('Phone'), value: 'PHONE' }
          ]
        })
        x.fields.push({
          id: 'applicant.contact',
          type: FieldType.PHONE,
          label: generateTranslationConfig('Contact'),
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('applicant.contactMethod').isEqualTo('PHONE')
            }
          ]
        })
        x.fields.push({
          id: 'applicant.contact',
          type: FieldType.EMAIL,
          label: generateTranslationConfig('Contact'),
          conditionals: [
            {
              type: ConditionalType.SHOW,
              conditional: field('applicant.contactMethod').isEqualTo('EMAIL')
            }
          ]
        })
      }
      return x
    })
  })
}
const actions = [
  generateActionDocument({
    configuration: overriddenEventConfig,
    action: ActionType.CREATE
  }),
  generateActionDocument({
    configuration: overriddenEventConfig,
    action: ActionType.DECLARE,
    defaults: {
      declaration: {
        'applicant.name': {
          firstname: 'Riku',
          surname: 'Rouvila'
        },
        'applicant.dob': '2025-01-23',
        'recommender.name': {
          firstname: 'Euan',
          surname: 'Millar'
        },
        'applicant.address': {
          country: 'FAR',
          addressType: 'DOMESTIC',
          province: 'a45b982a-5c7b-4bd9-8fd8-a42d0994054c',
          district: '27160bbd-32d1-4625-812f-860226bfb92a',
          urbanOrRural: 'URBAN',
          town: 'Example Town',
          residentialArea: 'Example Residential Area',
          street: 'Example Street',
          number: '55',
          zipCode: '123456'
        },
        'recommender.none': true
      },
      annotation: {
        'review.comment': 'asdasdasdasdasdasd'
      }
    }
  }),
  generateActionDocument({
    configuration: overriddenEventConfig,
    action: ActionType.DUPLICATE_DETECTED,
    defaults: {
      content: {
        duplicates
      }
    }
  })
]

const mockOriginalEvent = {
  trackingId: generateTrackingId(prng),
  type: overriddenEventConfig.id,
  actions,
  createdAt: new Date(Date.now()).toISOString(),
  id: generateUuid(prng),
  updatedAt: new Date(Date.now()).toISOString()
}

const mockDuplicateEvent = {
  trackingId: duplicates[0].trackingId,
  type: overriddenEventConfig.id,
  actions: actions.slice(0, 2),
  createdAt: new Date(Date.now()).toISOString(),
  id: duplicates[0].id,
  updatedAt: new Date(Date.now()).toISOString()
}

export const ReviewDuplicate: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.REVIEW_POTENTIAL_DUPLICATE.buildPath({
        eventId: mockOriginalEvent.id
      })
    },
    offline: {
      events: [mockOriginalEvent, mockDuplicateEvent]
    }
  }
}

export const ReviewComparison: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.REVIEW_POTENTIAL_DUPLICATE.buildPath({
        eventId: mockOriginalEvent.id
      })
    },
    offline: {
      events: [mockOriginalEvent, mockDuplicateEvent]
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const comparisonTab = await canvas.findByRole('button', {
      name: /243D49/i
    })
    await userEvent.click(comparisonTab)
  }
}

// Both events applicant.contactMethod is different
// but applicant.contact has the same label "Contact"
// This is to test that both fields are shown in the same comparison row
// and not just one of them
export const DuplicateWithSameLabels: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.REVIEW_POTENTIAL_DUPLICATE.buildPath({
        eventId: mockOriginalEvent.id
      })
    },
    offline: {
      events: [
        {
          ...mockOriginalEvent,
          actions: mockOriginalEvent.actions.map((x) => {
            if (x.type === ActionType.DECLARE) {
              return {
                ...x,
                declaration: {
                  ...x.declaration,
                  'applicant.contactMethod': 'EMAIL',
                  'applicant.contact': 'abc@gmail.com'
                }
              }
            }
            return x
          })
        },
        {
          ...mockDuplicateEvent,
          actions: mockDuplicateEvent.actions.map((x) => {
            if (x.type === ActionType.DECLARE) {
              return {
                ...x,
                declaration: {
                  ...x.declaration,
                  'applicant.contactMethod': 'PHONE',
                  'applicant.contact': '0912345678'
                }
              }
            }
            return x
          })
        }
      ]
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const comparisonTab = await canvas.findByRole('button', {
      name: /243D49/i
    })
    await userEvent.click(comparisonTab)

    const els = await canvas.findAllByText('Contact Method')
    await expect(els).toHaveLength(1) // only appears once

    await expect(canvas.getByText('Email')).toBeInTheDocument()
    await expect(canvas.getByText('abc@gmail.com')).toBeInTheDocument()

    await expect(canvas.getByText('Phone')).toBeInTheDocument()
    await expect(canvas.getByText('0912345678')).toBeInTheDocument()
  }
}
