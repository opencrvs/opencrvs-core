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
import React, { useMemo } from 'react'
import { IntlShape, useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import {
  ClientAdministrativeArea,
  ClientLocation,
  FieldPropsWithoutReferenceValue,
  UUID,
  joinValues,
  JurisdictionFilter,
  isSelectableAtAnchor,
  resolveJurisdictionReference,
  resolveVersion,
  PlainDate
} from '@opencrvs/commons/client'
import { getOfflineData } from '@client/offline/selectors'
import { Stringifiable } from '@client/v2-events/components/forms/utils'
import { useClearStaleSelectionOnAnchorChange } from '@client/v2-events/hooks/useClearStaleSelectionOnAnchorChange'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import { AdminStructureItem } from '@client/utils/referenceApi'
import {
  buildHistoricalLocationNameOptions,
  findLocationOption,
  getAdminLevelHierarchy,
  LocationOption,
  resolveLocationValue,
  toLocationId
} from '@client/v2-events/utils'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { getUserDetails } from '@client/profile/profileSelectors'
import { SearchableSelect } from '@client/v2-events/components/forms/inputs/SearchableSelect'
import { isLocationUnderJurisdiction } from '@client/utils/locationUtils'
import { getToken } from '@client/utils/authUtils'
import { useAdministrativeAreas } from '../../../hooks/useAdministrativeAreas'

/**
 * Pure filtering logic for location options, separated from React hook concerns for testability.
 *
 * - 'location' jurisdiction: returns only the user's own office if it matches locationTypes, otherwise [].
 * - 'administrativeArea' jurisdiction: returns locations within the user's admin area hierarchy, or [] if userLocationId is unknown.
 * - no filter / 'all': returns all locations matching locationTypes.
 */
export function filterLocationsByJurisdiction({
  locations,
  administrativeAreas,
  userLocationId,
  locationTypes,
  jurisdictionFilter
}: {
  locations: Map<UUID, ClientLocation>
  administrativeAreas: Map<UUID, ClientAdministrativeArea>
  userLocationId: string | undefined
  locationTypes?: string[]
  jurisdictionFilter?: JurisdictionFilter
}): ClientLocation[] {
  const matchesType = (location: ClientLocation) =>
    location.locationType &&
    (locationTypes ? locationTypes.includes(location.locationType) : true)

  const allOptions = Array.from(locations.values()).filter(matchesType)

  if (
    jurisdictionFilter === JurisdictionFilter.enum.location &&
    userLocationId
  ) {
    // If the jurisdiction filter is only for the user's own location, return their office
    // only if it matches the required locationTypes. A user whose office is a CRVS_OFFICE
    // should not appear as an option in a HEALTH_FACILITY field — return nothing instead,
    // since their 'location' scope does not extend to other locations of the correct type.
    const userOffice = locations.get(UUID.parse(userLocationId))
    return userOffice && matchesType(userOffice) ? [userOffice] : []
  }

  if (jurisdictionFilter === JurisdictionFilter.enum.administrativeArea) {
    if (!userLocationId) {
      // If we need to filter by administrative area but don't know the user's location, we can't determine their admin area - return no options
      return []
    }
    return allOptions.filter((o) =>
      isLocationUnderJurisdiction({
        locationId: userLocationId,
        otherLocationId: o.id,
        locations,
        administrativeAreas
      })
    )
  }

  return allOptions
}

/**
 * Return the available location options. The options will be filtered based on the jurisdiction filter.
 */
function useAvailableLocations(
  locationTypes?: string[],
  jurisdictionFilter?: JurisdictionFilter
) {
  const { getLocations } = useLocations()
  const { getAdministrativeAreas } = useAdministrativeAreas()
  const locations = getLocations.useSuspenseQuery()
  const administrativeAreas = getAdministrativeAreas.useSuspenseQuery()
  const userDetails = useSelector(getUserDetails)
  const userLocationId = userDetails?.primaryOfficeId

  return useMemo(
    () =>
      filterLocationsByJurisdiction({
        locations,
        administrativeAreas,
        userLocationId,
        locationTypes,
        jurisdictionFilter
      }),
    [
      locations,
      administrativeAreas,
      userLocationId,
      locationTypes,
      jurisdictionFilter
    ]
  )
}

function LocationSearchInput({
  onChange,
  value,
  locationTypes,
  onBlur,
  id,
  eventType,
  anchor,
  ...props
}: FieldPropsWithoutReferenceValue<'LOCATION' | 'OFFICE' | 'FACILITY'> & {
  onChange: (val: string | undefined) => void
  locationTypes?: string[]
  value?: string
  onBlur?: (e: React.FocusEvent<HTMLElement>) => void
  disabled?: boolean
  id: string
  eventType?: string
  anchor: PlainDate
}) {
  const token = useSelector(getToken)
  const jurisdictionFilter = resolveJurisdictionReference(
    props.configuration?.allowedLocations,
    token,
    eventType
  )

  const locations = useAvailableLocations(locationTypes, jurisdictionFilter)

  const anchorToDateOfEvent = Boolean(props.configuration?.anchorToDateOfEvent)

  const { getLocations: getLocationsForStaleCheck } = useLocations()
  const allLocations = getLocationsForStaleCheck.useSuspenseQuery()
  useClearStaleSelectionOnAnchorChange({
    enabled: anchorToDateOfEvent,
    value: toLocationId(value),
    anchor,
    entities: allLocations,
    onClear: () => onChange(undefined)
  })

  // `activeOnly` alone controls whether inactive/not-yet-effective locations
  // are dropped from the list; `anchorToDateOfEvent` only changes which date
  // `anchor` is resolved against (event date vs today) — the two are
  // orthogonal, so a field must opt into both to anchor-and-exclude.
  const activeOnly = Boolean(props.configuration?.activeOnly)

  const selectableLocations = useMemo(
    () =>
      activeOnly
        ? locations.filter((l) => isSelectableAtAnchor(l.versions, anchor))
        : locations,
    [locations, anchor, activeOnly]
  )

  // When the field config opts in (advanced search sets this), list every
  // historical name so records saved under an outdated name stay findable.
  // Otherwise show a single current-name option, resolved at the field's anchor.
  const options: LocationOption[] = useMemo(
    () =>
      props.configuration?.listHistoricalNames
        ? buildHistoricalLocationNameOptions(selectableLocations)
        : selectableLocations.map((l) => ({
            value: l.id,
            label: resolveVersion(l.versions, anchor).name
          })),
    [selectableLocations, props.configuration?.listHistoricalNames, anchor]
  )

  const selectedOption = findLocationOption(options, value)

  return (
    <SearchableSelect
      data-testid={'location__' + id}
      disabled={props.disabled}
      id={id}
      options={options}
      value={selectedOption}
      onChange={(opt) => {
        onChange(opt?.value ?? undefined)
      }}
    />
  )
}

function toCertificateVariables(
  value: Stringifiable | undefined | null,
  context: {
    intl: IntlShape
    locations: Map<UUID, ClientLocation>
    administrativeAreas: Map<UUID, ClientAdministrativeArea>
    anchor: PlainDate
    adminLevels?: AdminStructureItem[]
  }
) {
  const {
    intl,
    locations,
    administrativeAreas,
    anchor,
    adminLevels = []
  } = context
  const appConfigAdminLevels = adminLevels.map((level) => level.id)

  if (!value) {
    return {
      name: '',
      ...Object.fromEntries(adminLevels.map((level) => [level, ''])),
      country: ''
    }
  }

  const country = intl.formatMessage({
    id: `countries.${window.config.COUNTRY}`,
    defaultMessage: 'Farajaland',
    description: 'Country name'
  })

  // A search value is version-pinned — echo back the name that was actually
  // selected, not whatever the location is called today.
  const selection =
    resolveLocationValue(value, locations, anchor) ??
    resolveLocationValue(value, administrativeAreas, anchor)
  const resolvedLocation = selection?.version

  const selectedId = selection?.entity.id
  const parentAdministrativeAreaId = selectedId
    ? (locations.get(selectedId)?.administrativeAreaId ??
      administrativeAreas.get(selectedId)?.parentId)
    : undefined

  const adminLevelHierarchy = getAdminLevelHierarchy(
    parentAdministrativeAreaId,
    administrativeAreas,
    appConfigAdminLevels,
    'withNames',
    anchor
  )

  return {
    name: resolvedLocation?.name || '',
    ...adminLevelHierarchy,
    country
  }
}

function LocationSearchOutput({
  value,
  anchor
}: {
  value: Stringifiable
  anchor: PlainDate
}) {
  const intl = useIntl()
  const { getLocations } = useLocations()
  const { getAdministrativeAreas } = useAdministrativeAreas()

  const { config } = useSelector(getOfflineData)

  const locations = getLocations.useSuspenseQuery()
  const administrativeAreas = getAdministrativeAreas.useSuspenseQuery()
  const adminLevels = config.ADMIN_STRUCTURE

  const certificateVars = toCertificateVariables(value, {
    intl,
    locations,
    administrativeAreas,
    anchor,
    adminLevels
  })
  const { name, country } = certificateVars

  const resolvedAdminLevels = adminLevels
    .map((level) => certificateVars[level.id])
    .filter(Boolean)
    .reverse()

  return joinValues([name, ...resolvedAdminLevels, country], ', ')
}

function isLocationEmpty(value: Stringifiable) {
  return !value.toString()
}

export const LocationSearch = {
  Input: withSuspense(LocationSearchInput),
  Output: LocationSearchOutput,
  toCertificateVariables,
  isEmptyValue: isLocationEmpty
}
