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
import { IAdvancedSearchParamState } from '@client/search/advancedSearch/reducer'
import { advancedSearchBirthSections } from '@client/forms/advancedSearch/fieldDefinitions/Birth'
import { advancedSearchDeathSections } from '@client/forms/advancedSearch/fieldDefinitions/Death'
import { IDateRangePickerValue } from '@client/forms'
import { messages as advancedSearchResultMessages } from '@client/i18n/messages/views/advancedSearchResult'
import { constantsMessages, formMessages } from '@client/i18n/messages'
import {
  IOfflineData,
  OFFLINE_FACILITIES_KEY,
  OFFLINE_LOCATIONS_KEY
} from '@client/offline/reducer'
import {
  generateSearchableLocations,
  getLocationNameMapOfFacility
} from '@client/utils/locationUtils'
import { IntlShape } from 'react-intl'
import { RegStatus } from '@client/utils/gateway'
import { isEqual } from 'lodash'
import { messages as advancedSearchForm } from '@client/i18n/messages/views/advancedSearchForm'
import format from '@client/utils/date-formatting'
import { ISearchLocation } from '@opencrvs/components'

const {
  birthSearchRegistrationSection,
  birthSearchChildSection,
  birthSearchMotherSection,
  birthSearchFatherSection,
  birthSearchEventSection,
  birthSearchInformantSection
} = advancedSearchBirthSections
const {
  deathSearchRegistrationSection,
  deathSearchDeceasedSection,
  deathSearchEventSection,
  deathSearchInformantSection
} = advancedSearchDeathSections

export const getAccordionActiveStateMap = (
  storeState: IAdvancedSearchParamState
): Record<string, boolean> => {
  return {
    [birthSearchRegistrationSection.id]: Boolean(
      storeState.declarationLocationId ||
        storeState.declarationJurisdictionId ||
        storeState.dateOfRegistration ||
        (storeState.dateOfRegistrationStart &&
          storeState.dateOfRegistrationStart)
    ),
    [birthSearchChildSection.id]: Boolean(
      storeState.childGender ||
        storeState.childFirstNames ||
        storeState.childLastName ||
        storeState.childDoB ||
        (storeState.childDoBStart && storeState.childDoBEnd)
    ),
    [birthSearchEventSection.id]: Boolean(
      storeState.eventLocationId ||
        storeState.eventCountry ||
        storeState.eventLocationLevel1 ||
        storeState.eventLocationLevel1
    ),
    [birthSearchMotherSection.id]: Boolean(
      storeState.motherFirstNames ||
        storeState.motherFamilyName ||
        storeState.motherDoB ||
        (storeState.motherDoBStart && storeState.motherDoBEnd)
    ),
    [birthSearchFatherSection.id]: Boolean(
      storeState.fatherFirstNames ||
        storeState.fatherFamilyName ||
        storeState.fatherDoB ||
        (storeState.fatherDoBStart && storeState.fatherDoBEnd)
    ),
    [birthSearchInformantSection.id]: Boolean(
      storeState.informantFirstNames ||
        storeState.informantFamilyName ||
        storeState.informantDoB ||
        (storeState.informantDoBStart && storeState.informantDoBEnd)
    ),
    [deathSearchRegistrationSection.id]: Boolean(
      storeState.declarationLocationId ||
        storeState.declarationJurisdictionId ||
        storeState.dateOfRegistration ||
        (storeState.dateOfRegistrationStart &&
          storeState.dateOfRegistrationStart)
    ),
    [deathSearchDeceasedSection.id]: Boolean(
      storeState.childGender ||
        storeState.childFirstNames ||
        storeState.childLastName ||
        storeState.childDoB ||
        (storeState.childDoBStart && storeState.childDoBEnd)
    ),
    [deathSearchEventSection.id]: Boolean(
      storeState.eventLocationId ||
        storeState.eventCountry ||
        storeState.eventLocationLevel1 ||
        storeState.eventLocationLevel1
    ),
    [deathSearchInformantSection.id]: Boolean(
      storeState.informantFirstNames ||
        storeState.informantFamilyName ||
        storeState.informantDoB ||
        (storeState.informantDoBStart && storeState.informantDoBEnd)
    )
  }
}

export const determineDateFromDateRangePickerVal = (
  dateRangePickerValue?: IDateRangePickerValue
): Omit<IDateRangePickerValue, 'isDateRangeActive'> => {
  if (!dateRangePickerValue) {
    return { exact: undefined, rangeStart: undefined, rangeEnd: undefined }
  }
  const value = { ...dateRangePickerValue }
  if (dateRangePickerValue.isDateRangeActive) {
    value.exact = undefined
  } else {
    value.rangeStart = undefined
    value.rangeEnd = undefined
  }

  return value
}

export const convertDateValuesToDateRangePicker = (
  exact?: string,
  rangeStart?: string,
  rangeEnd?: string
): IDateRangePickerValue => {
  let value: IDateRangePickerValue = {
    isDateRangeActive: false
  } as IDateRangePickerValue

  if (rangeStart && rangeEnd) {
    value = {
      ...value,
      rangeStart,
      rangeEnd,
      isDateRangeActive: true
    }
  } else if (exact) {
    value = { ...value, exact }
  }

  return value
}

export const isValidDateRangePickerValue = (
  dateRangePickerValue: IDateRangePickerValue
): boolean => {
  let isValid = false
  if (!dateRangePickerValue.isDateRangeActive) {
    if (dateRangePickerValue.exact) {
      isValid = true
    }
  } else {
    if (dateRangePickerValue.rangeStart && dateRangePickerValue.rangeEnd) {
      isValid = true
    }
  }
  return isValid
}

const getFormattedOfficeName = (
  placeId: string,
  offlineData: IOfflineData
): string => {
  const offices = Object.values(offlineData.offices)
  return offices.find((place) => place.id === placeId)?.name || ''
}

const getFormattedJurisDictionName = (
  locationId: string,
  offlineData: IOfflineData,
  intl: IntlShape
): ISearchLocation | undefined => {
  if (
    !offlineData[OFFLINE_LOCATIONS_KEY] ||
    !offlineData[OFFLINE_LOCATIONS_KEY][locationId]
  ) {
    return
  }
  const jurisdiction = generateSearchableLocations(
    [offlineData[OFFLINE_LOCATIONS_KEY][locationId]],
    offlineData.locations,
    intl
  )
  return jurisdiction[0]
}

const getLabelForRegistrationStatus = (
  statusList: string[],
  intl: IntlShape
) => {
  const statusLabelMapping: Record<string, string[]> = {
    ALL: [
      RegStatus.Archived,
      RegStatus.Certified,
      RegStatus.DeclarationUpdated,
      RegStatus.Declared,
      RegStatus.InProgress,
      RegStatus.Registered,
      RegStatus.Rejected,
      RegStatus.Validated,
      RegStatus.WaitingValidation
    ],
    IN_REVIEW: [RegStatus.WaitingValidation, RegStatus.Validated],
    ARCHIVED: [RegStatus.Archived],
    CERTIFIED: [RegStatus.Certified],
    DECLARATION_UPDATED: [RegStatus.DeclarationUpdated],
    DECLARED: [RegStatus.Declared],
    IN_PROGRESS: [RegStatus.InProgress],
    REGISTERED: [RegStatus.Registered],
    REJECTED: [RegStatus.Rejected],
    VALIDATED: [RegStatus.Validated],
    WAITING_VALIDATION: [RegStatus.WaitingValidation]
  }

  const statusType = Object.keys(statusLabelMapping).find((key, i) => {
    if (isEqual(statusList, statusLabelMapping[key])) {
      return true
    }
    return false
  })

  const forMattedStatusList = [
    {
      value: 'ALL',
      label: intl.formatMessage(advancedSearchForm.recordStatusAny)
    },
    {
      value: RegStatus.InProgress,
      label: intl.formatMessage(advancedSearchForm.recordStatusInprogress)
    },
    {
      value: 'IN_REVIEW',
      label: intl.formatMessage(advancedSearchForm.recordStatusInReview)
    },
    {
      value: RegStatus.Rejected,
      label: intl.formatMessage(advancedSearchForm.recordStatusRequireUpdate)
    },
    {
      value: RegStatus.Registered,
      label: intl.formatMessage(advancedSearchForm.recordStatusRegistered)
    },
    {
      value: RegStatus.Certified,
      label: intl.formatMessage(advancedSearchForm.recordStatusCertified)
    },
    {
      value: RegStatus.Archived,
      label: intl.formatMessage(advancedSearchForm.recordStatusAchived)
    }
  ]

  const formattedLabel =
    forMattedStatusList.find((e, i) => statusType === e.value)?.label ||
    statusList[0]

  return formattedLabel
}

const formatDateRangeLabel = (
  rangeStart: string | undefined,
  rangeEnd: string | undefined,
  intl: IntlShape
) => {
  if (!rangeStart || !rangeEnd) {
    return
  }
  const dateStartLocale =
    rangeStart && format(new Date(rangeStart), 'MMMM yyyy')
  const dateEndLocale = rangeEnd && format(new Date(rangeEnd), 'MMMM yyyy')

  return intl.formatMessage(formMessages.dateRangePickerCheckboxLabel, {
    rangeStart: dateStartLocale,
    rangeEnd: dateEndLocale
  })
}

const getFacilityNameById = (locationId: string, offlineData: IOfflineData) => {
  const eventLocationKey =
    locationId && offlineData[OFFLINE_FACILITIES_KEY][locationId]
  if (eventLocationKey) {
    return (
      (getLocationNameMapOfFacility(eventLocationKey, offlineData.locations)
        .facility as string) || ''
    )
  }
  return ''
}

const getFormattedResidentialAddressForPill = (
  offlineData: IOfflineData,
  intl: IntlShape,
  eventLocationLevel1?: string,
  eventLocationLevel2?: string,
  eventCountry?: string
) => {
  return [
    getFormattedJurisDictionName(eventLocationLevel1 || '', offlineData, intl)
      ?.displayLabel,
    getFormattedJurisDictionName(eventLocationLevel2 || '', offlineData, intl)
      ?.searchableText,
    eventCountry || ''
  ]
    .filter((e) => e && e !== '')
    .join(',')
}

export const getFormattedAdvanceSearchParamPills = (
  advancedSearchParamsState: IAdvancedSearchParamState,
  intl: IntlShape,
  offlineData: IOfflineData
): Record<string, string> => {
  const intlFormattedMapOfParams = {
    [intl.formatMessage(advancedSearchResultMessages.event)]:
      advancedSearchParamsState.event === 'birth'
        ? intl.formatMessage(constantsMessages.birth)
        : intl.formatMessage(constantsMessages.death),

    [intl.formatMessage(advancedSearchResultMessages.registationStatus)]:
      advancedSearchParamsState.registrationStatuses &&
      advancedSearchParamsState.registrationStatuses.length > 0 &&
      getLabelForRegistrationStatus(
        advancedSearchParamsState.registrationStatuses,
        intl
      ),

    [intl.formatMessage(advancedSearchResultMessages.trackingId)]:
      advancedSearchParamsState.trackingId,

    [intl.formatMessage(advancedSearchResultMessages.regNumber)]:
      advancedSearchParamsState.registrationNumber,

    [intl.formatMessage(advancedSearchResultMessages.childFirstName)]:
      advancedSearchParamsState.childFirstNames,

    [intl.formatMessage(advancedSearchResultMessages.childLastName)]:
      advancedSearchParamsState.childLastName,

    [intl.formatMessage(advancedSearchResultMessages.motherFirstName)]:
      advancedSearchParamsState.motherFirstNames,

    [intl.formatMessage(advancedSearchResultMessages.motherLastName)]:
      advancedSearchParamsState.motherFamilyName,

    [intl.formatMessage(advancedSearchResultMessages.fatherFirstName)]:
      advancedSearchParamsState.fatherFirstNames,

    [intl.formatMessage(advancedSearchResultMessages.fatherLastName)]:
      advancedSearchParamsState.fatherFamilyName,

    [intl.formatMessage(advancedSearchResultMessages.informantFirstName)]:
      advancedSearchParamsState.informantFirstNames,

    [intl.formatMessage(advancedSearchResultMessages.informantLastName)]:
      advancedSearchParamsState.informantFamilyName,

    [intl.formatMessage(advancedSearchResultMessages.deceasedFirstName)]:
      advancedSearchParamsState.deceasedFirstNames,

    [intl.formatMessage(advancedSearchResultMessages.deceasedLastName)]:
      advancedSearchParamsState.deceasedFamilyName,

    [intl.formatMessage(advancedSearchResultMessages.gender)]:
      advancedSearchParamsState.childGender,

    [intl.formatMessage(advancedSearchResultMessages.gender)]:
      advancedSearchParamsState.deceasedGender,

    [intl.formatMessage(advancedSearchResultMessages.regLocation)]:
      (advancedSearchParamsState.declarationLocationId &&
        getFormattedOfficeName(
          advancedSearchParamsState.declarationLocationId,
          offlineData
        )) ||
      (advancedSearchParamsState.declarationJurisdictionId &&
        getFormattedJurisDictionName(
          advancedSearchParamsState.declarationJurisdictionId,
          offlineData,
          intl
        )?.displayLabel),

    [intl.formatMessage(advancedSearchResultMessages.eventlocation)]:
      (advancedSearchParamsState.eventLocationId &&
        getFacilityNameById(
          advancedSearchParamsState.eventLocationId,
          offlineData
        )) ||
      getFormattedResidentialAddressForPill(
        offlineData,
        intl,
        advancedSearchParamsState.eventLocationLevel1,
        advancedSearchParamsState.eventLocationLevel2,
        advancedSearchParamsState.eventCountry
      ),

    [intl.formatMessage(advancedSearchResultMessages.eventDate)]:
      (advancedSearchParamsState.dateOfEventStart &&
        advancedSearchParamsState.dateOfEventEnd &&
        formatDateRangeLabel(
          advancedSearchParamsState.dateOfEventStart,
          advancedSearchParamsState.dateOfEventEnd,
          intl
        )) ||
      advancedSearchParamsState.dateOfEvent,

    [intl.formatMessage(advancedSearchResultMessages.regDate)]:
      (advancedSearchParamsState.dateOfRegistrationStart &&
        advancedSearchParamsState.dateOfRegistrationEnd &&
        formatDateRangeLabel(
          advancedSearchParamsState.dateOfRegistrationStart,
          advancedSearchParamsState.dateOfRegistrationEnd,
          intl
        )) ||
      advancedSearchParamsState.dateOfRegistration,

    [intl.formatMessage(advancedSearchResultMessages.childDoB)]:
      (advancedSearchParamsState.event === 'birth' &&
        advancedSearchParamsState.childDoBStart &&
        advancedSearchParamsState.childDoBEnd &&
        formatDateRangeLabel(
          advancedSearchParamsState.childDoBStart,
          advancedSearchParamsState.childDoBEnd,
          intl
        )) ||
      advancedSearchParamsState.childDoB,

    [intl.formatMessage(advancedSearchResultMessages.motherDoB)]:
      (advancedSearchParamsState.event === 'birth' &&
        advancedSearchParamsState.motherDoBStart &&
        advancedSearchParamsState.motherDoBEnd &&
        formatDateRangeLabel(
          advancedSearchParamsState.motherDoBStart,
          advancedSearchParamsState.motherDoBEnd,
          intl
        )) ||
      advancedSearchParamsState.motherDoB,

    [intl.formatMessage(advancedSearchResultMessages.fatherDoB)]:
      (advancedSearchParamsState.event === 'birth' &&
        advancedSearchParamsState.fatherDoBStart &&
        advancedSearchParamsState.fatherDoBEnd &&
        formatDateRangeLabel(
          advancedSearchParamsState.fatherDoBStart,
          advancedSearchParamsState.fatherDoBEnd,
          intl
        )) ||
      advancedSearchParamsState.fatherDoB,

    [intl.formatMessage(advancedSearchResultMessages.deceasedDoB)]:
      (advancedSearchParamsState.event === 'death' &&
        advancedSearchParamsState.deceasedDoBStart &&
        advancedSearchParamsState.deceasedDoBEnd &&
        formatDateRangeLabel(
          advancedSearchParamsState.deceasedDoBStart,
          advancedSearchParamsState.deceasedDoBEnd,
          intl
        )) ||
      advancedSearchParamsState.deceasedDoB,

    [intl.formatMessage(advancedSearchResultMessages.informantDoB)]:
      (advancedSearchParamsState.informantDoBStart &&
        advancedSearchParamsState.informantDoBEnd &&
        formatDateRangeLabel(
          advancedSearchParamsState.informantDoBStart,
          advancedSearchParamsState.informantDoBEnd,
          intl
        )) ||
      advancedSearchParamsState.informantDoB
  }

  return Object.keys(intlFormattedMapOfParams)
    .filter((key) => Boolean(intlFormattedMapOfParams[key]))
    .reduce((ac, curr) => {
      return {
        ...ac,
        ...{
          [curr]: intlFormattedMapOfParams[curr]
        }
      }
    }, {})
}
