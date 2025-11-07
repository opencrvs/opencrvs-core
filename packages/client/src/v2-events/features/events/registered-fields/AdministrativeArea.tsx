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
import React, { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import {
  Location,
  FieldPropsWithoutReferenceValue,
  LocationType,
  UUID
} from '@opencrvs/commons/client'
import { getAdminStructureLocations } from '@client/offline/selectors'
import { Stringifiable } from '@client/v2-events/components/forms/utils'
import { EMPTY_TOKEN } from '@client/v2-events/messages/utils'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { LocationSearch } from './LocationSearch'
import { SearchableSelect } from './SearchableSelect'

function useAdminLocations(partOf: string) {
  const locationMap = useSelector(getAdminStructureLocations)

  const locations = Object.values(locationMap)

  const filteredLocations = locations.filter(
    (location) => location.partOf === 'Location/' + partOf
  )

  return filteredLocations.map((location) => ({
    value: location.id,
    label: location.name
  }))
}

function useAdministrativeAreas(
  searchableLocationTypes: LocationType[],
  parentId?: string | null
) {
  const { getLocations } = useLocations()
  const [allLocations] = getLocations.useSuspenseQuery({})

  return React.useMemo(() => {
    return allLocations
      .filter((location) => {
        if (!location.locationType) {
          return false
        }

        if (!searchableLocationTypes.includes(location.locationType)) {
          return false
        }

        if (parentId === undefined) {
          return true
        }

        return location.parentId === parentId
      })
      .map((location) => ({
        label: location.name,
        value: location.id
      }))
  }, [searchableLocationTypes, allLocations, parentId])
}

function AdministrativeAreaInput({
  onChange,
  value,
  partOf,
  ...props
}: FieldPropsWithoutReferenceValue<'ADMINISTRATIVE_AREA'> & {
  onChange: (val: string | null) => void
  partOf: string | null
  value?: string
  disabled?: boolean
}) {
  const locationTypes = React.useMemo(
    () => [LocationType.enum.ADMIN_STRUCTURE],
    []
  )

  const options = useAdministrativeAreas(locationTypes, partOf)

  const selectedLocation = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value]
  )

  return (
    <SearchableSelect
      options={options}
      value={selectedLocation}
      onChange={(opt) => {
        onChange(opt?.value ?? null)
      }}
      {...props}
    />
  )
}

function AdministrativeAreaOutput({ value }: { value: Stringifiable }) {
  const { getLocations } = useLocations()
  const [locations] = getLocations.useSuspenseQuery()

  const location = value.toString()
    ? locations.find((l) => l.id === value.toString())
    : null

  return location ? location.name : ''
}

function stringify(value: string, context: { locations: Location[] }) {
  const location = context.locations.find((l) => l.id === value)

  const name = location?.name
  return name ?? EMPTY_TOKEN
}

function isAdministrativeAreaEmpty(value: Stringifiable) {
  return !value.toString()
}

export const AdministrativeArea = {
  Input: withSuspense(AdministrativeAreaInput),
  Output: AdministrativeAreaOutput,
  stringify,
  toCertificateVariables: LocationSearch.toCertificateVariables,
  isEmptyValue: isAdministrativeAreaEmpty
}
