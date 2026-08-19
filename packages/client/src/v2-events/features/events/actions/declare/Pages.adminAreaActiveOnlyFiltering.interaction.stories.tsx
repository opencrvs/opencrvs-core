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
import { localDraftStore } from '@client/v2-events/features/drafts/useDrafts'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { AppRouter } from '@client/v2-events/trpc'
import { useActionAnnotation } from '../../useActionAnnotation'
import { useEventFormData } from '../../useEventFormData'
import { Pages } from './index'

const meta: Meta<typeof Pages> = {
  title: 'Declare/AdminAreaActiveOnlyFiltering',
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
 * Same name throughout — closed (made inactive) in 2020 without ever being
 * renamed. Isolates the status-exclusion concern from name resolution: any
 * option-list difference between stories below is due to `activeOnly`, not
 * `resolveVersion` picking a different name.
 */
const INACTIVATED_AREA: AdministrativeArea = {
  id: 'f6f6f6f6-1111-4111-8111-111111111111' as UUID,
  name: 'Mercy District',
  externalId: null,
  parentId: null,
  status: 'inactive',
  versions: [
    {
      versionId: 'f6f6f6f6-1111-4111-8111-111111111112' as UUID,
      effectiveFrom: '0001-01-01',
      name: 'Mercy District',
      externalId: null,
      status: 'active'
    },
    {
      versionId: 'f6f6f6f6-1111-4111-8111-111111111113' as UUID,
      effectiveFrom: '2020-01-01',
      name: 'Mercy District',
      externalId: null,
      status: 'inactive'
    }
  ]
}

/**
 * `ChildOnboardingEvent`, extended with `dateOfEvent` wired to `child.dob`
 * and a standalone ADMINISTRATIVE_AREA field (no `partOf`, so it lists every
 * root-level area unfiltered) configured per scenario, so `activeOnly` and
 * `anchorToDateOfEvent` can be exercised independently.
 */
function buildEventConfig(
  adminAreaConfiguration: Record<string, boolean>
): EventConfig {
  return {
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
                    description:
                      'Test field for admin-area activeOnly filtering',
                    id: 'test.child.testAdminArea.label'
                  },
                  configuration: {
                    type: AdministrativeAreas.enum.ADMIN_STRUCTURE,
                    ...adminAreaConfiguration
                  }
                }
              ]
            }
          : page
      )
    }
  }
}

function buildStoryParams(eventConfig: EventConfig) {
  const freshDraftEvent = generateEventDocument({
    configuration: eventConfig,
    actions: [{ type: ActionType.CREATE }]
  })

  const mswConfig = {
    handlers: {
      events: [tRPCMsw.event.config.get.query(() => [eventConfig])],
      event: [
        tRPCMsw.event.get.query(() => freshDraftEvent),
        tRPCMsw.event.search.query(() => ({ results: [], total: 0 }))
      ],
      eventLocations: [
        tRPCMsw.locations.list.query(() => []),
        tRPCMsw.administrativeAreas.list.query(() => [INACTIVATED_AREA])
      ]
    }
  }

  return {
    chromatic: { disableSnapshot: true },
    offline: {
      events: [freshDraftEvent],
      configs: [eventConfig]
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
}

const TEST_ADMIN_AREA_SELECTOR = '#searchable-select-child____testAdminArea'

function getTestAdminAreaInput(canvasElement: HTMLElement) {
  const input = canvasElement.querySelector(`${TEST_ADMIN_AREA_SELECTOR} input`)
  if (!input) {
    throw new Error('testAdminArea input not found')
  }
  return input as HTMLElement
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
 * Neither flag set — the field lists everything unfiltered, exactly as
 * before #13143/#13146. The area is inactive today, yet it still appears
 * since nothing opts into any exclusion at all.
 */
export const NeitherFlagListsEverythingUnfiltered: Story = {
  parameters: buildStoryParams(buildEventConfig({})),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await waitForPageReady(canvas)

    await step(
      'The closed area still appears — no flag set means no exclusion',
      async () => {
        await userEvent.click(getTestAdminAreaInput(canvasElement))

        const listbox = await canvas.findByRole('listbox')
        await within(listbox).findByText('Mercy District')
      }
    )
  }
}

/**
 * `anchorToDateOfEvent` alone must not exclude inactive-at-anchor areas —
 * that's `activeOnly`'s job. The area closed in 2020 (no rename), and the
 * record's date of birth defaults to today (well after 2020), yet it still
 * appears since `activeOnly` was never set.
 */
export const AnchorAloneDoesNotExclude: Story = {
  parameters: buildStoryParams(buildEventConfig({ anchorToDateOfEvent: true })),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await waitForPageReady(canvas)

    await step(
      'The closed area still appears — anchoring alone does not exclude it',
      async () => {
        await userEvent.click(getTestAdminAreaInput(canvasElement))

        const listbox = await canvas.findByRole('listbox')
        await within(listbox).findByText('Mercy District')
      }
    )
  }
}

/**
 * `activeOnly` alone excludes using today as the anchor (no
 * `anchorToDateOfEvent`), regardless of what date of birth is entered — the
 * area closed in 2020, so it's absent even when the date of birth is set to
 * a year when it was still active.
 */
export const ActiveOnlyAloneExcludesUsingToday: Story = {
  parameters: buildStoryParams(buildEventConfig({ activeOnly: true })),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await waitForPageReady(canvas)

    await step(
      'The closed area is excluded even before any date is entered',
      async () => {
        await userEvent.click(getTestAdminAreaInput(canvasElement))

        const listbox = await canvas.findByRole('listbox')
        await waitFor(async () =>
          expect(
            within(listbox).queryByText('Mercy District')
          ).not.toBeInTheDocument()
        )
        await userEvent.keyboard('{Escape}')
      }
    )

    await step(
      'Still excluded after entering a date of birth from when it was active — activeOnly alone ignores the event date',
      async () => {
        await typeDateOfBirth(canvas, '25', '04', '1995')
        await userEvent.click(getTestAdminAreaInput(canvasElement))

        const listbox = await canvas.findByRole('listbox')
        await waitFor(async () =>
          expect(
            within(listbox).queryByText('Mercy District')
          ).not.toBeInTheDocument()
        )
      }
    )
  }
}

/**
 * Combining both flags checks activeness at the *event date* anchor, not
 * today: the area is inactive today (excluded initially, since the date of
 * birth defaults to today), but entering a date of birth from before it
 * closed makes it reappear.
 */
export const CombinedActiveOnlyChecksEventDateAnchor: Story = {
  parameters: buildStoryParams(
    buildEventConfig({ anchorToDateOfEvent: true, activeOnly: true })
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await waitForPageReady(canvas)

    await step(
      'Excluded before a date of birth is entered — anchor defaults to today, after closure',
      async () => {
        await userEvent.click(getTestAdminAreaInput(canvasElement))

        const listbox = await canvas.findByRole('listbox')
        await waitFor(async () =>
          expect(
            within(listbox).queryByText('Mercy District')
          ).not.toBeInTheDocument()
        )
        await userEvent.keyboard('{Escape}')
      }
    )

    await step(
      'Reappears once the date of birth moves to before the area closed',
      async () => {
        await typeDateOfBirth(canvas, '25', '04', '1995')
        await userEvent.click(getTestAdminAreaInput(canvasElement))

        const listbox = await canvas.findByRole('listbox')
        await within(listbox).findByText('Mercy District')
      }
    )
  }
}
