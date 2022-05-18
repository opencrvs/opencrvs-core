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
import { IFormField, IRadioGroupFormField, ISelectOption } from '@client/forms'
import { IOfflineData } from '@client/offline/reducer'
import { get, has } from 'lodash'
import { IntlShape } from 'react-intl'
import { IDeclaration } from '@client/declarations'
import { countryMessages } from '@client/i18n/messages/constants'
import {
  generateLocationName,
  generateFullLocation
} from '@client/utils/locationUtils'

export const getFieldValue = (
  value: string,
  fieldObj: IFormField,
  offlineData: Partial<IOfflineData>,
  intl: IntlShape
) => {
  let original = value
  if (has(fieldObj, 'dynamicOptions')) {
    const offlineIndex = get(fieldObj, 'dynamicOptions.resource')
    const offlineResourceValues = get(offlineData, offlineIndex)
    const offlineResourceValue = get(offlineResourceValues, original)
    original = offlineResourceValue?.name || ''
  }
  if (fieldObj.type === 'SELECT_WITH_OPTIONS') {
    const selectedOption = fieldObj.options.find(
      (option) => option.value === value
    ) as ISelectOption
    return selectedOption ? intl.formatMessage(selectedOption.label) : original
  }
  if (
    ['RADIO_GROUP_WITH_NESTED_FIELDS', 'RADIO_GROUP'].includes(fieldObj.type)
  ) {
    const selectedOption = (fieldObj as IRadioGroupFormField).options.find(
      (option) => option.value === value
    )
    return selectedOption ? intl.formatMessage(selectedOption.label) : original
  }
  return original
}

export const getLocation = (
  declaration: IDeclaration,
  resources: IOfflineData,
  intl: IntlShape
) => {
  let locationType = ''
  let locationId = ''
  let district = ''
  let state = ''
  let internationalDistrict = ''
  let internationalState = ''
  let country = ''

  if (declaration.event === 'death') {
    locationType = declaration.data?.deathEvent?.placeOfDeath?.toString() || ''
    locationId = declaration.data?.deathEvent?.deathLocation?.toString() || ''

    district = declaration.data?.deathEvent?.district?.toString() || ''
    state = declaration.data?.deathEvent?.state?.toString() || ''
    country = declaration.data?.deathEvent?.country?.toString() || ''

    // when address is outside of default country
    internationalDistrict =
      declaration.data?.deathEvent?.internationalDistrict?.toString() || ''
    internationalState =
      declaration.data?.deathEvent?.internationalState?.toString() || ''
  } else {
    locationType = declaration.data?.child?.placeOfBirth?.toString() || ''
    locationId = declaration.data?.child?.birthLocation?.toString() || ''

    district = declaration.data?.child?.district?.toString() || ''
    state = declaration.data?.child?.state?.toString() || ''
    country = declaration.data?.child?.country?.toString() || ''

    // when address is outside of default country
    internationalDistrict =
      declaration.data?.child?.internationalDistrict?.toString() || ''
    internationalState =
      declaration.data?.child?.internationalState?.toString() || ''
  }
  if (locationType === 'HEALTH_FACILITY' && locationId) {
    const facility = resources.facilities[locationId]
    const district =
      facility && resources.locations[facility.partOf.split('/')[1]]
    const state = district && resources.locations[district.partOf.split('/')[1]]
    const defaultCountry = intl.formatMessage(
      countryMessages[window.config.COUNTRY]
    )
    const healthFacility = generateLocationName(facility, intl)

    let location = healthFacility + ', '
    if (district) location = location + district.name + ', '
    if (state) location = location + state.name + ', '
    location = location + defaultCountry
    return location
  }
  if (locationType === 'OTHER' || locationType === 'PRIVATE_HOME') {
    if (country && country !== window.config.COUNTRY) {
      let location = ''
      if (internationalDistrict) location = internationalDistrict + ', '
      if (internationalState) location = location + internationalState + ', '
      location = location + intl.formatMessage(countryMessages[country])
      return location
    }

    return generateFullLocation(district, state, country, resources, intl)
  }

  // when address is default residence address of deceased
  if (locationType === 'DECEASED_USUAL_RESIDENCE') {
    const countryResidence =
      declaration.data?.deceased?.countryPrimary?.toString() || ''

    if (countryResidence !== window.config.COUNTRY) {
      // residence address is other than default country
      const internationalDistrictResidence =
        declaration.data?.deceased?.internationalDistrictPrimary?.toString() ||
        ''
      const internationalStateResidence =
        declaration.data?.deceased?.internationalStatePrimary?.toString() || ''

      let location = ''
      if (internationalDistrictResidence)
        location = internationalDistrictResidence + ', '
      if (internationalStateResidence)
        location = location + internationalStateResidence + ', '
      location =
        location + intl.formatMessage(countryMessages[countryResidence])

      return location
    } else {
      const districtResidence =
        declaration.data?.deceased?.districtPrimary?.toString() || ''
      const stateResidence =
        declaration.data?.deceased?.statePrimary?.toString() || ''

      return generateFullLocation(
        districtResidence,
        stateResidence,
        countryResidence,
        resources,
        intl
      )
    }
  }
  return ''
}
