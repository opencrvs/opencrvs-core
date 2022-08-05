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
import {
  IFormField,
  IRadioGroupFormField,
  ISelectOption,
  IFormSectionData,
  IContactPointPhone
} from '@client/forms'
import { IOfflineData } from '@client/offline/reducer'
import { get, has } from 'lodash'
import { IntlShape, MessageDescriptor } from 'react-intl'
import { IDeclaration } from '@client/declarations'
import {
  generateLocationName,
  generateFullLocation
} from '@client/utils/locationUtils'
import {
  GQLEventSearchSet,
  GQLBirthEventSearchSet,
  GQLDeathEventSearchSet,
  GQLHumanName,
  GQLAssignmentData
} from '@opencrvs/gateway/src/graphql/schema'
import { createNamesMap } from '@client/utils/data-formatting'
import { formatLongDate } from '@client/utils/date-formatting'
import { IDynamicValues } from '@client/navigation'
import { countryMessages } from '@client/i18n/messages/constants'
import { IUserDetails } from '@client/utils/userUtils'
import { EMPTY_STRING, FIELD_AGENT_ROLES } from '@client/utils/constants'
import { Event } from '@client/utils/gateway'
interface IStatus {
  [key: string]: MessageDescriptor
}

export interface IDeclarationData {
  id: string
  name?: string
  status?: string
  trackingId?: string
  type?: string
  dateOfBirth?: string
  dateOfDeath?: string
  placeOfBirth?: string
  placeOfDeath?: string
  informant?: string
  informantContact?: string
  brnDrn?: string
  assignment?: GQLAssignmentData
}

export interface IGQLDeclaration {
  id: string
  child?: { name: Array<GQLHumanName | null> }
  deceased?: { name: Array<GQLHumanName | null> }
  registration?: {
    trackingId: string
    type: string
    status: { type: string }[]
    assignment?: GQLAssignmentData
  }
}

export const DECLARATION_STATUS_LABEL: IStatus = {
  STARTED: {
    defaultMessage: 'Started',
    description: 'Label for declaration started',
    id: 'recordAudit.history.started'
  },
  REINSTATED: {
    defaultMessage: 'Reinstated to {status}',
    description: 'The prefix for reinstated declaration',
    id: 'recordAudit.history.reinstated'
  },
  ARCHIVED: {
    defaultMessage: 'Archived',
    description: 'Label for registration status archived',
    id: 'recordAudit.history.archived'
  },
  IN_PROGRESS: {
    defaultMessage: 'Sent incomplete',
    description: 'Declaration submitted without completing the required fields',
    id: 'constants.sent_incomplete'
  },
  DECLARED: {
    defaultMessage: 'Declaration started',
    description: 'Label for registration status declared',
    id: 'recordAudit.history.declared'
  },
  DECLARED_FIELD_AGENT: {
    defaultMessage: 'Sent notification for review',
    description: 'Label for registration status declared',
    id: 'recordAudit.history.declaredFieldAgent'
  },
  WAITING_VALIDATION: {
    defaultMessage: 'Waiting for validation',
    description: 'Label for registration status waitingValidation',
    id: 'recordAudit.history.waitingValidation'
  },
  VALIDATED: {
    defaultMessage: 'Sent for approval',
    description: 'The title of sent for approvals tab',
    id: 'regHome.sentForApprovals'
  },
  REGISTERED: {
    defaultMessage: 'Registered',
    description: 'Label for registration status registered',
    id: 'recordAudit.history.registered'
  },
  CERTIFIED: {
    defaultMessage: 'Certified',
    description: 'Label for registration status certified',
    id: 'recordAudit.history.certified'
  },
  REJECTED: {
    defaultMessage: 'Rejected',
    description: 'A label for registration status rejected',
    id: 'recordAudit.history.rejected'
  },
  DOWNLOADED: {
    defaultMessage: 'Downloaded',
    description: 'Label for declaration download status Downloaded',
    id: 'recordAudit.history.downloaded'
  },
  REQUESTED_CORRECTION: {
    defaultMessage: 'Corrected record',
    description: 'Status for declaration being requested for correction',
    id: 'recordAudit.history.requestedCorrection'
  },
  DECLARATION_UPDATED: {
    defaultMessage: 'Updated',
    description: 'Declaration has been updated',
    id: 'recordAudit.history.updatedDeclaration'
  }
}

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

export const getLocation = (
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

  if (declaration.event === Event.Death) {
    locationType =
      declaration.data?.deathEvent?.placeOfDeath?.toString() || EMPTY_STRING
    locationId =
      declaration.data?.deathEvent?.deathLocation?.toString() || EMPTY_STRING

    district =
      declaration.data?.deathEvent?.district?.toString() || EMPTY_STRING
    state = declaration.data?.deathEvent?.state?.toString() || EMPTY_STRING
    country = declaration.data?.deathEvent?.country?.toString() || EMPTY_STRING

    // when address is outside of default country
    internationalDistrict =
      declaration.data?.deathEvent?.internationalDistrict?.toString() ||
      EMPTY_STRING
    internationalState =
      declaration.data?.deathEvent?.internationalState?.toString() ||
      EMPTY_STRING
  } else {
    locationType =
      declaration.data?.child?.placeOfBirth?.toString() || EMPTY_STRING
    locationId =
      declaration.data?.child?.birthLocation?.toString() || EMPTY_STRING

    district = declaration.data?.child?.district?.toString() || EMPTY_STRING
    state = declaration.data?.child?.state?.toString() || EMPTY_STRING
    country = declaration.data?.child?.country?.toString() || EMPTY_STRING

    // when address is outside of default country
    internationalDistrict =
      declaration.data?.child?.internationalDistrict?.toString() || EMPTY_STRING
    internationalState =
      declaration.data?.child?.internationalState?.toString() || EMPTY_STRING
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
      declaration.data?.deceased?.countryPrimary?.toString() || EMPTY_STRING

    if (countryResidence !== window.config.COUNTRY) {
      // residence address is other than default country
      const internationalDistrictResidence =
        declaration.data?.deceased?.internationalDistrictPrimary?.toString() ||
        EMPTY_STRING
      const internationalStateResidence =
        declaration.data?.deceased?.internationalStatePrimary?.toString() ||
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
        declaration.data?.deceased?.districtPrimary?.toString() || EMPTY_STRING
      const stateResidence =
        declaration.data?.deceased?.statePrimary?.toString() || EMPTY_STRING

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

export const getFormattedDate = (date: Date) => {
  return formatLongDate(
    date.toLocaleString(),
    window.config.LANGUAGES,
    'MMMM dd, yyyy · hh.mm a'
  )
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

export const isBirthDeclaration = (
  declaration: GQLEventSearchSet | null
): declaration is GQLBirthEventSearchSet => {
  return (declaration && declaration.type === 'Birth') || false
}

export const isDeathDeclaration = (
  declaration: GQLEventSearchSet | null
): declaration is GQLDeathEventSearchSet => {
  return (declaration && declaration.type === 'Death') || false
}

export const getDraftDeclarationName = (declaration: IDeclaration) => {
  let name = EMPTY_STRING
  let declarationName
  if (declaration.event === Event.Birth) {
    declarationName = declaration.data?.child
  } else {
    declarationName = declaration.data?.deceased
  }

  if (declarationName) {
    name = [declarationName.firstNamesEng, declarationName.familyNameEng]
      .filter((part) => Boolean(part))
      .join(' ')
  }
  return name
}

export function notNull<T>(value: T | null): value is T {
  return value !== null
}

export const getName = (name: (GQLHumanName | null)[], language: string) => {
  return createNamesMap(name.filter(notNull))[language]
}

export const getDraftDeclarationData = (
  declaration: IDeclaration,
  resources: IOfflineData,
  intl: IntlShape,
  trackingId: string
): IDeclarationData => {
  return {
    id: declaration.id,
    name: getDraftDeclarationName(declaration),
    type: declaration.event || EMPTY_STRING,
    brnDrn:
      declaration.data?.registration?.registrationNumber?.toString() ||
      EMPTY_STRING,
    trackingId: trackingId,
    dateOfBirth:
      declaration.data?.child?.childBirthDate?.toString() || EMPTY_STRING,
    dateOfDeath:
      declaration.data?.deathEvent?.deathDate?.toString() || EMPTY_STRING,
    placeOfBirth: getLocation(declaration, resources, intl) || EMPTY_STRING,
    placeOfDeath: getLocation(declaration, resources, intl) || EMPTY_STRING,
    informant:
      ((declaration.data?.registration?.contactPoint as IFormSectionData)
        ?.value as string) || EMPTY_STRING,
    informantContact:
      (
        (declaration.data?.registration?.contactPoint as IFormSectionData)
          ?.nestedFields as IContactPointPhone
      )?.registrationPhone.toString() || EMPTY_STRING
  }
}

export const getWQDeclarationData = (
  workqueueDeclaration: GQLEventSearchSet,
  language: string,
  trackingId: string
) => {
  let name = EMPTY_STRING
  if (
    isBirthDeclaration(workqueueDeclaration) &&
    workqueueDeclaration.childName
  ) {
    name = getName(workqueueDeclaration.childName, language)
  } else if (
    isDeathDeclaration(workqueueDeclaration) &&
    workqueueDeclaration.deceasedName
  ) {
    name = getName(workqueueDeclaration.deceasedName, language)
  }
  return {
    id: workqueueDeclaration?.id,
    name,
    type:
      (workqueueDeclaration?.type && workqueueDeclaration.type) || EMPTY_STRING,
    status: workqueueDeclaration?.registration?.status || EMPTY_STRING,
    assignment: workqueueDeclaration?.registration?.assignment,
    trackingId: trackingId,
    dateOfBirth: EMPTY_STRING,
    placeOfBirth: EMPTY_STRING,
    informant: EMPTY_STRING
  }
}

export const getGQLDeclaration = (
  data: IGQLDeclaration,
  language: string
): IDeclarationData => {
  let name = EMPTY_STRING
  if (data.child) {
    name = data.child.name ? getName(data.child.name, language) : EMPTY_STRING
  } else if (data.deceased) {
    name = data.deceased.name
      ? getName(data.deceased.name, language)
      : EMPTY_STRING
  }
  return {
    id: data?.id,
    name,
    type: data?.registration?.type,
    status: data?.registration?.status[0].type,
    trackingId: data?.registration?.trackingId,
    assignment: data?.registration?.assignment,
    dateOfBirth: EMPTY_STRING,
    placeOfBirth: EMPTY_STRING,
    informant: EMPTY_STRING
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

export const getStatusLabel = (
  status: string,
  reinstated: boolean,
  intl: IntlShape,
  userDetails: IUserDetails
) => {
  if (status in DECLARATION_STATUS_LABEL)
    return reinstated
      ? intl.formatMessage(DECLARATION_STATUS_LABEL['REINSTATED'], {
          status: intl.formatMessage(DECLARATION_STATUS_LABEL[status])
        })
      : status === 'DECLARED'
      ? findMessage(
          status,
          userDetails.role ? userDetails.role : EMPTY_STRING,
          intl
        )
      : intl.formatMessage(DECLARATION_STATUS_LABEL[status])
  return EMPTY_STRING
}

const findMessage = (status: string, userRole: string, intl: IntlShape) => {
  if (userRole && FIELD_AGENT_ROLES.includes(userRole)) {
    return intl.formatMessage(DECLARATION_STATUS_LABEL['DECLARED_FIELD_AGENT'])
  } else {
    return intl.formatMessage(DECLARATION_STATUS_LABEL[status])
  }
}
