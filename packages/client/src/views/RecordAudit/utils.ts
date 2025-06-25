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
import { IDeclaration, SUBMISSION_STATUS } from '@client/declarations'
import { IFormField, IRadioGroupFormField, ISelectOption } from '@client/forms'
import { countryMessages } from '@client/i18n/messages/constants'
import {
  recordAuditMessages,
  regActionMessages,
  regStatusMessages
} from '@client/i18n/messages/views/recordAudit'
import { IDynamicValues } from '@client/navigation'
import { IOfflineData } from '@client/offline/reducer'
import { EMPTY_STRING, LANG_EN } from '@client/utils/constants'
import { createNamesMap, getLocalisedName } from '@client/utils/data-formatting'
import { getDeclarationFullName } from '@client/utils/draftUtils'
import {
  AssignmentData,
  EventType,
  History,
  HumanName,
  Maybe,
  RegAction,
  RegStatus,
  User
} from '@client/utils/gateway'
import type {
  GQLBirthEventSearchSet,
  GQLDeathEventSearchSet,
  GQLEventSearchSet,
  GQLHumanName,
  GQLMarriageEventSearchSet
} from '@client/utils/gateway-deprecated-do-not-use'
import {
  generateFullLocation,
  generateLocationName
} from '@client/utils/locationUtils'
import { UserDetails } from '@client/utils/userUtils'
import { Scope, SCOPES } from '@opencrvs/commons/client'
import { get, has, PropertyPath } from 'lodash'
import { IntlShape } from 'react-intl'

export interface IDeclarationData {
  id: string
  name?: string
  status?: SUBMISSION_STATUS
  trackingId?: string
  type?: string
  dateOfBirth?: string
  dateOfDeath?: string
  dateOfMarriage?: string
  placeOfBirth?: string
  placeOfDeath?: string
  placeOfMarriage?: string
  informant?: IInformantInfo
  registrationNo?: string
  nid?: string
  assignment?: AssignmentData
}

interface IInformantInfo {
  registrationEmail?: string
  registrationPhone?: string
}

interface IGQLDeclaration {
  id: string
  child?: { name: Array<GQLHumanName | null> }
  deceased?: { name: Array<GQLHumanName | null> }
  bride?: { name: Array<GQLHumanName | null> }
  groom?: { name: Array<GQLHumanName | null> }
  registration?: {
    trackingId: string
    type: string
    status: { type: string }[]
    assignment?: AssignmentData
  }
}

export const getFieldValue = (
  value: Maybe<string> | undefined,
  fieldObj: IFormField,
  offlineData: Partial<IOfflineData>,
  intl: IntlShape
) => {
  let original = value
  // HOTFIX: The name of the fieldObject that is being received
  // here is internationalStatePrimary rather than statePrimary
  // same for districts as well as the secondary address fields
  if (
    fieldObj.name.toLowerCase().includes('state') ||
    fieldObj.name.toLowerCase().includes('district')
  ) {
    if (value && offlineData.locations?.[value]) {
      return offlineData.locations[value].name
    }
  }

  if (has(fieldObj, 'dynamicOptions')) {
    const offlineIndex = get(
      fieldObj,
      'dynamicOptions.resource'
    ) as unknown as PropertyPath
    const offlineResourceValues = get(offlineData, offlineIndex)
    const offlineResourceValue =
      original && get(offlineResourceValues, original)
    original = offlineResourceValue?.name || EMPTY_STRING
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

const getLocation = (
  declaration: IDeclaration,
  resources: IOfflineData,
  intl: IntlShape
) => {
  let locationType = EMPTY_STRING
  let locationId = EMPTY_STRING
  let district = EMPTY_STRING
  let state = EMPTY_STRING
  let internationalDistrict = EMPTY_STRING
  let internationalState = EMPTY_STRING
  let country = EMPTY_STRING
  if (declaration.event === EventType.Death) {
    locationType =
      declaration.data?.deathEvent?.placeOfDeath?.toString() || EMPTY_STRING

    locationId =
      declaration.data?.deathEvent?.deathLocation?.toString() || EMPTY_STRING

    district =
      declaration.data?.deathEvent?.districtPlaceofdeath?.toString() ||
      EMPTY_STRING
    state =
      declaration.data?.deathEvent?.statePlaceofdeath?.toString() ||
      EMPTY_STRING
    country =
      declaration.data?.deathEvent?.countryPlaceofdeath?.toString() ||
      EMPTY_STRING

    // when address is outside of default country
    internationalDistrict =
      declaration.data?.deathEvent?.internationalDistrictPlaceofdeath?.toString() ||
      EMPTY_STRING
    internationalState =
      declaration.data?.deathEvent?.internationalStatePlaceofdeath?.toString() ||
      EMPTY_STRING
  } else if (declaration.event === EventType.Birth) {
    locationType =
      declaration.data?.child?.placeOfBirth?.toString() || EMPTY_STRING
    locationId =
      declaration.data?.child?.birthLocation?.toString() || EMPTY_STRING

    district =
      declaration.data?.child?.districtPlaceofbirth?.toString() || EMPTY_STRING
    state =
      declaration.data?.child?.statePlaceofbirth?.toString() || EMPTY_STRING
    country =
      declaration.data?.child?.countryPlaceofbirth?.toString() || EMPTY_STRING

    // when address is outside of default country
    internationalDistrict =
      declaration.data?.child?.internationalDistrictPlaceofbirth?.toString() ||
      EMPTY_STRING
    internationalState =
      declaration.data?.child?.internationalStatePlaceofbirth?.toString() ||
      EMPTY_STRING
  } else if (declaration.event === EventType.Marriage) {
    district =
      declaration.data?.marriageEvent?.districtPlaceofmarriage?.toString() ||
      EMPTY_STRING
    state =
      declaration.data?.marriageEvent?.statePlaceofmarriage?.toString() ||
      EMPTY_STRING
    country =
      declaration.data?.marriageEvent?.countryPlaceofmarriage?.toString() ||
      EMPTY_STRING

    // when address is outside of default country
    internationalDistrict =
      declaration.data?.marriageEvent?.internationalDistrictPlaceofmarriage?.toString() ||
      EMPTY_STRING
    internationalState =
      declaration.data?.marriageEvent?.internationalStatePlaceofmarriage?.toString() ||
      EMPTY_STRING

    if (country && country !== window.config.COUNTRY) {
      let location = EMPTY_STRING
      if (internationalDistrict) location = internationalDistrict + ', '
      if (internationalState) location = location + internationalState + ', '
      location = location + intl.formatMessage(countryMessages[country])
      return location
    }
    return generateFullLocation(district, state, country, resources, intl)
  }
  if (locationType === 'HEALTH_FACILITY' && locationId) {
    const facility = resources.facilities[locationId]
    const district =
      facility &&
      facility.partOf &&
      resources.locations[facility.partOf.split('/')[1]]
    const state = district && resources.locations[district.partOf.split('/')[1]]
    const defaultCountry = intl.formatMessage(
      countryMessages[window.config.COUNTRY]
    )
    const healthFacility = generateLocationName(facility, intl)

    let location = EMPTY_STRING
    if (healthFacility) location = healthFacility + ', '
    if (district) location = location + district.name + ', '
    if (state) location = location + state.name + ', '
    location = location + defaultCountry
    return location
  }
  if (locationType === 'OTHER' || locationType === 'PRIVATE_HOME') {
    if (country && country !== window.config.COUNTRY) {
      let location = EMPTY_STRING
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
      declaration.data?.deceased?.countryPrimaryDeceased?.toString() ||
      EMPTY_STRING

    if (countryResidence !== window.config.COUNTRY) {
      // residence address is other than default country
      const internationalDistrictResidence =
        declaration.data?.deceased?.internationalDistrictPrimaryDeceased?.toString() ||
        EMPTY_STRING
      const internationalStateResidence =
        declaration.data?.deceased?.internationalStatePrimaryDeceased?.toString() ||
        EMPTY_STRING

      let location = EMPTY_STRING
      if (internationalDistrictResidence)
        location = internationalDistrictResidence + ', '
      if (internationalStateResidence)
        location = location + internationalStateResidence + ', '
      location =
        location + intl.formatMessage(countryMessages[countryResidence])

      return location
    } else {
      const districtResidence =
        declaration.data?.deceased?.districtPrimaryDeceased?.toString() ||
        EMPTY_STRING
      const stateResidence =
        declaration.data?.deceased?.statePrimaryDeceased?.toString() ||
        EMPTY_STRING

      return generateFullLocation(
        districtResidence,
        stateResidence,
        countryResidence,
        resources,
        intl
      )
    }
  }
  return EMPTY_STRING
}

export const getCaptitalizedWord = (word: string | undefined): string => {
  if (!word) return EMPTY_STRING
  return word.toUpperCase()[0] + word.toLowerCase().slice(1)
}

export const removeUnderscore = (word: string): string => {
  const wordArray = word.split('_')
  const finalWord = wordArray.reduce(
    (accum, cur, idx) => (idx > 0 ? accum + ' ' + cur : cur),
    EMPTY_STRING
  )
  return finalWord
}

const isBirthDeclaration = (
  declaration: GQLEventSearchSet | null
): declaration is GQLBirthEventSearchSet => {
  return (declaration && declaration.type === EventType.Birth) || false
}

const isDeathDeclaration = (
  declaration: GQLEventSearchSet | null
): declaration is GQLDeathEventSearchSet => {
  return (declaration && declaration.type === EventType.Death) || false
}

const isMarriageDeclaration = (
  declaration: GQLEventSearchSet | null
): declaration is GQLMarriageEventSearchSet => {
  return (declaration && declaration.type === EventType.Marriage) || false
}

export const getName = (names: (HumanName | null)[], language: string) => {
  const nameMap = createNamesMap(names)
  return nameMap[language] || nameMap[LANG_EN] || EMPTY_STRING
}

export const getDraftDeclarationData = (
  declaration: IDeclaration,
  resources: IOfflineData,
  intl: IntlShape,
  trackingId: string
): IDeclarationData => {
  return {
    id: declaration.id,
    name: getDeclarationFullName(declaration, intl),
    type: declaration.event || EMPTY_STRING,
    registrationNo:
      declaration.data?.registration?.registrationNumber?.toString() ||
      EMPTY_STRING,
    trackingId: trackingId,
    dateOfBirth:
      declaration.data?.child?.childBirthDate?.toString() || EMPTY_STRING,
    dateOfDeath:
      declaration.data?.deathEvent?.deathDate?.toString() || EMPTY_STRING,
    dateOfMarriage:
      declaration.data?.marriageEvent?.marriageDate?.toString() || EMPTY_STRING,
    placeOfBirth: getLocation(declaration, resources, intl) || EMPTY_STRING,
    placeOfDeath: getLocation(declaration, resources, intl) || EMPTY_STRING,
    placeOfMarriage: getLocation(declaration, resources, intl) || EMPTY_STRING,
    informant: {
      registrationPhone:
        declaration.data?.informant?.registrationPhone?.toString() ||
        EMPTY_STRING,
      registrationEmail:
        declaration.data?.informant?.registrationEmail?.toString() ||
        EMPTY_STRING
    }
  }
}

export const getWQDeclarationData = (
  workqueueDeclaration: GQLEventSearchSet,
  intl: IntlShape,
  trackingId: string
) => {
  let name = EMPTY_STRING
  if (
    isBirthDeclaration(workqueueDeclaration) &&
    workqueueDeclaration.childName
  ) {
    name = getLocalisedName(intl, {
      firstNames: workqueueDeclaration.childName[0]?.firstNames,
      middleName: workqueueDeclaration.childName[0]?.middleName,
      familyName: workqueueDeclaration.childName[0]?.familyName
    })
  } else if (
    isDeathDeclaration(workqueueDeclaration) &&
    workqueueDeclaration.deceasedName
  ) {
    name = getLocalisedName(intl, {
      firstNames: workqueueDeclaration.deceasedName[0]?.firstNames,
      middleName: workqueueDeclaration.deceasedName[0]?.middleName,
      familyName: workqueueDeclaration.deceasedName[0]?.familyName
    })
  } else if (
    isMarriageDeclaration(workqueueDeclaration) &&
    workqueueDeclaration.brideName &&
    workqueueDeclaration.groomName
  ) {
    const groomName = getLocalisedName(intl, {
      firstNames: workqueueDeclaration.groomName[0]?.firstNames,
      middleName: workqueueDeclaration.groomName[0]?.middleName,
      familyName: workqueueDeclaration.groomName[0]?.familyName
    })
    const brideName = getLocalisedName(intl, {
      firstNames: workqueueDeclaration.brideName[0]?.firstNames,
      middleName: workqueueDeclaration.brideName[0]?.middleName,
      familyName: workqueueDeclaration.brideName[0]?.familyName
    })

    name =
      brideName && groomName
        ? `${groomName} & ${brideName}`
        : brideName || groomName || EMPTY_STRING
  }
  return {
    id: workqueueDeclaration?.id,
    name,
    type:
      (workqueueDeclaration?.type && workqueueDeclaration.type) || EMPTY_STRING,
    status: (workqueueDeclaration?.registration?.status ||
      EMPTY_STRING) as SUBMISSION_STATUS,
    assignment: workqueueDeclaration?.registration?.assignment,
    trackingId: trackingId,
    dateOfBirth: EMPTY_STRING,
    placeOfBirth: EMPTY_STRING
  }
}

export const getGQLDeclaration = (
  data: IGQLDeclaration,
  intl: IntlShape
): IDeclarationData => {
  let name = EMPTY_STRING
  if (data.child) {
    name = data.child.name
      ? getLocalisedName(intl, {
          firstNames: data.child.name[0]?.firstNames,
          middleName: data.child.name[0]?.middleName,
          familyName: data.child.name[0]?.familyName
        })
      : EMPTY_STRING
  } else if (data.deceased) {
    name = data.deceased.name
      ? getLocalisedName(intl, {
          firstNames: data.deceased.name[0]?.firstNames,
          middleName: data.deceased.name[0]?.middleName,
          familyName: data.deceased.name[0]?.familyName
        })
      : EMPTY_STRING
  } else if (data.groom || data.bride) {
    if (data.groom?.name && data.bride?.name) {
      name = `${getLocalisedName(intl, {
        firstNames: data.groom.name[0]?.firstNames,
        middleName: data.groom.name[0]?.middleName,
        familyName: data.groom.name[0]?.familyName
      })} & ${getLocalisedName(intl, {
        firstNames: data.bride.name[0]?.firstNames,
        middleName: data.bride.name[0]?.middleName,
        familyName: data.bride.name[0]?.firstNames
      })}`
    } else if (data.groom?.name) {
      name = getLocalisedName(intl, {
        firstNames: data.groom.name[0]?.firstNames,
        middleName: data.groom.name[0]?.middleName,
        familyName: data.groom.name[0]?.familyName
      })
    } else if (data.bride?.name) {
      name = getLocalisedName(intl, {
        firstNames: data.bride.name[0]?.firstNames,
        middleName: data.bride.name[0]?.middleName,
        familyName: data.bride.name[0]?.familyName
      })
    } else {
      name = EMPTY_STRING
    }
  }
  return {
    id: data?.id,
    name,
    type: data?.registration?.type,
    status: data?.registration?.status[0].type as SUBMISSION_STATUS,
    trackingId: data?.registration?.trackingId,
    assignment: data?.registration?.assignment,
    dateOfBirth: EMPTY_STRING,
    placeOfBirth: EMPTY_STRING,
    dateOfDeath: EMPTY_STRING,
    placeOfDeath: EMPTY_STRING,
    dateOfMarriage: EMPTY_STRING,
    placeOfMarriage: EMPTY_STRING
  }
}

export const getPageItems = (
  currentPage: number,
  pageSize: number,
  allData: IDynamicValues
) => {
  if (allData.length <= pageSize) {
    return allData
  }

  const offset = (currentPage - 1) * pageSize
  const pageItems = allData.slice(offset, offset + pageSize)
  return pageItems
}

export function getStatusLabel(
  action: Maybe<RegAction> | undefined,
  regStatus: Maybe<RegStatus> | undefined,
  intl: IntlShape,
  performedBy: Maybe<User> | undefined,
  loggedInUser: UserDetails | null,
  scopes: Scope[] | null
) {
  if (action) {
    return intl.formatMessage(regActionMessages[action], {
      regStatus: regStatus?.toLowerCase()
    })
  }
  if (
    regStatus === RegStatus.Declared &&
    performedBy?.id === loggedInUser?.userMgntUserID &&
    scopes?.includes(SCOPES.RECORD_SUBMIT_INCOMPLETE)
  ) {
    return intl.formatMessage(recordAuditMessages.sentNotification)
  }
  /* We should find a better way of handling started event*/
  //@ts-ignore
  if (regStatus === 'STARTED') {
    return intl.formatMessage(recordAuditMessages.started)
  }
  return regStatus ? intl.formatMessage(regStatusMessages[regStatus]) : ''
}

export function isSystemInitiated(history: History) {
  return Boolean(
    (history.dhis2Notification && !history.user?.id) || history.system
  )
}

export function isVerifiedAction(history: History) {
  return history.action === RegAction.Verified
}

export function isFlaggedAsPotentialDuplicate(history: History) {
  return history.action === RegAction.FlaggedAsPotentialDuplicate
}
