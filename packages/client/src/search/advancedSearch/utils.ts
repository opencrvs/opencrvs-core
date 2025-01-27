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
import { IAdvancedSearchParamState } from '@client/search/advancedSearch/reducer'
import { createAdvancedSearchBirthSections } from '@client/forms/advancedSearch/fieldDefinitions/Birth'
import { createAdvancedSearchDeathSections } from '@client/forms/advancedSearch/fieldDefinitions/Death'
import { IDateRangePickerValue } from '@client/forms'
import { IAdvancedSearchResultMessages } from '@client/i18n/messages/views/advancedSearchResult'
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
import { COLUMNS, ISearchLocation } from '@opencrvs/components'
import formatDate from '@client/utils/date-formatting'
import {
  isInvalidDate,
  TIME_PERIOD
} from '@client/forms/advancedSearch/fieldDefinitions/utils'
import { UUID } from '@opencrvs/commons/client'

export type advancedSearchPillKey = Exclude<
  keyof IAdvancedSearchResultMessages,
  'searchResult' | 'noResult'
>

type pillKeyValueMap = {
  [key in advancedSearchPillKey]: string | undefined
}

const baseKeysSameAsStore = [
  'event',
  'registrationStatuses',
  'registrationNumber',
  'trackingId',
  'eventCountry',
  'eventLocationId',
  'eventLocationLevel1',
  'eventLocationLevel2',
  'eventLocationLevel3',
  'eventLocationLevel4',
  'eventLocationLevel5',
  'eventLocationLevel6',
  'childFirstNames',
  'childLastName',
  'childGender',
  'deceasedFirstNames',
  'deceasedFamilyName',
  'deceasedGender',
  'motherFirstNames',
  'motherFamilyName',
  'fatherFirstNames',
  'fatherFamilyName',
  'informantFirstNames',
  'informantFamilyName'
] as const

export const dateFieldTypes = [
  'dateOfRegistration',
  'dateOfEvent',
  'childDoB',
  'motherDoB',
  'fatherDoB',
  'deceasedDoB',
  'informantDoB'
]

export interface IAdvancedSearchFormState {
  event?: string
  registrationStatuses?: string
  dateOfEvent?: IDateRangePickerValue
  dateOfEventStart?: string
  dateOfEventEnd?: string
  registrationByPeriod?: string
  registrationNumber?: string
  trackingId?: string
  dateOfRegistration?: IDateRangePickerValue
  dateOfRegistrationStart?: string
  dateOfRegistrationEnd?: string
  placeOfRegistration?: string
  eventLocationType?: string
  eventCountry?: string
  eventLocationId?: string
  eventLocationLevel1?: string
  eventLocationLevel2?: string
  eventLocationLevel3?: string
  eventLocationLevel4?: string
  eventLocationLevel5?: string
  eventLocationLevel6?: string
  childFirstNames?: string
  childLastName?: string
  childDoB?: IDateRangePickerValue
  childDoBStart?: string
  childDoBEnd?: string
  childGender?: string
  deceasedFirstNames?: string
  deceasedFamilyName?: string
  deceasedGender?: string
  deceasedDoB?: IDateRangePickerValue
  deceasedDoBStart?: string
  deceasedDoBEnd?: string
  motherFirstNames?: string
  motherFamilyName?: string
  motherDoB?: IDateRangePickerValue
  motherDoBStart?: string
  motherDoBEnd?: string
  fatherFirstNames?: string
  fatherFamilyName?: string
  fatherDoB?: IDateRangePickerValue
  fatherDoBStart?: string
  fatherDoBEnd?: string
  informantFirstNames?: string
  informantFamilyName?: string
  informantDoB?: IDateRangePickerValue
  informantDoBStart?: string
  informantDoBEnd?: string
}

export const transformAdvancedSearchLocalStateToStoreData = (
  localState: IAdvancedSearchFormState,
  offlineData: IOfflineData
): IAdvancedSearchParamState => {
  let transformedStoreState: IAdvancedSearchParamState =
    baseKeysSameAsStore.reduce((ac, curr) => {
      return { ...ac, [curr]: localState[curr] }
    }, {})
  let declarationLocationId,
    declarationJurisdictionId,
    eventLocationId,
    eventCountry,
    eventLocationLevel1,
    eventLocationLevel2

  if (
    localState.registrationStatuses !== undefined &&
    localState.registrationStatuses.length > 0
  ) {
    transformedStoreState.registrationStatuses =
      localState.registrationStatuses === RegStatus.Registered
        ? [RegStatus.Registered, RegStatus.Certified, RegStatus.Issued]
        : localState.registrationStatuses === 'IN_REVIEW'
        ? [RegStatus.WaitingValidation, RegStatus.Declared]
        : localState.registrationStatuses === 'ALL'
        ? Object.values(RegStatus)
        : [localState.registrationStatuses]
  } else {
    transformedStoreState.registrationStatuses = undefined
  }

  if (localState.placeOfRegistration) {
    if (
      Object.keys(offlineData.offices).includes(localState.placeOfRegistration)
    ) {
      declarationLocationId = localState.placeOfRegistration
    }
    if (
      Object.keys(offlineData.locations).includes(
        localState.placeOfRegistration
      )
    ) {
      declarationJurisdictionId = localState.placeOfRegistration
    }
  }

  if (
    localState.registrationByPeriod &&
    localState.registrationByPeriod in TIME_PERIOD
  ) {
    transformedStoreState.timePeriodFrom = localState.registrationByPeriod
  }

  if (localState.eventLocationType === 'HEALTH_FACILITY') {
    eventLocationId = localState.eventLocationId
    eventCountry = ''
    eventLocationLevel1 = ''
    eventLocationLevel2 = ''
  } else {
    eventCountry = localState.eventCountry
    eventLocationLevel1 = localState.eventLocationLevel1
    eventLocationLevel2 = localState.eventLocationLevel2
    eventLocationId = ''
  }

  const {
    exact: informantDoB,
    rangeStart: informantDoBStart,
    rangeEnd: informantDoBEnd
  } = determineDateFromDateRangePickerVal(
    localState.informantDoB
  ) as IDateRangePickerValue

  const {
    exact: dateOfRegistration,
    rangeStart: dateOfRegistrationStart,
    rangeEnd: dateOfRegistrationEnd
  } = determineDateFromDateRangePickerVal(
    localState.dateOfRegistration
  ) as IDateRangePickerValue

  transformedStoreState = {
    ...transformedStoreState,
    informantDoB,
    informantDoBStart,
    informantDoBEnd,
    dateOfRegistration,
    dateOfRegistrationStart,
    dateOfRegistrationEnd,
    declarationLocationId,
    declarationJurisdictionId,
    eventCountry,
    eventLocationId,
    eventLocationLevel1,
    eventLocationLevel2
  }

  if (localState.event && localState.event === 'birth') {
    const {
      exact: childDoB,
      rangeStart: childDoBStart,
      rangeEnd: childDoBEnd
    } = determineDateFromDateRangePickerVal(localState.childDoB)

    const {
      exact: motherDoB,
      rangeStart: motherDoBStart,
      rangeEnd: motherDoBEnd
    } = determineDateFromDateRangePickerVal(localState.motherDoB)
    const {
      exact: fatherDoB,
      rangeStart: fatherDoBStart,
      rangeEnd: fatherDoBEnd
    } = determineDateFromDateRangePickerVal(localState.fatherDoB)
    transformedStoreState = {
      ...transformedStoreState,
      childDoB,
      childDoBStart,
      childDoBEnd,
      motherDoB,
      motherDoBStart,
      motherDoBEnd,
      fatherDoB,
      fatherDoBStart,
      fatherDoBEnd
    }
  } else {
    const {
      exact: deceasedDoB,
      rangeStart: deceasedDoBStart,
      rangeEnd: deceasedDoBEnd
    } = determineDateFromDateRangePickerVal(localState.deceasedDoB)
    transformedStoreState = {
      ...transformedStoreState,
      deceasedDoB,
      deceasedDoBStart,
      deceasedDoBEnd
    }
  }

  return transformedStoreState
}

export const transformStoreDataToAdvancedSearchLocalState = (
  reduxState: IAdvancedSearchParamState,
  offlineData: IOfflineData,
  eventType: string
): IAdvancedSearchFormState => {
  const localState: IAdvancedSearchFormState = baseKeysSameAsStore.reduce(
    (ac, curr) => {
      return { ...ac, [curr]: reduxState[curr] }
    },
    {}
  )

  if (reduxState.timePeriodFrom) {
    localState.registrationByPeriod = reduxState.timePeriodFrom
  }

  localState.event = eventType
  if (
    reduxState.registrationStatuses &&
    reduxState.registrationStatuses.length !== 0
  ) {
    localState.registrationStatuses =
      reduxState.registrationStatuses.length === 1
        ? reduxState.registrationStatuses[0]
        : isEqual(
            [...reduxState.registrationStatuses].sort(),
            [RegStatus.WaitingValidation, RegStatus.Declared].sort()
          )
        ? 'IN_REVIEW'
        : isEqual(
            [...reduxState.registrationStatuses].sort(),
            [RegStatus.Registered, RegStatus.Certified, RegStatus.Issued].sort()
          )
        ? 'REGISTERED'
        : 'ALL'
  } else {
    localState.registrationStatuses = ''
  }

  localState.placeOfRegistration = ''
  if (
    reduxState.declarationLocationId &&
    Object.keys(offlineData.offices).includes(reduxState.declarationLocationId)
  ) {
    localState.placeOfRegistration = reduxState.declarationLocationId
  }
  if (
    reduxState.declarationJurisdictionId &&
    Object.keys(offlineData.locations).includes(
      reduxState.declarationJurisdictionId
    )
  ) {
    localState.placeOfRegistration = reduxState.declarationJurisdictionId
  }

  localState.eventLocationId = ''
  localState.eventCountry = ''
  localState.eventLocationType = ''
  if (reduxState.eventLocationId) {
    localState.eventLocationType = 'HEALTH_FACILITY'
    localState.eventLocationId = reduxState.eventLocationId
  }

  if (reduxState.eventCountry) {
    localState.eventLocationType = 'PRIVATE_HOME'
    localState.eventCountry = reduxState.eventCountry
    localState.eventLocationLevel1 = reduxState.eventLocationLevel1 || ''
    localState.eventLocationLevel2 = reduxState.eventLocationLevel2 || ''
  }

  const { informantDoB, informantDoBStart, informantDoBEnd } = reduxState
  localState.informantDoB = convertDateValuesToDateRangePicker(
    informantDoB,
    informantDoBStart,
    informantDoBEnd
  )
  const { dateOfRegistration, dateOfRegistrationStart, dateOfRegistrationEnd } =
    reduxState
  localState.dateOfRegistration = convertDateValuesToDateRangePicker(
    dateOfRegistration,
    dateOfRegistrationStart,
    dateOfRegistrationEnd
  )

  if (localState.event && localState.event === 'birth') {
    const { childDoB, childDoBStart, childDoBEnd } = reduxState
    localState.childDoB = convertDateValuesToDateRangePicker(
      childDoB,
      childDoBStart,
      childDoBEnd
    )
    const { motherDoB, motherDoBStart, motherDoBEnd } = reduxState
    localState.motherDoB = convertDateValuesToDateRangePicker(
      motherDoB,
      motherDoBStart,
      motherDoBEnd
    )
    const { fatherDoB, fatherDoBStart, fatherDoBEnd } = reduxState
    localState.fatherDoB = convertDateValuesToDateRangePicker(
      fatherDoB,
      fatherDoBStart,
      fatherDoBEnd
    )
  } else {
    const { deceasedDoB, deceasedDoBStart, deceasedDoBEnd } = reduxState
    localState.deceasedDoB = convertDateValuesToDateRangePicker(
      deceasedDoB,
      deceasedDoBStart,
      deceasedDoBEnd
    )
  }

  return localState
}

export const getAccordionActiveStateMap = (
  storeState: IAdvancedSearchParamState,
  hasBirthSearchJurisdictionScope?: boolean,
  hasDeathSearchJurisdictionScope?: boolean,
  officeId?: UUID
): Record<string, boolean> => {
  const advancedSearchBirthSections = createAdvancedSearchBirthSections(
    hasBirthSearchJurisdictionScope,
    officeId
  )
  const advancedSearchDeathSections = createAdvancedSearchDeathSections(
    hasDeathSearchJurisdictionScope,
    officeId
  )
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

const getFromDateFomTimePeriod = (timePeriod: TIME_PERIOD) => {
  return formatDate(timePeriodToFromDate(timePeriod), 'yyyy-MM-dd')
}

const MILLISECONDS_IN_A_DAY = 24 * 60 * 60 * 1000

const timePeriodToFromDate = (timePeriod: TIME_PERIOD) => {
  switch (timePeriod) {
    case TIME_PERIOD.LAST_7_DAYS:
      return new Date(Date.now() - 7 * MILLISECONDS_IN_A_DAY)

    case TIME_PERIOD.LAST_30_DAYS:
      return new Date(Date.now() - 30 * MILLISECONDS_IN_A_DAY)

    case TIME_PERIOD.LAST_90_DAYS:
      return new Date(Date.now() - 90 * MILLISECONDS_IN_A_DAY)

    case TIME_PERIOD.LAST_YEAR:
      const oneYearAgo = new Date(Date.now())
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      return oneYearAgo
  }
}

export const replacePeriodWithDate = (
  advancedSearchParamState: IAdvancedSearchParamState
) => {
  if (
    advancedSearchParamState.timePeriodFrom &&
    advancedSearchParamState.timePeriodFrom in TIME_PERIOD
  )
    advancedSearchParamState.timePeriodFrom = getFromDateFomTimePeriod(
      advancedSearchParamState.timePeriodFrom as TIME_PERIOD
    )
  return advancedSearchParamState
}

const determineDateFromDateRangePickerVal = (
  dateRangePickerValue?: IDateRangePickerValue
): Omit<IDateRangePickerValue, 'isDateRangeActive'> => {
  if (!dateRangePickerValue) {
    return { exact: undefined, rangeStart: undefined, rangeEnd: undefined }
  }
  const value = {
    ...dateRangePickerValue,
    exact:
      dateRangePickerValue.exact &&
      formatDate(new Date(dateRangePickerValue.exact), 'yyyy-MM-dd')
  }
  if (dateRangePickerValue.isDateRangeActive) {
    value.exact = undefined
  } else {
    value.rangeStart = undefined
    value.rangeEnd = undefined
  }

  return value
}

const convertDateValuesToDateRangePicker = (
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
  if (
    !dateRangePickerValue.isDateRangeActive &&
    dateRangePickerValue.exact &&
    !isInvalidDate(dateRangePickerValue.exact)
  )
    isValid = true
  else if (dateRangePickerValue.rangeStart && dateRangePickerValue.rangeEnd)
    isValid = true

  return isValid
}

const getFormattedOfficeName = (
  placeId: string,
  offlineData: IOfflineData
): string => {
  return offlineData.offices[placeId]?.name || ''
}

const getFormattedJurisdictionName = (
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
    ALL: Object.values(RegStatus),
    IN_REVIEW: [RegStatus.WaitingValidation, RegStatus.Declared],
    ARCHIVED: [RegStatus.Archived],
    CERTIFIED: [RegStatus.Certified],
    DECLARATION_UPDATED: [RegStatus.DeclarationUpdated],
    DECLARED: [RegStatus.Declared],
    IN_PROGRESS: [RegStatus.InProgress],
    REGISTERED: [RegStatus.Registered, RegStatus.Issued, RegStatus.Certified],
    REJECTED: [RegStatus.Rejected],
    VALIDATED: [RegStatus.Validated],
    WAITING_VALIDATION: [RegStatus.WaitingValidation],
    CORRECTION_REQUESTED: [RegStatus.CorrectionRequested]
  }
  const statusType = Object.keys(statusLabelMapping).find((key) => {
    if (isEqual([...statusList].sort(), [...statusLabelMapping[key]].sort())) {
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
    },
    {
      value: RegStatus.CorrectionRequested,
      label: intl.formatMessage(
        advancedSearchForm.recordStatusCorrectionRequested
      )
    },
    {
      value: RegStatus.Validated,
      label: intl.formatMessage(advancedSearchForm.recordStatusValidated)
    }
  ]

  const formattedLabel =
    forMattedStatusList.find((e) => statusType === e.value)?.label ||
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
    rangeStart && formatDate(new Date(rangeStart), 'MMMM yyyy')
  const dateEndLocale = rangeEnd && formatDate(new Date(rangeEnd), 'MMMM yyyy')

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
    getFormattedJurisdictionName(eventLocationLevel1 || '', offlineData, intl)
      ?.displayLabel,
    getFormattedJurisdictionName(eventLocationLevel2 || '', offlineData, intl)
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
): pillKeyValueMap => {
  const pillLabelFromTimePeriod = {
    [TIME_PERIOD.LAST_90_DAYS]: advancedSearchForm.timePeriodLast90Days,
    [TIME_PERIOD.LAST_30_DAYS]: advancedSearchForm.timePeriodLast30Days,
    [TIME_PERIOD.LAST_7_DAYS]: advancedSearchForm.timePeriodLast7Days,
    [TIME_PERIOD.LAST_YEAR]: advancedSearchForm.timePeriodLastYear
  }
  const intlFormattedMapOfParams: pillKeyValueMap = {
    event:
      advancedSearchParamsState.event === 'birth'
        ? intl.formatMessage(constantsMessages.birth)
        : intl.formatMessage(constantsMessages.death),

    registationStatus:
      advancedSearchParamsState.registrationStatuses &&
      advancedSearchParamsState.registrationStatuses.length > 0
        ? getLabelForRegistrationStatus(
            advancedSearchParamsState.registrationStatuses,
            intl
          )
        : '',

    timePeriodFrom:
      advancedSearchParamsState.timePeriodFrom &&
      intl.formatMessage(
        pillLabelFromTimePeriod[
          advancedSearchParamsState.timePeriodFrom as TIME_PERIOD
        ]
      ),
    trackingId: advancedSearchParamsState.trackingId,
    regNumber: advancedSearchParamsState.registrationNumber,
    childFirstName: advancedSearchParamsState.childFirstNames,
    childLastName: advancedSearchParamsState.childLastName,
    motherFirstName: advancedSearchParamsState.motherFirstNames,
    motherLastName: advancedSearchParamsState.motherFamilyName,
    fatherFirstName: advancedSearchParamsState.fatherFirstNames,
    fatherLastName: advancedSearchParamsState.fatherFamilyName,
    informantFirstName: advancedSearchParamsState.informantFirstNames,
    informantLastName: advancedSearchParamsState.informantFamilyName,
    deceasedFirstName: advancedSearchParamsState.deceasedFirstNames,
    deceasedLastName: advancedSearchParamsState.deceasedFamilyName,
    gender:
      advancedSearchParamsState.event === 'birth'
        ? advancedSearchParamsState.childGender
        : advancedSearchParamsState.deceasedGender || '',
    regLocation:
      (advancedSearchParamsState.declarationLocationId &&
        getFormattedOfficeName(
          advancedSearchParamsState.declarationLocationId,
          offlineData
        )) ||
      (advancedSearchParamsState.declarationJurisdictionId &&
        getFormattedJurisdictionName(
          advancedSearchParamsState.declarationJurisdictionId,
          offlineData,
          intl
        )?.displayLabel),

    eventLocation:
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

    eventDate:
      (advancedSearchParamsState.dateOfEventStart &&
        advancedSearchParamsState.dateOfEventEnd &&
        formatDateRangeLabel(
          advancedSearchParamsState.dateOfEventStart,
          advancedSearchParamsState.dateOfEventEnd,
          intl
        )) ||
      advancedSearchParamsState.dateOfEvent,

    regDate:
      (advancedSearchParamsState.dateOfRegistrationStart &&
        advancedSearchParamsState.dateOfRegistrationEnd &&
        formatDateRangeLabel(
          advancedSearchParamsState.dateOfRegistrationStart,
          advancedSearchParamsState.dateOfRegistrationEnd,
          intl
        )) ||
      advancedSearchParamsState.dateOfRegistration,

    childDoB:
      (advancedSearchParamsState.event === 'birth' &&
        advancedSearchParamsState.childDoBStart &&
        advancedSearchParamsState.childDoBEnd &&
        formatDateRangeLabel(
          advancedSearchParamsState.childDoBStart,
          advancedSearchParamsState.childDoBEnd,
          intl
        )) ||
      advancedSearchParamsState.childDoB,

    motherDoB:
      (advancedSearchParamsState.event === 'birth' &&
        advancedSearchParamsState.motherDoBStart &&
        advancedSearchParamsState.motherDoBEnd &&
        formatDateRangeLabel(
          advancedSearchParamsState.motherDoBStart,
          advancedSearchParamsState.motherDoBEnd,
          intl
        )) ||
      advancedSearchParamsState.motherDoB,

    fatherDoB:
      (advancedSearchParamsState.event === 'birth' &&
        advancedSearchParamsState.fatherDoBStart &&
        advancedSearchParamsState.fatherDoBEnd &&
        formatDateRangeLabel(
          advancedSearchParamsState.fatherDoBStart,
          advancedSearchParamsState.fatherDoBEnd,
          intl
        )) ||
      advancedSearchParamsState.fatherDoB,

    deceasedDoB:
      (advancedSearchParamsState.event === 'death' &&
        advancedSearchParamsState.deceasedDoBStart &&
        advancedSearchParamsState.deceasedDoBEnd &&
        formatDateRangeLabel(
          advancedSearchParamsState.deceasedDoBStart,
          advancedSearchParamsState.deceasedDoBEnd,
          intl
        )) ||
      advancedSearchParamsState.deceasedDoB,

    informantDoB:
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
    .filter((key) =>
      Boolean(intlFormattedMapOfParams[key as advancedSearchPillKey])
    )
    .reduce((ac, curr) => {
      return {
        ...ac,
        ...{
          [curr]: intlFormattedMapOfParams[curr as advancedSearchPillKey]
        }
      }
    }, {} as pillKeyValueMap)
}

const eventDateMapping: Record<string, string> = {
  birth: 'childDoB',
  death: 'deathDate',
  marriage: 'marriageDate'
}

export const getSortColumn = (sortCol: COLUMNS, event: string) => {
  return sortCol === 'dateOfEvent'
    ? eventDateMapping[event] || sortCol
    : sortCol
}
