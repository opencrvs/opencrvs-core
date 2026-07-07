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
import superjson from 'superjson'
import { within, expect } from '@storybook/test'
import {
  ActionType,
  ConditionalType,
  createPrng,
  flag,
  generateActionDocument,
  generateUuid,
  not,
  tennisClubMembershipEvent,
  generateTrackingId
} from '@opencrvs/commons/client'
import { AppRouter } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { ReviewDuplicateIndex } from '../../../../events/actions/dedup/ReviewDuplicate'

const meta: Meta<typeof ReviewDuplicateIndex> = {
  title: 'ActionMenu/CoreActionConfig/MarkAsNotDuplicate'
}

export default meta

type Story = StoryObj<typeof ReviewDuplicateIndex>

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [
    httpLink({
      url: '/api/events'
    })
  ],
  transformer: { input: superjson, output: superjson }
})

/**
 * A country config for MARK_AS_NOT_DUPLICATE and MARK_AS_DUPLICATE,
 * overriding the hardcoded default label/icon
 * (`duplicateMessages.notDuplicateButton`/`markAsDuplicateButton` and
 * `NotePencil`/`Archive` in ReviewDuplicate.tsx / DuplicateForm.tsx) to prove
 * both buttons on this screen read from ActionConfig when present.
 * `archiveOnDuplicate` (the mutation the "mark as duplicate" button fires)
 * is a client-side combinator over the core MARK_AS_DUPLICATE action — see
 * custom-api/index.ts — so it shares this same config, not a separate one.
 */
const configuration = {
  ...tennisClubMembershipEvent,
  actions: [
    ...tennisClubMembershipEvent.actions,
    {
      type: ActionType.MARK_AS_NOT_DUPLICATE,
      label: {
        id: 'storybook.action.mark-as-not-duplicate.custom-label',
        defaultMessage: 'Confirm no duplicate',
        description:
          'Country-configured label for the mark-as-not-duplicate action'
      },
      icon: 'MagnifyingGlass',
      flags: []
    },
    {
      type: ActionType.MARK_AS_DUPLICATE,
      label: {
        id: 'storybook.action.mark-as-duplicate.custom-label',
        defaultMessage: 'Compare duplicates',
        description: 'Country-configured label for the mark-as-duplicate action'
      },
      icon: 'Copy',
      flags: []
    }
  ]
}

const prng = createPrng(123123)
const duplicates = [
  {
    id: generateUuid(prng),
    trackingId: generateTrackingId(prng)
  }
]
const actions = [
  generateActionDocument({
    configuration,
    action: ActionType.CREATE
  }),
  generateActionDocument({
    configuration,
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
      },
      annotation: {
        'review.comment': 'no duplicate, just a test'
      }
    }
  }),
  generateActionDocument({
    configuration,
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
  type: tennisClubMembershipEvent.id,
  actions,
  createdAt: new Date(Date.now()).toISOString(),
  id: generateUuid(prng),
  updatedAt: new Date(Date.now()).toISOString()
}

const mockDuplicateEvent = {
  trackingId: duplicates[0].trackingId,
  type: tennisClubMembershipEvent.id,
  actions: actions.slice(0, 2),
  createdAt: new Date(Date.now()).toISOString(),
  id: duplicates[0].id,
  updatedAt: new Date(Date.now()).toISOString()
}

// A separate config (DUPLICATE_DETECTED already supports `flags`, so no
// CUSTOM action is needed) with a SHOW conditional on both
// MARK_AS_NOT_DUPLICATE and MARK_AS_DUPLICATE.
const configurationWithConditional = {
  ...tennisClubMembershipEvent,
  actions: [
    ...tennisClubMembershipEvent.actions,
    {
      type: ActionType.MARK_AS_NOT_DUPLICATE,
      label: {
        id: 'storybook.action.mark-as-not-duplicate.custom-label',
        defaultMessage: 'Confirm no duplicate',
        description:
          'Country-configured label for the mark-as-not-duplicate action'
      },
      icon: 'MagnifyingGlass',
      flags: [],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(flag('locked-for-review'))
        }
      ]
    },
    {
      type: ActionType.MARK_AS_DUPLICATE,
      label: {
        id: 'storybook.action.mark-as-duplicate.custom-label',
        defaultMessage: 'Compare duplicates',
        description: 'Country-configured label for the mark-as-duplicate action'
      },
      icon: 'Copy',
      flags: [],
      conditionals: [
        {
          type: ConditionalType.SHOW,
          conditional: not(flag('locked-for-review'))
        }
      ]
    },
    {
      type: ActionType.DUPLICATE_DETECTED,
      flags: [{ id: 'locked-for-review', operation: 'add' as const }]
    }
  ]
}

const lockedActions = [
  generateActionDocument({
    configuration: configurationWithConditional,
    action: ActionType.CREATE
  }),
  actions[1],
  generateActionDocument({
    configuration: configurationWithConditional,
    action: ActionType.DUPLICATE_DETECTED,
    defaults: { content: { duplicates } }
  })
]

const lockedEvent = {
  ...mockOriginalEvent,
  id: generateUuid(prng),
  actions: lockedActions
}

export const markAsNotDuplicateLabelAndIconAreConfigurable: Story = {
  parameters: {
    mockingDate: new Date(),
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.REVIEW_POTENTIAL_DUPLICATE.buildPath({
        eventId: mockOriginalEvent.id
      })
    },
    // Snapshot enabled here to visually verify the configured icon.
    chromatic: { disableSnapshot: false },
    // `.storybook/preview.tsx`'s global loader seeds the query cache directly
    // (bypassing MSW) with a default config unless `offline.configs` is set
    // here, so mocking `event.config.get` via MSW alone is not enough.
    offline: {
      configs: [configuration],
      events: [mockOriginalEvent, mockDuplicateEvent]
    },
    msw: {
      handlers: {
        events: [
          tRPCMsw.event.actions.duplicate.markNotDuplicate.mutation(() => ({
            ...mockOriginalEvent,
            actions: [
              ...actions,
              generateActionDocument({
                configuration,
                action: ActionType.MARK_AS_NOT_DUPLICATE
              })
            ]
          }))
        ]
      }
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const notADuplicateButton = await canvas.findByRole('button', {
      name: /Confirm no duplicate/i
    })
    await expect(notADuplicateButton).toBeVisible()
    await expect(canvas.queryByText(/Not a duplicate/i)).not.toBeInTheDocument()
    // Icon identity can't be asserted from the DOM (phosphor-react renders
    // plain <svg> geometry with no name-identifying attribute) — just confirm
    // one rendered alongside the configured label.
    await expect(notADuplicateButton.querySelector('svg')).toBeInTheDocument()

    const markAsDuplicateButton = await canvas.findByRole('button', {
      name: /Compare duplicates/i
    })
    await expect(markAsDuplicateButton).toBeVisible()
    await expect(canvas.queryByText(/^Archive$/i)).not.toBeInTheDocument()
    await expect(markAsDuplicateButton.querySelector('svg')).toBeInTheDocument()
  }
}

export const markAsNotDuplicateIsHiddenWhenConditionalIsNotMet: Story = {
  parameters: {
    mockingDate: new Date(),
    reactRouter: {
      router: routesConfig,
      initialPath: ROUTES.V2.EVENTS.REVIEW_POTENTIAL_DUPLICATE.buildPath({
        eventId: lockedEvent.id
      })
    },
    chromatic: { disableSnapshot: true },
    offline: {
      configs: [configurationWithConditional],
      events: [lockedEvent, mockDuplicateEvent]
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // DuplicateForm sits behind a Suspense boundary — wait for it to mount
    // before asserting on button absence, so a still-loading tree can't
    // false-pass as "correctly hidden".
    await canvas.findByText(/a duplicate\?/i)

    // Querying by testid (Button forwards `id` as `data-testid`), not by
    // label text, so this can't false-pass on a label that fails to match.
    await expect(
      canvas.queryByTestId('not-a-duplicate')
    ).not.toBeInTheDocument()

    // Exposes a bug: DuplicateForm.tsx never gates `markAsDuplicateButton` on
    // MARK_AS_DUPLICATE's conditionals, unlike the not-a-duplicate button
    // above, so this currently fails — see PR #13095 review discussion.
    await expect(
      canvas.queryByTestId('mark-as-duplicate')
    ).not.toBeInTheDocument()
  }
}
