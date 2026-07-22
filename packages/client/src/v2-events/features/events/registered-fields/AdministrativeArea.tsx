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
  ClientLocation,
  AdministrativeAreas,
  getAdministrativeAreaHierarchy,
  JurisdictionFilter,
  resolveJurisdictionReference,
  resolveVersion,
  todayISO,
  UUID,
  PlainDate
} from '@opencrvs/commons/client'
import { Stringifiable } from '@client/v2-events/components/forms/utils'
import { EMPTY_TOKEN } from '@client/v2-events/messages/utils'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { getUserDetails } from '@client/profile/profileSelectors'
import { getToken } from '@client/utils/authUtils'
import {
  SearchableSelect,
  SearchableSelectProps
} from '@client/v2-events/components/forms/inputs/SearchableSelect'
import { useAdministrativeAreas } from '@client/v2-events/hooks/useAdministrativeAreas'
import { useLocations } from '@client/v2-events/hooks/useLocations'
import {
  buildLocationNameOptions,
  resolveLocationName
} from '@client/v2-events/utils'
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
  jurisdictionFilter?: JurisdictionFilter,
  excludeInactive = false
) {
  const { getAdministrativeAreas } = useAdministrativeAreas()
  const administrativeAreas = getAdministrativeAreas.useSuspenseQuery()
  const userAdministrativeAreaHierarchy = useUserAdministrativeAreaHierarchy()

  const options = React.useMemo(() => {
    return [...administrativeAreas.values()].filter((administrativeArea) => {
      // In advanced search, address (admin-structure) filters offer only
      // currently-valid areas; inactivated ones are not selectable.
      if (
        excludeInactive &&
        resolveVersion(administrativeArea.versions, todayISO()).status !==
          'active'
      ) {
        return false
      }

      if (parentId === undefined) {
        return true
      }

      return administrativeArea.parentId === parentId
    })
  }, [administrativeAreas, parentId, excludeInactive])

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
  /** When true (advanced search), excludes inactive admin structures and lists historical names. */
  isSearchFilter?: boolean
}

function AdministrativeAreaInput({
  configuration,
  eventType,
  value,
  partOf,
  onChange,
  isSearchFilter = false,
  ...inputProps
}: AdministrativeAreaInputProps) {
  const token = useSelector(getToken)
  const jurisdictionFilter = resolveJurisdictionReference(
    configuration.allowedLocations,
    token,
    eventType
  )

  // Only admin-structure address filters drop inactive areas, and only within
  // advanced search. Office/health-facility fields keep listing inactive ones.
  const excludeInactive =
    isSearchFilter &&
    configuration.type === AdministrativeAreas.enum.ADMIN_STRUCTURE

  const administrativeAreas = useAvailableAdministrativeAreas(
    partOf,
    jurisdictionFilter,
    excludeInactive
  )

  // In advanced search, list every historical name so records saved under an
  // outdated name stay findable. Elsewhere show a single current-name option.
  // Names are anchored to today; event-date anchoring is a follow-up (#13143).
  const options = useMemo(
    () =>
      isSearchFilter
        ? buildLocationNameOptions(administrativeAreas)
        : administrativeAreas.map((o) => ({
            label: resolveLocationName(o, todayISO()),
            value: o.id
          })),
    [administrativeAreas, isSearchFilter]
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
      disabled={inputProps.disabled || hasOnlyOneOption}
      options={options}
      value={selectedLocation}
      onChange={(opt) => {
        onChange(opt?.value ?? null)
      }}
    />
  )
}

function AdministrativeAreaOutput({
  value,
  anchor
}: {
  value: Stringifiable | undefined
  anchor: PlainDate
}) {
  const { getAdministrativeAreas } = useAdministrativeAreas()
  const administrativeAreas = getAdministrativeAreas.useSuspenseQuery()

  const administrativeAreaId = UUID.safeParse(value?.toString()).data

  const resolved =
    administrativeAreaId &&
    resolveVersion(
      administrativeAreas.get(administrativeAreaId)?.versions ?? [],
      anchor
    )

  return resolved ? resolved.name : ''
}

function stringify(
  value: string,
  context: { locations: Map<UUID, ClientLocation>; anchor: PlainDate }
) {
  const locationId = UUID.safeParse(value).data
  const location = locationId && context.locations.get(locationId)

  if (!location) {
    return EMPTY_TOKEN
  }

  return resolveVersion(location.versions, context.anchor).name
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
