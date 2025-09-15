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
import { useSelector } from 'react-redux'
import { IntlShape, useIntl } from 'react-intl'
import { Location } from '@events/service/locations/locations'
import { LocationSearch as LocationSearchComponent } from '@opencrvs/components'
import { FieldPropsWithoutReferenceValue } from '@opencrvs/commons/client'
import { getOfflineData } from '@client/offline/selectors'
import { getListOfLocations } from '@client/utils/validate'
import { generateLocations } from '@client/utils/locationUtils'
import { Stringifiable } from '@client/v2-events/components/forms/utils'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import { IAdminStructureItem } from '@client/utils/referenceApi'
import { getAdminLevelHierarchy } from '@client/v2-events/utils'

interface SearchLocation {
  id: string
  searchableText: string
  displayLabel: string
}

function useAdministrativeAreas(
  searchableResource: ('locations' | 'facilities' | 'offices')[]
) {
  const offlineCountryConfig = useSelector(getOfflineData)
  const intl = useIntl()
  const locationList = generateLocations(
    searchableResource.reduce((locations, resource) => {
      return {
        ...locations,
        ...getListOfLocations(offlineCountryConfig, resource)
      }
    }, {}),
    intl
  )

  return locationList
}

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
}) {
  const locationList = useAdministrativeAreas(searchableResource)
  const selectedLocation = locationList.find(
    (location) => location.id === value
  )

  return (
    <LocationSearchComponent
      buttonLabel="Health facility"
      locationList={locationList}
      searchHandler={(location: SearchLocation) => {
        if (location.id === '0') {
          onChange(undefined)
          return
        }

        onChange(location.id)
      }}
      selectedLocation={selectedLocation}
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
    locations: Location[]
    adminLevels?: IAdminStructureItem[]
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

  return [name, ...resolvedAdminLevels, country]
    .filter((loc) => loc !== '')
    .join(', ')
}

export const LocationSearch = {
  Input: LocationSearchInput,
  Output: LocationSearchOutput,
  toCertificateVariables: toCertificateVariables
}
