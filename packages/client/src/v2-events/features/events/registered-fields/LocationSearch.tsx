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
import { FieldProps } from '@opencrvs/commons/client'
import { getOfflineData } from '@client/offline/selectors'
import { getListOfLocations } from '@client/utils/validate'
import { generateLocations } from '@client/utils/locationUtils'
import { Stringifiable } from '@client/v2-events/components/forms/utils'
import { useLocations } from '@client/v2-events/hooks/useLocations'

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
  ...props
}: FieldProps<'LOCATION' | 'OFFICE' | 'FACILITY'> & {
  onChange: (val: string | undefined) => void
  searchableResource: ('locations' | 'facilities' | 'offices')[]
  value?: string
}) {
  const locationList = useAdministrativeAreas(searchableResource)
  const selectedLocation = locationList.find(
    (location) => location.id === value
  )

  return (
    <LocationSearchComponent
      buttonLabel="Health facility"
      locationList={locationList}
      searchHandler={(location: SearchLocation) => onChange(location.id)}
      selectedLocation={selectedLocation}
      {...props}
    />
  )
}

function stringify(
  intl: IntlShape,
  locations: Location[],
  value: Stringifiable | undefined | null
) {
  const country = intl.formatMessage({
    id: `countries.${window.config.COUNTRY}`,
    defaultMessage: 'Farajaland',
    description: 'Country name'
  })

  if (!value) {
    return {
      location: '',
      district: '',
      province: '',
      country
    }
  }

  const locationId = value.toString()
  const location = locations.find((loc) => loc.id === locationId)
  const district = locations.find((loc) => loc.id === location?.partOf)
  const province = locations.find((loc) => loc.id === district?.partOf)

  return {
    location: location?.name || '',
    district: district?.name || '',
    province: province?.name || '',
    country: country
  }
}

function LocationSearchOutput({ value }: { value: Stringifiable }) {
  const intl = useIntl()
  const { getLocations } = useLocations()
  const [locations] = getLocations.useSuspenseQuery()
  const { location, district, province, country } = stringify(
    intl,
    locations,
    value
  )

  const locationsArray = [location, district, province, country].filter(
    (loc) => loc !== ''
  )

  return locationsArray.join(', ')
}

export const LocationSearch = {
  Input: LocationSearchInput,
  Output: LocationSearchOutput,
  stringify
}
