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
import React, { useEffect, useState } from 'react'
import { FieldProps, FieldValue, SelectOption } from '@opencrvs/commons'
import { storage } from '@client/storage'
import { Select } from './Select'

interface ILocation {
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
type JurisdictionType =
  | 'STATE'
  | 'DISTRICT'
  | 'LOCATION_LEVEL_3'
  | 'LOCATION_LEVEL_4'
  | 'LOCATION_LEVEL_5'
interface AdminStructure extends ILocation {
  type: 'ADMIN_STRUCTURE'
  jurisdictionType: JurisdictionType
  physicalType: 'Jurisdiction'
}

export function Location({
  setFieldValue,
  value,
  partOf,
  ...props
}: FieldProps<'LOCATION'> & {
  setFieldValue: (name: string, val: FieldValue | undefined) => void
  partOf: string | null
  value?: string
}) {
  const [options, setOptions] = useState<SelectOption[]>([])

  useEffect(() => {
    const fetchOfflineData = async () => {
      const offlineData = JSON.parse((await storage.getItem('offline')) ?? '{}')

      switch (props.options.type) {
        case 'ADMIN_STRUCTURE':
          const locations = offlineData.locations as AdminStructure[]

          const filteredLocations = Object.values(locations).filter(
            (location) => location.partOf === 'Location/' + (partOf ?? '0')
          )

          setOptions(
            filteredLocations.map((location) => ({
              value: location.id,
              label: {
                id: 'location.' + location.id,
                description: 'Label for location: ' + location.name,
                defaultMessage: location.name
              }
            }))
          )
          break

        default:
          break
      }
    }
    fetchOfflineData().catch((error) => {
      console.error('Error fetching offline data:', error)
    })
  }, [partOf, props.options.type])

  return (
    <Select
      {...props}
      options={options}
      type="SELECT"
      value={value as string}
      onChange={(val: string) => setFieldValue(props.id, val)}
    />
  )
}
