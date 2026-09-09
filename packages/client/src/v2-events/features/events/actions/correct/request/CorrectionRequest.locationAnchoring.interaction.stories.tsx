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
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import React from 'react'
import { Outlet } from 'react-router-dom'
import superjson from 'superjson'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import {
  ActionType,
  ChildOnboardingEvent,
  EventConfig,
  FieldType,
  generateEventDocument,
  Location,
  PageTypes,
  TestUserRole,
  UUID
} from '@opencrvs/commons/client'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { ROUTES } from '@client/v2-events/routes'
import { AppRouter } from '@client/v2-events/trpc'
import { router } from './router'
import * as Request from './index'

const meta: Meta<typeof Request.Review> = {
  title: 'CorrectionRequest/LocationAnchoring',
  parameters: {
    userRole: TestUserRole.enum.REGISTRATION_AGENT
  }
}
export default meta

type Story = StoryObj<typeof Request.Review>

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

const IBOMBO_ADMIN_AREA_ID = '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID

/**
 * A health facility renamed from "Old Riverside Health Post" to "New
 * Riverside Health Post" in 2023. Both names live in the version history;
 * the resolved (current) name is the latest.
 */
const RENAMED_FACILITY: Location = {
  id: 'a1a1a1a1-1111-4111-8111-111111111111' as UUID,
  name: 'New Riverside Health Post',
  locationType: 'HEALTH_FACILITY',
  administrativeAreaId: IBOMBO_ADMIN_AREA_ID,
  externalId: null,
  status: 'active',
  versions: [
    {
      versionId: 'a1a1a1a1-1111-4111-8111-111111111112' as UUID,
      effectiveFrom: '0001-01-01',
      name: 'Old Riverside Health Post',
      externalId: null,
      status: 'active'
    },
    {
      versionId: 'a1a1a1a1-1111-4111-8111-111111111113' as UUID,
      effectiveFrom: '2023-01-01',
      name: 'New Riverside Health Post',
      externalId: null,
      status: 'active'
    }
  ]
}

/**
 * `ChildOnboardingEvent`, extended so #13143's anchoring actually kicks in:
 * `dateOfEvent` wired to `child.dob`, `child.birthLocation` opted into
 * `anchorToDateOfEvent`, and correction added as an available action — none
 * of which the shared fixture needs for its other (non-correction) uses.
 */
const correctableChildOnboardingEvent: EventConfig = {
  ...ChildOnboardingEvent,
  // A plain literal, not `field('child.dob')` — the story seeds this config
  // directly into IndexedDB (bypassing the network boundary that would
  // otherwise strip `field()`'s attached methods), which chokes on them.
  dateOfEvent: { $$field: 'child.dob', $$subfield: [] },
  actions: [
    ...ChildOnboardingEvent.actions,
    {
      type: ActionType.REQUEST_CORRECTION,
      label: {
        defaultMessage: 'Request correction',
        description: 'Action label',
        id: 'event.childOnboarding.action.requestCorrection.label'
      },
      flags: [],
      correctionForm: {
        label: {
          defaultMessage: 'Request correction',
          description: 'Correction form label',
          id: 'event.childOnboarding.action.requestCorrection.form.label'
        },
        pages: [
          {
            id: 'correction-requester',
            type: PageTypes.enum.FORM,
            title: {
              defaultMessage: 'Correction requester',
              description: 'Page title',
              id: 'event.childOnboarding.action.requestCorrection.form.section.corrector'
            },
            requireCompletionToContinue: false,
            fields: []
          }
        ]
      }
    }
  ],
  declaration: {
    ...ChildOnboardingEvent.declaration,
    pages: ChildOnboardingEvent.declaration.pages.map((page) =>
      page.id === 'child'
        ? {
            ...page,
            fields: page.fields.map((f) =>
              f.id === 'child.birthLocation' && f.type === FieldType.LOCATION
                ? {
                    ...f,
                    configuration: {
                      ...f.configuration,
                      anchorToDateOfEvent: true
                    }
                  }
                : f
            )
          }
        : page
    )
  }
}

// A birth in 1995 — well before the facility's 2023 rename.
const declarationOverrides = {
  'child.dob': '1995-04-25',
  'child.placeOfBirth': 'child.placeOfBirth-SELECT-2',
  'child.birthLocation': RENAMED_FACILITY.id
}

const birthEventDocument = generateEventDocument({
  configuration: correctableChildOnboardingEvent,
  actions: [
    { type: ActionType.CREATE },
    { type: ActionType.DECLARE, declarationOverrides },
    // REGISTER is also a DeclarationUpdateAction and otherwise auto-generates
    // its own random declaration, silently overwriting DECLARE's values.
    { type: ActionType.REGISTER, declarationOverrides }
  ]
})

const generator = testDataGenerator()
const mockUser = generator.user.registrationAgent().summary
const mockUserFull = generator.user.registrationAgent().v2

const mswConfig = {
  handlers: {
    events: [
      tRPCMsw.event.config.get.query(() => [correctableChildOnboardingEvent])
    ],
    event: [tRPCMsw.event.get.query(() => birthEventDocument)],
    eventLocations: [
      tRPCMsw.locations.list.query(() => [RENAMED_FACILITY]),
      tRPCMsw.administrativeAreas.list.query(() => [])
    ],
    user: [
      tRPCMsw.user.list.query(() => [mockUser]),
      tRPCMsw.user.get.query(() => mockUserFull)
    ]
  }
}

/**
 * Correcting a record declared in 1995 must offer/resolve `child.birthLocation`
 * (opted into `anchorToDateOfEvent`) against the record's own date of birth,
 * not today — a facility renamed years after the birth still shows under the
 * name it carried in 1995.
 */
export const BirthLocationAnchorsToRecordDateOfEvent: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
    offline: {
      events: [birthEventDocument],
      configs: [correctableChildOnboardingEvent]
    },
    reactRouter: {
      router: {
        path: '/',
        element: <Outlet />,
        children: [router]
      },
      initialPath: ROUTES.V2.EVENTS.REQUEST_CORRECTION.REVIEW.buildPath({
        eventId: birthEventDocument.id
      })
    },
    msw: mswConfig
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Open the birth location field for editing', async () => {
      await userEvent.click(
        await canvas.findByTestId('change-button-child.birthLocation')
      )
    })

    await step(
      'Resolves under the 1995 name, not the 2023-onward name',
      async () => {
        const select = await waitFor(() => {
          const el = canvasElement.querySelector(
            '#searchable-select-child____birthLocation'
          )
          if (!el) {
            throw new Error('birthLocation select not rendered yet')
          }
          return el
        })

        await within(select as HTMLElement).findByText(
          'Old Riverside Health Post'
        )
        await expect(
          within(select as HTMLElement).queryByText('New Riverside Health Post')
        ).not.toBeInTheDocument()
      }
    )
  }
}

// A birth in 2024 — well after the facility's 2023 rename.
const declarationOverridesPostRename = {
  'child.dob': '2024-06-15',
  'child.placeOfBirth': 'child.placeOfBirth-SELECT-2',
  'child.birthLocation': RENAMED_FACILITY.id
}

const birthEventDocumentPostRename = generateEventDocument({
  configuration: correctableChildOnboardingEvent,
  actions: [
    { type: ActionType.CREATE },
    {
      type: ActionType.DECLARE,
      declarationOverrides: declarationOverridesPostRename
    },
    {
      type: ActionType.REGISTER,
      declarationOverrides: declarationOverridesPostRename
    }
  ]
})

const mswConfigPostRename = {
  handlers: {
    events: [
      tRPCMsw.event.config.get.query(() => [correctableChildOnboardingEvent])
    ],
    event: [tRPCMsw.event.get.query(() => birthEventDocumentPostRename)],
    eventLocations: [
      tRPCMsw.locations.list.query(() => [RENAMED_FACILITY]),
      tRPCMsw.administrativeAreas.list.query(() => [])
    ],
    user: [
      tRPCMsw.user.list.query(() => [mockUser]),
      tRPCMsw.user.get.query(() => mockUserFull)
    ]
  }
}

/**
 * Correcting a record declared in 2024 — after the facility's 2023 rename —
 * must resolve `child.birthLocation` under its current name, not the 1995
 * name it no longer carries at that date. Mirrors
 * `BirthLocationAnchorsToRecordDateOfEvent` with a later anchor date.
 */
export const BirthLocationAnchorsToNewerNameAfterRename: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
    offline: {
      events: [birthEventDocumentPostRename],
      configs: [correctableChildOnboardingEvent]
    },
    reactRouter: {
      router: {
        path: '/',
        element: <Outlet />,
        children: [router]
      },
      initialPath: ROUTES.V2.EVENTS.REQUEST_CORRECTION.REVIEW.buildPath({
        eventId: birthEventDocumentPostRename.id
      })
    },
    msw: mswConfigPostRename
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Open the birth location field for editing', async () => {
      await userEvent.click(
        await canvas.findByTestId('change-button-child.birthLocation')
      )
    })

    await step(
      'Resolves under the current (post-rename) name, not the 1995 name',
      async () => {
        const select = await waitFor(() => {
          const el = canvasElement.querySelector(
            '#searchable-select-child____birthLocation'
          )
          if (!el) {
            throw new Error('birthLocation select not rendered yet')
          }
          return el
        })

        await within(select as HTMLElement).findByText(
          'New Riverside Health Post'
        )
        await expect(
          within(select as HTMLElement).queryByText('Old Riverside Health Post')
        ).not.toBeInTheDocument()
      }
    )
  }
}
