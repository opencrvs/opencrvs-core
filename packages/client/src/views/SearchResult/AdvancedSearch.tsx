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

import React, { useEffect, useState } from 'react'
import { connect, useDispatch, useSelector } from 'react-redux'

import { injectIntl, useIntl } from 'react-intl'
import { getScope } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import { messages } from '@client/i18n/messages/views/config'

import { Content, FormTabs, Text } from '@client/../../components/lib'
import { FormFieldGenerator } from '@client/components/form/FormFieldGenerator'
import { Icon } from '@opencrvs/components/lib/Icon'
import { advancedSearchBirthSectionFormType } from '@client/forms/advancedSearch/fieldDefinitions/Birth'
import { advancedSearchDeathSectionFormType } from '@client/forms/advancedSearch/fieldDefinitions/Death'
import { PrimaryButton, ICON_ALIGNMENT } from '@opencrvs/components/lib/buttons'
import { buttonMessages } from '@client/i18n/messages'
import { useOnlineStatus } from '@client/views/OfficeHome/LoadingIndicator'
import { getPartialState as AdvancedSearchParamsSelector } from '@client/search/advancedSearch/advancedSearchSelectors'
import { setAdvancedSearchParam } from '@client/search/advancedSearch/actions'
import { goToAdvancedSearchResult, goToSearchResult } from '@client/navigation'
import { IAdvancedSearchParamState } from '@client/search/advancedSearch/reducer'
import {
  IDateRangePickerValue,
  IFormData,
  IFormFieldValue,
  IFormSectionData
} from '@client/forms'

export enum TabId {
  BIRTH = 'birth',
  DEATH = 'death'
}

const baseKeysSameAsStore = [
  'event',
  'registrationStatuses',
  'registrationNumber',
  'trackingId',
  'declarationLocationId',
  'declarationJurisdictionId',
  'eventCountry',
  'eventLocationId',
  'eventLocationLevel1',
  'eventLocationLevel2',
  'eventLocationLevel3',
  'eventLocationLevel4',
  'eventLocationLevel5',
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

const dateFieldTypes = [
  'dateOfRegistration',
  'dateOfEvent',
  'childDoB',
  'motherDoB',
  'fatherDoB',
  'deceasedDoB',
  'informantDoB'
]

export interface IBaseAdvancedSearchState {
  event?: string
  registrationStatuses?: string
  dateOfEvent?: IDateRangePickerValue
  dateOfEventStart?: string
  dateOfEventEnd?: string
  registrationNumber?: string
  trackingId?: string
  dateOfRegistration?: IDateRangePickerValue
  dateOfRegistrationStart?: string
  dateOfRegistrationEnd?: string
  declarationLocationId?: string
  declarationJurisdictionId?: string
  eventCountry?: string
  eventLocationId?: string
  eventLocationLevel1?: string
  eventLocationLevel2?: string
  eventLocationLevel3?: string
  eventLocationLevel4?: string
  eventLocationLevel5?: string
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

const determineDateFromDateRangePickerVal = (
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

const isValidDateRangePickerValue = (
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

const transformLocalFormDataToReduxData = (
  localState: IBaseAdvancedSearchState
): IAdvancedSearchParamState => {
  let transformedStoreState: IAdvancedSearchParamState =
    baseKeysSameAsStore.reduce((ac, curr) => {
      return { ...ac, [curr]: localState[curr] }
    }, {})

  if (localState.registrationStatuses !== undefined) {
    transformedStoreState.registrationStatuses =
      localState.registrationStatuses === 'IN_REVIEW'
        ? [' WAITING_VALIDATION', 'VALIDATED']
        : [localState.registrationStatuses]
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
    dateOfRegistrationEnd
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

const transformReduxDataToLocalState = (
  reduxState: IAdvancedSearchParamState
): IBaseAdvancedSearchState => {
  const localState: IBaseAdvancedSearchState = baseKeysSameAsStore.reduce(
    (ac, curr) => {
      return { ...ac, [curr]: reduxState[curr] }
    },
    {}
  )
  if (
    reduxState.registrationStatuses !== undefined &&
    reduxState.registrationStatuses.length !== 0
  ) {
    localState.registrationStatuses =
      reduxState.registrationStatuses.length > 1
        ? 'IN_REVIEW'
        : reduxState.registrationStatuses[0]
  } else {
    localState.registrationStatuses = ''
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

const transformDraftData = (
  state: IBaseAdvancedSearchState
): IFormSectionData => {
  let sectionData: IFormSectionData = {}
  const sectionDataKeys = Object.keys(state)
  for (const k of sectionDataKeys) {
    sectionData = {
      ...sectionData,
      ...{ [k]: state[k as keyof IBaseAdvancedSearchState] as IFormFieldValue }
    }
  }

  return sectionData
}

const isFormValid = (value: IBaseAdvancedSearchState) => {
  const validNonDateFields = Object.keys(value).filter(
    (key) =>
      key !== 'event' &&
      !dateFieldTypes.includes(key) &&
      Boolean(value[key as keyof IBaseAdvancedSearchState])
  )
  //handle date fields separately
  const validDateFields = dateFieldTypes.filter(
    (key) =>
      value[key as keyof IBaseAdvancedSearchState] &&
      isValidDateRangePickerValue(
        value[key as keyof IBaseAdvancedSearchState] as IDateRangePickerValue
      )
  )
  const validCount = validNonDateFields.length + validDateFields.length
  return validCount >= 2
}

const BirthSection = () => {
  const intl = useIntl()
  const advancedSearchParamsState = useSelector(AdvancedSearchParamsSelector)
  const [formState, setFormState] = useState<IBaseAdvancedSearchState>({
    ...transformReduxDataToLocalState(advancedSearchParamsState),
    event: 'birth'
  })
  const [isDisable, setDisable] = useState(!isFormValid(formState))
  const dispatch = useDispatch()

  return (
    <>
      <Text element={'p'} variant={'reg18'}>
        {intl.formatMessage(messages.advancedSearchInstruction)}
      </Text>
      <FormFieldGenerator
        id={advancedSearchBirthSectionFormType.id}
        onChange={(values) => {
          const isValid = isFormValid(values)
          if (isValid) {
            setDisable(false)
          } else {
            setDisable(true)
          }
          setFormState({ ...formState, ...values })
        }}
        setAllFieldsDirty={false}
        fields={advancedSearchBirthSectionFormType.fields}
        initialValues={formState}
      />

      <PrimaryButton
        icon={() => <Icon name={'Search'} />}
        align={ICON_ALIGNMENT.LEFT}
        id="search"
        key="search"
        disabled={isDisable}
        onClick={() => {
          dispatch(
            setAdvancedSearchParam({
              ...transformLocalFormDataToReduxData(formState),
              event: 'birth'
            })
          )
          dispatch(goToAdvancedSearchResult())
        }}
      >
        {intl.formatMessage(buttonMessages.search)}
      </PrimaryButton>
    </>
  )
}

const DeathSection = () => {
  const intl = useIntl()
  const [isDisable, setDisable] = useState(true)
  const isOnline = useOnlineStatus()
  const [formState, setFormState] = useState({})

  const validateForm = (advancedSearch: IAdvancedSearch) => {
    let count = 0

    for (const field of Object.values(advancedSearch)) {
      const result = field.nestedFields
      for (const value of Object.values(result)) {
        if (value !== '') {
          count++
        }
      }
    }

    if (count > 1 && isOnline) {
      setDisable(false)
    } else {
      setDisable(true)
    }
  }

  return (
    <>
      <Text element={'p'} variant={'reg18'}>
        {intl.formatMessage(messages.advancedSearchInstruction)}
      </Text>
      <FormFieldGenerator
        id={advancedSearchDeathSectionFormType.id}
        onChange={(values) => {
          validateForm(values)
          setFormState(values)
        }}
        setAllFieldsDirty={false}
        fields={advancedSearchDeathSectionFormType.fields}
      />

      <PrimaryButton
        icon={() => <Icon name={'Search'} />}
        align={ICON_ALIGNMENT.LEFT}
        id="search"
        key="search"
        disabled={isDisable}
      >
        {intl.formatMessage(buttonMessages.search)}
      </PrimaryButton>
    </>
  )
}

const AdvancedSearch = () => {
  const intl = useIntl()
  const [activeTabId, setActiveTabId] = useState(TabId.BIRTH)

  const tabSections = [
    {
      id: TabId.BIRTH,
      title: intl.formatMessage(messages.birthTabTitle)
    },
    {
      id: TabId.DEATH,
      title: intl.formatMessage(messages.deathTabTitle)
    }
  ]
  return (
    <>
      <SysAdminContentWrapper
        isCertificatesConfigPage={true}
        hideBackground={true}
      >
        <Content
          title={intl.formatMessage(messages.advancedSearch)}
          titleColor={'copy'}
          tabBarContent={
            <FormTabs
              sections={tabSections}
              activeTabId={activeTabId}
              onTabClick={(id: TabId) => setActiveTabId(id)}
            />
          }
        >
          {activeTabId === TabId.BIRTH && <BirthSection />}
          {activeTabId === TabId.DEATH && <DeathSection />}
        </Content>
      </SysAdminContentWrapper>
    </>
  )
}

function mapStateToProps(state: IStoreState) {
  return {
    scope: getScope(state)
  }
}

export const AdvancedSearchConfig = connect(mapStateToProps)(
  injectIntl(AdvancedSearch)
)
