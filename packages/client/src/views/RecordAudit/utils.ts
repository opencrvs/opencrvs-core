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
  GQLHumanName
} from '@opencrvs/gateway/src/graphql/schema'
import { createNamesMap } from '@client/utils/data-formatting'
import { formatLongDate } from '@client/utils/date-formatting'
import { IDynamicValues } from '@client/navigation'
import { countryMessages } from '@client/i18n/messages/constants'
import { IUserDetails } from '@client/utils/userUtils'
import { FIELD_AGENT_ROLES } from '@client/utils/constants'

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
}

export interface IGQLDeclaration {
  id: string
  child?: { name: Array<GQLHumanName | null> }
  deceased?: { name: Array<GQLHumanName | null> }
  registration?: {
    trackingId: string
    type: string
    status: { type: string }[]
  }
}

export const DECLARATION_STATUS_LABEL: IStatus = {
  STARTED: {
    defaultMessage: 'Started',
    description: 'Label for declaration started',
    id: 'recordAudit.history.started'
  },
  REINSTATED: {
    defaultMessage: 'Reinstated to ',
    description: 'The prefix for reinstated declaration',
    id: 'recordAudit.history.reinstated.prefix'
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
      facility &&
      facility.partOf &&
      resources.locations[facility.partOf.split('/')[1]]
    const state = district && resources.locations[district.partOf.split('/')[1]]
    const defaultCountry = intl.formatMessage(
      countryMessages[window.config.COUNTRY]
    )
    const healthFacility = generateLocationName(facility, intl)

    let location = ''
    if (healthFacility) location = healthFacility + ', '
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

export const getFormattedDate = (date: Date) => {
  return formatLongDate(
    date.toLocaleString(),
    window.config.LANGUAGES,
    'MMMM dd, yyyy · hh.mm a'
  )
}

export const getCaptitalizedWord = (word: string | undefined): string => {
  if (!word) return ''
  return word.toUpperCase()[0] + word.toLowerCase().slice(1)
}

export const removeUnderscore = (word: string): string => {
  const wordArray = word.split('_')
  const finalWord = wordArray.reduce(
    (accum, cur, idx) => (idx > 0 ? accum + ' ' + cur : cur),
    ''
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
  let name = ''
  let declarationName
  if (declaration.event === 'birth') {
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
    type: declaration.event || '',
    brnDrn:
      declaration.data?.registration?.registrationNumber?.toString() || '',
    trackingId: trackingId,
    dateOfBirth: declaration.data?.child?.childBirthDate?.toString() || '',
    dateOfDeath: declaration.data?.deathEvent?.deathDate?.toString() || '',
    placeOfBirth: getLocation(declaration, resources, intl) || '',
    placeOfDeath: getLocation(declaration, resources, intl) || '',
    informant:
      ((declaration.data?.registration?.contactPoint as IFormSectionData)
        ?.value as string) || '',
    informantContact:
      (
        (declaration.data?.registration?.contactPoint as IFormSectionData)
          ?.nestedFields as IContactPointPhone
      )?.registrationPhone.toString() || ''
  }
}

export const getWQDeclarationData = (
  workqueueDeclaration: GQLEventSearchSet,
  language: string,
  trackingId: string
) => {
  let name = ''
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
    type: (workqueueDeclaration?.type && workqueueDeclaration.type) || '',
    trackingId: trackingId,
    dateOfBirth: '',
    placeOfBirth: '',
    informant: ''
  }
}

export const getGQLDeclaration = (
  data: IGQLDeclaration,
  language: string
): IDeclarationData => {
  let name = ''
  if (data.child) {
    name = getName(data.child.name, language)
  } else if (data.deceased) {
    name = getName(data.deceased.name, language)
  }
  return {
    id: data?.id,
    name,
    type: data?.registration?.type,
    status: data?.registration?.status[0].type,
    trackingId: data?.registration?.trackingId,
    dateOfBirth: '',
    placeOfBirth: '',
    informant: ''
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
    return (reinstated
      ? intl.formatMessage(DECLARATION_STATUS_LABEL['REINSTATED'])
      : '') +
      status ===
      'DECLARED'
      ? findMessage(status, userDetails.role ? userDetails.role : '', intl)
      : intl.formatMessage(DECLARATION_STATUS_LABEL[status])
  return ''
}

const findMessage = (status: string, userRole: string, intl: IntlShape) => {
  if (userRole && FIELD_AGENT_ROLES.includes(userRole)) {
    return intl.formatMessage(DECLARATION_STATUS_LABEL['DECLARED_FIELD_AGENT'])
  } else {
    return intl.formatMessage(DECLARATION_STATUS_LABEL[status])
  }
}
