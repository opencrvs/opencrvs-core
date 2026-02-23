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
import { useSelector } from 'react-redux'
import { JurisdictionFilter, Location, UUID } from '@opencrvs/commons/client'
import { Stringifiable } from '@client/v2-events/components/forms/utils'
import { EMPTY_TOKEN } from '@client/v2-events/messages/utils'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { getUserDetails } from '@client/profile/profileSelectors'
import { getAdministrativeAreaHierarchy } from '@client/v2-events/utils'
import { SearchableSelect } from '../../../components/forms/inputs/SearchableSelect'
import { useAdministrativeAreas } from '../../../hooks/useAdministrativeAreas'
import { useLocations } from '../../../hooks/useLocations'
import { AdministrativeAreaField } from '../../../../../../commons/build/dist/esm/events/FieldConfig'
import { LocationSearch } from './LocationSearch'

/**
 * Given a location id, return the full administrative area hierarchy for the location.
 * For example, if the location id is Ibombo District Office, this will return the administrative areas objects for:
 * [Central, Ibombo]
 */
function useLocationAdministrativeAreaHierarchy(
  locationId: string | undefined
) {
  const { getAdministrativeAreas } = useAdministrativeAreas()
  const administrativeAreas = getAdministrativeAreas.useSuspenseQuery({})
  const { getLocations } = useLocations()
  const locations = getLocations.useSuspenseQuery()

  if (!locationId) {
    return []
  }

  const location = locations.get(UUID.parse(locationId))

  if (!location) {
    return []
  }

  return getAdministrativeAreaHierarchy(
    location.administrativeAreaId,
    administrativeAreas
  )
}

/**
 * Given a parent id, return the administrative area options for the parent. This will return both:
 * 1. All administrative areas under the parent
 * 2. Administrative areas under which the users location is located
 */
function useAdministrativeAreaOptions(parentId?: string | null) {
  const { getAdministrativeAreas } = useAdministrativeAreas()
  const administrativeAreas = getAdministrativeAreas.useSuspenseQuery({})
  const userDetails = useSelector(getUserDetails)
  const allAdministrativeAreaOptions = React.useMemo(() => {
    return [...administrativeAreas.values()]
      .filter((administrativeArea) => {
        if (parentId === undefined) {
          return true
        }

        return administrativeArea.parentId === parentId
      })
      .map((location) => ({
        label: location.name,
        value: location.id
      }))
  }, [administrativeAreas, parentId])

  const locationAdministrativeAreaHierarchy =
    useLocationAdministrativeAreaHierarchy(userDetails?.primaryOffice.id)

  const userAdministrativeAreaOptions = allAdministrativeAreaOptions.filter(
    (o) => locationAdministrativeAreaHierarchy.some(({ id }) => id === o.value)
  )

  return {
    allAdministrativeAreaOptions,
    userAdministrativeAreaOptions
  }
}

function AdministrativeAreaInput({
  onChange,
  value,
  partOf,
  id,
  disabled,
  configuration
}: {
  onChange: (val: string | null) => void
  partOf: string | null
  value?: string | null
  disabled?: boolean
  configuration: AdministrativeAreaField['configuration']
  id: string
}) {
  const { allAdministrativeAreaOptions, userAdministrativeAreaOptions } =
    useAdministrativeAreaOptions(partOf)

  const options =
    configuration.allowedLocations ===
    JurisdictionFilter.enum.administrativeArea
      ? userAdministrativeAreaOptions
      : allAdministrativeAreaOptions

  const selectedLocation = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value]
  )

  /** If there is only one option and its selected, lets disable the input. */
  const hasOnlyOneOption = options.length === 1 && Boolean(selectedLocation)

  return (
    <SearchableSelect
      data-testid={'location__' + id}
      disabled={disabled || hasOnlyOneOption}
      id={id}
      options={options}
      value={selectedLocation}
      onChange={(opt) => {
        onChange(opt?.value ?? null)
      }}
    />
  )
}

function AdministrativeAreaOutput({ value }: { value: Stringifiable }) {
  const { getAdministrativeAreas } = useAdministrativeAreas()
  const administrativeAreas = getAdministrativeAreas.useSuspenseQuery()

  const administrativeAreaId = UUID.safeParse(value.toString()).data

  const administrativeArea =
    administrativeAreaId && administrativeAreas.get(administrativeAreaId)

  return administrativeArea?.name ?? ''
}

function stringify(value: string, context: { locations: Map<UUID, Location> }) {
  const locationId = UUID.safeParse(value).data
  const location = locationId && context.locations.get(locationId)

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
