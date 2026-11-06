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
import { userEvent, within, expect } from 'storybook/test'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import {
  ActionType,
  createPrng,
  generateActionDocument,
  generateActionDocuments,
  generateUuid,
  tennisClubMembershipEvent,
  generateTrackingId,
  defineDeclarationForm,
  FieldType,
  generateTranslationConfig,
  ConditionalType,
  field,
  ActionUpdate,
  ActionDocument,
  UUID,
  withDeclaration,
  getDeclaration,
  getDeclarationPages,
  INITIAL_EVENT_CONFIG_VERSION_ID,
  DEFAULT_EFFECTIVE_FROM,
  EventConfig,
  FieldConfig,
  VersionedEventConfig,
  toVersionedEventConfig
} from '@opencrvs/commons/client'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { AppRouter } from '@client/v2-events/trpc'
import {
  addLocalEventConfig,
  setEventData,
  updateLocalEventIndex
} from '@client/v2-events/features/events/useEvents/api'
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

const overriddenEventConfig = withDeclaration(
  tennisClubMembershipEvent,
  defineDeclarationForm({
    ...getDeclaration(tennisClubMembershipEvent),
    pages: getDeclarationPages(tennisClubMembershipEvent).map((x) => {
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
)

const declarationObj = {
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
    administrativeArea: '27160bbd-32d1-4625-812f-860226bfb92a',
    streetLevelDetails: {
      town: 'Example Town',
      residentialArea: 'Example Residential Area',
      street: 'Example Street',
      number: '55',
      zipCode: '123456',
      state: 'Example State',
      district2: 'Example District 2'
    }
  },
  'recommender.none': true
} satisfies ActionUpdate

const actions = [
  generateActionDocument({
    configuration: overriddenEventConfig,
    action: ActionType.CREATE
  }),
  ...generateActionDocuments({
    configuration: overriddenEventConfig,
    action: ActionType.DECLARE,
    defaults: {
      declaration: declarationObj,
      annotation: {
        'review.comment': 'asdasdasdasdasdasd'
      }
    }
  }),
  ...generateActionDocuments({
    configuration: overriddenEventConfig,
    action: ActionType.REGISTER,
    defaults: {
      declaration: declarationObj
    }
  }),
  generateActionDocument({
    configuration: overriddenEventConfig,
    action: ActionType.DUPLICATE_DETECTED,
    defaults: {
      declaration: declarationObj, // Same as DECLARE action details
      content: {
        duplicates
      }
    }
  })
]

const mockOriginalEvent = {
  trackingId: generateTrackingId(prng),
  configVersionId: INITIAL_EVENT_CONFIG_VERSION_ID,
  type: overriddenEventConfig.id,
  actions,
  createdAt: new Date(Date.now()).toISOString(),
  id: generateUuid(prng),
  updatedAt: new Date(Date.now()).toISOString()
}

const mockDuplicateEvent = {
  trackingId: duplicates[0].trackingId,
  configVersionId: INITIAL_EVENT_CONFIG_VERSION_ID,
  type: overriddenEventConfig.id,
  // CREATE and the Requested + Accepted DECLARE pair
  actions: actions.slice(0, 3).concat(
    generateActionDocuments({
      configuration: overriddenEventConfig,
      action: ActionType.REGISTER,
      defaults: {
        // Test with location id so both it and administrative area are shown in the comparison
        createdAtLocation: '1f4a5b6c-7d8e-4312-8abc-345678901234' as UUID
      }
    })
  ),
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
            if (
              x.type === ActionType.DECLARE ||
              x.type === ActionType.REGISTER
            ) {
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
            if (
              x.type === ActionType.DECLARE ||
              x.type === ActionType.REGISTER
            ) {
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

    await canvas.findByText('Phone')
    await canvas.findByText('0912345678')
  }
}

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

function withApplicantFields(
  config: EventConfig,
  fields: FieldConfig[]
): EventConfig {
  return withDeclaration(
    config,
    defineDeclarationForm({
      ...getDeclaration(config),
      pages: getDeclarationPages(config).map((page) =>
        page.id === 'applicant'
          ? {
              ...page,
              fields: [
                // `overriddenEventConfig` adds these to the shared fixture. They are not
                // part of this comparison.
                ...page.fields.filter(
                  ({ id }) =>
                    !['applicant.contactMethod', 'applicant.contact'].includes(
                      id
                    )
                ),
                ...fields
              ]
            }
          : page
      )
    })
  )
}

function sexField(label: string): FieldConfig {
  return {
    id: 'applicant.sex',
    type: FieldType.SELECT,
    label: generateTranslationConfig(label),
    options: [
      { label: generateTranslationConfig('Female'), value: 'female' },
      { label: generateTranslationConfig('Male'), value: 'male' }
    ]
  }
}

// The potential duplicate was created under v1, the record under review under v2.
// v2 renames "Sex" to "Gender", stops capturing "Weight at birth" and starts capturing
// "Membership tier".
const v1Config = withApplicantFields(tennisClubMembershipEvent, [
  sexField('Sex'),
  {
    id: 'applicant.weightAtBirth',
    type: FieldType.NUMBER,
    label: generateTranslationConfig('Weight at birth')
  }
])

const v2Config = withApplicantFields(tennisClubMembershipEvent, [
  sexField('Gender'),
  {
    id: 'applicant.membershipTier',
    type: FieldType.TEXT,
    label: generateTranslationConfig('Membership tier')
  }
])

const [v1Version] = toVersionedEventConfig(v1Config).versions
const [v2Version] = toVersionedEventConfig(v2Config).versions

const versionedConfig: VersionedEventConfig = {
  ...toVersionedEventConfig(tennisClubMembershipEvent),
  versions: [
    { ...v1Version, id: 'v1', effectiveFrom: DEFAULT_EFFECTIVE_FROM },
    { ...v2Version, id: 'v2', effectiveFrom: '2025-01-01' }
  ]
}

function generateDeclaredActions(
  configuration: EventConfig,
  declaration: ActionUpdate,
  extraActions: ActionDocument[] = []
) {
  return [
    generateActionDocument({ configuration, action: ActionType.CREATE }),
    ...generateActionDocuments({
      configuration,
      action: ActionType.DECLARE,
      defaults: { declaration }
    }),
    ...extraActions
  ]
}

const recordUnderReviewOfV2 = {
  ...mockOriginalEvent,
  configVersionId: 'v2',
  actions: generateDeclaredActions(
    v2Config,
    {
      ...declarationObj,
      'applicant.sex': 'female',
      'applicant.membershipTier': 'Gold'
    },
    [
      generateActionDocument({
        configuration: v2Config,
        action: ActionType.DUPLICATE_DETECTED,
        defaults: { content: { duplicates } }
      })
    ]
  )
}

const potentialDuplicateOfV1 = {
  ...mockDuplicateEvent,
  configVersionId: 'v1',
  actions: generateDeclaredActions(v1Config, {
    ...declarationObj,
    'applicant.sex': 'male',
    'applicant.weightAtBirth': 3.2
  })
}

export const ComparisonAcrossConfigVersions: Story = {
  parameters: {
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.REVIEW_POTENTIAL_DUPLICATE.buildPath({
        eventId: recordUnderReviewOfV2.id
      })
    },
    // Seeded in `beforeEach`: the default seeding gives each config only one version
    offline: { configs: [], events: [] },
    msw: {
      handlers: {
        events: [tRPCMsw.event.config.get.query(() => [versionedConfig])]
      }
    }
  },
  beforeEach: () => {
    addLocalEventConfig(versionedConfig)
    for (const event of [recordUnderReviewOfV2, potentialDuplicateOfV1]) {
      setEventData(event.id, event)
      updateLocalEventIndex(event.id, event)
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const comparisonTab = await canvas.findByRole('button', {
      name: new RegExp(potentialDuplicateOfV1.trackingId, 'i')
    })
    await userEvent.click(comparisonTab)

    /** The cells of the record under review and of the potential duplicate */
    async function cellsOf(label: string) {
      const row = await canvas.findByRole('row', { name: new RegExp(label) })
      const [left, right] = within(row).getAllByRole('cell')
      return { left, right }
    }

    // On a narrow screen each cell also shows its column name, the record's tracking ID
    async function expectNoValue(cell: HTMLElement, trackingId: string) {
      await expect(cell.textContent?.replace(trackingId, '').trim()).toBe('')
    }

    await step(
      'A field renamed between versions shows the label of the record under review',
      async () => {
        const { left, right } = await cellsOf('Gender')
        await expect(left).toHaveTextContent('Female')
        await expect(right).toHaveTextContent('Male')
        await expect(canvas.queryByText('Sex')).not.toBeInTheDocument()
      }
    )

    await step(
      "A field only the potential duplicate's version has leaves the cell of the record under review empty",
      async () => {
        const { left, right } = await cellsOf('Weight at birth')
        await expectNoValue(left, recordUnderReviewOfV2.trackingId)
        await expect(right).toHaveTextContent('3.2')
      }
    )

    await step(
      'A field only the version of the record under review has leaves the cell of the potential duplicate empty',
      async () => {
        const { left, right } = await cellsOf('Membership tier')
        await expect(left).toHaveTextContent('Gold')
        await expectNoValue(right, potentialDuplicateOfV1.trackingId)
      }
    )
  }
}

export const DuplicateOfUnknownConfigVersion: Story = {
  parameters: {
    // The error page is shown by an error boundary, which React still reports as unhandled
    test: { dangerouslyIgnoreUnhandledErrors: true },
    chromatic: { disableSnapshot: true },
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.REVIEW_POTENTIAL_DUPLICATE.buildPath({
        eventId: recordUnderReviewOfV2.id
      })
    },
    // Seeded in `beforeEach`: the default seeding gives each config only one version
    offline: { configs: [], events: [] },
    msw: {
      handlers: {
        events: [tRPCMsw.event.config.get.query(() => [versionedConfig])]
      }
    }
  },
  beforeEach: () => {
    addLocalEventConfig(versionedConfig)
    setEventData(recordUnderReviewOfV2.id, recordUnderReviewOfV2)
    updateLocalEventIndex(recordUnderReviewOfV2.id, recordUnderReviewOfV2)
    // Not indexed: the index cannot be built without the record's version
    setEventData(potentialDuplicateOfV1.id, {
      ...potentialDuplicateOfV1,
      configVersionId: 'removed-version'
    })
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const comparisonTab = await canvas.findByRole('button', {
      name: new RegExp(potentialDuplicateOfV1.trackingId, 'i')
    })
    await userEvent.click(comparisonTab)

    await canvas.findByText('This record cannot be opened')
    await expect(
      await canvas.findByText(
        new RegExp(
          `Record ${potentialDuplicateOfV1.trackingId} was created under version removed-version`
        )
      )
    ).toBeInTheDocument()
  }
}
