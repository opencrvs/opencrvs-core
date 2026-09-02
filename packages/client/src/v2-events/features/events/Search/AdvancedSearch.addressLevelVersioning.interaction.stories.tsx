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

import React from 'react'
import { Meta, StoryObj } from '@storybook/react-vite'
import { userEvent, within, expect, waitFor } from 'storybook/test'
import { createTRPCMsw, httpLink } from '@vafanassieff/msw-trpc'
import superjson from 'superjson'
import {
  AddressType,
  AdministrativeArea,
  and,
  ChildOnboardingEvent,
  ConditionalType,
  EventConfig,
  field,
  FieldType,
  not,
  footballClubMembershipEvent,
  tennisClubMembershipEvent,
  TestUserRole,
  UUID,
  user,
  V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS,
  V2_DEFAULT_MOCK_LOCATIONS
} from '@opencrvs/commons/client'
import { toNamedVersions } from '@client/v2-events/VersionedLocation'
import * as selectEvent from '@client/v2-events/select-event'
import { serializeSearchParams } from '@client/v2-events/features/events/Search/utils'
import { testDataGenerator } from '@client/tests/test-data-generators'
import { TRPCProvider, AppRouter } from '@client/v2-events/trpc'
import { ROUTES, routesConfig } from '@client/v2-events/routes'
import { AdvancedSearch } from './index'

const meta: Meta<typeof AdvancedSearch> = {
  title: 'AdvancedSearch/AddressLevelVersioning',
  component: AdvancedSearch,
  decorators: [
    (Story) => (
      <TRPCProvider>
        <Story />
      </TRPCProvider>
    )
  ]
}
export default meta

type Story = StoryObj<typeof AdvancedSearch>

const tRPCMsw = createTRPCMsw<AppRouter>({
  links: [httpLink({ url: '/api/events' })],
  transformer: { input: superjson, output: superjson }
})

/**
 * A three-level administrative chain where every level has been renamed twice,
 * so each offers three names in its dropdown. `ZZ` prefixes keep them sortable
 * past the dropdown's initial render cap, the way the existing address stories
 * surface custom areas.
 */
const RENAMED_PROVINCE_ID = 'aa000001-0000-4000-8000-000000000000' as UUID
const RENAMED_DISTRICT_ID = 'aa000002-0000-4000-8000-000000000000' as UUID
const RENAMED_VILLAGE_ID = 'aa000003-0000-4000-8000-000000000000' as UUID

function renamedArea(
  id: UUID,
  parentId: UUID | null,
  names: [string, string, string]
): AdministrativeArea {
  const effectiveFrom = ['0001-01-01', '2023-01-01', '2025-01-01']

  return {
    id,
    name: names[names.length - 1],
    externalId: null,
    parentId,
    status: 'active',
    versions: names.map((name, index) => ({
      /*
       * Derived from the id's leading groups, so the three areas must differ
       * there rather than in their trailing group — otherwise they would share
       * version ids. Numbered from 1 so no version id equals its own area id.
       */
      versionId:
        `${id.slice(0, 24)}${String(index + 1).padStart(12, '0')}` as UUID,
      effectiveFrom: effectiveFrom[index],
      name,
      externalId: null,
      status: 'active'
    }))
  }
}

const RENAMED_PROVINCE = renamedArea(RENAMED_PROVINCE_ID, null, [
  'ZZ Old Central State',
  'ZZ Mid Central State',
  'ZZ New Central State'
])

const RENAMED_DISTRICT = renamedArea(RENAMED_DISTRICT_ID, RENAMED_PROVINCE_ID, [
  'ZZ Old Ibombo District',
  'ZZ Mid Ibombo District',
  'ZZ New Ibombo District'
])

const RENAMED_VILLAGE = renamedArea(RENAMED_VILLAGE_ID, RENAMED_DISTRICT_ID, [
  'ZZ Old Klow Village',
  'ZZ Mid Klow Village',
  'ZZ New Klow Village'
])

const mockAdministrativeAreas: AdministrativeArea[] = [
  ...V2_DEFAULT_MOCK_ADMINISTRATIVE_AREAS,
  RENAMED_PROVINCE,
  RENAMED_DISTRICT,
  RENAMED_VILLAGE
]

/**
 * ChildOnboardingEvent with an advanced search section covering the residential
 * address, so the admin-structure chain is reachable from the search form.
 */
/**
 * A street-level field guarded the way a country configuration guards them:
 * by bare sibling ids (@see defaultStreetAddressConfiguration in testland).
 * Those ids only resolve inside the address's own scope, so this is what proves
 * the search group gives its subfields that scope rather than the outer form's.
 */
const STREET_IDS = ['town', 'residentialArea', 'street'] as const

const STREET_FIELDS = STREET_IDS.map((id) => ({
  id,
  type: FieldType.TEXT,
  required: false,
  label: {
    defaultMessage: id,
    description: `${id} field label`,
    id: `field.address.${id}.label`
  },
  conditionals: [
    {
      type: ConditionalType.SHOW,
      conditional: and(
        not(field('country').isUndefined()),
        field('addressType').isEqualTo(AddressType.DOMESTIC),
        not(field('district').isUndefined())
      )
    }
  ]
}))

/** ChildOnboardingEvent, with street fields added to the searched address. */
const childOnboardingDeclarationWithStreet = {
  ...ChildOnboardingEvent.declaration,
  pages: ChildOnboardingEvent.declaration.pages.map((page) => ({
    ...page,
    fields: page.fields.map((pageField) =>
      pageField.id === 'child.birthLocation.privateHome' &&
      pageField.type === FieldType.ADDRESS
        ? {
            ...pageField,
            configuration: {
              ...pageField.configuration,
              streetAddressForm: STREET_FIELDS
            }
          }
        : pageField
    )
  }))
} as EventConfig['declaration']

const childOnboardingWithAddressSearch: EventConfig = {
  ...ChildOnboardingEvent,
  declaration: childOnboardingDeclarationWithStreet,
  advancedSearch: [
    {
      title: {
        defaultMessage: 'Event details',
        description: 'Event details accordion title',
        id: 'advancedSearch.form.eventDetails'
      },
      fields: [
        field('child.placeOfBirth').exact(),
        field('child.birthLocation.privateHome', {
          allowedLocations: user.jurisdiction(
            user.scope('record.search').attribute('placeOfEvent')
          )
        }).exact()
      ]
    }
  ]
}

const generator = testDataGenerator()

const mockUser = {
  ...generator.user.communityLeader().summary,
  primaryOfficeId: '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID
}

const mockUserFull = {
  ...generator.user.communityLeader().v2,
  primaryOfficeId: '028d2c85-ca31-426d-b5d1-2cef545a4902' as UUID
}

const mswConfig = {
  handlers: {
    events: [
      tRPCMsw.event.config.get.query(() => [
        childOnboardingWithAddressSearch,
        tennisClubMembershipEvent,
        footballClubMembershipEvent
      ])
    ],
    eventLocations: [
      tRPCMsw.locations.list.query(() => V2_DEFAULT_MOCK_LOCATIONS),
      tRPCMsw.administrativeAreas.list.query(() => mockAdministrativeAreas)
    ],
    user: [
      tRPCMsw.user.list.query(() => [mockUser]),
      tRPCMsw.user.get.query(() => mockUserFull)
    ]
  }
}

const searchMswConfig = {
  handlers: {
    ...mswConfig.handlers,
    events: [
      ...mswConfig.handlers.events,
      tRPCMsw.event.search.query(() => ({ results: [], total: 0 }))
    ]
  }
}

const storyParams = {
  userRole: TestUserRole.enum.COMMUNITY_LEADER,
  reactRouter: {
    router: routesConfig,
    initialPath: ROUTES.V2.ADVANCED_SEARCH.buildPath({})
  },
  chromatic: { disableSnapshot: true },
  offline: {
    configs: [
      childOnboardingWithAddressSearch,
      tennisClubMembershipEvent,
      footballClubMembershipEvent
    ]
  }
}

/**
 * The old-name pin of each level, keyed by the level it belongs to — the search
 * form holds an address filter as one entry per level
 * (@see toAddressSearchGroup), not as a single collapsed value.
 */
const OLD_NAME_CHAIN = {
  province: toNamedVersions(RENAMED_PROVINCE)[0].selection,
  district: toNamedVersions(RENAMED_DISTRICT)[0].selection,
  village: toNamedVersions(RENAMED_VILLAGE)[0].selection
}

/**
 * The address filter renders as a FIELD_GROUP under the address field's own id
 * (@see withSearchLocationBehaviour), so every level is addressed through the
 * group rather than by its bare level id.
 */
const ADDRESS_GROUP = 'child.birthLocation.privateHome'.replaceAll('.', '____')

function levelId(level: string) {
  return `${ADDRESS_GROUP}.${level}`
}

/**
 * An attribute selector, not `#id` — the group prefix and the level are joined
 * by a dot, which a CSS id selector would read as a class.
 */
function levelSelector(level: string, suffix: string) {
  return `[id="searchable-select-${levelId(level)}"] ${suffix}`
}

async function openAddressAdminChain(
  canvasElement: HTMLElement,
  canvas: ReturnType<typeof within>
) {
  const accordion = await canvas.findByTestId(
    'accordion-advancedSearch.form.eventDetails'
  )
  await userEvent.click(within(accordion).getByRole('button', { name: 'Show' }))

  const placeOfBirth = await canvas.findByTestId(
    'select__child____placeOfBirth'
  )
  await selectEvent.select(placeOfBirth, 'Residential address')

  const country = await canvas.findByTestId(`location__${levelId('country')}`)
  await selectEvent.select(country, 'Bangladesh')
}

/**
 * Finds an option by label in whichever listbox is currently open.
 *
 * The listbox is re-created while react-select loads its filtered options, so a
 * node captured up front goes stale and never sees them. Re-query it on every
 * attempt instead of holding a reference.
 */
async function findDropdownOption(
  canvas: ReturnType<typeof within>,
  label: string
) {
  // Synchronous queries inside `waitFor`: nesting `find*` in it gives the inner
  // query its own budget, which expires before the outer one can retry.
  return waitFor(() => within(canvas.getByRole('listbox')).getByText(label), {
    timeout: 5000
  })
}

/**
 * Opens one admin-level dropdown and narrows it to the custom `ZZ` areas.
 *
 * The search term is cleared first: the levels are opened more than once per
 * story, and typing into an input that already holds `ZZ` would search for
 * `ZZZZ` and match nothing.
 */
async function openLevelDropdown(canvasElement: HTMLElement, level: string) {
  await waitFor(() => {
    if (!canvasElement.querySelector(levelSelector(level, 'input'))) {
      throw new Error(`${level} input not rendered yet`)
    }
  })

  const input = canvasElement.querySelector(levelSelector(level, 'input'))

  if (!input) {
    throw new Error(`${level} input not found`)
  }

  await userEvent.click(input)
  await userEvent.clear(input)
  await userEvent.type(input, 'ZZ')
}

/** Picks `label` in the admin-level dropdown with the given field id. */
async function pickAdminLevel(
  canvasElement: HTMLElement,
  canvas: ReturnType<typeof within>,
  level: string,
  label: string
) {
  await openLevelDropdown(canvasElement, level)
  await userEvent.click(await findDropdownOption(canvas, label))
}

function selectedValueOf(canvasElement: HTMLElement, level: string) {
  return canvasElement.querySelector(
    levelSelector(level, '.react-select__single-value')
  )
}

/**
 * Every level of a renamed address chain keeps the name it was picked under.
 *
 * The address value stores only the deepest level and rebuilds its ancestors
 * from it, so without a pin per level the province and district dropdowns would
 * flip to their current names the moment a village was chosen.
 */
export const EveryAddressLevelKeepsItsPickedName: Story = {
  parameters: {
    ...storyParams,
    token: generator.user.token.communityLeaderSearchAllAndLocation,
    msw: mswConfig
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Open the residential-address filter', async () => {
      await openAddressAdminChain(canvasElement, canvas)
    })

    await step('Each level offers all three of its names', async () => {
      await openLevelDropdown(canvasElement, 'province')

      await findDropdownOption(canvas, 'ZZ Old Central State')
      await findDropdownOption(canvas, 'ZZ Mid Central State')
      await findDropdownOption(canvas, 'ZZ New Central State')
    })

    await step('Pick the oldest name at all three levels', async () => {
      await pickAdminLevel(
        canvasElement,
        canvas,
        'province',
        'ZZ Old Central State'
      )
      await pickAdminLevel(
        canvasElement,
        canvas,
        'district',
        'ZZ Old Ibombo District'
      )
      await pickAdminLevel(
        canvasElement,
        canvas,
        'village',
        'ZZ Old Klow Village'
      )
    })

    await step(
      'All three keep the picked name after the chain is complete',
      async () => {
        await waitFor(async () => {
          await expect(
            selectedValueOf(canvasElement, 'province')
          ).toHaveTextContent('ZZ Old Central State')
          await expect(
            selectedValueOf(canvasElement, 'district')
          ).toHaveTextContent('ZZ Old Ibombo District')
          await expect(
            selectedValueOf(canvasElement, 'village')
          ).toHaveTextContent('ZZ Old Klow Village')
        })
      }
    )
  }
}

/**
 * A street field configured on the address appears in the search filter once the
 * chain reaches the level it waits for.
 *
 * Its SHOW conditional is written against bare sibling ids — `country`,
 * `addressType`, `district` — which is how a country configuration writes them.
 * The declaration form gives those ids a scope by rendering the address in its
 * own nested form; the search filter is a FIELD_GROUP in the outer form, where
 * the whole address sits under one key, so the group has to supply that scope
 * itself. Without it the street field is silently never shown.
 */
export const StreetFieldAppearsOnceTheChainReachesDistrict: Story = {
  parameters: {
    ...storyParams,
    token: generator.user.token.communityLeaderSearchAllAndLocation,
    msw: mswConfig
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)
    const streetTestId = `text__${ADDRESS_GROUP}.street`

    await openAddressAdminChain(canvasElement, canvas)

    await step('Street is hidden before a district is picked', async () => {
      await expect(canvas.queryByTestId(streetTestId)).toBeNull()

      await pickAdminLevel(
        canvasElement,
        canvas,
        'province',
        'ZZ Old Central State'
      )
      await expect(canvas.queryByTestId(streetTestId)).toBeNull()
    })

    await step(
      'Every street field appears once the district is picked',
      async () => {
        await pickAdminLevel(
          canvasElement,
          canvas,
          'district',
          'ZZ Old Ibombo District'
        )

        // All of them, not just the first — they share one conditional, so a
        // partial render would mean the group's scope is reaching some and not
        // others.
        for (const id of STREET_IDS) {
          await canvas.findByTestId(`text__${ADDRESS_GROUP}.${id}`)
        }
      }
    )
  }
}

/**
 * The criteria pill spells the address out level by level, and each level reads
 * back as the name that was picked rather than the one the area carries today.
 */
export const ResultsPillEchoesEveryPickedAddressLevel: Story = {
  parameters: {
    ...storyParams,
    token: generator.user.token.communityLeaderSearchAllAndLocation,
    msw: searchMswConfig,
    reactRouter: {
      router: routesConfig,
      initialPath: `${ROUTES.V2.SEARCH_RESULT.buildPath({
        eventType: ChildOnboardingEvent.id
      })}?${serializeSearchParams({
        'child.placeOfBirth': 'PRIVATE_HOME',
        'child.birthLocation.privateHome': {
          country: 'BGD',
          ...OLD_NAME_CHAIN,
          town: 'ZZ Town',
          residentialArea: 'ZZ Area',
          street: 'ZZ Street'
        },
        eventType: ChildOnboardingEvent.id
      })}`
    }
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement)

    await step('Search results render', async () => {
      await canvas.findByTestId('search-result', {}, { timeout: 5000 })
    })

    await step('Every level of the pill shows its picked name', async () => {
      /*
       * Asserted as one contiguous run rather than three separate `toContain`s.
       * `textContent` ignores markup, so per-name checks pass even when the
       * levels are rendered on separate lines with blank entries between them —
       * matching the exact string is what pins the comma separator, the order,
       * and the absence of empty levels.
       */
      await waitFor(async () => {
        await expect(canvasElement.textContent).toContain(
          'ZZ Old Central State, ZZ Old Ibombo District, ZZ Old Klow Village'
        )
        await expect(canvasElement.textContent).toContain(
          'ZZ Town, ZZ Area, ZZ Street'
        )
      })
    })

    await step('No level falls back to its current name', async () => {
      await expect(canvasElement.textContent).not.toContain(
        'ZZ New Central State'
      )
      await expect(canvasElement.textContent).not.toContain(
        'ZZ New Ibombo District'
      )
      await expect(canvasElement.textContent).not.toContain(
        'ZZ New Klow Village'
      )
    })
  }
}
