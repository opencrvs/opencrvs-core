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
import { FieldProps, FieldValue } from '@opencrvs/commons'
import { LocationSearch as LocationSearchComponent } from '@opencrvs/components'
import { storage } from '@client/storage'
import { ILocation } from './Location'

interface SearchLocation {
  id: string
  searchableText: string
  displayLabel: string
}

export interface Facility extends ILocation {
  type: 'HEALTH_FACILITY'
  physicalType: 'Building'
}

export function LocationSearch({
  setFieldValue,
  value,
  ...props
}: FieldProps<'LOCATION'> & {
  setFieldValue: (name: string, val: FieldValue | undefined) => void
  value?: string
}) {
  const [options, setOptions] = useState<SearchLocation[]>([])
  const [loadingStatus, setLoadingStatus] = useState<
    'loading' | 'success' | 'failed'
  >('loading')
  const [selectedLocation, setSelectedLocation] = useState<
    SearchLocation | undefined
  >(undefined)

  useEffect(() => {
    const fetchOfflineData = async () => {
      const offlineData = JSON.parse((await storage.getItem('offline')) ?? '{}')

      const facilities = offlineData.facilities as Facility[]

      const locations = Object.values(facilities).map((facility) => ({
        id: facility.id,
        searchableText: facility.name,
        displayLabel: facility.alias
      }))
      const initialLocation = locations.find((option) => option.id === value)

      setSelectedLocation(initialLocation)
      setOptions(locations)
      setLoadingStatus('success')
    }
    fetchOfflineData().catch((error) => {
      setLoadingStatus('failed')
    })
  }, [value])

  if (loadingStatus === 'failed') {
    return 'Error occurred while fetching offline data'
  }

  if (loadingStatus === 'loading') {
    return 'Loading...'
  }

  return (
    <LocationSearchComponent
      buttonLabel="Health facility"
      selectedLocation={selectedLocation}
      {...props}
      locationList={options}
      searchHandler={(location: SearchLocation) =>
        setFieldValue(props.id, location.id)
      }
    />
  )
}
