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
import {
  AdministrativeAreaField,
  JurisdictionFilter,
  Location,
  resolveJurisdictionReference,
  UUID
} from '@opencrvs/commons/client'
import { Stringifiable } from '@client/v2-events/components/forms/utils'
import { EMPTY_TOKEN } from '@client/v2-events/messages/utils'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { getUserDetails } from '@client/profile/profileSelectors'
import { getAdministrativeAreaHierarchy } from '@client/v2-events/utils'
import { getToken } from '@client/utils/authUtils'
import { SearchableSelect, SearchableSelectProps } from '@client/v2-events/components/forms/inputs/SearchableSelect'
import { useAdministrativeAreas } from '@client/v2-events/hooks/useAdministrativeAreas'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import { LocationSearch } from './LocationSearch'

/**
 * Return the full administrative area hierarchy for the user's location.
 * For example, if the user's location is Ibombo District Office, this will return the administrative areas objects for:
 * [Central, Ibombo]
 */
function useUserAdministrativeAreaHierarchy() {
  const userDetails = useSelector(getUserDetails)
  const { getAdministrativeAreas } = useAdministrativeAreas()
  const administrativeAreas = getAdministrativeAreas.useSuspenseQuery()
  const { getLocations } = useLocations()
  const locations = getLocations.useSuspenseQuery()
  const userLocationId = userDetails?.primaryOfficeId

  if (!userLocationId) {
    return []
  }

  const location = locations.get(UUID.parse(userLocationId))

  if (!location) {
    return []
  }

  const hierarchy = useMemo(
    () =>
      getAdministrativeAreaHierarchy(
        location.administrativeAreaId,
        administrativeAreas
      ),
    [location.administrativeAreaId, administrativeAreas]
  )

  return hierarchy
}

/**
 * Given a parent id, return the administrative area options for the parent. The options will be filtered based on the jurisdiction filter.
 * If parentId is null, we are at the root level of the administrative area hierarchy.
 */
function useAvailableAdministrativeAreas(
  parentId?: string | null,
  jurisdictionFilter?: JurisdictionFilter
) {
  const { getAdministrativeAreas } = useAdministrativeAreas()
  const administrativeAreas = getAdministrativeAreas.useSuspenseQuery()
  const userAdministrativeAreaHierarchy = useUserAdministrativeAreaHierarchy()

  const options = React.useMemo(() => {
    return [...administrativeAreas.values()].filter((administrativeArea) => {
      if (parentId === undefined) {
        return true
      }

      return administrativeArea.parentId === parentId
    })
  }, [administrativeAreas, parentId])

  // When jurisdictionFilter is not "all", restrict options to the user's own area hierarchy.
  // e.g. a LOCAL_REGISTRAR sees only their province/district; a COMMUNITY_LEADER sees only their province/district/village.
  const hierarchyOptions = options.filter((o) =>
    userAdministrativeAreaHierarchy.some(({ id }) => id === o.id)
  )
  if (
    jurisdictionFilter !== JurisdictionFilter.enum.all &&
    hierarchyOptions.length > 0
  ) {
    return hierarchyOptions
  }

  // By default or if jurisdiction is all, we show all options
  return options
}

interface AdministrativeAreaInputProps
  extends Omit<
    SearchableSelectProps,
    'data-testid' | 'value' | 'onChange' | 'options'
  > {
  configuration: AdministrativeAreaField['configuration']
  eventType?: string
  partOf: string | null
  onChange: (val: string | null) => void
  value?: string | null
}

function AdministrativeAreaInput({
  configuration,
  eventType,
  value,
  partOf,
  onChange,
  ...inputProps
}: AdministrativeAreaInputProps) {
  const token = useSelector(getToken)
  const jurisdictionFilter = resolveJurisdictionReference(
    configuration.allowedLocations,
    token,
    eventType
  )

  const administrativeAreas = useAvailableAdministrativeAreas(
    partOf,
    jurisdictionFilter
  )

  const options = useMemo(
    () => administrativeAreas.map((o) => ({ label: o.name, value: o.id })),
    [administrativeAreas]
  )

  const selectedLocation = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value]
  )

  /** If there is only one option and its selected, lets disable the input. */
  const hasOnlyOneOption = options.length === 1 && Boolean(selectedLocation)

  return (
    <SearchableSelect
      {...inputProps}
      data-testid={'location__' + inputProps.id}
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
