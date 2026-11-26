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
import superjson from 'superjson'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import {
  ActionType,
  AdministrativeArea,
  AdministrativeAreas,
  ChildOnboardingEvent,
  EventConfig,
  FieldType,
  generateEventDocument,
  UUID
} from '@opencrvs/commons/client'
import * as selectEvent from '@client/v2-events/select-event'
import { localDraftStore } from '@client/v2-events/features/drafts/useDrafts'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { AppRouter } from '@client/v2-events/trpc'
import { useActionAnnotation } from '../../useActionAnnotation'
import { useEventFormData } from '../../useEventFormData'
import { Pages } from './index'

const meta: Meta<typeof Pages> = {
  title: 'Declare/AdminAreaAnchorClearing',
  beforeEach: () => {
    useEventFormData.setState({ formValues: {} })
    useActionAnnotation.setState({})
    localDraftStore.getState().setDraft(null)
  }
}
export default meta

type Story = StoryObj<typeof Pages>

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

/**
 * Inactivated before its rename — anchoring to a date before 2023 resolves to
 * an inactive version, so this area should be cleared, not just relabeled.
 */
const RENAMED_AREA: AdministrativeArea = {
  id: 'c3c3c3c3-1111-4111-8111-111111111111' as UUID,
  name: 'New Riverside District',
  externalId: null,
  parentId: null,
  status: 'active',
  versions: [
    {
      versionId: 'c3c3c3c3-1111-4111-8111-111111111112' as UUID,
      effectiveFrom: '0001-01-01',
      name: 'Old Riverside District',
      externalId: null,
      status: 'inactive'
    },
    {
      versionId: 'c3c3c3c3-1111-4111-8111-111111111113' as UUID,
      effectiveFrom: '2023-01-01',
      name: 'New Riverside District',
      externalId: null,
      status: 'active'
    }
  ]
}

/**
 * Renamed but active throughout both versions — even though it's still
 * selectable at any anchor, anchoring to a date before the rename resolves a
 * *different* version, which should clear the selection too, not relabel it.
 */
const RENAMED_BUT_ALWAYS_ACTIVE_AREA: AdministrativeArea = {
  id: 'd4d4d4d4-2222-4222-8222-222222222222' as UUID,
  name: 'Greater Pangasinan',
  externalId: null,
  parentId: null,
  status: 'active',
  versions: [
    {
      versionId: 'd4d4d4d4-2222-4222-8222-222222222223' as UUID,
      effectiveFrom: '0001-01-01',
      name: 'Pangasinan',
      externalId: null,
      status: 'active'
    },
    {
      versionId: 'd4d4d4d4-2222-4222-8222-222222222224' as UUID,
      effectiveFrom: '2010-01-01',
      name: 'Greater Pangasinan',
      externalId: null,
      status: 'active'
    }
  ]
}

/**
 * `ChildOnboardingEvent`, extended so #13143's anchoring kicks in: `dateOfEvent`
 * wired to `child.dob`, plus a standalone ADMINISTRATIVE_AREA field (no
 * `partOf`, so it lists every root-level area unfiltered) opted into
 * `anchorToDateOfEvent`.
 */
const anchoredChildOnboardingEvent: EventConfig = {
  ...ChildOnboardingEvent,
  dateOfEvent: { $$field: 'child.dob', $$subfield: [] },
  declaration: {
    ...ChildOnboardingEvent.declaration,
    pages: ChildOnboardingEvent.declaration.pages.map((page) =>
      page.id === 'child'
        ? {
            ...page,
            fields: [
              ...page.fields,
              {
                id: 'child.testAdminArea',
                type: FieldType.ADMINISTRATIVE_AREA,
                required: false,
                label: {
                  defaultMessage: 'Test admin area',
                  description: 'Test field for admin-area anchor clearing',
                  id: 'test.child.testAdminArea.label'
                },
                configuration: {
                  type: AdministrativeAreas.enum.ADMIN_STRUCTURE,
                  anchorToDateOfEvent: true
                }
              }
            ]
          }
        : page
    )
  }
}

const freshDraftEvent = generateEventDocument({
  configuration: anchoredChildOnboardingEvent,
  actions: [{ type: ActionType.CREATE }]
})

const mswConfig = {
  handlers: {
    events: [
      tRPCMsw.event.config.get.query(() => [anchoredChildOnboardingEvent])
    ],
    event: [
      tRPCMsw.event.get.query(() => freshDraftEvent),
      tRPCMsw.event.search.query(() => ({ results: [], total: 0 }))
    ],
    eventLocations: [
      tRPCMsw.locations.list.query(() => []),
      tRPCMsw.administrativeAreas.list.query(() => [
        RENAMED_AREA,
        RENAMED_BUT_ALWAYS_ACTIVE_AREA
      ])
    ]
  }
}

const storyParams = {
  chromatic: { disableSnapshot: true },
  offline: {
    events: [freshDraftEvent],
    configs: [anchoredChildOnboardingEvent]
  },
  reactRouter: {
    router: routesConfig,
    initialPath: ROUTES.V2.EVENTS.DECLARE.PAGES.buildPath({
      eventId: freshDraftEvent.id,
      pageId: 'child'
    })
  },
  msw: mswConfig
}

const TEST_ADMIN_AREA_SELECTOR = '#searchable-select-child____testAdminArea'

function getTestAdminAreaInput(canvasElement: HTMLElement) {
  const input = canvasElement.querySelector(`${TEST_ADMIN_AREA_SELECTOR} input`)
  if (!input) {
    throw new Error('testAdminArea input not found')
  }
  return input as HTMLElement
}

function getTestAdminAreaContainer(canvasElement: HTMLElement) {
  const container = canvasElement.querySelector(TEST_ADMIN_AREA_SELECTOR)
  if (!container) {
    throw new Error('testAdminArea container not found')
  }
  return container as HTMLElement
}

async function typeDateOfBirth(
  canvas: ReturnType<typeof within>,
  dd: string,
  mm: string,
  yyyy: string
) {
  await userEvent.type(await canvas.findByPlaceholderText('dd'), dd)
  await userEvent.type(await canvas.findByPlaceholderText('mm'), mm)
  await userEvent.type(await canvas.findByPlaceholderText('yyyy'), yyyy)
}

/** Waits for the page's first render (data loading, Suspense) to settle. */
async function waitForPageReady(canvas: ReturnType<typeof within>) {
  await canvas.findByTestId('text__firstname')
}

/**
 * With no date of birth entered yet, the anchor falls back to the record's
 * creation date — effectively today. The admin-area dropdown should list a
 * renamed area under its current (latest, active) name only.
 */
export const EmptyDateShowsLatestName: Story = {
  parameters: storyParams,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await waitForPageReady(canvas)

    await step(
      'The dropdown lists the area under its current name only',
      async () => {
        await userEvent.click(getTestAdminAreaInput(canvasElement))

        const listbox = await canvas.findByRole('listbox')
        await within(listbox).findByText('New Riverside District')
        await expect(
          within(listbox).queryByText('Old Riverside District')
        ).not.toBeInTheDocument()
      }
    )
  }
}

/**
 * An area selected while valid gets cleared once the date of birth moves to
 * a date before the area was ever active — the stored selection would
 * otherwise silently stay invalid.
 */
export const ClearsWhenBecomesInactive: Story = {
  parameters: storyParams,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await waitForPageReady(canvas)

    await step('Pick an area valid today', async () => {
      await selectEvent.select(
        getTestAdminAreaInput(canvasElement),
        'New Riverside District'
      )
      await within(getTestAdminAreaContainer(canvasElement)).findByText(
        'New Riverside District'
      )
    })

    await step(
      'Entering a date of birth before the area was ever active clears the selection',
      async () => {
        await typeDateOfBirth(canvas, '25', '04', '1995')

        await waitFor(async () =>
          expect(
            within(getTestAdminAreaContainer(canvasElement)).queryByText(
              'New Riverside District'
            )
          ).not.toBeInTheDocument()
        )
      }
    )
  }
}

/**
 * An area that was renamed but stayed active throughout still gets cleared
 * when the date of birth moves before the rename — a version change
 * invalidates the selection even when the area stays selectable.
 */
export const ClearsAcrossRename: Story = {
  parameters: storyParams,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await waitForPageReady(canvas)

    await step('Pick the always-active area', async () => {
      await selectEvent.select(
        getTestAdminAreaInput(canvasElement),
        'Greater Pangasinan'
      )
      await within(getTestAdminAreaContainer(canvasElement)).findByText(
        'Greater Pangasinan'
      )
    })

    await step(
      'Entering a date of birth before the rename clears the selection',
      async () => {
        await typeDateOfBirth(canvas, '25', '04', '1995')

        await waitFor(async () =>
          expect(
            within(getTestAdminAreaContainer(canvasElement)).queryByText(
              'Greater Pangasinan'
            )
          ).not.toBeInTheDocument()
        )
      }
    )
  }
}
