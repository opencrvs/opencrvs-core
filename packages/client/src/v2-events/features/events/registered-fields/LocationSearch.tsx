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
import { Location } from '@events/service/locations/locations'
import { LocationSearch as LocationSearchComponent } from '@opencrvs/components'
import { FieldPropsWithoutReferenceValue } from '@opencrvs/commons/client'
import { Stringifiable } from '@client/v2-events/components/forms/utils'
import { useLocations } from '@client/v2-events/hooks/useLocations'

interface SearchLocation {
  id: string
  searchableText: string
  displayLabel: string
}

const resourceTypeMap: Record<'locations' | 'facilities' | 'offices', string> =
  {
    locations: 'ADMIN_STRUCTURE',
    facilities: 'HEALTH_FACILITY',
    offices: 'CRVS_OFFICE'
  }

function useAdministrativeAreas(
  searchableResource: ('locations' | 'facilities' | 'offices')[]
) {
  const { getLocations } = useLocations()
  const [locations] = getLocations.useSuspenseQuery()
  const locationsBasedOnSearchableResource = locations.filter((location) =>
    searchableResource.some(
      (resource) => location.locationType === resourceTypeMap[resource]
    )
  )

  return locationsBasedOnSearchableResource.map((location) => ({
    id: location.id,
    searchableText: location.name.toLowerCase(),
    displayLabel: location.name
  }))
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
  }
) {
  if (!value) {
    return {
      name: '',
      district: '',
      province: '',
      country: ''
    }
  }

  const country = context.intl.formatMessage({
    id: `countries.${window.config.COUNTRY}`,
    defaultMessage: 'Farajaland',
    description: 'Country name'
  })

  const locationId = value.toString()
  const location = context.locations.find((loc) => loc.id === locationId)

  const district = context.locations.find(
    (loc) => loc.id === location?.parentId
  )
  const province = context.locations.find(
    (loc) => loc.id === district?.parentId
  )

  return {
    name: location?.name || '',
    district: district?.name || '',
    province: province?.name || '',
    country: country
  }
}

function LocationSearchOutput({ value }: { value: Stringifiable }) {
  const intl = useIntl()
  const { getLocations } = useLocations()
  const [locations] = getLocations.useSuspenseQuery()
  const { name, district, province, country } = toCertificateVariables(value, {
    intl,
    locations
  })

  return [name, district, province, country]
    .filter((loc) => loc !== '')
    .join(', ')
}

export const LocationSearch = {
  Input: LocationSearchInput,
  Output: LocationSearchOutput,
  toCertificateVariables: toCertificateVariables
}
