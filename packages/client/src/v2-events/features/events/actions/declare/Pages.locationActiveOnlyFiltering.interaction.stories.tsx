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
  ChildOnboardingEvent,
  EventConfig,
  FieldType,
  generateEventDocument,
  Location,
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
  title: 'Declare/LocationActiveOnlyFiltering',
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

const IBOMBO_ADMIN_AREA_ID = '62a0ccb4-880d-4f30-8882-f256007dfff9' as UUID

/**
 * Same name throughout — closed (made inactive) in 2020 without ever being
 * renamed. Isolates the status-exclusion concern from name resolution: any
 * option-list difference between stories below is due to `activeOnly`, not
 * `resolveVersion` picking a different name.
 */
const INACTIVATED_FACILITY: Location = {
  id: 'e5e5e5e5-1111-4111-8111-111111111111' as UUID,
  name: 'Mercy Clinic',
  locationType: 'HEALTH_FACILITY',
  administrativeAreaId: IBOMBO_ADMIN_AREA_ID,
  externalId: null,
  status: 'inactive',
  versions: [
    {
      versionId: 'e5e5e5e5-1111-4111-8111-111111111112' as UUID,
      effectiveFrom: '0001-01-01',
      name: 'Mercy Clinic',
      externalId: null,
      status: 'active'
    },
    {
      versionId: 'e5e5e5e5-1111-4111-8111-111111111113' as UUID,
      effectiveFrom: '2020-01-01',
      name: 'Mercy Clinic',
      externalId: null,
      status: 'inactive'
    }
  ]
}

/**
 * `ChildOnboardingEvent`, extended with `dateOfEvent` wired to `child.dob`
 * and `child.birthLocation`'s configuration overridden per scenario, so
 * `activeOnly` and `anchorToDateOfEvent` can be exercised independently.
 */
function buildEventConfig(
  locationConfiguration: Record<string, boolean>
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
              fields: page.fields.map((f) =>
                f.id === 'child.birthLocation' && f.type === FieldType.LOCATION
                  ? {
                      ...f,
                      configuration: {
                        ...f.configuration,
                        ...locationConfiguration
                      }
                    }
                  : f
              )
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
        tRPCMsw.locations.list.query(() => [INACTIVATED_FACILITY]),
        tRPCMsw.administrativeAreas.list.query(() => [])
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

const BIRTH_LOCATION_SELECTOR = '#searchable-select-child____birthLocation'

async function selectHealthInstitutionPlaceOfBirth(
  canvas: ReturnType<typeof within>
) {
  const placeOfBirth = await canvas.findByTestId(
    'select__child____placeOfBirth'
  )
  await selectEvent.select(placeOfBirth, 'Health Institution')
}

function getBirthLocationInput(canvasElement: HTMLElement) {
  const input = canvasElement.querySelector(`${BIRTH_LOCATION_SELECTOR} input`)
  if (!input) {
    throw new Error('birthLocation input not found')
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

/**
 * Neither flag set — the field lists everything unfiltered, exactly as
 * before #13143/#13146. The facility is inactive today, yet it still
 * appears since nothing opts into any exclusion at all.
 */
export const NeitherFlagListsEverythingUnfiltered: Story = {
  parameters: buildStoryParams(buildEventConfig({})),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Select Health Institution as place of birth', async () => {
      await selectHealthInstitutionPlaceOfBirth(canvas)
    })

    await step(
      'The closed facility still appears — no flag set means no exclusion',
      async () => {
        await userEvent.click(getBirthLocationInput(canvasElement))

        const listbox = await canvas.findByRole('listbox')
        await within(listbox).findByText('Mercy Clinic')
      }
    )
  }
}

/**
 * `anchorToDateOfEvent` alone must not exclude inactive-at-anchor locations
 * — that's `activeOnly`'s job. The facility closed in 2020 (no rename), and
 * the record's date of birth defaults to today (well after 2020), yet it
 * still appears since `activeOnly` was never set.
 */
export const AnchorAloneDoesNotExclude: Story = {
  parameters: buildStoryParams(buildEventConfig({ anchorToDateOfEvent: true })),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Select Health Institution as place of birth', async () => {
      await selectHealthInstitutionPlaceOfBirth(canvas)
    })

    await step(
      'The closed facility still appears — anchoring alone does not exclude it',
      async () => {
        await userEvent.click(getBirthLocationInput(canvasElement))

        const listbox = await canvas.findByRole('listbox')
        await within(listbox).findByText('Mercy Clinic')
      }
    )
  }
}

/**
 * `activeOnly` alone excludes using today as the anchor (no
 * `anchorToDateOfEvent`), regardless of what date of birth is entered — the
 * facility closed in 2020, so it's absent even when the date of birth is set
 * to a year when it was still active.
 */
export const ActiveOnlyAloneExcludesUsingToday: Story = {
  parameters: buildStoryParams(buildEventConfig({ activeOnly: true })),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Select Health Institution as place of birth', async () => {
      await selectHealthInstitutionPlaceOfBirth(canvas)
    })

    await step(
      'The closed facility is excluded even before any date is entered',
      async () => {
        await userEvent.click(getBirthLocationInput(canvasElement))

        const listbox = await canvas.findByRole('listbox')
        await waitFor(async () =>
          expect(
            within(listbox).queryByText('Mercy Clinic')
          ).not.toBeInTheDocument()
        )
        await userEvent.keyboard('{Escape}')
      }
    )

    await step(
      'Still excluded after entering a date of birth from when it was active — activeOnly alone ignores the event date',
      async () => {
        await typeDateOfBirth(canvas, '25', '04', '1995')
        await userEvent.click(getBirthLocationInput(canvasElement))

        const listbox = await canvas.findByRole('listbox')
        await waitFor(async () =>
          expect(
            within(listbox).queryByText('Mercy Clinic')
          ).not.toBeInTheDocument()
        )
      }
    )
  }
}

/**
 * Combining both flags checks activeness at the *event date* anchor, not
 * today: the facility is inactive today (excluded initially, since the date
 * of birth defaults to today), but entering a date of birth from before it
 * closed makes it reappear.
 */
export const CombinedActiveOnlyChecksEventDateAnchor: Story = {
  parameters: buildStoryParams(
    buildEventConfig({ anchorToDateOfEvent: true, activeOnly: true })
  ),
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Select Health Institution as place of birth', async () => {
      await selectHealthInstitutionPlaceOfBirth(canvas)
    })

    await step(
      'Excluded before a date of birth is entered — anchor defaults to today, after closure',
      async () => {
        await userEvent.click(getBirthLocationInput(canvasElement))

        const listbox = await canvas.findByRole('listbox')
        await waitFor(async () =>
          expect(
            within(listbox).queryByText('Mercy Clinic')
          ).not.toBeInTheDocument()
        )
        await userEvent.keyboard('{Escape}')
      }
    )

    await step(
      'Reappears once the date of birth moves to before the facility closed',
      async () => {
        await typeDateOfBirth(canvas, '25', '04', '1995')
        await userEvent.click(getBirthLocationInput(canvasElement))

        const listbox = await canvas.findByRole('listbox')
        await within(listbox).findByText('Mercy Clinic')
      }
    )
  }
}
