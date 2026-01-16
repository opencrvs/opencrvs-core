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
import { IntlShape, useIntl } from 'react-intl'
import { useSelector } from 'react-redux'
import { LocationSearch as LocationSearchComponent } from '@opencrvs/components'
import {
  FieldPropsWithoutReferenceValue,
  Location,
  UUID,
  joinValues,
  AdministrativeArea
} from '@opencrvs/commons/client'
import { getOfflineData } from '@client/offline/selectors'
import { Stringifiable } from '@client/v2-events/components/forms/utils'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import { AdminStructureItem } from '@client/utils/referenceApi'
import { getAdminLevelHierarchy } from '@client/v2-events/utils'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { useAdministrativeAreas } from '../../../hooks/useAdministrativeAreas'

interface SearchLocation {
  id: string
  searchableText: string
  displayLabel: string
}

/**
 * @deprecated
 *  In v2.0 resource mapping will be dynamic.
 */
const resourceTypeMap: Record<'locations' | 'facilities' | 'offices', string> =
  {
    locations: 'ADMIN_STRUCTURE',
    facilities: 'HEALTH_FACILITY',
    offices: 'CRVS_OFFICE'
  }

function useCreateSearchOptions(
  searchableResource: ('locations' | 'facilities' | 'offices')[]
) {
  const { getLocations } = useLocations()
  const { getAdministrativeAreas } = useAdministrativeAreas()
  const locations = getLocations.useSuspenseQuery({})
  const administrativeAreas = getAdministrativeAreas.useSuspenseQuery()

  return React.useMemo(() => {
    const searchableResources: (Location | AdministrativeArea)[] = []

    if (searchableResource.includes('locations')) {
      searchableResources.push(...Array.from(administrativeAreas.values()))
    }

    for (const [, location] of locations) {
      if (
        location.locationType &&
        searchableResource.some(
          (r) =>
            resourceTypeMap[r satisfies keyof typeof resourceTypeMap] ===
            location.locationType
        )
      ) {
        searchableResources.push(location)
      }
    }

    return searchableResources.map((resource) => ({
      id: resource.id,
      searchableText: resource.name.toLowerCase(),
      displayLabel: resource.name
    }))
  }, [searchableResource, locations, administrativeAreas])
}

/**
 * @deprecated -- Use/replace with SearchableSelect 1.10 onwards.
 */
function LocationSearchInput({
  onChange,
  value,
  searchableResource,
  onBlur,
  ...props
}: FieldPropsWithoutReferenceValue<'LOCATION' | 'OFFICE' | 'FACILITY'> & {
  onChange: (val: string | undefined) => void
  searchableResource: ('locations' | 'facilities' | 'offices')[]
  value?: string
  onBlur?: (e: React.FocusEvent<HTMLElement>) => void
  disabled?: boolean
}) {
  const options = useCreateSearchOptions(searchableResource)
  const selectedOption = options.find((option) => option.id === value)

  return (
    <LocationSearchComponent
      buttonLabel="Health facility"
      locationList={options}
      searchHandler={(location: SearchLocation) => {
        if (location.id === '0') {
          onChange(undefined)
          return
        }

        onChange(location.id)
      }}
      selectedLocation={selectedOption}
      onBlur={(...args) => {
        /*
         * This is here purely for legacy reasons.
         * As without passing this in, onChange will not trigger.
         */
        onBlur?.(...args)
      }}
      {...props}
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
    (location as Location).administrativeAreaId ??
    (location as AdministrativeArea).parentId

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
