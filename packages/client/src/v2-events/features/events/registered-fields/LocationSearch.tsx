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
import { useAdministrativeAreas } from '../../../hooks/useAdministrativeAreas'

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
  const userLocationId = userDetails?.primaryOffice.id

  // If the jurisdiction filter is only for users current location, we return the location as a single option.
  if (
    jurisdictionFilter === JurisdictionFilter.enum.location &&
    userLocationId
  ) {
    const location = locations.get(UUID.parse(userLocationId))
    return location ? [location] : []
  }

  const options = useMemo(() => {
    return Array.from(locations.values()).filter(
      (location) =>
        location.locationType &&
        (locationTypes ? locationTypes.includes(location.locationType) : true)
    )
  }, [locationTypes, locations])

  // If jurisdiction filter is administrative area, we filter the options to only include locations that are under the user's admin area jurisdiction.
  if (
    jurisdictionFilter === JurisdictionFilter.enum.administrativeArea &&
    userLocationId
  ) {
    return useMemo(
      () =>
        options.filter((o) =>
          isLocationUnderJurisdiction({
            locationId: userLocationId,
            otherLocationId: o.id,
            locations,
            administrativeAreas
          })
        ),
      [options, userLocationId, locations, administrativeAreas]
    )
  }

  return options
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

  const locations = useAvailableLocations(locationTypes, jurisdictionFilter)

  const options = useMemo(
    () => locations.map((l) => ({ value: l.id, label: l.name })),
    [locations]
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
