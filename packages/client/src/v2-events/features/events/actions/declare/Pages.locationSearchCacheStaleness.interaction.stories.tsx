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
  title: 'Declare/LocationSearchCacheStaleness',
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
 * renamed, so a repeated search for the same string is only distinguished by
 * whether the anchor falls before or after 2020, not by a name change.
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
 * and `child.birthLocation` opted into both `anchorToDateOfEvent` and
 * `activeOnly`, matching #13143's anchored-and-excluding configuration.
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
            fields: page.fields.map((f) =>
              f.id === 'child.birthLocation' && f.type === FieldType.LOCATION
                ? {
                    ...f,
                    configuration: {
                      ...f.configuration,
                      anchorToDateOfEvent: true,
                      activeOnly: true
                    }
                  }
                : f
            )
          }
        : page
    )
  }
}

const freshDraftEvent = generateEventDocument({
  configuration: anchoredChildOnboardingEvent,
  actions: [{ type: ActionType.CREATE }]
})

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
  msw: {
    handlers: {
      events: [
        tRPCMsw.event.config.get.query(() => [anchoredChildOnboardingEvent])
      ],
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
}

const BIRTH_LOCATION_SELECTOR = '#searchable-select-child____birthLocation'
const SEARCH_TERM = 'Mercy'

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
 * Regression test for #13407: re-typing the exact same search string after
 * the anchor moves must re-resolve against the new anchor, not replay a
 * cached result from the previous search.
 *
 * The facility closed in 2020. With no date of birth entered, the anchor
 * defaults to today (after closure), so searching "Mercy" correctly finds
 * nothing. Moving the date of birth to before 2020 makes the facility
 * selectable again — searching the identical string a second time must show
 * it, not silently replay the empty result cached from the first search.
 */
export const RepeatedSearchReflectsNewAnchor: Story = {
  parameters: storyParams,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Select Health Institution as place of birth', async () => {
      await selectHealthInstitutionPlaceOfBirth(canvas)
    })

    await step(
      'Searching "Mercy" before any date of birth finds nothing — anchor defaults to today, after closure',
      async () => {
        const input = getBirthLocationInput(canvasElement)
        await userEvent.click(input)
        await userEvent.type(input, SEARCH_TERM)

        const listbox = await canvas.findByRole('listbox')
        await waitFor(async () =>
          expect(within(listbox).queryByText('Mercy Clinic')).toBeNull()
        )
        await userEvent.keyboard('{Escape}')
      }
    )

    await step(
      'Entering a date of birth from before the closure moves the anchor',
      async () => {
        await typeDateOfBirth(canvas, '25', '04', '1995')
      }
    )

    await step(
      'Searching the identical string "Mercy" again now finds the facility — the anchor moved, so the cached empty result must not be replayed',
      async () => {
        const input = getBirthLocationInput(canvasElement)
        await userEvent.click(input)
        await userEvent.type(input, SEARCH_TERM)

        const listbox = await canvas.findByRole('listbox')
        await within(listbox).findByText('Mercy Clinic')
      }
    )
  }
}
