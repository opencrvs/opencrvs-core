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

import React, { useState } from 'react'
import { connect, useDispatch, useSelector } from 'react-redux'

import { injectIntl, useIntl } from 'react-intl'
import { getScope } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import { messages } from '@client/i18n/messages/views/config'

import { Content, FormTabs, Text } from '@client/../../components/lib'
import { FormFieldGenerator } from '@client/components/form/FormFieldGenerator'
import { Icon } from '@opencrvs/components/lib/Icon'
import { advancedSearchBirthSections } from '@client/forms/advancedSearch/fieldDefinitions/Birth'
import { advancedSearchDeathSections } from '@client/forms/advancedSearch/fieldDefinitions/Death'
import { PrimaryButton, ICON_ALIGNMENT } from '@opencrvs/components/lib/buttons'
import { buttonMessages } from '@client/i18n/messages'
import { messages as advancedSearchFormMessages } from '@client/i18n/messages/views/advancedSearchForm'
import { getPartialState as AdvancedSearchParamsSelector } from '@client/search/advancedSearch/advancedSearchSelectors'
import { setAdvancedSearchParam } from '@client/search/advancedSearch/actions'
import { goToAdvancedSearchResult } from '@client/navigation'
import { IAdvancedSearchParamState } from '@client/search/advancedSearch/reducer'
import {
  IDateRangePickerValue,
  IFormData,
  IFormFieldValue,
  IFormSectionData
} from '@client/forms'
import { pick } from 'lodash'
import { getOfflineData } from '@client/offline/selectors'
import { IOfflineData } from '@client/offline/reducer'
import { Accordion } from '@opencrvs/components/lib/Accordion'
import { LocationType, RegStatus } from '@client/utils/gateway'

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
  placeOfRegistration?: string
  declarationLocationId?: string
  declarationJurisdictionId?: string
  eventLocationType?: string
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
  localState: IBaseAdvancedSearchState,
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
      localState.registrationStatuses === 'IN_REVIEW'
        ? [RegStatus.WaitingValidation, RegStatus.Validated]
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

  if (localState.eventLocationType === LocationType.HealthFacility) {
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

export const transformReduxDataToLocalState = (
  reduxState: IAdvancedSearchParamState,
  offlineData: IOfflineData,
  eventType: string
): IBaseAdvancedSearchState => {
  const localState: IBaseAdvancedSearchState = baseKeysSameAsStore.reduce(
    (ac, curr) => {
      return { ...ac, [curr]: reduxState[curr] }
    },
    {}
  )
  localState.event = eventType
  if (
    reduxState.registrationStatuses &&
    reduxState.registrationStatuses.length !== 0
  ) {
    localState.registrationStatuses =
      reduxState.registrationStatuses.length === 1
        ? reduxState.registrationStatuses[0]
        : reduxState.registrationStatuses.length === 2
        ? 'IN_REVIEW'
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
    localState.eventLocationType = LocationType.HealthFacility
    localState.eventLocationId = reduxState.eventLocationId
  }

  if (reduxState.eventCountry) {
    localState.eventLocationType = LocationType.PrivateHome
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

export const isAdvancedSearchFormValid = (value: IBaseAdvancedSearchState) => {
  const validNonDateFields = Object.keys(value).filter(
    (key) =>
      !['event', 'eventLocationType'].includes(key) &&
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
  const offlineData = useSelector(getOfflineData)
  const [formState, setFormState] = useState<IBaseAdvancedSearchState>({
    ...transformReduxDataToLocalState(
      advancedSearchParamsState,
      offlineData,
      'birth'
    )
  })

  const isDisabled = !isAdvancedSearchFormValid(formState)
  const dispatch = useDispatch()

  return (
    <>
      <Text element={'p'} variant={'reg18'}>
        {intl.formatMessage(messages.advancedSearchInstruction)}
      </Text>
      <Accordion
        name={advancedSearchBirthSections.registrationSection.id}
        label={intl.formatMessage(
          advancedSearchFormMessages.registrationDetails
        )}
        toggleButtonLabelWhenClosed={intl.formatMessage(
          advancedSearchFormMessages.show
        )}
        toggleButtonLabelWhenOpen={intl.formatMessage(
          advancedSearchFormMessages.hide
        )}
      >
        <FormFieldGenerator
          id={advancedSearchBirthSections.registrationSection.id}
          onChange={(values) => {
            setFormState({ ...formState, ...values })
          }}
          setAllFieldsDirty={false}
          fields={advancedSearchBirthSections.registrationSection.fields}
          initialValues={pick(formState, [
            'placeOfRegistration',
            'dateOfRegistration',
            'registrationStatuses'
          ])}
        />
      </Accordion>

      <Accordion
        name={advancedSearchBirthSections.childSection.id}
        label={intl.formatMessage(advancedSearchFormMessages.childDetails)}
        toggleButtonLabelWhenClosed={intl.formatMessage(
          advancedSearchFormMessages.show
        )}
        toggleButtonLabelWhenOpen={intl.formatMessage(
          advancedSearchFormMessages.hide
        )}
      >
        <FormFieldGenerator
          id={advancedSearchBirthSections.childSection.id}
          onChange={(values) => {
            setFormState({ ...formState, ...values })
          }}
          setAllFieldsDirty={false}
          fields={advancedSearchBirthSections.childSection.fields}
          initialValues={pick(formState, [
            'childDoB',
            'childFirstNames',
            'childLastName',
            'childGender'
          ])}
        />
      </Accordion>

      <Accordion
        name={advancedSearchBirthSections.eventSection.id}
        label={intl.formatMessage(advancedSearchFormMessages.eventDetails)}
        toggleButtonLabelWhenClosed={intl.formatMessage(
          advancedSearchFormMessages.show
        )}
        toggleButtonLabelWhenOpen={intl.formatMessage(
          advancedSearchFormMessages.hide
        )}
      >
        <FormFieldGenerator
          id={advancedSearchBirthSections.eventSection.id}
          onChange={(values) => {
            const nextVal =
              values.eventLocationType === LocationType.HealthFacility
                ? {
                    ...values,
                    eventCountry: '',
                    eventLocationLevel1: '',
                    eventLocationLevel2: ''
                  }
                : {
                    ...values,
                    eventLocationId: ''
                  }
            setFormState({ ...formState, ...nextVal })
          }}
          setAllFieldsDirty={false}
          fields={advancedSearchBirthSections.eventSection.fields}
          initialValues={pick(formState, [
            'eventLocationType',
            'eventLocationId',
            'eventCountry',
            'eventLocationLevel1',
            'eventLocationLevel2'
          ])}
        />
      </Accordion>

      <Accordion
        name={advancedSearchBirthSections.motherSection.id}
        label={intl.formatMessage(advancedSearchFormMessages.motherDetails)}
        toggleButtonLabelWhenClosed={intl.formatMessage(
          advancedSearchFormMessages.show
        )}
        toggleButtonLabelWhenOpen={intl.formatMessage(
          advancedSearchFormMessages.hide
        )}
      >
        <FormFieldGenerator
          id={advancedSearchBirthSections.motherSection.id}
          onChange={(values) => {
            setFormState({ ...formState, ...values })
          }}
          setAllFieldsDirty={false}
          fields={advancedSearchBirthSections.motherSection.fields}
          initialValues={pick(formState, [
            'motherDoB',
            'motherFirstNames',
            'motherFamilyName'
          ])}
        />
      </Accordion>

      <Accordion
        name={advancedSearchBirthSections.fatherSection.id}
        label={intl.formatMessage(advancedSearchFormMessages.fatherDetails)}
        toggleButtonLabelWhenClosed={intl.formatMessage(
          advancedSearchFormMessages.show
        )}
        toggleButtonLabelWhenOpen={intl.formatMessage(
          advancedSearchFormMessages.hide
        )}
      >
        <FormFieldGenerator
          id={advancedSearchBirthSections.fatherSection.id}
          onChange={(values) => {
            setFormState({ ...formState, ...values })
          }}
          setAllFieldsDirty={false}
          fields={advancedSearchBirthSections.fatherSection.fields}
          initialValues={pick(formState, [
            'fatherDoB',
            'fatherFirstNames',
            'fatherFamilyName'
          ])}
        />
      </Accordion>

      <Accordion
        name={advancedSearchBirthSections.informantSection.id}
        label={intl.formatMessage(advancedSearchFormMessages.informantDetails)}
        toggleButtonLabelWhenClosed={intl.formatMessage(
          advancedSearchFormMessages.show
        )}
        toggleButtonLabelWhenOpen={intl.formatMessage(
          advancedSearchFormMessages.hide
        )}
      >
        <FormFieldGenerator
          id={advancedSearchBirthSections.informantSection.id}
          onChange={(values) => {
            setFormState({ ...formState, ...values })
          }}
          setAllFieldsDirty={false}
          fields={advancedSearchBirthSections.informantSection.fields}
          initialValues={pick(formState, [
            'informantDoB',
            'informantFirstNames',
            'informantFamilyName'
          ])}
        />
      </Accordion>

      <PrimaryButton
        icon={() => <Icon name={'Search'} />}
        align={ICON_ALIGNMENT.LEFT}
        id="search"
        key="search"
        disabled={isDisabled}
        onClick={() => {
          dispatch(
            setAdvancedSearchParam({
              ...transformLocalFormDataToReduxData(formState, offlineData),
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
  const advancedSearchParamsState = useSelector(AdvancedSearchParamsSelector)
  const offlineData = useSelector(getOfflineData)
  const [formState, setFormState] = useState<IBaseAdvancedSearchState>({
    ...transformReduxDataToLocalState(
      advancedSearchParamsState,
      offlineData,
      'death'
    )
  })
  const isDisable = !isAdvancedSearchFormValid(formState)
  const dispatch = useDispatch()

  return (
    <>
      <Text element={'p'} variant={'reg18'}>
        {intl.formatMessage(messages.advancedSearchInstruction)}
      </Text>
      <Accordion
        name={advancedSearchDeathSections.registrationSection.id}
        label={intl.formatMessage(
          advancedSearchFormMessages.registrationDetails
        )}
        toggleButtonLabelWhenClosed={intl.formatMessage(
          advancedSearchFormMessages.show
        )}
        toggleButtonLabelWhenOpen={intl.formatMessage(
          advancedSearchFormMessages.hide
        )}
      >
        <FormFieldGenerator
          id={advancedSearchDeathSections.registrationSection.id}
          onChange={(values) => {
            setFormState({ ...formState, ...values })
          }}
          setAllFieldsDirty={false}
          fields={advancedSearchDeathSections.registrationSection.fields}
          initialValues={pick(formState, [
            'placeOfRegistration',
            'dateOfRegistration',
            'registrationStatuses'
          ])}
        />
      </Accordion>

      <Accordion
        name={advancedSearchDeathSections.deceasedSection.id}
        label={intl.formatMessage(advancedSearchFormMessages.deceasedDetails)}
        toggleButtonLabelWhenClosed={intl.formatMessage(
          advancedSearchFormMessages.show
        )}
        toggleButtonLabelWhenOpen={intl.formatMessage(
          advancedSearchFormMessages.hide
        )}
      >
        <FormFieldGenerator
          id={advancedSearchDeathSections.deceasedSection.id}
          onChange={(values) => {
            setFormState({ ...formState, ...values })
          }}
          setAllFieldsDirty={false}
          fields={advancedSearchDeathSections.deceasedSection.fields}
          initialValues={pick(formState, [
            'deceasedDoB',
            'deceasedFirstNames',
            'deceasedFamilyName',
            'deceasedGender',
            'placeOfDeath'
          ])}
        />
      </Accordion>

      <Accordion
        name={advancedSearchDeathSections.eventSection.id}
        label={intl.formatMessage(advancedSearchFormMessages.eventDetails)}
        toggleButtonLabelWhenClosed={intl.formatMessage(
          advancedSearchFormMessages.show
        )}
        toggleButtonLabelWhenOpen={intl.formatMessage(
          advancedSearchFormMessages.hide
        )}
      >
        <FormFieldGenerator
          id={advancedSearchDeathSections.eventSection.id}
          onChange={(values) => {
            const nextVal =
              values.eventLocationType === LocationType.HealthFacility
                ? {
                    ...values,
                    eventCountry: '',
                    eventLocationLevel1: '',
                    eventLocationLevel2: ''
                  }
                : {
                    ...values,
                    eventLocationId: ''
                  }
            setFormState({ ...formState, ...nextVal })
          }}
          setAllFieldsDirty={false}
          fields={advancedSearchDeathSections.eventSection.fields}
          initialValues={pick(formState, [
            'eventLocationType',
            'eventLocationId',
            'eventCountry',
            'eventLocationLevel1',
            'eventLocationLevel2'
          ])}
        />
      </Accordion>

      <Accordion
        name={advancedSearchDeathSections.informantSection.id}
        label={intl.formatMessage(advancedSearchFormMessages.informantDetails)}
        toggleButtonLabelWhenClosed={intl.formatMessage(
          advancedSearchFormMessages.show
        )}
        toggleButtonLabelWhenOpen={intl.formatMessage(
          advancedSearchFormMessages.hide
        )}
      >
        <FormFieldGenerator
          id={advancedSearchDeathSections.informantSection.id}
          onChange={(values) => {
            setFormState({ ...formState, ...values })
          }}
          setAllFieldsDirty={false}
          fields={advancedSearchBirthSections.informantSection.fields}
          initialValues={pick(formState, [
            'informantDoB',
            'informantFirstNames',
            'informantFamilyName'
          ])}
        />
      </Accordion>

      <PrimaryButton
        icon={() => <Icon name={'Search'} />}
        align={ICON_ALIGNMENT.LEFT}
        id="search"
        key="search"
        disabled={isDisable}
        onClick={() => {
          dispatch(
            setAdvancedSearchParam({
              ...transformLocalFormDataToReduxData(formState, offlineData),
              event: 'death'
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

const AdvancedSearch = () => {
  const intl = useIntl()
  const advancedSearchParamState = useSelector(AdvancedSearchParamsSelector)
  const activeTabId = advancedSearchParamState.event || TabId.BIRTH
  const dispatch = useDispatch()

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
              onTabClick={(id: TabId) => {
                dispatch(
                  setAdvancedSearchParam({
                    ...advancedSearchParamState,
                    event: id
                  })
                )
              }}
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
