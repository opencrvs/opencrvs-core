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
  title: 'Declare/LocationAnchorClearing',
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
 * Inactivated before its rename — anchoring to a date before 2023 resolves to
 * an inactive version, so this facility should be cleared, not just relabeled.
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
      status: 'inactive'
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
 * Renamed but active throughout both versions — even though it's still
 * selectable at any anchor, anchoring to a date before the rename resolves a
 * *different* version, which should clear the selection too, not relabel it.
 */
const RENAMED_BUT_ALWAYS_ACTIVE_FACILITY: Location = {
  id: 'b2b2b2b2-2222-4222-8222-222222222222' as UUID,
  name: 'Greater Pangasinan Clinic',
  locationType: 'HEALTH_FACILITY',
  administrativeAreaId: IBOMBO_ADMIN_AREA_ID,
  externalId: null,
  status: 'active',
  versions: [
    {
      versionId: 'b2b2b2b2-2222-4222-8222-222222222223' as UUID,
      effectiveFrom: '0001-01-01',
      name: 'Pangasinan Clinic',
      externalId: null,
      status: 'active'
    },
    {
      versionId: 'b2b2b2b2-2222-4222-8222-222222222224' as UUID,
      effectiveFrom: '2010-01-01',
      name: 'Greater Pangasinan Clinic',
      externalId: null,
      status: 'active'
    }
  ]
}

/**
 * `ChildOnboardingEvent`, extended so #13143's anchoring kicks in: `dateOfEvent`
 * wired to `child.dob`, `child.birthLocation` opted into `anchorToDateOfEvent`.
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
      tRPCMsw.locations.list.query(() => [
        RENAMED_FACILITY,
        RENAMED_BUT_ALWAYS_ACTIVE_FACILITY
      ]),
      tRPCMsw.administrativeAreas.list.query(() => [])
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

function getBirthLocationContainer(canvasElement: HTMLElement) {
  const container = canvasElement.querySelector(BIRTH_LOCATION_SELECTOR)
  if (!container) {
    throw new Error('birthLocation container not found')
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

/**
 * With no date of birth entered yet, the anchor falls back to the record's
 * creation date — effectively today. The Health Institution dropdown should
 * list a renamed facility under its current (latest, active) name only.
 */
export const EmptyDateShowsLatestName: Story = {
  parameters: storyParams,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Select Health Institution as place of birth', async () => {
      await selectHealthInstitutionPlaceOfBirth(canvas)
    })

    await step(
      'The dropdown lists the facility under its current name only',
      async () => {
        await userEvent.click(getBirthLocationInput(canvasElement))

        const listbox = await canvas.findByRole('listbox')
        await within(listbox).findByText('New Riverside Health Post')
        await expect(
          within(listbox).queryByText('Old Riverside Health Post')
        ).not.toBeInTheDocument()
      }
    )
  }
}

/**
 * A facility selected while valid gets cleared once the date of birth moves
 * to a date before the facility was ever active — the stored selection would
 * otherwise silently stay invalid.
 */
export const ClearsWhenBecomesInactive: Story = {
  parameters: storyParams,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      'Select Health Institution and pick a facility valid today',
      async () => {
        await selectHealthInstitutionPlaceOfBirth(canvas)

        await selectEvent.select(
          getBirthLocationInput(canvasElement),
          'New Riverside Health Post'
        )
        await within(getBirthLocationContainer(canvasElement)).findByText(
          'New Riverside Health Post'
        )
      }
    )

    await step(
      'Entering a date of birth before the facility was ever active clears the selection',
      async () => {
        await typeDateOfBirth(canvas, '25', '04', '1995')

        await waitFor(async () =>
          expect(
            within(getBirthLocationContainer(canvasElement)).queryByText(
              'New Riverside Health Post'
            )
          ).not.toBeInTheDocument()
        )
      }
    )
  }
}

/**
 * A facility that was renamed but stayed active throughout still gets
 * cleared when the date of birth moves before the rename — a version change
 * invalidates the selection even when the location stays selectable, so the
 * registrar always re-confirms rather than silently seeing a different name.
 */
export const ClearsAcrossRename: Story = {
  parameters: storyParams,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step(
      'Select Health Institution and pick the always-active facility',
      async () => {
        await selectHealthInstitutionPlaceOfBirth(canvas)

        await selectEvent.select(
          getBirthLocationInput(canvasElement),
          'Greater Pangasinan Clinic'
        )
        await within(getBirthLocationContainer(canvasElement)).findByText(
          'Greater Pangasinan Clinic'
        )
      }
    )

    await step(
      'Entering a date of birth before the rename clears the selection',
      async () => {
        await typeDateOfBirth(canvas, '25', '04', '1995')

        await waitFor(async () =>
          expect(
            within(getBirthLocationContainer(canvasElement)).queryByText(
              'Greater Pangasinan Clinic'
            )
          ).not.toBeInTheDocument()
        )
      }
    )
  }
}
