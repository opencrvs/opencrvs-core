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
import {
  ISearchLocation,
  LocationSearch as LocationSearchComponent
} from '@opencrvs/components'
import {
  FieldPropsWithoutReferenceValue,
  Location,
  LocationType,
  UUID,
  joinValues
} from '@opencrvs/commons/client'
import { getOfflineData } from '@client/offline/selectors'
import { Stringifiable } from '@client/v2-events/components/forms/utils'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import { AdminStructureItem } from '@client/utils/referenceApi'
import { getAdminLevelHierarchy } from '@client/v2-events/utils'
import { withSuspense } from '@client/v2-events/components/withSuspense'

interface SearchLocation {
  id: string
  searchableText: string
  displayLabel: string
}

const resourceTypeMap: Record<
  'locations' | 'facilities' | 'offices',
  LocationType
> = {
  locations: 'ADMIN_STRUCTURE',
  facilities: 'HEALTH_FACILITY',
  offices: 'CRVS_OFFICE'
}

function useAdministrativeAreas(
  searchableResource: ('locations' | 'facilities' | 'offices')[],
  parentId?: string | null
) {
  const { getLocations } = useLocations()
  const [allLocations] = getLocations.useSuspenseQuery({})

  return React.useMemo(() => {
    const resourceLocations = allLocations.filter((location) => {
      if (!location.locationType) {
        return false
      }

      const isRightLocationType = searchableResource.some(
        (r) =>
          resourceTypeMap[r satisfies keyof typeof resourceTypeMap] ===
          location.locationType
      )

      if (!isRightLocationType) {
        return false
      }

      if (parentId === undefined) {
        return true
      }

      return parentId === location.parentId
    })

    return resourceLocations.map((location) => ({
      id: location.id,
      searchableText: location.name.toLowerCase(),
      displayLabel: location.name
    }))
  }, [searchableResource, allLocations, parentId])
}

function LocationSearchInput({
  onChange,
  value,
  searchableResource,
  onBlur,
  partOf,
  ...props
}: FieldPropsWithoutReferenceValue<'LOCATION' | 'OFFICE' | 'FACILITY'> & {
  onChange: (val: string | null) => void
  searchableResource: ('locations' | 'facilities' | 'offices')[]
  value?: string
  onBlur?: (e: React.FocusEvent<HTMLElement>) => void
  disabled?: boolean
  /** Additional filter for location resources. */
  partOf?: string | null
}) {
  // 1. Get location options at the given hierarchy level.
  const locationList = useAdministrativeAreas(searchableResource, partOf)

  // 2. Cache location IDs for quick lookup. We expect there to be hundred of thousands of locations.
  const locationIdSet = React.useMemo(() => {
    return new Set(locationList.map((l) => l.id))
  }, [locationList])

  // 3. Set the selected location based on the value prop.
  const [selectedLocation, setSelectedLocation] = React.useState<
    ISearchLocation | undefined
  >(locationList.find((l) => l.id === value))

  // 4. When locations change (e.g. due to partOf change), update the selected location.
  React.useEffect(() => {
    if (value && locationIdSet.has(value as UUID)) {
      setSelectedLocation(locationList.find((l) => l.id === value))
    } else {
      setSelectedLocation(undefined)
    }
  }, [value, locationList, locationIdSet])

  // 5. If the current value is not valid anymore, clear it on all levels.
  React.useEffect(() => {
    if (value && !locationIdSet.has(value as UUID)) {
      setSelectedLocation(undefined)
      onChange(null)
    }
  }, [value, locationIdSet, onChange])

  return (
    <LocationSearchComponent
      buttonLabel="Health facility"
      locationList={locationList}
      searchHandler={(location: SearchLocation) => {
        // Ignore legacy default values.
        if (location.id === '' || location.id === '0') {
          setSelectedLocation(undefined)
          return
        }

        setSelectedLocation(location)
      }}
      selectedLocation={selectedLocation}
      showOptionsWhenEmpty={true}
      onBlur={(...args) => {
        onChange(selectedLocation?.id ?? null)
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
    locations: Location[]
    adminLevels?: AdminStructureItem[]
  }
) {
  const { intl, locations, adminLevels = [] } = context
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

  const locationId = value.toString()
  const location = locations.find((loc) => loc.id === locationId)

  const adminLevelHierarchy = getAdminLevelHierarchy(
    locationId,
    locations,
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
  const { config } = useSelector(getOfflineData)
  const [locations] = getLocations.useSuspenseQuery()
  const adminLevels = config.ADMIN_STRUCTURE

  const certificateVars = toCertificateVariables(value, {
    intl,
    locations,
    adminLevels
  })

  const { name, country } = certificateVars

  const resolvedAdminLevels = adminLevels
    .map((level) => certificateVars[level.id])
    .filter(Boolean)
    .reverse()

  const location = locations.find(({ id }) => id === value.toString())

  if (location?.locationType === LocationType.Enum.ADMIN_STRUCTURE) {
    return joinValues([...resolvedAdminLevels, country], ', ')
  }
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
