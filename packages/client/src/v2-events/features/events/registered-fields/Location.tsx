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
import { FieldProps } from '@opencrvs/commons/client'
// eslint-disable-next-line no-restricted-imports
import {
  getAdminStructureLocations,
  getLocations
} from '@client/offline/selectors'
import { Stringifiable } from '@client/v2-events/components/forms/utils'
import { Select } from './Select'

export interface LocationProps {
  id: string
  name: string
  status: string
  alias: string
  physicalType: string
  jurisdictionType?: string
  statisticalId: string
  type: string
  partOf: string
}

function useAdminLocations(partOf: string) {
  const locationMap = useSelector(getAdminStructureLocations)

  const locations = Object.values(locationMap)

  const filteredLocations = locations.filter(
    (location) => location.partOf === 'Location/' + partOf
  )

  return filteredLocations.map((location) => ({
    value: location.id,
    label: {
      id: 'v2.location.' + location.id,
      description: 'Label for location: ' + location.name,
      defaultMessage: location.name
    }
  }))
}

function LocationInput({
  setFieldValue,
  value,
  partOf,
  ...props
}: FieldProps<'LOCATION'> & {
  setFieldValue: (name: string, val: string | undefined) => void
  partOf: string | null
  value?: string
}) {
  const options = useAdminLocations(partOf ?? '0')

  return (
    <Select.Input
      {...props}
      data-testid={`location__${props.id}`}
      options={options}
      type="SELECT"
      value={value}
      onChange={(val: string) => setFieldValue(props.id, val)}
    />
  )
}

function LocationOutput({ value }: { value: Stringifiable }) {
  const locations = useSelector(getLocations)

  const location = value.toString() && locations[value.toString()]

  return location ? location.name : ''
}

export const Location = {
  Input: LocationInput,
  Output: LocationOutput
}
