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
  FieldPropsWithoutReferenceValue,
  Location,
  LocationVersion,
  UUID,
  joinValues,
  AdministrativeArea,
  JurisdictionFilter,
  resolveJurisdictionReference
} from '@opencrvs/commons/client'
import { getOfflineData } from '@client/offline/selectors'
import { Stringifiable } from '@client/v2-events/components/forms/utils'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import { AdminStructureItem } from '@client/utils/referenceApi'
import { getAdminLevelHierarchy } from '@client/v2-events/utils'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { getUserDetails } from '@client/profile/profileSelectors'
import { SearchableSelect } from '@client/v2-events/components/forms/inputs/SearchableSelect'
import { isLocationUnderJurisdiction } from '@client/utils/locationUtils'
import { getToken } from '@client/utils/authUtils'
import { useIsSearchFilter } from '@client/v2-events/features/events/Search/SearchFilterContext'
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
  locations: Map<UUID, Location>
  administrativeAreas: Map<UUID, AdministrativeArea>
  userLocationId: string | undefined
  locationTypes?: string[]
  jurisdictionFilter?: JurisdictionFilter
}): Location[] {
  const matchesType = (location: Location) =>
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
 * Builds `{ value, label }` options for a location selector.
 *
 * In advanced search (`enumerateHistoricalNames`) a renamed location is listed
 * once per distinct name it has ever carried, so records saved under an old
 * name stay findable; every row resolves to the same location id. The current
 * name is listed first, so the field shows it after any row is picked.
 * Elsewhere a location contributes a single row with its current name.
 */
export function buildLocationNameOptions<
  T extends { id: UUID; name: string; versions: LocationVersion[] }
>(
  items: T[],
  enumerateHistoricalNames: boolean
): { value: UUID; label: string }[] {
  return items.flatMap((item) => {
    if (!enumerateHistoricalNames) {
      return [{ value: item.id, label: item.name }]
    }

    const distinctNames = [
      item.name,
      ...item.versions.map((version) => version.name)
    ].filter((name, index, names) => names.indexOf(name) === index)

    return distinctNames.map((name) => ({ value: item.id, label: name }))
  })
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
  ...props
}: FieldPropsWithoutReferenceValue<'LOCATION' | 'OFFICE' | 'FACILITY'> & {
  onChange: (val: string | undefined) => void
  locationTypes?: string[]
  value?: string
  onBlur?: (e: React.FocusEvent<HTMLElement>) => void
  disabled?: boolean
  id: string
  eventType?: string
}) {
  const token = useSelector(getToken)
  const jurisdictionFilter = resolveJurisdictionReference(
    props.configuration?.allowedLocations,
    token,
    eventType
  )

  const isSearchFilter = useIsSearchFilter()
  const locations = useAvailableLocations(locationTypes, jurisdictionFilter)

  const options = useMemo(
    () => buildLocationNameOptions(locations, isSearchFilter),
    [locations, isSearchFilter]
  )

  const selectedOption =
    options.find((option) => option.value === value) ?? null

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
    locations: Map<UUID, Location>
    administrativeAreas: Map<UUID, AdministrativeArea>
    adminLevels?: AdminStructureItem[]
  }
) {
  const { intl, locations, administrativeAreas, adminLevels = [] } = context
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

  const locationId = UUID.safeParse(value.toString()).data
  const location = locationId
    ? (locations.get(locationId) ?? administrativeAreas.get(locationId))
    : undefined

  const parentAdministrativeAreaId =
    (location as Location | undefined)?.administrativeAreaId ??
    (location as AdministrativeArea | undefined)?.parentId

  const adminLevelHierarchy = getAdminLevelHierarchy(
    parentAdministrativeAreaId,
    administrativeAreas,
    appConfigAdminLevels,
    'withNames'
  )

  return {
    name: location?.name || '',
    ...adminLevelHierarchy,
    country
  }
}

function LocationSearchOutput({ value }: { value: Stringifiable }) {
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
