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
import {
  Location,
  FieldPropsWithoutReferenceValue,
  UUID
} from '@opencrvs/commons/client'
import { Stringifiable } from '@client/v2-events/components/forms/utils'
import { EMPTY_TOKEN } from '@client/v2-events/messages/utils'
import { withSuspense } from '@client/v2-events/components/withSuspense'
import { SearchableSelect } from '../../../components/forms/inputs/SearchableSelect'
import { useAdministrativeAreas } from '../../../hooks/useAdministrativeAreas'
import { LocationSearch } from './LocationSearch'

function useAdministrativeAreaOptions(parentId?: string | null) {
  const { getAdministrativeAreas } = useAdministrativeAreas()
  const administrativeAreas = getAdministrativeAreas.useSuspenseQuery({})

  return React.useMemo(() => {
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
}

function AdministrativeAreaInput({
  onChange,
  value,
  partOf,
  id,
  disabled
}: FieldPropsWithoutReferenceValue<'ADMINISTRATIVE_AREA'> & {
  onChange: (val: string | null) => void
  partOf: string | null
  value?: string | null
  disabled?: boolean
}) {
  const options = useAdministrativeAreaOptions(partOf)

  const selectedLocation = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value]
  )

  return (
    <SearchableSelect
      data-testid={'location__' + id}
      disabled={disabled}
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

  const location =
    administrativeAreaId && administrativeAreas.get(administrativeAreaId)

  return location?.name ?? ''
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
