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
  getAdministrativeAreaHierarchy,
  isSelectableAtAnchor,
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
  buildHistoricalLocationNameOptions,
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
  excludeInactive = false,
  anchor: PlainDate = todayISO()
) {
  const { getAdministrativeAreas } = useAdministrativeAreas()
  const administrativeAreas = getAdministrativeAreas.useSuspenseQuery()
  const userAdministrativeAreaHierarchy = useUserAdministrativeAreaHierarchy()

  const options = React.useMemo(() => {
    return [...administrativeAreas.values()].filter((administrativeArea) => {
      // In advanced search, address (admin-structure) filters offer only
      // currently-valid areas; when anchored to the event's date (#13143),
      // fields anchored to it offer only areas that existed and were active
      // as at that date. Either way, inactivated/not-yet-effective areas are
      // excluded; other fields keep listing everything, unchanged.
      if (
        excludeInactive &&
        !isSelectableAtAnchor(administrativeArea.versions, anchor)
      ) {
        return false
      }

      if (parentId === undefined) {
        return true
      }

      return administrativeArea.parentId === parentId
    })
  }, [administrativeAreas, parentId, excludeInactive, anchor])

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
  anchor: PlainDate
}

function AdministrativeAreaInput({
  configuration,
  eventType,
  value,
  partOf,
  onChange,
  anchor,
  ...inputProps
}: AdministrativeAreaInputProps) {
  const token = useSelector(getToken)
  const jurisdictionFilter = resolveJurisdictionReference(
    configuration.allowedLocations,
    token,
    eventType
  )

  // Advanced search stamps `activeOnly` on admin-structure address filters so
  // inactivated areas are dropped; capture forms set `anchorToDateOfEvent`
  // for the same reason (#13143). Either way, only currently-active/effective
  // areas at `anchor` are selectable; other fields keep listing everything.
  const excludeInactive = Boolean(
    configuration.activeOnly || configuration.anchorToDateOfEvent
  )

  const administrativeAreas = useAvailableAdministrativeAreas(
    partOf,
    jurisdictionFilter,
    excludeInactive,
    anchor
  )

  // When the field config opts in (advanced search sets this), list every
  // historical name so records saved under an outdated name stay findable.
  // Otherwise show a single current-name option, resolved at the field's anchor.
  const options = useMemo(
    () =>
      configuration.listHistoricalNames
        ? buildHistoricalLocationNameOptions(administrativeAreas)
        : administrativeAreas.map((o) => ({
            label: resolveLocationName(o, anchor),
            value: o.id
          })),
    [administrativeAreas, configuration.listHistoricalNames, anchor]
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
