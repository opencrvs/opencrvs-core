/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */

import { ILocation } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { IStoreState } from '@client/store'
import { generateLocations } from '@client/utils/locationUtils'
import { ISearchLocation } from '@opencrvs/components/lib/interface'
import * as React from 'react'

import { ITheme } from '@opencrvs/components/lib/theme'
import {
  injectIntl,
  WrappedComponentProps,
  IntlShape,
  useIntl
} from 'react-intl'
import { connect } from 'react-redux'

import { withTheme } from 'styled-components'
import { LocationPicker as LocationPickerComponent } from '@client/components/LocationPicker'
import { getUserDetails } from '@client/profile/profileSelectors'
import { IUserDetails } from '@client/utils/userUtils'

import { getAdditionalLocations } from '@client/views/SysAdmin/Performance/utils'

interface IConnectProps {
  locations: { [key: string]: ILocation }
  offices: { [key: string]: ILocation }
  userDetails: IUserDetails
}

type Props = WrappedComponentProps & {
  locationId?: string
  onChangeLocation?: (location: ISearchLocation) => void
} & IConnectProps & {
    theme: ITheme
  }

const selectLocation = (
  locationId: string,
  searchableLocations: ISearchLocation[]
) => {
  return searchableLocations.find(
    ({ id }) => id === locationId
  ) as ISearchLocation
}

type LocationsById = {
  [key: string]: ILocation
}

function setInitialLocationForUser(
  user: IUserDetails,
  locations: LocationsById,
  offices: LocationsById,
  intl: IntlShape,
  locationInSearchParams?: string
) {
  const [countryLocationItem] = getAdditionalLocations(intl)

  if (!user.supervisoryArea) {
    const allLocations = generateLocations({ ...offices }, intl)

    if (locationInSearchParams) {
      return selectLocation(locationInSearchParams, allLocations)
    }
    if (user.primaryOffice?.id) {
      return selectLocation(user.primaryOffice?.id, allLocations)
    }
    throw new Error(
      'No primary office found for user. This should never happen'
    )
  }

  const supervisesNationwide = shouldSeeCountryLevel(user)

  const allLocations = generateLocations({ ...offices, ...locations }, intl)

  if (supervisesNationwide) {
    allLocations.push(countryLocationItem)
    if (!locationInSearchParams) {
      return selectLocation(countryLocationItem.id, allLocations)
    }
  }

  if (locationInSearchParams) {
    return selectLocation(locationInSearchParams, allLocations)
  }

  return selectLocation(user.supervisoryArea, allLocations)
}

function getJurisdictionTypeFilterForUser(
  user: IUserDetails,
  locations: LocationsById
) {
  if (shouldSeeCountryLevel(user)) {
    return undefined
  }
  if (!user.supervisoryArea) {
    return []
  }
  return [locations[user.supervisoryArea].jurisdictionType!]
}

function getJurisdictionTypeForUser(
  user: IUserDetails,
  locations: LocationsById
) {
  if (!user.supervisoryArea) {
    return null
  }
  if (shouldSeeCountryLevel(user)) {
    return 'COUNTRY'
  }
  return locations[user.supervisoryArea].jurisdictionType!
}

function shouldSeeCountryLevel(user: IUserDetails) {
  return user.supervisoryArea === '0'
}

function LocationPickerWithUserPermissionFiltering(props: Props) {
  const intl = useIntl()

  const { locationId, locations, offices, userDetails } = props

  const [selectedLocation, setSelectedLocation] = React.useState(
    setInitialLocationForUser(userDetails, locations, offices, intl, locationId)
  )

  const supervisoryAreaType = getJurisdictionTypeForUser(
    userDetails,
    props.locations
  )

  const previousLocation = React.useRef<ISearchLocation>()
  React.useEffect(() => {
    if (previousLocation.current?.id !== selectedLocation?.id) {
      props.onChangeLocation && props.onChangeLocation(selectedLocation)
    }
    previousLocation.current = selectedLocation
  }, [props, selectedLocation])

  return (
    <LocationPickerComponent
      locationFilter={(location) => {
        if (supervisoryAreaType === 'COUNTRY') {
          return true
        }
        if (supervisoryAreaType === 'STATE') {
          return (
            location.partOf.replace('Location/', '') ===
              userDetails.supervisoryArea ||
            location.id === userDetails.supervisoryArea
          )
        }
        if (supervisoryAreaType === 'DISTRICT') {
          return location.id === userDetails.supervisoryArea
        }
        return false
      }}
      officeFilter={(office) => {
        if (supervisoryAreaType === 'COUNTRY') {
          return true
        }

        const officeDistrict = locations[office.partOf.replace('Location/', '')]

        if (supervisoryAreaType === 'STATE') {
          return (
            officeDistrict.partOf.replace('Location/', '') ===
            userDetails.supervisoryArea
          )
        }
        if (supervisoryAreaType === 'DISTRICT') {
          return officeDistrict.id === userDetails.supervisoryArea
        }

        return office.id === userDetails.primaryOffice?.id
      }}
      additionalLocations={
        shouldSeeCountryLevel(userDetails) ? getAdditionalLocations(intl) : []
      }
      selectedLocationId={selectedLocation.id}
      onChangeLocation={(newLocationId) => {
        const newLocation = setInitialLocationForUser(
          userDetails,
          locations,
          offices,
          intl,
          newLocationId
        )

        console.log({ newLocation })

        setSelectedLocation(newLocation)
      }}
    />
  )
}

function mapStateToProps(state: IStoreState) {
  const offlineCountryConfiguration = getOfflineData(state)
  return {
    locations: offlineCountryConfiguration.locations,
    offices: offlineCountryConfiguration.offices,
    userDetails: getUserDetails(state)!
  }
}

export const LocationPicker = connect(
  mapStateToProps,
  {}
)(withTheme(injectIntl(LocationPickerWithUserPermissionFiltering)))
